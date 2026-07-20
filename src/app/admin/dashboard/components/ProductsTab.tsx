'use client';

import React, { useState, useEffect } from 'react';
import { Product, EmptyState, LoadingSpinner } from './Shared';
import { showToast, useConfirm } from './Toast';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [productForm, setProductForm] = useState({
    category: 'street', nameUk: '', nameRu: '', nameEn: '', 
    price: '', badgeUk: '', badgeRu: '', badgeEn: '', photo: ''
  });
  const [productSpecs, setProductSpecs] = useState<[string, string][]>([['', '']]);
  const [adminLang, setAdminLang] = useState<'uk' | 'ru' | 'en'>('uk');
  
  const { confirm, dialog } = useConfirm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
      else showToast('Помилка завантаження товарів', 'error');
    } catch (e) {
      showToast('Помилка мережі', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadProducts());
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
          setProductForm(prev => ({ ...prev, photo: data.secure_url }));
          showToast('Фото успішно завантажено');
        } else {
          showToast('Помилка завантаження фото в Cloudinary', 'error');
        }
      } catch (err) {
        showToast('Помилка з\'єднання при завантаженні фото', 'error');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const addSpecField = () => setProductSpecs(prev => [...prev, ['', '']]);
  const removeSpecField = (idx: number) => setProductSpecs(prev => prev.filter((_, i) => i !== idx));
  const updateSpecField = (idx: number, isValue: boolean, val: string) => {
    setProductSpecs(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return isValue ? [item[0], val] : [val, item[1]];
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ category: 'street', nameUk: '', nameRu: '', nameEn: '', price: '', badgeUk: '', badgeRu: '', badgeEn: '', photo: '' });
    setProductSpecs([['', '']]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      category: product.category,
      nameUk: product.nameUk,
      nameRu: product.nameRu || '',
      nameEn: product.nameEn || '',
      price: String(product.price),
      badgeUk: product.badgeUk || '',
      badgeRu: product.badgeRu || '',
      badgeEn: product.badgeEn || '',
      photo: product.photo || '',
    });
    try {
      setProductSpecs(JSON.parse(product.specsJson));
    } catch (e) {
      setProductSpecs([['', '']]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsFiltered = productSpecs.filter(([name]) => name.trim() !== '');
    const body = {
      ...productForm,
      price: Number(productForm.price),
      specsJson: JSON.stringify(specsFiltered)
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showToast(`Товар ${editingProduct ? 'оновлено' : 'додано'}`);
        setIsModalOpen(false);
        loadProducts();
      } else {
        showToast('Помилка при збереженні товару', 'error');
      }
    } catch (err) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm('Видалення товару', 'Ви впевнені, що хочете видалити цей товар?')) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Товар видалено');
          loadProducts();
        } else {
          showToast('Помилка видалення', 'error');
        }
      } catch (e) {
        showToast('Помилка мережі', 'error');
      }
    }
  };

  if (loading && products.length === 0) return <LoadingSpinner text="Завантаження каталогу..." />;

  return (
    <div>
      {dialog}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Товари в каталозі</h3>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={openAddModal}>
          + Додати товар
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="Немає товарів" subtitle="Додайте перший товар до каталогу" />
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Категорія</th>
                <th>Назва (UA)</th>
                <th>Ціна</th>
                <th>Плашка</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.photo ? (
                      <img src={p.photo} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', background: 'var(--bg-dark)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏋️</div>
                    )}
                  </td>
                  <td style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>{p.category}</td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.nameUk}</td>
                  <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{p.price} ₴</td>
                  <td>{p.badgeUk || '-'}</td>
                  <td>
                    <div className="action-links">
                      <span className="action-edit-btn" onClick={() => openEditModal(p)}>Редагувати</span>
                      <span className="action-delete-btn" onClick={() => handleDelete(p.id)}>Видалити</span>
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
          <div className="admin-modal-card">
            <div className="admin-modal-header">{editingProduct ? 'Редагувати товар' : 'Додати товар'}</div>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Категорія</label>
                <select value={productForm.category} onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="street">Вуличні комплекси</option>
                  <option value="turnik">Турніки</option>
                  <option value="ruckhod">Рукоходи</option>
                  <option value="workout">Воркаут</option>
                  <option value="swedish">Шведські стінки</option>
                </select>
              </div>

              <div className="admin-lang-tabs">
                <button type="button" className={`admin-lang-tab uk ${adminLang === 'uk' ? 'active' : ''}`} onClick={() => setAdminLang('uk')}>Українська (Основна)</button>
                <button type="button" className={`admin-lang-tab ru ${adminLang === 'ru' ? 'active' : ''}`} onClick={() => setAdminLang('ru')}>Русский</button>
                <button type="button" className={`admin-lang-tab en ${adminLang === 'en' ? 'active' : ''}`} onClick={() => setAdminLang('en')}>English</button>
              </div>

              {adminLang === 'uk' && (
                <>
                  <div className="form-field"><input type="text" placeholder="Назва (Українська)*" value={productForm.nameUk} onChange={(e) => setProductForm(prev => ({ ...prev, nameUk: e.target.value }))} required /></div>
                  <div className="form-field"><input type="text" placeholder="Плашка (напр. 'Хіт', не обов'язково)" value={productForm.badgeUk} onChange={(e) => setProductForm(prev => ({ ...prev, badgeUk: e.target.value }))} /></div>
                </>
              )}
              {adminLang === 'ru' && (
                <>
                  <div className="form-field"><input type="text" placeholder="Название (Русский)" value={productForm.nameRu} onChange={(e) => setProductForm(prev => ({ ...prev, nameRu: e.target.value }))} /></div>
                  <div className="form-field"><input type="text" placeholder="Плашка (напр. 'Хит', не обязательно)" value={productForm.badgeRu} onChange={(e) => setProductForm(prev => ({ ...prev, badgeRu: e.target.value }))} /></div>
                </>
              )}
              {adminLang === 'en' && (
                <>
                  <div className="form-field"><input type="text" placeholder="Name (English)" value={productForm.nameEn} onChange={(e) => setProductForm(prev => ({ ...prev, nameEn: e.target.value }))} /></div>
                  <div className="form-field"><input type="text" placeholder="Badge (e.g. 'Bestseller', optional)" value={productForm.badgeEn} onChange={(e) => setProductForm(prev => ({ ...prev, badgeEn: e.target.value }))} /></div>
                </>
              )}

              <div className="form-field" style={{ marginTop: '16px' }}>
                <input type="number" placeholder="Ціна (₴)*" value={productForm.price} onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))} required />
              </div>

              <div className="form-field">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Фотографія товару</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ border: 'none', background: 'none', paddingLeft: 0 }} disabled={isUploadingPhoto} />
                {isUploadingPhoto && <div style={{ fontSize: '12px', color: 'var(--border-focus)', marginTop: '6px' }}>Завантаження фото на Cloudinary...</div>}
                {productForm.photo && !isUploadingPhoto && (
                  <div style={{ marginTop: '10px' }}><img src={productForm.photo} alt="Uploaded product preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} /></div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Характеристики (Динамічні поля)</label>
                {productSpecs.map((spec, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input type="text" placeholder="Назва (напр. Колір)" value={spec[0]} onChange={(e) => updateSpecField(index, false, e.target.value)} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '10px', borderRadius: '6px', fontSize: '13px', outline: 'none', flex: 1 }} />
                    <input type="text" placeholder="Значення (напр. Червоний)" value={spec[1]} onChange={(e) => updateSpecField(index, true, e.target.value)} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '10px', borderRadius: '6px', fontSize: '13px', outline: 'none', flex: 1.5 }} />
                    <button type="button" onClick={() => removeSpecField(index)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                  </div>
                ))}
                <button type="button" className="btn-outline" onClick={addSpecField} style={{ padding: '6px 12px', fontSize: '12px', marginTop: '6px' }}>+ Додати характеристику</button>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', fontSize: '13px' }}>Скасувати</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} disabled={isUploadingPhoto}>
                  {isUploadingPhoto ? 'Завантаження фото...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
