'use client';

import React, { useState, useEffect } from 'react';
import { Product, EmptyState, LoadingSpinner } from './Shared';
import { showToast, useConfirm } from './Toast';
import CategoriesManager, { Category } from './CategoriesManager';

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [productForm, setProductForm] = useState({
    category: '', nameUk: '', nameRu: '', nameEn: '', 
    price: '', badgeUk: '', badgeRu: '', badgeEn: '', photo: ''
  });
  const [specsText, setSpecsText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [adminLang, setAdminLang] = useState<'uk' | 'ru' | 'en'>('uk');
  
  const { confirm, dialog } = useConfirm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      
      if (resProd.ok) setProducts(await resProd.json());
      if (resCat.ok) setCategories(await resCat.json());
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

  const openAddModal = () => {
    setEditingProduct(null);
    const defCat = activeCategory === 'all' && categories.length > 0 ? categories[0].id : activeCategory;
    setProductForm({ 
      category: defCat, 
      nameUk: '', nameRu: '', nameEn: '', price: '', badgeUk: '', badgeRu: '', badgeEn: '', photo: '' 
    });
    setSpecsText('');
    setDescriptionText('');
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
    
    // Parse specs back to textarea format and separate description
    try {
      const parsed = JSON.parse(product.specsJson) as [string, string][];
      const descItem = parsed.find(([k]) => k.toLowerCase() === 'опис');
      const specsItems = parsed.filter(([k]) => k.toLowerCase() !== 'опис');
      
      setSpecsText(specsItems.map(([k, v]) => v ? `${k}: ${v}` : k).join('\n'));
      setDescriptionText(descItem ? descItem[1] : '');
    } catch (e) {
      setSpecsText('');
      setDescriptionText('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert specs lines to JSON array of tuples
    let specsArray = specsText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(line => {
        const splitIndex = line.indexOf(':');
        if (splitIndex === -1) return [line, ''];
        return [
          line.substring(0, splitIndex).trim(),
          line.substring(splitIndex + 1).trim()
        ] as [string, string];
      });

    if (descriptionText.trim()) {
      specsArray.push(['Опис', descriptionText.trim()]);
    }

    const body = {
      ...productForm,
      price: Number(productForm.price),
      specsJson: JSON.stringify(specsArray)
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
        loadData();
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
          loadData();
        } else {
          showToast('Помилка видалення', 'error');
        }
      } catch (e) {
        showToast('Помилка мережі', 'error');
      }
    }
  };

  if (loading && products.length === 0) return <LoadingSpinner text="Завантаження каталогу..." />;

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div>
      {dialog}
      {isCatManagerOpen && <CategoriesManager onClose={() => setIsCatManagerOpen(false)} onUpdate={loadData} />}
      
      <div className="admin-category-filters">
        <button className={`admin-cat-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>Всі товари</button>
        {categories.map(c => (
          <button key={c.id} className={`admin-cat-btn ${activeCategory === c.id ? 'active' : ''}`} onClick={() => setActiveCategory(c.id)}>
            {c.nameUk}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Товари в каталозі ({filteredProducts.length})</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={() => setIsCatManagerOpen(true)}>
            ⚙️ Управління категоріями
          </button>
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={openAddModal}>
            + Додати товар
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState icon="📦" title="Немає товарів у цій категорії" subtitle="Створіть перший товар" />
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
              {filteredProducts.map(p => (
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
          <div className="admin-modal-card admin-modal-card-large">
            <div className="admin-modal-header">{editingProduct ? 'Редагувати товар' : 'Додати товар'}</div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-grid">
                
                {/* Column 1: Main Info */}
                <div>
                  <div className="form-field">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Фотографія товару</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ border: 'none', background: 'none', paddingLeft: 0 }} disabled={isUploadingPhoto} />
                    {isUploadingPhoto && <div style={{ fontSize: '12px', color: 'var(--border-focus)', marginTop: '6px' }}>Завантаження фото на Cloudinary...</div>}
                    {productForm.photo && !isUploadingPhoto && (
                      <div style={{ marginTop: '10px' }}><img src={productForm.photo} alt="Uploaded product preview" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }} /></div>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Категорія</label>
                    <select value={productForm.category} onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nameUk}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ціна (₴)*</label>
                    <input type="number" placeholder="Ціна (₴)" value={productForm.price} onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))} required />
                  </div>
                </div>

                {/* Column 2: Translations and Specs */}
                <div>
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
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Характеристики (по одній на рядок)
                    </label>
                    <textarea 
                      placeholder={"Колір: Чорний\nПрофіль труби: 40х40 мм\nМаксимальне навантаження: 150 кг"}
                      value={specsText}
                      onChange={(e) => setSpecsText(e.target.value)}
                      rows={5}
                      style={{ resize: 'vertical' }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Вводьте кожну характеристику з нового рядка через двокрапку.
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Опис товару
                    </label>
                    <textarea 
                      placeholder="Найкращий турнік для занять вдома. Надійна конструкція..."
                      value={descriptionText}
                      onChange={(e) => setDescriptionText(e.target.value)}
                      rows={5}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', fontSize: '13px' }}>Скасувати</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} disabled={isUploadingPhoto}>
                  {isUploadingPhoto ? 'Завантаження фото...' : 'Зберегти товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
