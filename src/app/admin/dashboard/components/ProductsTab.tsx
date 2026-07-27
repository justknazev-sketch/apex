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
  const [photosList, setPhotosList] = useState<string[]>([]);
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
          const newUrl = data.secure_url;
          setPhotosList(prev => {
            const next = [...prev, newUrl];
            if (!productForm.photo) {
              setProductForm(p => ({ ...p, photo: newUrl }));
            }
            return next;
          });
          showToast('Фото додано до галереї');
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

  const removePhotoFromList = (indexToRemove: number) => {
    setPhotosList(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (productForm.photo === prev[indexToRemove]) {
        setProductForm(p => ({ ...p, photo: next[0] || '' }));
      }
      return next;
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    const defCat = activeCategory === 'all' && categories.length > 0 ? categories[0].id : activeCategory;
    setProductForm({ 
      category: defCat, 
      nameUk: '', nameRu: '', nameEn: '', price: '', badgeUk: '', badgeRu: '', badgeEn: '', photo: '' 
    });
    setPhotosList([]);
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

    // Extract photos list
    let list: string[] = [];
    if (product.photosJson) {
      try {
        list = JSON.parse(product.photosJson);
      } catch (e) {
        list = [];
      }
    }
    if (list.length === 0 && product.photo) {
      list = [product.photo];
    }
    setPhotosList(list);
    
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

  const handleDelete = async (productId: number) => {
    const isConfirmed = await confirm('Видалення товару', 'Ви дійсно бажаєте видалити цей товар?');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('Товар успішно видалено');
      } else {
        showToast('Помилка при видаленні товару', 'error');
      }
    } catch (err) {
      showToast('Помилка з\'єднання при видаленні', 'error');
    }
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

    const primaryPhoto = productForm.photo || photosList[0] || '';

    const body = {
      ...productForm,
      photo: primaryPhoto,
      photosJson: JSON.stringify(photosList.length > 0 ? photosList : (primaryPhoto ? [primaryPhoto] : [])),
      price: Number(productForm.price),
      specsJson: JSON.stringify(specsArray)
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editingProduct ? 'Товар оновлено' : 'Товар створено');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('Помилка збереження товару', 'error');
      }
    } catch (err) {
      showToast('Помилка з\'єднання при збереженні', 'error');
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
                
                {/* Column 1: Main Info & Multi-Photo Upload */}
                <div>
                  <div className="form-field">
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Галерея фотографій товару ({photosList.length})
                    </label>
                    
                    {/* Photos Thumbnail Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                      {photosList.map((url, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            position: 'relative', 
                            height: '70px', 
                            borderRadius: '6px', 
                            overflow: 'hidden', 
                            border: productForm.photo === url ? '2px solid var(--red)' : '1px solid var(--border-light)',
                            cursor: 'pointer' 
                          }}
                          onClick={() => setProductForm(prev => ({ ...prev, photo: url }))}
                          title={productForm.photo === url ? 'Головне фото обкладинки' : 'Зробити головним фото'}
                        >
                          <img src={url} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {productForm.photo === url && (
                            <span style={{ position: 'absolute', top: '2px', left: '2px', background: 'var(--red)', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>★ Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhotoFromList(idx);
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Видалити фото"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ border: 'none', background: 'none', paddingLeft: 0 }} 
                      disabled={isUploadingPhoto} 
                    />
                    {isUploadingPhoto && <div style={{ fontSize: '12px', color: 'var(--border-focus)', marginTop: '6px' }}>Завантаження фото в галерею...</div>}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Натисніть на фото в сітці, щоб обрати обкладинку товару.
                    </div>
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
