'use client';

import React, { useState, useEffect } from 'react';
import { Order, EmptyState, LoadingSpinner } from './Shared';
import { showToast, useConfirm } from './Toast';
import { FaPhoneAlt, FaViber, FaTelegramPlane, FaPrint, FaSearch, FaFilter, FaTruck, FaStore, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const { confirm, dialog } = useConfirm();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
      else showToast('Не вдалося завантажити заявки', 'error');
    } catch (e) {
      showToast('Помилка мережі при завантаженні', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateOrderStatus = async (id: number, status: string, additionalData = {}) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      });
      if (res.ok) {
        showToast('Дані заявки оновлено');
        loadOrders();
        if (selectedOrder && selectedOrder.id === id) {
          const updated = await res.json();
          setSelectedOrder(updated);
        }
      } else {
        showToast('Помилка при оновленні', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    const isConfirmed = await confirm('Видалення заявки', 'Ви впевнені, що хочете видалити цю заявку?');
    if (isConfirmed) {
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Заявку видалено');
          if (selectedOrder?.id === id) setSelectedOrder(null);
          loadOrders();
        } else {
          showToast('Помилка видалення', 'error');
        }
      } catch (e) {
        showToast('Помилка мережі', 'error');
      }
    }
  };

  // Calculate analytics
  const totalRevenue = orders
    .filter(o => o.status === 'done')
    .reduce((sum, o) => {
      try {
        const details = JSON.parse(o.detailsJson);
        return sum + (details.totalPrice || details.price || details.total || 0);
      } catch (e) {
        return sum;
      }
    }, 0);

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const customizerCount = orders.filter(o => o.type === 'customizer' || o.type === 'callback').length;

  // Filter orders by search & type
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      !searchQuery || 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.phone.includes(searchQuery) ||
      String(o.id).includes(searchQuery);

    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'order' && o.type === 'order') ||
      (typeFilter === 'customizer' && o.type === 'customizer') ||
      (typeFilter === 'callback' && o.type === 'callback');

    return matchesSearch && matchesType;
  });

  const parseOrderDetails = (detailsJson: string) => {
    try {
      return JSON.parse(detailsJson);
    } catch (e) {
      return {};
    }
  };

  const getCleanPhone = (phone: string) => phone.replace(/[^\d+]/g, '');

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingNotes(order.comment || '');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const renderColumn = (statusKey: string, title: string, cssClass: string) => {
    const colOrders = filteredOrders.filter(o => o.status === statusKey);

    return (
      <div className={`kanban-column ${cssClass}`}>
        <div className="kanban-column-header">
          <span>{title}</span>
          <span className="kanban-col-count">{colOrders.length}</span>
        </div>
        <div className="kanban-cards-container">
          {colOrders.length === 0 ? (
            <EmptyState icon="📋" title="Немає заявок" />
          ) : (
            colOrders.map(order => {
              const details = parseOrderDetails(order.detailsJson);
              const orderPrice = details.totalPrice || details.price || details.total || 0;
              const cleanPhone = getCleanPhone(order.phone);

              return (
                <div key={order.id} className="kanban-order-card" onClick={() => openOrderModal(order)}>
                  <div className="order-card-header">
                    <span className="order-id-tag">№{order.id}</span>
                    <span className={`order-type-badge ${order.type}`}>
                      {order.type === 'order' ? '🛒 Кошик' : order.type === 'customizer' ? '🛠️ Конструктор' : '📞 Дзвінок'}
                    </span>
                  </div>

                  <div className="order-card-client-name">{order.name}</div>
                  <div className="order-card-client-phone">{order.phone}</div>

                  {/* Quick Action Contact Links */}
                  <div className="crm-card-contact-actions" onClick={e => e.stopPropagation()}>
                    <a href={`tel:${cleanPhone}`} className="crm-icon-btn crm-call" title="Зателефонувати">
                      <FaPhoneAlt size={12} />
                    </a>
                    <a href={`viber://chat?number=${cleanPhone}`} className="crm-icon-btn crm-viber" title="Viber">
                      <FaViber size={12} />
                    </a>
                    <a href={`https://t.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="crm-icon-btn crm-tg" title="Telegram">
                      <FaTelegramPlane size={12} />
                    </a>
                  </div>

                  {/* Summary / Price */}
                  {orderPrice > 0 && (
                    <div className="order-card-price">{orderPrice.toLocaleString()} ₴</div>
                  )}

                  {/* Delivery & Payment tags */}
                  <div className="order-card-meta-tags">
                    {order.deliveryMethod === 'novaposhta' ? (
                      <span className="meta-tag np"><FaTruck size={10} /> {order.deliveryCity || 'НП'}</span>
                    ) : (
                      <span className="meta-tag pickup"><FaStore size={10} /> Самовивіз</span>
                    )}

                    {order.paymentMethod === 'monobank' || order.paymentMethod === 'liqpay' ? (
                      <span className="meta-tag card"><FaCreditCard size={10} /> Карта</span>
                    ) : (
                      <span className="meta-tag cash"><FaMoneyBillWave size={10} /> Готівка</span>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div className="order-card-footer-actions" onClick={e => e.stopPropagation()}>
                    {statusKey === 'new' && (
                      <button className="crm-btn-status in-progress" onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}>
                        В роботу →
                      </button>
                    )}
                    {statusKey === 'in_progress' && (
                      <button className="crm-btn-status done" onClick={() => handleUpdateOrderStatus(order.id, 'done')}>
                        Виконано ✓
                      </button>
                    )}
                    {statusKey !== 'cancelled' && (
                      <button className="crm-btn-status cancel" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                        Скасувати
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-tab-content">
      {dialog}

      {/* KPI Analytics Summary Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrap green">💰</div>
          <div className="stat-info">
            <div className="stat-label">Виручка (Виконані)</div>
            <div className="stat-value">{totalRevenue.toLocaleString()} ₴</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap red">
            📦
            {newOrdersCount > 0 && <span className="stat-pulse-badge">{newOrdersCount}</span>}
          </div>
          <div className="stat-info">
            <div className="stat-label">Нові Заявки</div>
            <div className="stat-value">{newOrdersCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap yellow">⏳</div>
          <div className="stat-info">
            <div className="stat-label">В Роботі</div>
            <div className="stat-value">{inProgressCount}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap blue">🛠️</div>
          <div className="stat-info">
            <div className="stat-label">Конструктор & Консультації</div>
            <div className="stat-value">{customizerCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <FaSearch color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Пошук за ім'ям, телефоном або № замовлення..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-type-filters">
          <button className={typeFilter === 'all' ? 'active' : ''} onClick={() => setTypeFilter('all')}>Всі ({orders.length})</button>
          <button className={typeFilter === 'order' ? 'active' : ''} onClick={() => setTypeFilter('order')}>🛒 Кошик</button>
          <button className={typeFilter === 'customizer' ? 'active' : ''} onClick={() => setTypeFilter('customizer')}>🛠️ Конструктор</button>
          <button className={typeFilter === 'callback' ? 'active' : ''} onClick={() => setTypeFilter('callback')}>📞 Консультація</button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="kanban-board-wrapper CRM-4-col">
        {renderColumn('new', 'Нові', 'new')}
        {renderColumn('in_progress', 'В роботі', 'in-progress')}
        {renderColumn('done', 'Виконані', 'done')}
        {renderColumn('cancelled', 'Скасовані', 'cancelled')}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card crm-order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>Заявка №{selectedOrder.id} <span className={`order-type-badge ${selectedOrder.type}`}>{selectedOrder.type}</span></h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Створено: {new Date(selectedOrder.createdAt).toLocaleString('uk-UA')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn-outline" onClick={handlePrintInvoice} title="Друк чеку/накладної">
                  <FaPrint /> Друк
                </button>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
            </div>

            <div className="admin-modal-body">
              <div className="crm-modal-grid">
                {/* Left Column: Client & Order Details */}
                <div className="crm-modal-col">
                  <div className="crm-detail-block">
                    <h3>👤 Клієнт</h3>
                    <div className="crm-detail-field"><strong>Ім'я:</strong> {selectedOrder.name}</div>
                    <div className="crm-detail-field">
                      <strong>Телефон:</strong> {selectedOrder.phone}
                      <div className="crm-card-contact-actions" style={{ display: 'inline-flex', marginLeft: '12px' }}>
                        <a href={`tel:${getCleanPhone(selectedOrder.phone)}`} className="crm-icon-btn crm-call"><FaPhoneAlt size={12} /></a>
                        <a href={`viber://chat?number=${getCleanPhone(selectedOrder.phone)}`} className="crm-icon-btn crm-viber"><FaViber size={12} /></a>
                        <a href={`https://t.me/${getCleanPhone(selectedOrder.phone)}`} target="_blank" rel="noreferrer" className="crm-icon-btn crm-tg"><FaTelegramPlane size={12} /></a>
                      </div>
                    </div>
                  </div>

                  <div className="crm-detail-block">
                    <h3>🚚 Доставка та Оплата</h3>
                    <div className="crm-detail-field">
                      <strong>Спосіб доставки:</strong> {selectedOrder.deliveryMethod === 'novaposhta' ? 'Нова Пошта' : 'Самовивіз'}
                    </div>
                    {selectedOrder.deliveryCity && (
                      <div className="crm-detail-field"><strong>Місто:</strong> {selectedOrder.deliveryCity}</div>
                    )}
                    {selectedOrder.deliveryWarehouse && (
                      <div className="crm-detail-field"><strong>Відділення:</strong> {selectedOrder.deliveryWarehouse}</div>
                    )}
                    <div className="crm-detail-field">
                      <strong>Спосіб оплати:</strong> {selectedOrder.paymentMethod}
                    </div>
                    <div className="crm-detail-field">
                      <strong>Статус оплати:</strong> 
                      <select 
                        value={selectedOrder.paymentStatus || 'pending'}
                        onChange={e => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.status, { paymentStatus: e.target.value })}
                        style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px' }}
                      >
                        <option value="pending">⏳ Очікує оплати</option>
                        <option value="paid">✅ Оплачено</option>
                        <option value="failed">❌ Помилка/Скасовано</option>
                      </select>
                    </div>
                  </div>

                  <div className="crm-detail-block">
                    <h3>📝 Примітка Адміна</h3>
                    <textarea 
                      rows={3} 
                      value={editingNotes}
                      placeholder="Додати коментар адміна (напр. 'Передоплата 500 грн на карту')..."
                      onChange={e => setEditingNotes(e.target.value)}
                    />
                    <button 
                      className="btn-outline" 
                      style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.status, { comment: editingNotes })}
                    >
                      Зберегти примітку
                    </button>
                  </div>
                </div>

                {/* Right Column: Ordered Items / Customizer Details */}
                <div className="crm-modal-col">
                  <div className="crm-detail-block">
                    <h3>🛒 Склад Замовлення</h3>
                    {(() => {
                      const details = parseOrderDetails(selectedOrder.detailsJson);
                      if (selectedOrder.type === 'customizer') {
                        return (
                          <div>
                            <p><strong>Елементи конструктора:</strong></p>
                            <ul>
                              {details.elements?.map((el: string, idx: number) => <li key={idx}>• {el}</li>)}
                            </ul>
                            <p style={{ marginTop: '8px' }}><strong>Обраний колір:</strong> {details.color || 'Не вказано'}</p>
                            <p style={{ marginTop: '12px', fontSize: '18px', color: 'var(--red)', fontWeight: 700 }}>
                              Розрахункова сума: {(details.price || 0).toLocaleString()} ₴
                            </p>
                          </div>
                        );
                      } else if (selectedOrder.type === 'order' && details.items) {
                        return (
                          <div>
                            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)', textTransform: 'uppercase' }}>
                                  <th style={{ textAlign: 'left', padding: '6px 0' }}>Товар</th>
                                  <th style={{ textAlign: 'center' }}>К-сть</th>
                                  <th style={{ textAlign: 'right' }}>Сума</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details.items.map((item: any, idx: number) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '8px 0' }}>{item.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} ₴</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '20px', fontWeight: 800, color: 'var(--red)' }}>
                              Загалом: {(details.totalPrice || details.total || 0).toLocaleString()} ₴
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <p><strong>Тема консультації:</strong> {details.interestTopic || 'Загальне питання'}</p>
                            <p><strong>Бажаний спосіб зв'язку:</strong> {details.contactMethod || 'Дзвінок'}</p>
                            {selectedOrder.comment && <p style={{ marginTop: '8px' }}><strong>Коментар клієнта:</strong> {selectedOrder.comment}</p>}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-outline delete" onClick={() => handleDeleteOrder(selectedOrder.id)}>
                🗑️ Видалити заявку
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" onClick={() => setSelectedOrder(null)}>Закрити</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
