'use client';

import React, { useState, useEffect } from 'react';
import { EmptyState, LoadingSpinner } from './Shared';
import { showToast, useConfirm } from './Toast';

export interface BlogPost {
  id: number;
  slug: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  contentUk: string;
  contentRu: string;
  contentEn: string;
  photo: string | null;
  videoUrl: string | null;
  createdAt: string;
}

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [adminLang, setAdminLang] = useState<'uk' | 'ru' | 'en'>('uk');
  
  const [form, setForm] = useState({
    slug: '',
    titleUk: '', titleRu: '', titleEn: '',
    contentUk: '', contentRu: '', contentEn: '',
    photo: '',
    videoUrl: ''
  });
  
  const { confirm, dialog } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog');
      if (res.ok) setPosts(await res.json());
    } catch (e) {
      showToast('Помилка завантаження даних', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'jjekokdx');

      try {
        const res = await fetch('https://api.cloudinary.com/v1_1/th95enet/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({ ...prev, photo: data.secure_url }));
          showToast('Фото завантажено');
        } else {
          showToast('Помилка завантаження фото в Cloudinary', 'error');
        }
      } catch (err) {
        showToast('Помилка з\'єднання при завантаженні фото', 'error');
      } finally {
        setIsUploadingPhoto(false);
        e.target.value = '';
      }
    }
  };

  const openAddModal = () => {
    setEditingPost(null);
    setForm({ 
      slug: '', titleUk: '', titleRu: '', titleEn: '', 
      contentUk: '', contentRu: '', contentEn: '', 
      photo: '', videoUrl: '' 
    });
    setAdminLang('uk');
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      slug: post.slug,
      titleUk: post.titleUk, titleRu: post.titleRu, titleEn: post.titleEn,
      contentUk: post.contentUk, contentRu: post.contentRu, contentEn: post.contentEn,
      photo: post.photo || '', videoUrl: post.videoUrl || ''
    });
    setAdminLang('uk');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm('Видалити статтю?', 'Ви впевнені, що хочете видалити цю статтю?');
    if (isConfirmed) {
      try {
        const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Статтю видалено');
          loadData();
        } else {
          showToast('Помилка при видаленні', 'error');
        }
      } catch (e) {
        showToast('Помилка з\'єднання', 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!form.slug || !form.titleUk) {
      showToast('Заповніть Slug та Назву (UA)', 'error');
      return;
    }

    try {
      const url = editingPost ? `/api/blog/${editingPost.id}` : '/api/blog';
      const method = editingPost ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showToast(editingPost ? 'Статтю оновлено' : 'Статтю додано');
        setIsModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        showToast(`Помилка: ${err.error || 'невідома'}`, 'error');
      }
    } catch (e) {
      showToast('Помилка з\'єднання', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-tab-content">
      {dialog}
      <div className="admin-actions-row">
        <button className="btn-primary" onClick={openAddModal}>+ Додати статтю</button>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon="📝" title="Блог порожній" subtitle="Додайте першу статтю, щоб вона з'явилася на сайті." />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Фото</th>
                <th>Назва</th>
                <th>Slug</th>
                <th>Дата</th>
                <th style={{ width: '120px' }}>Дії</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    {post.photo ? (
                      <div className="table-img" style={{ backgroundImage: `url(${post.photo})` }} />
                    ) : (
                      <div className="table-img-placeholder">Н/Д</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{post.titleUk}</div>
                  </td>
                  <td><code style={{ fontSize: '12px' }}>{post.slug}</code></td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-icon" onClick={() => openEditModal(post)} title="Редагувати">✏️</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(post.id)} title="Видалити">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '900px' }}>
            <div className="admin-modal-header">
              <h2>{editingPost ? 'Редагувати статтю' : 'Нова стаття'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-modal-grid">
                
                {/* Left Column: Language Specific */}
                <div className="admin-form-col">
                  <div className="admin-lang-tabs">
                    <button className={adminLang === 'uk' ? 'active' : ''} onClick={() => setAdminLang('uk')}>🇺🇦 UK</button>
                    <button className={adminLang === 'ru' ? 'active' : ''} onClick={() => setAdminLang('ru')}>🇷🇺 RU</button>
                    <button className={adminLang === 'en' ? 'active' : ''} onClick={() => setAdminLang('en')}>🇬🇧 EN</button>
                  </div>
                  
                  <div className="admin-form-group">
                    <label>Заголовок ({adminLang.toUpperCase()})</label>
                    <input 
                      type="text" 
                      value={adminLang === 'uk' ? form.titleUk : adminLang === 'ru' ? form.titleRu : form.titleEn}
                      onChange={e => {
                        const v = e.target.value;
                        if (adminLang === 'uk') setForm(p => ({ ...p, titleUk: v }));
                        if (adminLang === 'ru') setForm(p => ({ ...p, titleRu: v }));
                        if (adminLang === 'en') setForm(p => ({ ...p, titleEn: v }));
                      }}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Текст статті ({adminLang.toUpperCase()})</label>
                    <textarea 
                      style={{ height: '200px' }}
                      value={adminLang === 'uk' ? form.contentUk : adminLang === 'ru' ? form.contentRu : form.contentEn}
                      onChange={e => {
                        const v = e.target.value;
                        if (adminLang === 'uk') setForm(p => ({ ...p, contentUk: v }));
                        if (adminLang === 'ru') setForm(p => ({ ...p, contentRu: v }));
                        if (adminLang === 'en') setForm(p => ({ ...p, contentEn: v }));
                      }}
                    />
                  </div>
                </div>

                {/* Right Column: Global Settings */}
                <div className="admin-form-col">
                  <div className="admin-form-group">
                    <label>Slug (URL) *</label>
                    <input 
                      type="text" 
                      placeholder="naprimer-krashtest-turnika"
                      value={form.slug}
                      onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    />
                    <small style={{ color: 'var(--text-secondary)' }}>Латиницею, без пробілів (через дефіс)</small>
                  </div>

                  <div className="admin-form-group">
                    <label>Посилання на відео (YouTube)</label>
                    <input 
                      type="text" 
                      placeholder="https://youtube.com/..."
                      value={form.videoUrl}
                      onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Головне фото</label>
                    {form.photo ? (
                      <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '10px' }}>
                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${form.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }} />
                        <button 
                          onClick={() => setForm(p => ({ ...p, photo: '' }))}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                        >×</button>
                      </div>
                    ) : (
                      <div className="photo-upload-placeholder" style={{ width: '100%', maxWidth: '200px', minHeight: '100px', border: '2px dashed var(--border-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {isUploadingPhoto ? 'Завантаження...' : '+ Завантажити фото'}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>Скасувати</button>
              <button className="btn-primary" onClick={handleSave}>Зберегти</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
