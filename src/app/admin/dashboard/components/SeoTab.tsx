'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './Shared';
import { showToast } from './Toast';

interface SeoItem {
  route: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  descUk: string;
  descRu: string;
  descEn: string;
}

export default function SeoTab() {
  const [seoData, setSeoData] = useState<Record<string, SeoItem>>({});
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string>('/');
  const [adminLang, setAdminLang] = useState<'uk' | 'ru' | 'en'>('uk');

  const [form, setForm] = useState<SeoItem>({
    route: '/',
    titleUk: '', titleRu: '', titleEn: '',
    descUk: '', descRu: '', descEn: ''
  });

  const routesList = [
    { route: '/', label: 'Головна сторінка (/)' },
    { route: '/blog', label: 'Блог (/blog)' },
    { route: '/#catalog', label: 'Каталог (/#catalog)' },
    { route: '/#constructor', label: 'Конструктор (/#constructor)' },
  ];

  const loadSeo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo');
      if (res.ok) {
        const data = await res.json();
        setSeoData(data);
        if (data['/']) {
          selectRoute('/', data);
        }
      }
    } catch (e) {
      showToast('Помилка завантаження SEO даних', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeo();
  }, []);

  const selectRoute = (route: string, dataMap = seoData) => {
    setActiveRoute(route);
    const item = dataMap[route];
    if (item) {
      setForm({
        route,
        titleUk: item.titleUk || '',
        titleRu: item.titleRu || '',
        titleEn: item.titleEn || '',
        descUk: item.descUk || '',
        descRu: item.descRu || '',
        descEn: item.descEn || '',
      });
    } else {
      setForm({
        route,
        titleUk: 'APEX FORCE — Спортивне обладнання',
        titleRu: 'APEX FORCE — Спортивное оборудование',
        titleEn: 'APEX FORCE — Workout & Sports Equipment',
        descUk: 'Професійні вуличні комплекси, турніки та шведські стінки APEX FORCE.',
        descRu: 'Профессиональные уличные комплексы, турники и шведские стенки APEX FORCE.',
        descEn: 'Professional outdoor workout equipment and workout stations by APEX FORCE.'
      });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showToast('SEO метадані збережено!');
        loadSeo();
      } else {
        showToast('Помилка збереження SEO', 'error');
      }
    } catch (e) {
      showToast('Помилка з\'єднання', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-tab-content">
      <div className="admin-category-filters" style={{ marginBottom: '24px' }}>
        {routesList.map(r => (
          <button
            key={r.route}
            className={`admin-cat-btn ${activeRoute === r.route ? 'active' : ''}`}
            onClick={() => selectRoute(r.route)}
          >
            🔍 {r.label}
          </button>
        ))}
      </div>

      <div className="admin-modal-card" style={{ maxWidth: '800px', margin: '0' }}>
        <div className="admin-modal-header">
          <h2>SEO Метадані для: <code style={{ color: 'var(--red)' }}>{activeRoute}</code></h2>
        </div>
        <div className="admin-modal-body">
          <div className="admin-lang-tabs">
            <button className={adminLang === 'uk' ? 'active' : ''} onClick={() => setAdminLang('uk')}>🇺🇦 UK</button>
            <button className={adminLang === 'ru' ? 'active' : ''} onClick={() => setAdminLang('ru')}>🇷🇺 RU</button>
            <button className={adminLang === 'en' ? 'active' : ''} onClick={() => setAdminLang('en')}>🇬🇧 EN</button>
          </div>

          <div className="admin-form-group">
            <label>Meta Title (Заголовок сторінки у Google) [{adminLang.toUpperCase()}]</label>
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
            <label>Meta Description (Опис у результатах пошуку) [{adminLang.toUpperCase()}]</label>
            <textarea 
              style={{ height: '100px' }}
              value={adminLang === 'uk' ? form.descUk : adminLang === 'ru' ? form.descRu : form.descEn}
              onChange={e => {
                const v = e.target.value;
                if (adminLang === 'uk') setForm(p => ({ ...p, descUk: v }));
                if (adminLang === 'ru') setForm(p => ({ ...p, descRu: v }));
                if (adminLang === 'en') setForm(p => ({ ...p, descEn: v }));
              }}
            />
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn-primary" onClick={handleSave}>Зберегти SEO</button>
        </div>
      </div>
    </div>
  );
}
