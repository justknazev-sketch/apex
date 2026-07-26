'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { FaTruck, FaStore, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

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
  const [deliveryMethod, setDeliveryMethod] = useState('novaposhta');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryWarehouse, setDeliveryWarehouse] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert(t('cart_error_empty_fields'));
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
          detailsJson: JSON.stringify(orderDetails),
          deliveryMethod,
          deliveryCity: deliveryMethod === 'novaposhta' ? deliveryCity : null,
          deliveryWarehouse: deliveryMethod === 'novaposhta' ? deliveryWarehouse : null,
          paymentMethod
        })
      });

      if (res.ok) {
        setOrderSuccess(true);
        clearCart();
        setName('');
        setPhone('');
        setComment('');
      } else {
        alert(t('cart_error_submit'));
      }
    } catch (err) {
      console.error(err);
      alert(t('cart_error_network'));
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
            <h3>{t('cart_success_title')}</h3>
            <p>{t('cart_success_desc')}</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setOrderSuccess(false);
                closeCart();
              }}
            >
              {t('cart_btn_ok')}
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
                    {t('cart_empty_sub')}
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
                    {t('cart_btn_catalog')}
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

                  <div className="checkout-section-title" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>{t('cart_delivery_title')}</div>
                  <div className="form-field" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <label className={`checkout-radio-label ${deliveryMethod === 'novaposhta' ? 'selected' : ''}`} style={{ flex: 1 }}>
                      <input type="radio" value="novaposhta" checked={deliveryMethod === 'novaposhta'} onChange={() => setDeliveryMethod('novaposhta')} />
                      <FaTruck /> {t('cart_delivery_np')}
                    </label>
                    <label className={`checkout-radio-label ${deliveryMethod === 'pickup' ? 'selected' : ''}`} style={{ flex: 1 }}>
                      <input type="radio" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                      <FaStore /> {t('cart_delivery_pickup')}
                    </label>
                  </div>
                  
                  {deliveryMethod === 'novaposhta' && (
                    <>
                      <div className="form-field">
                        <input type="text" placeholder={t('cart_delivery_city')} value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} required={deliveryMethod === 'novaposhta'} />
                      </div>
                      <div className="form-field">
                        <input type="text" placeholder={t('cart_delivery_warehouse')} value={deliveryWarehouse} onChange={(e) => setDeliveryWarehouse(e.target.value)} required={deliveryMethod === 'novaposhta'} />
                      </div>
                    </>
                  )}

                  <div className="checkout-section-title" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>{t('cart_payment_title')}</div>
                  <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <label className={`checkout-radio-label ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                      <FaMoneyBillWave /> {t('cart_payment_cash')}
                    </label>
                    <label className={`checkout-radio-label ${paymentMethod === 'monobank' ? 'selected' : ''}`}>
                      <input type="radio" value="monobank" checked={paymentMethod === 'monobank'} onChange={() => setPaymentMethod('monobank')} />
                      <FaCreditCard /> {t('cart_payment_mono')}
                    </label>
                    <label className={`checkout-radio-label ${paymentMethod === 'liqpay' ? 'selected' : ''}`}>
                      <input type="radio" value="liqpay" checked={paymentMethod === 'liqpay'} onChange={() => setPaymentMethod('liqpay')} />
                      <FaCreditCard /> {t('cart_payment_liqpay')}
                    </label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? t('cart_btn_sending') : t('cart_checkout')}
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
