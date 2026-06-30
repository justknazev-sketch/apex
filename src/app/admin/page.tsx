'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Refresh router context and navigate to dashboard
        router.refresh();
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Невірний логін або пароль');
      }
    } catch (err) {
      console.error(err);
      setError('Помилка мережі при спробі авторизації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="admin-login-wrapper">
        <h2>Вхід в адмін-панель</h2>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '13px', background: 'rgba(229,57,83,0.1)', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-field">
            <input
              type="text"
              placeholder="Ім'я користувача"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
