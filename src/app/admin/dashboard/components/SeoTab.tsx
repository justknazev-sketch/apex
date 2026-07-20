'use client';

import React, { useState, useEffect } from 'react';
import { SeoData, LoadingSpinner } from './Shared';
import { showToast } from './Toast';

export default function SeoTab() {
  const [seoList, setSeoList] = useState<SeoData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSeo = async () => {
    setLoading(true);
    try {
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
      } else {
        showToast('Помилка завантаження SEO', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі при завантаженні SEO', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadSeo());
  }, []);

  const handleSaveSeo = async (seo: SeoData) => {
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo)
      });
      if (res.ok) {
        showToast(`SEO для ${seo.route} збережено!`);
      } else {
        showToast('Помилка збереження SEO', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  if (loading && seoList.length === 0) return <LoadingSpinner text="Завантаження SEO налаштувань..." />;

  return (
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
                <textarea 
                  value={seo.descUk}
                  rows={2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, descUk: val } : s));
                  }}
                />
              </div>
              <div className="translation-field-group">
                <label>Description (RU)</label>
                <textarea 
                  value={seo.descRu}
                  rows={2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSeoList(prev => prev.map(s => s.route === seo.route ? { ...s, descRu: val } : s));
                  }}
                />
              </div>
              <div className="translation-field-group">
                <label>Description (EN)</label>
                <textarea 
                  value={seo.descEn}
                  rows={2}
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
  );
}
