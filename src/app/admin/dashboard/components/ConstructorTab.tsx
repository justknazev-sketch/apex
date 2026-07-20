'use client';

import React, { useState, useEffect } from 'react';
import { ConstructorPart, ColorPreset, LoadingSpinner, EmptyState } from './Shared';
import { showToast, useConfirm } from './Toast';

export default function ConstructorTab() {
  const [parts, setParts] = useState<ConstructorPart[]>([]);
  const [colors, setColors] = useState<ColorPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [colorForm, setColorForm] = useState({ id: '', nameUk: '', nameRu: '', nameEn: '' });
  const [adminLang, setAdminLang] = useState<'uk' | 'ru' | 'en'>('uk');

  const { confirm, dialog } = useConfirm();

  const loadConstructor = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/constructor/elements'),
        fetch('/api/constructor/colors')
      ]);
      if (pRes.ok) setParts(await pRes.json());
      if (cRes.ok) setColors(await cRes.json());
    } catch (e) {
      showToast('Помилка мережі при завантаженні конструктора', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadConstructor());
  }, []);

  const handleUpdatePartPrice = async (id: string, price: number, nameUk: string, nameRu: string, nameEn: string, icon: string) => {
    try {
      const res = await fetch(`/api/constructor/elements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, nameUk, nameRu, nameEn, icon })
      });
      if (res.ok) {
        showToast('Ціну деталі оновлено!');
        loadConstructor();
      } else {
        showToast('Помилка оновлення ціни', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorForm.id.startsWith('#')) {
      showToast('HEX код повинен починатися з #', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/constructor/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorForm)
      });
      if (res.ok) {
        setIsColorModalOpen(false);
        setColorForm({ id: '', nameUk: '', nameRu: '', nameEn: '' });
        showToast('Колір успішно додано');
        loadConstructor();
      } else {
        showToast('Помилка додавання кольору', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (await confirm('Видалення кольору', 'Видалити цей колір?')) {
      try {
        const res = await fetch(`/api/constructor/colors/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Колір видалено');
          loadConstructor();
        } else {
          showToast('Помилка видалення', 'error');
        }
      } catch (e) {
        showToast('Помилка мережі', 'error');
      }
    }
  };

  if (loading && parts.length === 0 && colors.length === 0) return <LoadingSpinner text="Завантаження деталей конструктора..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
      {dialog}
      {/* Elements Price tuning */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '20px' }}>Ціни деталей конструктора</h3>
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
              {parts.length === 0 ? (
                <tr><td colSpan={3}><EmptyState icon="⚙️" title="Деталей не знайдено" /></td></tr>
              ) : (
                parts.map(part => (
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
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '6px', borderRadius: '4px', width: '90px', outline: 'none' }}
                      />
                    </td>
                    <td>
                      <button 
                        className="order-card-action-btn"
                        style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-primary)' }}
                        onClick={() => handleUpdatePartPrice(part.id, part.price, part.nameUk, part.nameRu, part.nameEn, part.icon)}
                      >
                        Оновити
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Colors Preset Admin list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '18px' }}>Кольори конструктора</h3>
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
              {colors.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon="🎨" title="Кольорів не знайдено" /></td></tr>
              ) : (
                colors.map(color => (
                  <tr key={color.id}>
                    <td>
                      <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.id, border: '1px solid var(--border-light)' }} />
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{color.id}</td>
                    <td style={{ fontWeight: '600' }}>{color.nameUk}</td>
                    <td>
                      <span className="action-delete-btn" onClick={() => handleDeleteColor(color.id)}>Видалити</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isColorModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '400px' }}>
            <div className="admin-modal-header">Додати колір конструктора</div>
            <form onSubmit={handleAddColor}>
              <div className="form-field">
                <input 
                  type="color" 
                  value={colorForm.id || '#ff0000'}
                  onChange={(e) => setColorForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', height: '40px', padding: '0', cursor: 'pointer', border: '1px solid var(--border-light)', borderRadius: '4px' }}
                />
                <input 
                  type="text" 
                  placeholder="HEX код (напр. #FF0000)*" 
                  value={colorForm.id}
                  onChange={(e) => setColorForm(prev => ({ ...prev, id: e.target.value }))}
                  required
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div className="admin-lang-tabs" style={{ marginTop: '16px' }}>
                <button type="button" className={`admin-lang-tab uk ${adminLang === 'uk' ? 'active' : ''}`} onClick={() => setAdminLang('uk')}>Укр</button>
                <button type="button" className={`admin-lang-tab ru ${adminLang === 'ru' ? 'active' : ''}`} onClick={() => setAdminLang('ru')}>Рус</button>
                <button type="button" className={`admin-lang-tab en ${adminLang === 'en' ? 'active' : ''}`} onClick={() => setAdminLang('en')}>Eng</button>
              </div>

              {adminLang === 'uk' && (
                <div className="form-field"><input type="text" placeholder="Назва (UA)*" value={colorForm.nameUk} onChange={(e) => setColorForm(prev => ({ ...prev, nameUk: e.target.value }))} required /></div>
              )}
              {adminLang === 'ru' && (
                <div className="form-field"><input type="text" placeholder="Назва (RU)" value={colorForm.nameRu} onChange={(e) => setColorForm(prev => ({ ...prev, nameRu: e.target.value }))} /></div>
              )}
              {adminLang === 'en' && (
                <div className="form-field"><input type="text" placeholder="Назва (EN)" value={colorForm.nameEn} onChange={(e) => setColorForm(prev => ({ ...prev, nameEn: e.target.value }))} /></div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="btn-outline" onClick={() => setIsColorModalOpen(false)} style={{ padding: '8px 16px', fontSize: '12px' }}>Скасувати</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Додати</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
