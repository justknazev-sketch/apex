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

  // Helper function to safely return translation or clean fallback
  const getText = (key: string, uk: string, ru?: string, en?: string) => {
    const val = t(key);
    if (val !== key) return val;
    return language === 'en' ? (en || uk) : language === 'ru' ? (ru || uk) : uk;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert(getText('cart_error_empty_fields', 'Будь ласка, заповніть ім\'я та телефон', 'Пожалуйста, заполните имя и телефон', 'Please fill name and phone'));
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
        alert(getText('cart_error_submit', 'Помилка при створенні замовлення. Спробуйте ще раз.', 'Ошибка при создании заказа. Попробуйте еще раз.', 'Order creation error. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      alert(getText('cart_error_network', 'Помилка мережі. Перевірте з\'єднання.', 'Ошибка сети. Проверьте соединение.', 'Network error. Check connection.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay open" onClick={closeCart}></div>
      <aside className="cart-drawer open" aria-label={getText('cart_title', 'Кошик', 'Корзина', 'Cart')}>
        <div className="cart-head">
          <span>{getText('cart_title', 'Кошик', 'Корзина', 'Cart')}</span>
          <button onClick={closeCart} aria-label="Close drawer">&times;</button>
        </div>

        {orderSuccess ? (
          <div className="cart-success-view">
            <div className="success-icon">✓</div>
            <h3>{getText('cart_success_title', 'Дякуємо за замовлення!', 'Спасибо за заказ!', 'Thank you for your order!')}</h3>
            <p>{getText('cart_success_desc', 'Наш менеджер зв\'яжеться з вами найближчим часом.', 'Наш менеджер свяжется с вами в ближайшее время.', 'Our manager will contact you shortly.')}</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setOrderSuccess(false);
                closeCart();
              }}
            >
              {getText('cart_btn_ok', 'ОК', 'ОК', 'OK')}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty-icon">🛒</span>
                  <div className="cart-empty-title">{getText('cart_empty', 'Кошик порожній', 'Корзина пуста', 'Cart is empty')}</div>
                  <p className="cart-empty-sub">
                    {getText('cart_empty_sub', 'Додайте товари з каталогу', 'Добавьте товары из каталога', 'Add products from catalog')}
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
                    {getText('cart_btn_catalog', 'Перейти до каталогу', 'Перейти в каталог', 'Go to catalog')}
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
                  <span className="ctl">{getText('cart_total', 'Всього:', 'Итого:', 'Total:')}</span>
                  <span className="ctv">{cartTotal} ₴</span>
                </div>

                <form className="cart-checkout-form" onSubmit={handleCheckout}>
                  <div className="form-field">
                    <input 
                      type="text" 
                      placeholder={getText('constructor_form_name', 'Ваше ім\'я', 'Ваше имя', 'Your name')} 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-field">
                    <input 
                      type="tel" 
                      placeholder={getText('constructor_form_phone', 'Номер телефону', 'Номер телефона', 'Phone number')} 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-field">
                    <textarea 
                      placeholder={getText('contact_form_comment', 'Коментар або побажання (необов\'язково)', 'Комментарий или пожелания (необязательно)', 'Comment (optional)')} 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="checkout-section-title" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                    {getText('cart_delivery_title', 'Доставка', 'Доставка', 'Delivery')}
                  </div>
                  <div className="form-field" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <label className={`checkout-radio-label ${deliveryMethod === 'novaposhta' ? 'selected' : ''}`} style={{ flex: 1 }}>
                      <input type="radio" value="novaposhta" checked={deliveryMethod === 'novaposhta'} onChange={() => setDeliveryMethod('novaposhta')} />
                      <FaTruck /> {getText('cart_delivery_np', 'Нова Пошта', 'Новая Почта', 'Nova Poshta')}
                    </label>
                    <label className={`checkout-radio-label ${deliveryMethod === 'pickup' ? 'selected' : ''}`} style={{ flex: 1 }}>
                      <input type="radio" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                      <FaStore /> {getText('cart_delivery_pickup', 'Самовивіз', 'Самовывоз', 'Pickup')}
                    </label>
                  </div>
                  
                  {deliveryMethod === 'novaposhta' && (
                    <>
                      <div className="form-field">
                        <input 
                          type="text" 
                          placeholder={getText('cart_delivery_city', 'Місто (напр. Київ)', 'Город (напр. Киев)', 'City (e.g. Kyiv)')} 
                          value={deliveryCity} 
                          onChange={(e) => setDeliveryCity(e.target.value)} 
                          required={deliveryMethod === 'novaposhta'} 
                        />
                      </div>
                      <div className="form-field">
                        <input 
                          type="text" 
                          placeholder={getText('cart_delivery_warehouse', 'Відділення №', 'Отделение №', 'Warehouse #')} 
                          value={deliveryWarehouse} 
                          onChange={(e) => setDeliveryWarehouse(e.target.value)} 
                          required={deliveryMethod === 'novaposhta'} 
                        />
                      </div>
                    </>
                  )}

                  <div className="checkout-section-title" style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                    {getText('cart_payment_title', 'Оплата', 'Оплата', 'Payment')}
                  </div>
                  <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <label className={`checkout-radio-label ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                      <FaMoneyBillWave /> {getText('cart_payment_cash', 'При отриманні (Накладений платіж)', 'При получении (Наложенный платеж)', 'Cash on delivery')}
                    </label>
                    <label className={`checkout-radio-label ${paymentMethod === 'monobank' ? 'selected' : ''}`}>
                      <input type="radio" value="monobank" checked={paymentMethod === 'monobank'} onChange={() => setPaymentMethod('monobank')} />
                      <FaCreditCard /> {getText('cart_payment_mono', 'Оплата картою (Monobank)', 'Оплата картой (Monobank)', 'Card payment (Monobank)')}
                    </label>
                    <label className={`checkout-radio-label ${paymentMethod === 'liqpay' ? 'selected' : ''}`}>
                      <input type="radio" value="liqpay" checked={paymentMethod === 'liqpay'} onChange={() => setPaymentMethod('liqpay')} />
                      <FaCreditCard /> {getText('cart_payment_liqpay', 'Оплата картою (LiqPay / ПриватБанк)', 'Оплата картой (LiqPay / ПриватБанк)', 'Card payment (LiqPay)')}
                    </label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading 
                      ? getText('cart_btn_sending', 'Надсилання...', 'Отправка...', 'Sending...') 
                      : getText('cart_checkout', 'Оформити замовлення', 'Оформить заказ', 'Checkout')
                    }
                  </button>
                </form>

                <button className="cart-clear" onClick={clearCart}>
                  {getText('cart_clear', 'Очистити кошик', 'Очистить корзину', 'Clear cart')}
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
