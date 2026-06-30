'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  category: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  badgeUk?: string | null;
  badgeRu?: string | null;
  badgeEn?: string | null;
  specsJson: string;
  photo?: string;
}

interface Order {
  id: number;
  type: string;
  name: string;
  phone: string;
  comment?: string | null;
  detailsJson: string;
  status: string;
  createdAt: string;
}

interface ConstructorPart {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  icon: string;
}

interface ColorPreset {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
}

interface TranslationData {
  key: string;
  uk: string;
  ru: string;
  en: string;
}

interface SeoData {
  route: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  descUk: string;
  descRu: string;
  descEn: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'content' | 'constructor' | 'seo'>('orders');

  // Global loading states
  const [loading, setLoading] = useState(false);

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [translations, setTranslations] = useState<TranslationData[]>([]);
  const [parts, setParts] = useState<ConstructorPart[]>([]);
  const [colors, setColors] = useState<ColorPreset[]>([]);
  const [seoList, setSeoList] = useState<SeoData[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    category: 'street',
    nameUk: '',
    nameRu: '',
    nameEn: '',
    price: '',
    badgeUk: '',
    badgeRu: '',
    badgeEn: '',
    photo: '',
  });
  const [productSpecs, setProductSpecs] = useState<[string, string][]>([['', '']]);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [colorForm, setColorForm] = useState({ id: '', nameUk: '', nameRu: '', nameEn: '' });

  // Log out handler
  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      router.refresh();
      router.push('/admin');
    }
  };

  // Loaders
  const loadOrders = async () => {
    const res = await fetch('/api/orders');
    if (res.ok) setOrders(await res.json());
  };

  const loadProducts = async () => {
    const res = await fetch('/api/products');
    if (res.ok) setProducts(await res.json());
  };

  const loadTranslations = async () => {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      const list: TranslationData[] = Object.keys(data).map(key => ({
        key,
        uk: data[key].uk,
        ru: data[key].ru,
        en: data[key].en
      }));
      setTranslations(list);
    }
  };

  const loadConstructor = async () => {
    const pRes = await fetch('/api/constructor/elements');
    const cRes = await fetch('/api/constructor/colors');
    if (pRes.ok) setParts(await pRes.json());
    if (cRes.ok) setColors(await cRes.json());
  };

  const loadSeo = async () => {
    const res = await fetch('/api/seo');
    if (res.ok) {
      const data = await res.json();
      const list: SeoData[] = Object.keys(data).map(route => ({
        route,
        titleUk: data[route].titleUk,
        titleRu: data[route].titleRu,
        titleEn: data[route].titleEn,
        descUk: data[route].descUk,
        descRu: data[route].descRu,
        descEn: data[route].descEn
      }));
      setSeoList(list);
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadTranslations();
    loadConstructor();
    loadSeo();
  }, [activeTab]);

  // Order actions
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) loadOrders();
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю заявку?')) return;
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    if (res.ok) loadOrders();
  };

  const formatOrderDetails = (order: Order) => {
    try {
      const details = JSON.parse(order.detailsJson);
      if (order.type === 'customizer') {
        const els = details.elements ? details.elements.join(', ') : 'Не обрано';
        return `Конструктор:\n- Деталі: ${els}\n- Колір: ${details.color || 'Не обрано'}\n- Ціна: ${details.price || 0} ₴`;
      } else if (order.type === 'order') {
        if (details.items) {
          const list = details.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ');
          return `Замовлення з кошика:\n- Товари: ${list}\n- Сума: ${details.total || 0} ₴`;
        }
        return `Замовлення: ${details.productName || 'Невідомий товар'} (${details.price || 0} ₴)`;
      } else {
        return `Передзвонити:\n- Цікавить: ${details.interestTopic || 'Загальне'}\n- Зв'язок: ${details.contactMethod || 'Дзвінок'}`;
      }
    } catch (e) {
      return order.detailsJson;
    }
  };

  // Product photo file upload to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Specs helper functions
  const addSpecField = () => setProductSpecs(prev => [...prev, ['', '']]);
  const removeSpecField = (idx: number) => setProductSpecs(prev => prev.filter((_, i) => i !== idx));
  const updateSpecField = (idx: number, isValue: boolean, val: string) => {
    setProductSpecs(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return isValue ? [item[0], val] : [val, item[1]];
    }));
  };

  // Product CRUD handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      category: 'street',
      nameUk: '',
      nameRu: '',
      nameEn: '',
      price: '',
      badgeUk: '',
      badgeRu: '',
      badgeEn: '',
      photo: '',
    });
    setProductSpecs([['', '']]);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
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
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        setIsProductModalOpen(false);
        loadProducts();
      } else {
        alert('Помилка при збереженні товару');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) loadProducts();
  };

  // Translation single save handler
  const handleSaveTranslation = async (key: string, uk: string, ru: string, en: string) => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uk, ru, en })
      });
      if (res.ok) {
        alert('Переклад збережено!');
      } else {
        alert('Помилка при збереженні');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Constructor elements update
  const handleUpdatePartPrice = async (id: string, price: number, nameUk: string, nameRu: string, nameEn: string, icon: string) => {
    const res = await fetch(`/api/constructor/elements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price, nameUk, nameRu, nameEn, icon })
    });
    if (res.ok) {
      alert('Ціну деталі оновлено!');
      loadConstructor();
    }
  };

  // Colors presets crud
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/constructor/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(colorForm)
    });
    if (res.ok) {
      setIsColorModalOpen(false);
      setColorForm({ id: '', nameUk: '', nameRu: '', nameEn: '' });
      loadConstructor();
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm('Видалити цей колір?')) return;
    const res = await fetch(`/api/constructor/colors/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) loadConstructor();
  };

  // SEO update
  const handleSaveSeo = async (seo: SeoData) => {
    const res = await fetch('/api/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seo)
    });
    if (res.ok) alert('SEO мета-дані для ' + seo.route + ' збережено!');
  };

  // Filtered translations list based on search
  const filteredTranslations = translations.filter(item => 
    item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.uk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '28px', color: 'white' }}>Панель управління Apex Force</h1>
        <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '13px' }}>
          Вийти
        </button>
      </div>

      <div className="admin-tabs-list">
        <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Заявки ({orders.length})</button>
        <button className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Каталог ({products.length})</button>
        <button className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Тексти сайту</button>
        <button className={`admin-tab-btn ${activeTab === 'constructor' ? 'active' : ''}`} onClick={() => setActiveTab('constructor')}>Ціни деталей & Колір</button>
        <button className={`admin-tab-btn ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>Налаштування SEO</button>
      </div>

      <div className="admin-pane">
        
        {/* 1. ORDERS KANBAN TAB */}
        {activeTab === 'orders' && (
          <div className="kanban-board-wrapper">
            {/* New Column */}
            <div className="kanban-column new">
              <div className="kanban-column-header">Нові ({orders.filter(o => o.status === 'new').length})</div>
              <div className="kanban-cards-container">
                {orders.filter(o => o.status === 'new').map(order => (
                  <div className="kanban-order-card" key={order.id}>
                    <div className="order-card-header">
                      <span>№{order.id}</span>
                      <span className="order-card-type-badge">{order.type}</span>
                    </div>
                    <div className="order-card-client-name">{order.name}</div>
                    <div className="order-card-client-phone">{order.phone}</div>
                    <pre className="order-card-details-box">{formatOrderDetails(order)}</pre>
                    {order.comment && <div className="order-card-comment">«{order.comment}»</div>}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {new Date(order.createdAt).toLocaleString('uk-UA')}
                    </div>
                    <div className="order-card-actions">
                      <button className="order-card-action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}>В роботу</button>
                      <button className="order-card-action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'done')}>Виконано</button>
                      <button className="order-card-action-btn order-card-delete-btn" onClick={() => handleDeleteOrder(order.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="kanban-column in-progress">
              <div className="kanban-column-header">В роботі ({orders.filter(o => o.status === 'in_progress').length})</div>
              <div className="kanban-cards-container">
                {orders.filter(o => o.status === 'in_progress').map(order => (
                  <div className="kanban-order-card" key={order.id}>
                    <div className="order-card-header">
                      <span>№{order.id}</span>
                      <span className="order-card-type-badge">{order.type}</span>
                    </div>
                    <div className="order-card-client-name">{order.name}</div>
                    <div className="order-card-client-phone">{order.phone}</div>
                    <pre className="order-card-details-box">{formatOrderDetails(order)}</pre>
                    {order.comment && <div className="order-card-comment">«{order.comment}»</div>}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {new Date(order.createdAt).toLocaleString('uk-UA')}
                    </div>
                    <div className="order-card-actions">
                      <button className="order-card-action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'new')}>У нові</button>
                      <button className="order-card-action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'done')}>Виконано</button>
                      <button className="order-card-action-btn order-card-delete-btn" onClick={() => handleDeleteOrder(order.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div className="kanban-column done">
              <div className="kanban-column-header">Виконані ({orders.filter(o => o.status === 'done').length})</div>
              <div className="kanban-cards-container">
                {orders.filter(o => o.status === 'done').map(order => (
                  <div className="kanban-order-card" key={order.id}>
                    <div className="order-card-header">
                      <span>№{order.id}</span>
                      <span className="order-card-type-badge">{order.type}</span>
                    </div>
                    <div className="order-card-client-name">{order.name}</div>
                    <div className="order-card-client-phone">{order.phone}</div>
                    <pre className="order-card-details-box">{formatOrderDetails(order)}</pre>
                    {order.comment && <div className="order-card-comment">«{order.comment}»</div>}
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {new Date(order.createdAt).toLocaleString('uk-UA')}
                    </div>
                    <div className="order-card-actions">
                      <button className="order-card-action-btn" onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}>У роботу</button>
                      <button className="order-card-action-btn order-card-delete-btn" onClick={() => handleDeleteOrder(order.id)}>Видалити</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CATALOG PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ color: 'white', fontSize: '18px' }}>Товари в каталозі</h3>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} onClick={openAddProductModal}>
                + Додати товар
              </button>
            </div>

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
                      <td style={{ fontWeight: '600', color: 'white' }}>{p.nameUk}</td>
                      <td style={{ color: 'var(--red)', fontWeight: 'bold' }}>{p.price} ₴</td>
                      <td>{p.badgeUk || '-'}</td>
                      <td>
                        <div className="action-links">
                          <span className="action-edit-btn" onClick={() => openEditProductModal(p)}>Редагувати</span>
                          <span className="action-delete-btn" onClick={() => handleDeleteProduct(p.id)}>Видалити</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SITE CONTENT TEXT TRANSLATIONS TAB */}
        {activeTab === 'content' && (
          <div>
            <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
              <input 
                type="text" 
                placeholder="Фільтрувати переклади за ключем чи текстом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', color: 'white', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div className="translations-grid-wrapper">
              {filteredTranslations.map((item) => (
                <div className="translation-key-card" key={item.key}>
                  <div className="translation-key-name">{item.key}</div>
                  <div className="translation-inputs-row">
                    <div className="translation-field-group">
                      <label>UA (Українська)</label>
                      <input 
                        type="text" 
                        value={item.uk} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setTranslations(prev => prev.map(t => t.key === item.key ? { ...t, uk: val } : t));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>RU (Русский)</label>
                      <input 
                        type="text" 
                        value={item.ru} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setTranslations(prev => prev.map(t => t.key === item.key ? { ...t, ru: val } : t));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>EN (English)</label>
                      <input 
                        type="text" 
                        value={item.en} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setTranslations(prev => prev.map(t => t.key === item.key ? { ...t, en: val } : t));
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleSaveTranslation(item.key, item.uk, item.ru, item.en)}
                    >
                      Зберегти переклад
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CONSTRUCTOR ELEMENTS PRICES & COLORS TAB */}
        {activeTab === 'constructor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Elements Price tuning */}
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '20px' }}>Ціни деталей конструктора</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Назва (UA)</th>
                      <th>Ціна (₴)</th>
                      <th>Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map(part => (
                      <tr key={part.id}>
                        <td style={{ fontWeight: '600' }}>{part.icon} {part.nameUk}</td>
                        <td>
                          <input 
                            type="number" 
                            value={part.price} 
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setParts(prev => prev.map(p => p.id === part.id ? { ...p, price: val } : p));
                            }}
                            style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', color: 'white', padding: '6px', borderRadius: '4px', width: '90px', outline: 'none' }}
                          />
                        </td>
                        <td>
                          <button 
                            className="order-card-action-btn"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            onClick={() => handleUpdatePartPrice(part.id, part.price, part.nameUk, part.nameRu, part.nameEn, part.icon)}
                          >
                            Оновити ціну
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Colors Preset Admin list */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '18px' }}>Цвета конструктора</h3>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => setIsColorModalOpen(true)}>
                  + Додати колір
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Колір</th>
                      <th>HEX</th>
                      <th>Назва (UA)</th>
                      <th>Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map(color => (
                      <tr key={color.id}>
                        <td>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.id, border: '1px solid #333' }} />
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{color.id}</td>
                        <td style={{ fontWeight: '600' }}>{color.nameUk}</td>
                        <td>
                          <span className="action-delete-btn" onClick={() => handleDeleteColor(color.id)}>Видалити</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SEO SETTINGS TAB */}
        {activeTab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {seoList.map((seo) => (
              <div className="translation-key-card" key={seo.route}>
                <div className="translation-key-name" style={{ fontSize: '15px' }}>Маршрут: {seo.route}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Titles */}
                  <div className="translation-inputs-row">
                    <div className="translation-field-group">
                      <label>Title (UA)</label>
                      <input 
                        type="text" 
                        value={seo.titleUk}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, titleUk: val } : s));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>Title (RU)</label>
                      <input 
                        type="text" 
                        value={seo.titleRu}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, titleRu: val } : s));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>Title (EN)</label>
                      <input 
                        type="text" 
                        value={seo.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, titleEn: val } : s));
                        }}
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="translation-inputs-row">
                    <div className="translation-field-group">
                      <label>Description (UA)</label>
                      <input 
                        type="text" 
                        value={seo.descUk}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, descUk: val } : s));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>Description (RU)</label>
                      <input 
                        type="text" 
                        value={seo.descRu}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, descRu: val } : s));
                        }}
                      />
                    </div>
                    <div className="translation-field-group">
                      <label>Description (EN)</label>
                      <input 
                        type="text" 
                        value={seo.descEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, descEn: val } : s));
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => handleSaveSeo(seo)}>
                      Зберегти SEO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Product Add/Edit Dialog Modal */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">{editingProduct ? 'Редагувати товар' : 'Додати товар'}</div>
            <form onSubmit={handleProductFormSubmit}>
              <div className="form-field">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Категорія</label>
                <select 
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="street">Вуличні комплекси</option>
                  <option value="turnik">Турніки</option>
                  <option value="ruckhod">Рукоходи</option>
                  <option value="workout">Воркаут</option>
                  <option value="swedish">Шведські стінки</option>
                </select>
              </div>

              {/* Localized Names */}
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (Українська)*" 
                  value={productForm.nameUk}
                  onChange={(e) => setProductForm(prev => ({ ...prev, nameUk: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (Русский)" 
                  value={productForm.nameRu}
                  onChange={(e) => setProductForm(prev => ({ ...prev, nameRu: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (English)" 
                  value={productForm.nameEn}
                  onChange={(e) => setProductForm(prev => ({ ...prev, nameEn: e.target.value }))}
                />
              </div>

              {/* Price */}
              <div className="form-field">
                <input 
                  type="number" 
                  placeholder="Ціна (₴)*" 
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              {/* Localized Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder="Плашка (UA)" 
                    value={productForm.badgeUk}
                    onChange={(e) => setProductForm(prev => ({ ...prev, badgeUk: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder="Плашка (RU)" 
                    value={productForm.badgeRu}
                    onChange={(e) => setProductForm(prev => ({ ...prev, badgeRu: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder="Плашка (EN)" 
                    value={productForm.badgeEn}
                    onChange={(e) => setProductForm(prev => ({ ...prev, badgeEn: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-field">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Фотографія товару</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  style={{ border: 'none', background: 'none', paddingLeft: 0 }}
                />
                {productForm.photo && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={productForm.photo} alt="Uploaded product preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} />
                  </div>
                )}
              </div>

              {/* Specifications CRUD inside form */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Характеристики (Динамічні поля)</label>
                {productSpecs.map((spec, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Назва (напр. Колір)" 
                      value={spec[0]}
                      onChange={(e) => updateSpecField(index, false, e.target.value)}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '13px', outline: 'none', flex: 1 }}
                    />
                    <input 
                      type="text" 
                      placeholder="Значення (напр. Червоний)" 
                      value={spec[1]}
                      onChange={(e) => updateSpecField(index, true, e.target.value)}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '13px', outline: 'none', flex: 1.5 }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeSpecField(index)}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '20px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={addSpecField} 
                  style={{ padding: '6px 12px', fontSize: '12px', marginTop: '6px' }}
                >
                  + Додати характеристику
                </button>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsProductModalOpen(false)} style={{ padding: '10px 20px', fontSize: '13px' }}>
                  Скасувати
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }} disabled={loading}>
                  {loading ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Color Add Preset Dialog Modal */}
      {isColorModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">Додати колір preset</div>
            <form onSubmit={handleAddColor}>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="HEX код (напр. #FF0000)*" 
                  value={colorForm.id}
                  onChange={(e) => setColorForm(prev => ({ ...prev, id: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (UA)*" 
                  value={colorForm.nameUk}
                  onChange={(e) => setColorForm(prev => ({ ...prev, nameUk: e.target.value }))}
                  required
                />
              </div>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (RU)" 
                  value={colorForm.nameRu}
                  onChange={(e) => setColorForm(prev => ({ ...prev, nameRu: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <input 
                  type="text" 
                  placeholder="Назва (EN)" 
                  value={colorForm.nameEn}
                  onChange={(e) => setColorForm(prev => ({ ...prev, nameEn: e.target.value }))}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsColorModalOpen(false)} style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Скасувати
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Додати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
