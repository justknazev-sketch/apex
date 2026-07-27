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
  photosJson?: string | null;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const { addToCart, cart } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse gallery photos
  let galleryPhotos: string[] = [];
  if (product.photosJson) {
    try {
      galleryPhotos = JSON.parse(product.photosJson);
    } catch (e) {
      galleryPhotos = [];
    }
  }
  if (galleryPhotos.length === 0 && product.photo) {
    galleryPhotos = [product.photo];
  }

  const [activePhoto, setActivePhoto] = useState<string>(galleryPhotos[0] || product.photo || '');

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
      alert(t('product_error_empty') === 'product_error_empty' ? 'Заповніть обов\'язкові поля' : t('product_error_empty'));
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
        alert(t('product_error_order') === 'product_error_order' ? 'Помилка замовлення. Спробуйте ще раз.' : t('product_error_order'));
      }
    } catch (err) {
      console.error(err);
      alert(t('product_error_network') === 'product_error_network' ? 'Помилка з\'єднання.' : t('product_error_network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="product-detail-page">
      <Link href="/#catalog" className="back-link" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--red)', fontWeight: '600' }}>
        ← {t('product_back_to_catalog') === 'product_back_to_catalog' ? 'Назад до каталогу' : t('product_back_to_catalog')}
      </Link>

      <div className="product-detail-grid">
        {/* Left: Gallery (Main Photo + Thumbnails) */}
        <div>
          <div 
            className="product-detail-image-box" 
            style={{ 
              background: 'var(--photo-wrap-bg)', 
              border: '1px solid var(--border-light)', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              aspectRatio: '4/3', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'relative',
              marginBottom: galleryPhotos.length > 1 ? '12px' : '0'
            }}
          >
            {activePhoto ? (
              <Image src={activePhoto} alt={getLocalizedName()} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'contain', mixBlendMode: 'multiply', transition: 'all 0.3s ease' }} />
            ) : (
              <span style={{ fontSize: '96px', opacity: 0.2 }}>🏋️</span>
            )}
            {badge && <span className="product-badge" style={{ top: '20px', left: '20px', fontSize: '12px' }}>{badge}</span>}
          </div>

          {/* Gallery Thumbnails List */}
          {galleryPhotos.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {galleryPhotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(url)}
                  style={{
                    width: '72px',
                    height: '54px',
                    position: 'relative',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: activePhoto === url ? '2px solid var(--red)' : '1px solid var(--border-light)',
                    background: 'var(--photo-wrap-bg)',
                    cursor: 'pointer',
                    opacity: activePhoto === url ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    padding: 0,
                    flexShrink: 0
                  }}
                  title={`Фото ${idx + 1}`}
                >
                  <Image src={url} alt={`Thumbnail ${idx + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price, Cart & Fast Buy Form */}
        <div className="product-detail-info-box">
          <h1 style={{ fontSize: '32px', marginBottom: '16px', lineHeight: '1.2' }}>{getLocalizedName()}</h1>
          <div className="product-detail-price" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--red)', marginBottom: '24px' }}>
            {product.price} ₴
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
              {t('product_specs') === 'product_specs' ? 'Характеристики' : t('product_specs')}
            </h3>
            <ul className="product-specs-list" style={{ fontSize: '14px', gap: '8px' }}>
              {specs.filter(([sName]) => sName.toLowerCase() !== 'опис').map(([sName, sVal], idx) => (
                <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #222' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sName}</span>
                  <span style={{ fontWeight: '600' }}>{sVal}</span>
                </li>
              ))}
              {specs.length === 0 && (
                <li style={{ color: 'var(--text-muted)' }}>
                  {t('product_no_desc') === 'product_no_desc' ? 'Опис відсутній' : t('product_no_desc')}
                </li>
              )}
            </ul>
            {specs.find(([sName]) => sName.toLowerCase() === 'опис') && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  {t('product_desc_title') === 'product_desc_title' ? 'Опис товару' : t('product_desc_title')}
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {specs.find(([sName]) => sName.toLowerCase() === 'опис')?.[1]}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart button */}
          <button 
            className={`btn-primary ${isAdded ? 'in-cart' : ''}`} 
            style={{ width: '100%', marginBottom: '24px' }}
            onClick={() => addToCart({ id: product.id, name: getLocalizedName(), price: product.price, photo: activePhoto || product.photo })}
          >
            {isAdded ? t('product_in_cart') : t('product_buy')}
          </button>

          {/* Fast Buy Lead Form */}
          <div className="fast-buy-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '24px' }}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <span className="success-icon" style={{ backgroundColor: '#2E7D32', width: '48px', height: '48px', fontSize: '24px' }}>✓</span>
                <h4 style={{ margin: '12px 0 6px' }}>{t('product_fast_success') === 'product_fast_success' ? 'Дякуємо!' : t('product_fast_success')}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('constructor_form_hint')}</p>
                <button className="btn-outline" style={{ marginTop: '16px', width: '100%', padding: '10px' }} onClick={() => setSuccess(false)}>ОК</button>
              </div>
            ) : (
              <form onSubmit={handleBuyNow}>
                <h4 style={{ fontSize: '15px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>
                  {t('product_fast_title') === 'product_fast_title' ? 'Швидке замовлення / Консультація' : t('product_fast_title')}
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
                  {loading ? (t('product_fast_btn_sending') === 'product_fast_btn_sending' ? 'Надсилання...' : t('product_fast_btn_sending')) : (t('product_fast_btn') === 'product_fast_btn' ? 'Передзвонити мені →' : t('product_fast_btn'))}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
