'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ToastContainer from './components/Toast';
import OrdersTab from './components/OrdersTab';
import ProductsTab from './components/ProductsTab';
import ContentTab from './components/ContentTab';
import ConstructorTab from './components/ConstructorTab';
import SeoTab from './components/SeoTab';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'content' | 'constructor' | 'seo'>('orders');

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      router.refresh();
      router.push('/admin');
    }
  };

  return (
    <div>
      <ToastContainer />
      
      <div className="admin-header-row">
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>Панель управління Apex Force</h1>
        <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '13px' }}>
          Вийти
        </button>
      </div>

      <div className="admin-tabs-list">
        <button className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Заявки</button>
        <button className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Каталог</button>
        <button className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Тексти сайту</button>
        <button className={`admin-tab-btn ${activeTab === 'constructor' ? 'active' : ''}`} onClick={() => setActiveTab('constructor')}>Деталі & Кольори</button>
        <button className={`admin-tab-btn ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>SEO</button>
      </div>

      <div className="admin-pane">
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'constructor' && <ConstructorTab />}
        {activeTab === 'seo' && <SeoTab />}
      </div>
    </div>
  );
}
