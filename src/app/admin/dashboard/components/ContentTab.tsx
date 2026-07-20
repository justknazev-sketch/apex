'use client';

import React, { useState, useEffect } from 'react';
import { TranslationData, LoadingSpinner } from './Shared';
import { showToast } from './Toast';

export default function ContentTab() {
  const [translations, setTranslations] = useState<TranslationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTranslations = async () => {
    setLoading(true);
    try {
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
      } else {
        showToast('Помилка завантаження перекладів', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadTranslations());
  }, []);

  const handleSaveTranslation = async (key: string, uk: string, ru: string, en: string) => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uk, ru, en })
      });
      if (res.ok) {
        showToast('Переклад збережено!');
      } else {
        showToast('Помилка при збереженні', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const filteredTranslations = translations.filter(item => 
    item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.uk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && translations.length === 0) return <LoadingSpinner text="Завантаження контенту..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <input 
          type="text" 
          placeholder="Фільтрувати переклади за ключем чи текстом..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div className="translations-grid-wrapper">
        {filteredTranslations.map((item) => (
          <div className="translation-key-card" key={item.key}>
            <div className="translation-key-name">{item.key}</div>
            <div className="translation-inputs-row">
              <div className="translation-field-group">
                <label>UA (Українська)</label>
                <textarea 
                  value={item.uk} 
                  rows={2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslations(prev => prev.map(t => t.key === item.key ? { ...t, uk: val } : t));
                  }}
                />
              </div>
              <div className="translation-field-group">
                <label>RU (Русский)</label>
                <textarea 
                  value={item.ru} 
                  rows={2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTranslations(prev => prev.map(t => t.key === item.key ? { ...t, ru: val } : t));
                  }}
                />
              </div>
              <div className="translation-field-group">
                <label>EN (English)</label>
                <textarea 
                  value={item.en} 
                  rows={2}
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
  );
}
