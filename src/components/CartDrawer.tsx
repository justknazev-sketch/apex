'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    clearCart 
  } = useCart();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert(language === 'uk' ? 'Будь ласка, заповніть ім\'я та телефон' : language === 'ru' ? 'Пожалуйста, заполните имя и телефон' : 'Please fill name and phone');
      return;
    }

    setLoading(true);

    const orderDetails = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: cartTotal
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          name,
          phone,
          comment,
          detailsJson: JSON.stringify(orderDetails)
        })
      });

      if (res.ok) {
        setOrderSuccess(true);
        clearCart();
        setName('');
        setPhone('');
        setComment('');
      } else {
        alert('Помилка при створенні замовлення. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка мережі. Перевірте з\'єднання.');
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay open" onClick={closeCart}></div>
      <aside className="cart-drawer open" aria-label={t('cart_title')}>
        <div className="cart-head">
          <span>{t('cart_title')}</span>
          <button onClick={closeCart} aria-label="Close drawer">&times;</button>
        </div>

        {orderSuccess ? (
          <div className="cart-success-view">
            <div className="success-icon">✓</div>
            <h3>{t('constructor_form_hint') === 'constructor_form_hint' ? 'Дякуємо! Замовлення прийнято.' : 'Дякуємо за замовлення!'}</h3>
            <p>{t('constructor_form_hint') === 'constructor_form_hint' ? 'Наш менеджер зв\'яжеться з вами найближчим часом.' : t('constructor_form_hint')}</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setOrderSuccess(false);
                closeCart();
              }}
            >
              ОК
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty-icon">🛒</span>
                  <div className="cart-empty-title">{t('cart_empty')}</div>
                  <p className="cart-empty-sub">
                    {t('cart_empty') === 'cart_empty' ? 'Додайте товари з каталогу' : 'Додайте товари з каталогу'}
                  </p>
                  <button
                    className="btn-outline"
                    style={{ padding: '10px 24px', fontSize: '13px', marginTop: '4px' }}
                    onClick={() => {
                      closeCart();
                      setTimeout(() => {
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }, 300);
                    }}
                  >
                    Перейти до каталогу
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    {item.photo ? (
                      <div className="cart-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
                        <Image src={item.photo} alt={item.name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className="cart-thumb-placeholder">🏋️</div>
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{item.price} ₴</div>
                      <div className="cart-qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-remove" onClick={() => removeFromCart(item.id)} title="Remove item">&times;</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-foot">
                <div className="cart-total-row">
                  <span className="ctl">{t('cart_total')}</span>
                  <span className="ctv">{cartTotal} ₴</span>
                </div>

                <form className="cart-checkout-form" onSubmit={handleCheckout}>
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
                  <div className="form-field">
                    <textarea 
                      placeholder={t('contact_form_comment')} 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Надсилання...' : t('cart_checkout')}
                  </button>
                </form>

                <button className="cart-clear" onClick={clearCart}>{t('cart_clear')}</button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
