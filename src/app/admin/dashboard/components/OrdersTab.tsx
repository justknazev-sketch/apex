'use client';

import React, { useState, useEffect } from 'react';
import { Order, KanbanCard, EmptyState, LoadingSpinner } from './Shared';
import { showToast, useConfirm } from './Toast';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
    Promise.resolve().then(() => loadOrders());
  }, []);

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast('Статус заявки оновлено');
        loadOrders();
      } else {
        showToast('Помилка при оновленні статусу', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (await confirm('Видалення заявки', 'Ви впевнені, що хочете видалити цю заявку?')) {
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Заявку видалено');
          loadOrders();
        } else {
          showToast('Помилка видалення', 'error');
        }
      } catch (e) {
        showToast('Помилка мережі', 'error');
      }
    }
  };

  const formatOrderDetails = (order: Order) => {
    try {
      const details = JSON.parse(order.detailsJson);
      if (order.type === 'customizer') {
        const els = details.elements ? details.elements.join(', ') : 'Не обрано';
        return `Конструктор:\n- Деталі: ${els}\n- Колір: ${details.color || 'Не обрано'}\n- Ціна: ${details.price || 0} ₴`;
      } else if (order.type === 'order') {
        if (details.items) {
          const list = details.items.map((i: { name: string; quantity: number }) => `${i.name} (x${i.quantity})`).join(', ');
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

  const renderColumn = (status: string, title: string, cssClass: string, actions: { label: string; status?: string; isDelete?: boolean }[]) => {
    const colOrders = orders.filter(o => o.status === status);
    
    return (
      <div className={`kanban-column ${cssClass}`}>
        <div className="kanban-column-header">{title} ({colOrders.length})</div>
        <div className="kanban-cards-container">
          {colOrders.length === 0 ? (
            <EmptyState icon="📋" title="Немає заявок" />
          ) : (
            colOrders.map(order => (
              <KanbanCard 
                key={order.id} 
                order={order} 
                actions={actions} 
                onUpdateStatus={handleUpdateOrderStatus} 
                onDelete={handleDeleteOrder} 
                formatDetails={formatOrderDetails} 
              />
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) return <LoadingSpinner text="Завантаження заявок..." />;

  return (
    <div className="kanban-board-wrapper">
      {dialog}
      {renderColumn('new', 'Нові', 'new', [
        { label: 'В роботу', status: 'in_progress' },
        { label: 'Виконано', status: 'done' },
        { label: '×', isDelete: true }
      ])}
      {renderColumn('in_progress', 'В роботі', 'in-progress', [
        { label: 'У нові', status: 'new' },
        { label: 'Виконано', status: 'done' },
        { label: '×', isDelete: true }
      ])}
      {renderColumn('done', 'Виконані', 'done', [
        { label: 'У роботу', status: 'in_progress' },
        { label: 'Видалити', isDelete: true }
      ])}
    </div>
  );
}
