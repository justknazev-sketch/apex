'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  category: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  badgeUk?: string | null;
  badgeRu?: string | null;
  badgeEn?: string | null;
  specsJson: string;
  photo?: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const { addToCart, cart } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdded = cart.some(item => item.id === product.id);

  let specs: [string, string][] = [];
  try {
    specs = JSON.parse(product.specsJson);
  } catch (e) {
    // Ignore
  }

  const getLocalizedName = () => {
    if (language === 'ru') return product.nameRu;
    if (language === 'en') return product.nameEn;
    return product.nameUk;
  };

  const getLocalizedBadge = () => {
    if (language === 'ru') return product.badgeRu;
    if (language === 'en') return product.badgeEn;
    return product.badgeUk;
  };

  const badge = getLocalizedBadge();

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert(language === 'uk' ? 'Заповніть обов\'язкові поля' : 'Заполните обязательные поля');
      return;
    }

    setLoading(true);

    const orderDetails = {
      productName: getLocalizedName(),
      price: product.price,
      quantity: 1
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          name,
          phone,
          detailsJson: JSON.stringify(orderDetails)
        })
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setPhone('');
      } else {
        alert('Помилка замовлення. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з\'єднання.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="product-detail-page">
      <Link href="/#catalog" className="back-link" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--red)', fontWeight: '600' }}>
        ← {language === 'uk' ? 'Назад до каталогу' : language === 'ru' ? 'Назад в каталог' : 'Back to Catalog'}
      </Link>

      <div className="product-detail-grid">
        {/* Left: Photo */}
        <div className="product-detail-image-box" style={{ background: 'var(--photo-wrap-bg)', border: '1px solid transparent', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.photo ? (
            <Image src={product.photo} alt={getLocalizedName()} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', mixBlendMode: 'multiply' }} />
          ) : (
            <span style={{ fontSize: '96px', opacity: 0.2 }}>🏋️</span>
          )}
          {badge && <span className="product-badge" style={{ top: '20px', left: '20px', fontSize: '12px' }}>{badge}</span>}
        </div>

        {/* Right: Info, Price, Cart & Fast Buy Form */}
        <div className="product-detail-info-box">
          <h1 style={{ fontSize: '32px', marginBottom: '16px', lineHeight: '1.2' }}>{getLocalizedName()}</h1>
          <div className="product-detail-price" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--red)', marginBottom: '24px' }}>
            {product.price} ₴
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              {language === 'uk' ? 'Характеристики' : language === 'ru' ? 'Характеристики' : 'Specifications'}
            </h3>
            <ul className="product-specs-list" style={{ fontSize: '14px', gap: '8px' }}>
              {specs.map(([sName, sVal], idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #222' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sName}</span>
                  <span style={{ fontWeight: '600' }}>{sVal}</span>
                </li>
              ))}
              {specs.length === 0 && (
                <li style={{ color: 'var(--text-muted)' }}>
                  {language === 'uk' ? 'Опис відсутній' : 'Описание отсутствует'}
                </li>
              )}
            </ul>
          </div>

          {/* Add to Cart button */}
          <button 
            className={`btn-primary ${isAdded ? 'in-cart' : ''}`} 
            style={{ width: '100%', marginBottom: '24px' }}
            onClick={() => addToCart({ id: product.id, name: getLocalizedName(), price: product.price, photo: product.photo })}
          >
            {isAdded ? t('product_in_cart') : t('product_buy')}
          </button>

          {/* Fast Buy Lead Form */}
          <div className="fast-buy-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '24px' }}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <span className="success-icon" style={{ backgroundColor: '#2E7D32', width: '48px', height: '48px', fontSize: '24px' }}>✓</span>
                <h4 style={{ margin: '12px 0 6px' }}>{language === 'uk' ? 'Дякуємо!' : 'Заявка принята!'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('constructor_form_hint')}</p>
                <button className="btn-outline" style={{ marginTop: '16px', width: '100%', padding: '10px' }} onClick={() => setSuccess(false)}>ОК</button>
              </div>
            ) : (
              <form onSubmit={handleBuyNow}>
                <h4 style={{ fontSize: '15px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>
                  {language === 'uk' ? 'Швидке замовлення / Консультація' : language === 'ru' ? 'Быстрый заказ / Консультация' : 'Fast Order / Callback'}
                </h4>
                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder={t('constructor_form_name')} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="tel" 
                    placeholder={t('constructor_form_phone')} 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn-outline" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                  {loading ? 'Надсилання...' : (language === 'uk' ? 'Передзвонити мені →' : 'Перезвонить мне →')}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
