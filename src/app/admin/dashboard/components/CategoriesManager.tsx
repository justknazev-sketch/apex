import React, { useState, useEffect } from 'react';
import { showToast, useConfirm } from './Toast';

export interface Category {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  order: number;
}

interface Props {
  onClose: () => void;
  onUpdate: () => void;
}

export default function CategoriesManager({ onClose, onUpdate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ id: '', nameUk: '', nameRu: '', nameEn: '', order: 0 });
  const { confirm, dialog } = useConfirm();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      showToast('Помилка завантаження категорій', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleEdit = (cat: Category) => {
    setForm(cat);
    setEditingId(cat.id);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setForm({ id: '', nameUk: '', nameRu: '', nameEn: '', order: categories.length + 1 });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Видалення', 'Видалити категорію? Товари в ній можуть втратити прив\'язку.')) {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Категорію видалено');
        loadCategories();
        onUpdate();
      } else {
        const data = await res.json();
        showToast(data.error || 'Помилка видалення', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editingId;
    const url = isNew ? '/api/categories' : `/api/categories/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: Number(form.order) })
    });

    if (res.ok) {
      showToast(`Категорію ${isNew ? 'створено' : 'оновлено'}`);
      setIsEditing(false);
      loadCategories();
      onUpdate();
    } else {
      showToast('Помилка збереження', 'error');
    }
  };

  return (
    <div className="admin-modal-overlay">
      {dialog}
      <div className="admin-modal-card" style={{ maxWidth: '700px' }}>
        <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Управління категоріями</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>ID (англійською, без пробілів)*</label>
              <input type="text" value={form.id} onChange={e => setForm({...form, id: e.target.value})} required disabled={!!editingId} placeholder="напр. street" />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Назва (Укр)*</label>
              <input type="text" value={form.nameUk} onChange={e => setForm({...form, nameUk: e.target.value})} required />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Назва (Рос)</label>
              <input type="text" value={form.nameRu} onChange={e => setForm({...form, nameRu: e.target.value})} />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Назва (Eng)</label>
              <input type="text" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} />
            </div>
            <div className="form-field">
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Порядок сортування</label>
              <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} />
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Скасувати</button>
              <button type="submit" className="btn-primary">Зберегти</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: '16px' }}>
              <button type="button" className="btn-primary" onClick={handleAdd}>+ Додати категорію</button>
            </div>
            
            {loading ? <p>Завантаження...</p> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Порядок</th>
                    <th>ID</th>
                    <th>Назва (Укр)</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.order}</td>
                      <td>{c.id}</td>
                      <td style={{ fontWeight: 'bold' }}>{c.nameUk}</td>
                      <td>
                        <div className="action-links">
                          <span className="action-edit-btn" onClick={() => handleEdit(c)}>Редагувати</span>
                          <span className="action-delete-btn" onClick={() => handleDelete(c.id)}>Видалити</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
