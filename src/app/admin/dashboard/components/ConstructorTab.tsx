'use client';

import React, { useState, useEffect } from 'react';
import { ConstructorPart, ColorPreset, LoadingSpinner, EmptyState } from './Shared';
import { showToast, useConfirm } from './Toast';

// Popular RAL Classic Color presets dataset
const RAL_PRESETS = [
  { id: '#0A0A0A', ralCode: 'RAL 9005', uk: 'Глибоко-чорний (RAL 9005)', ru: 'Глубокий черный (RAL 9005)', en: 'Jet Black (RAL 9005)' },
  { id: '#373D43', ralCode: 'RAL 7016', uk: 'Антрацитово-сірий / Графіт (RAL 7016)', ru: 'Антрацитовый серый / Графит (RAL 7016)', en: 'Anthracite Grey (RAL 7016)' },
  { id: '#F6F6F6', ralCode: 'RAL 9016', uk: 'Білосніжний (RAL 9016)', ru: 'Белоснежный (RAL 9016)', en: 'Traffic White (RAL 9016)' },
  { id: '#C1121C', ralCode: 'RAL 3020', uk: 'Трафіковий червоний (RAL 3020)', ru: 'Трафиковый красный (RAL 3020)', en: 'Traffic Red (RAL 3020)' },
  { id: '#00438A', ralCode: 'RAL 5005', uk: 'Сигнальний синій (RAL 5005)', ru: 'Сигнальный синий (RAL 5005)', en: 'Signal Blue (RAL 5005)' },
  { id: '#0E4438', ralCode: 'RAL 6005', uk: 'Зелений мох (RAL 6005)', ru: 'Зеленый мох (RAL 6005)', en: 'Moss Green (RAL 6005)' },
  { id: '#F3C010', ralCode: 'RAL 1021', uk: 'Ріпаково-жовтий (RAL 1021)', ru: 'Рапсово-желтый (RAL 1021)', en: 'Rape Yellow (RAL 1021)' },
  { id: '#CBD0CC', ralCode: 'RAL 7035', uk: 'Світло-сірий (RAL 7035)', ru: 'Светло-серый (RAL 7035)', en: 'Light Grey (RAL 7035)' },
  { id: '#442F29', ralCode: 'RAL 8017', uk: 'Шоколадно-коричневий (RAL 8017)', ru: 'Шоколадно-коричневый (RAL 8017)', en: 'Chocolate Brown (RAL 8017)' },
  { id: '#E15501', ralCode: 'RAL 2004', uk: 'Чистий оранжевий (RAL 2004)', ru: 'Чистый оранжевый (RAL 2004)', en: 'Pure Orange (RAL 2004)' },
  { id: '#922B79', ralCode: 'RAL 4006', uk: 'Трафіковий пурпур (RAL 4006)', ru: 'Трафиковый пурпур (RAL 4006)', en: 'Traffic Purple (RAL 4006)' },
  { id: '#57A639', ralCode: 'RAL 6018', uk: 'Жовто-зелений / Лайм (RAL 6018)', ru: 'Желто-зеленый / Лайм (RAL 6018)', en: 'Yellow Green (RAL 6018)' },
];

export default function ConstructorTab() {
  const [parts, setParts] = useState<ConstructorPart[]>([]);
  const [colors, setColors] = useState<ColorPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isRalPickerOpen, setIsRalPickerOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<ConstructorPart | null>(null);

  const [colorForm, setColorForm] = useState({ id: '', ralCode: '', nameUk: '', nameRu: '', nameEn: '' });
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
    loadConstructor();
  }, []);

  const handleUpdatePart = async (part: ConstructorPart) => {
    try {
      const res = await fetch(`/api/constructor/elements/${part.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: part.price,
          nameUk: part.nameUk,
          nameRu: part.nameRu,
          nameEn: part.nameEn,
          icon: part.icon,
          photo: part.photo
        })
      });
      if (res.ok) {
        showToast('Деталь конструктора оновлено!');
        setEditingPart(null);
        loadConstructor();
      } else {
        showToast('Помилка оновлення деталі', 'error');
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
        setColorForm({ id: '', ralCode: '', nameUk: '', nameRu: '', nameEn: '' });
        showToast('Колір успішно додано');
        loadConstructor();
      } else {
        showToast('Помилка додавання кольору', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleAddRalPreset = async (preset: typeof RAL_PRESETS[0]) => {
    try {
      const res = await fetch('/api/constructor/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: preset.id,
          ralCode: preset.ralCode,
          nameUk: preset.uk,
          nameRu: preset.ru,
          nameEn: preset.en
        })
      });
      if (res.ok) {
        showToast(`Додано колір ${preset.ralCode}`);
        loadConstructor();
      } else {
        showToast('Помилка додавання кольору', 'error');
      }
    } catch (e) {
      showToast('Помилка мережі', 'error');
    }
  };

  const handleDeleteColor = async (id: string) => {
    const isConfirmed = await confirm('Видалення кольору', 'Видалити цей колір з конструктора?');
    if (isConfirmed) {
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

  // Cloudinary image upload handler
  const handleUploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'jjekokdx');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/th95enet/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url && editingPart) {
        setEditingPart({ ...editingPart, photo: data.secure_url });
        showToast('Фото завантажено!');
      }
    } catch (e) {
      showToast('Помилка завантаження фото', 'error');
    }
  };

  if (loading && parts.length === 0 && colors.length === 0) {
    return <LoadingSpinner text="Завантаження елементів конструктора..." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
      {dialog}

      {/* Elements Manager (Left Column) */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '20px' }}>
          🛠️ Елементи & Ціни Конструктора
        </h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Фото / Іконка</th>
                <th>Назва (UA)</th>
                <th>Ціна (₴)</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon="⚙️" title="Деталей не знайдено" /></td></tr>
              ) : (
                parts.map(part => (
                  <tr key={part.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {part.photo ? (
                          <img src={part.photo} alt={part.nameUk} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff' }} />
                        ) : (
                          <span style={{ fontSize: '24px' }}>{part.icon || '🛠️'}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{part.nameUk}</td>
                    <td>
                      <input 
                        type="number" 
                        value={part.price} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setParts(prev => prev.map(p => p.id === part.id ? { ...p, price: val } : p));
                        }}
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: '4px', width: '90px', outline: 'none', fontWeight: '700' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                          onClick={() => setEditingPart(part)}
                        >
                          ⚙️ Налаштувати
                        </button>
                        <button 
                          className="order-card-action-btn"
                          style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-primary)' }}
                          onClick={() => handleUpdatePart(part)}
                        >
                          Зберегти
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Colors & RAL Palette Manager (Right Column) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '18px' }}>🎨 Палітра кольорів (RAL Classic)</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => setIsRalPickerOpen(!isRalPickerOpen)}>
              🌈 Каталог RAL
            </button>
            <button className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => setIsColorModalOpen(true)}>
              + Свій колір
            </button>
          </div>
        </div>

        {/* Quick RAL Presets Picker Panel */}
        {isRalPickerOpen && (
          <div className="admin-modal-card" style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-dark)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Швидке додавання з колекції RAL Classic:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {RAL_PRESETS.map(preset => {
                const isAdded = colors.some(c => c.id === preset.id || c.ralCode === preset.ralCode);
                return (
                  <button 
                    key={preset.ralCode}
                    onClick={() => !isAdded && handleAddRalPreset(preset)}
                    disabled={isAdded}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '6px',
                      cursor: isAdded ? 'default' : 'pointer',
                      opacity: isAdded ? 0.5 : 1,
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: preset.id, border: '1px solid var(--border-light)', flexShrink: 0 }} />
                    <span>{preset.ralCode}</span>
                    {isAdded && <span style={{ marginLeft: 'auto', color: '#2E7D32' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Колір</th>
                <th>Код / HEX</th>
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
                      <span style={{ display: 'inline-block', width: '26px', height: '26px', borderRadius: '50%', backgroundColor: color.id, border: '1px solid var(--border-light)' }} />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                      {color.ralCode || color.id}
                    </td>
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

      {/* Edit Element Modal */}
      {editingPart && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Налаштування елемента: {editingPart.nameUk}</h2>
              <button className="close-btn" onClick={() => setEditingPart(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label>Фото елемента (або іконка)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {editingPart.photo ? (
                    <img src={editingPart.photo} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '6px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      {editingPart.icon || '🛠️'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files?.[0] && handleUploadPhoto(e.target.files[0])} 
                      style={{ fontSize: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Завантажити нове фото елемента (Cloudinary)
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label>URL фотографії (альтернативно)</label>
                <input 
                  type="text" 
                  value={editingPart.photo || ''} 
                  placeholder="https://res.cloudinary.com/..." 
                  onChange={e => setEditingPart({ ...editingPart, photo: e.target.value })} 
                />
              </div>

              <div className="admin-form-group">
                <label>Emoji іконка</label>
                <input 
                  type="text" 
                  value={editingPart.icon || ''} 
                  onChange={e => setEditingPart({ ...editingPart, icon: e.target.value })} 
                />
              </div>

              <div className="admin-form-group">
                <label>Ціна (₴)</label>
                <input 
                  type="number" 
                  value={editingPart.price} 
                  onChange={e => setEditingPart({ ...editingPart, price: Number(e.target.value) })} 
                />
              </div>

              <div className="admin-form-group">
                <label>Назва елемента (UA)</label>
                <input 
                  type="text" 
                  value={editingPart.nameUk} 
                  onChange={e => setEditingPart({ ...editingPart, nameUk: e.target.value })} 
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-outline" onClick={() => setEditingPart(null)}>Скасувати</button>
              <button className="btn-primary" onClick={() => handleUpdatePart(editingPart)}>Зберегти зміни</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Color Modal */}
      {isColorModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '440px' }}>
            <div className="admin-modal-header">
              <h2>Додати свій колір / код RAL</h2>
              <button className="close-btn" onClick={() => setIsColorModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddColor}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Выбор цвета на палитре & HEX</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={colorForm.id || '#ff0000'}
                      onChange={(e) => setColorForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                      style={{ width: '50px', height: '40px', padding: '0', cursor: 'pointer', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                    />
                    <input 
                      type="text" 
                      placeholder="HEX код (напр. #FF0000)*" 
                      value={colorForm.id}
                      onChange={(e) => setColorForm(prev => ({ ...prev, id: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Код RAL (напр. RAL 7016 або RAL 9005)</label>
                  <input 
                    type="text" 
                    placeholder="RAL 7016" 
                    value={colorForm.ralCode}
                    onChange={(e) => setColorForm(prev => ({ ...prev, ralCode: e.target.value }))}
                  />
                </div>

                <div className="admin-lang-tabs" style={{ marginTop: '16px' }}>
                  <button type="button" className={`admin-lang-tab uk ${adminLang === 'uk' ? 'active' : ''}`} onClick={() => setAdminLang('uk')}>Укр</button>
                  <button type="button" className={`admin-lang-tab ru ${adminLang === 'ru' ? 'active' : ''}`} onClick={() => setAdminLang('ru')}>Рус</button>
                  <button type="button" className={`admin-lang-tab en ${adminLang === 'en' ? 'active' : ''}`} onClick={() => setAdminLang('en')}>Eng</button>
                </div>

                {adminLang === 'uk' && (
                  <div className="form-field"><input type="text" placeholder="Назва кольору (UA)*" value={colorForm.nameUk} onChange={(e) => setColorForm(prev => ({ ...prev, nameUk: e.target.value }))} required /></div>
                )}
                {adminLang === 'ru' && (
                  <div className="form-field"><input type="text" placeholder="Назва кольору (RU)" value={colorForm.nameRu} onChange={(e) => setColorForm(prev => ({ ...prev, nameRu: e.target.value }))} /></div>
                )}
                {adminLang === 'en' && (
                  <div className="form-field"><input type="text" placeholder="Назва кольору (EN)" value={colorForm.nameEn} onChange={(e) => setColorForm(prev => ({ ...prev, nameEn: e.target.value }))} /></div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsColorModalOpen(false)}>Скасувати</button>
                <button type="submit" className="btn-primary">Зберегти колір</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
