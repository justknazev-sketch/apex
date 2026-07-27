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

  // Nova Poshta API autocomplete states
  const [npCities, setNpCities] = useState<{ present: string; deliveryCityRef: string; mainDescription?: string }[]>([]);
  const [npWarehouses, setNpWarehouses] = useState<{ description: string; number: string }[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // Helper function to safely return translation or clean fallback
  const getText = (key: string, uk: string, ru?: string, en?: string) => {
    const val = t(key);
    if (val !== key) return val;
    return language === 'en' ? (en || uk) : language === 'ru' ? (ru || uk) : uk;
  };

  // Handle City Autocomplete
  const handleCityChange = async (val: string) => {
    setDeliveryCity(val);
    setDeliveryWarehouse('');
    setNpWarehouses([]);

    if (val.trim().length >= 2) {
      try {
        const res = await fetch(`/api/novaposhta?action=cities&q=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cities && data.cities.length > 0) {
            setNpCities(data.cities);
            setShowCityDropdown(true);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    setNpCities([]);
    setShowCityDropdown(false);
  };

  const selectCity = async (city: { present: string; deliveryCityRef: string; mainDescription?: string }) => {
    const displayName = city.present || city.mainDescription || '';
    setDeliveryCity(displayName);
    setShowCityDropdown(false);

    // Fetch warehouses for selected city
    try {
      const url = city.deliveryCityRef 
        ? `/api/novaposhta?action=warehouses&cityRef=${city.deliveryCityRef}`
        : `/api/novaposhta?action=warehouses&cityName=${encodeURIComponent(city.mainDescription || displayName)}`;
        
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.warehouses && data.warehouses.length > 0) {
          setNpWarehouses(data.warehouses);
          setShowWarehouseDropdown(true);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleWarehouseChange = async (val: string) => {
    setDeliveryWarehouse(val);

    if (npWarehouses.length === 0 && deliveryCity.trim().length >= 2) {
      try {
        const res = await fetch(`/api/novaposhta?action=warehouses&cityName=${encodeURIComponent(deliveryCity.trim())}&q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.warehouses && data.warehouses.length > 0) {
            setNpWarehouses(data.warehouses);
            setShowWarehouseDropdown(true);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    } else if (npWarehouses.length > 0) {
      setShowWarehouseDropdown(true);
    }
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
      totalPrice: cartTotal,
      language
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          name,
          phone,
          comment: comment || null,
          deliveryMethod,
          deliveryCity: deliveryMethod === 'novaposhta' ? deliveryCity : null,
          deliveryWarehouse: deliveryMethod === 'novaposhta' ? deliveryWarehouse : null,
          paymentMethod,
          detailsJson: JSON.stringify(orderDetails)
        })
      });

      if (res.ok) {
        setOrderSuccess(true);
        clearCart();
      } else {
        alert(getText('cart_order_error', 'Помилка при створенні замовлення. Спробуйте ще раз.', 'Ошибка при создании заказа. Попробуйте еще раз.', 'Error placing order. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      alert(getText('cart_conn_error', 'Помилка з\'єднання.', 'Ошибка соединения.', 'Connection error.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>{getText('cart_title', 'Кошик', 'Корзина', 'Cart')} ({cart.reduce((sum, i) => sum + i.quantity, 0)})</h2>
          <button className="cart-close-btn" onClick={closeCart}>×</button>
        </div>

        {orderSuccess ? (
          <div className="cart-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{getText('cart_success_title', 'Замовлення прийнято!', 'Заказ принят!', 'Order placed!')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {getText('cart_success_desc', 'Ми зателефонуємо вам найближчим часом для підтвердження.', 'Мы перезвоним вам в ближайшее время для подтверждения.', 'We will call you shortly to confirm.')}
            </p>
            <button className="btn-primary" onClick={() => { setOrderSuccess(false); closeCart(); }}>
              {getText('cart_btn_continue', 'Продовжити покупки', 'Продолжить покупки', 'Continue shopping')}
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🛒</div>
            <p style={{ color: 'var(--text-secondary)' }}>{getText('cart_empty', 'Ваш кошик порожній', 'Ваша корзина пуста', 'Your cart is empty')}</p>
          </div>
        ) : (
          <>
            <div className="cart-body">
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-photo">
                      {item.photo ? (
                        <Image src={item.photo} alt={item.name} fill style={{ objectFit: 'contain' }} />
                      ) : (
                        <span>🏋️</span>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">{item.price.toLocaleString()} грн</div>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>×</button>
                  </div>
                ))}
              </div>

              <form id="checkout-form" onSubmit={handleCheckout} className="checkout-form">
                <div className="checkout-section-title">{getText('cart_checkout_title', 'Оформлення замовлення', 'Оформление заказа', 'Checkout')}</div>
                
                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder={getText('cart_name_placeholder', 'Ваше ім\'я *', 'Ваше имя *', 'Your name *')} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-field">
                  <input 
                    type="tel" 
                    placeholder={getText('cart_phone_placeholder', 'Телефон *', 'Телефон *', 'Phone *')} 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
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
                    <div className="form-field np-autocomplete-container">
                      <input 
                        type="text" 
                        placeholder={getText('cart_delivery_city', 'Місто (напр. Київ)', 'Город (напр. Киев)', 'City (e.g. Kyiv)')} 
                        value={deliveryCity} 
                        onChange={(e) => handleCityChange(e.target.value)} 
                        onFocus={() => npCities.length > 0 && setShowCityDropdown(true)}
                        required={deliveryMethod === 'novaposhta'} 
                      />
                      {showCityDropdown && npCities.length > 0 && (
                        <ul className="np-autocomplete-dropdown">
                          {npCities.map((c, idx) => (
                            <li key={idx} className="np-dropdown-item" onClick={() => selectCity(c)}>
                              {c.present}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="form-field np-autocomplete-container">
                      <input 
                        type="text" 
                        placeholder={getText('cart_delivery_warehouse', 'Відділення № або адреса', 'Отделение № или адрес', 'Warehouse # or address')} 
                        value={deliveryWarehouse} 
                        onChange={(e) => handleWarehouseChange(e.target.value)} 
                        onFocus={() => npWarehouses.length > 0 && setShowWarehouseDropdown(true)}
                        required={deliveryMethod === 'novaposhta'} 
                      />
                      {showWarehouseDropdown && npWarehouses.length > 0 && (
                        <ul className="np-autocomplete-dropdown">
                          {npWarehouses
                            .filter(w => !deliveryWarehouse || w.description.toLowerCase().includes(deliveryWarehouse.toLowerCase()) || w.number === deliveryWarehouse)
                            .slice(0, 60)
                            .map((w, idx) => (
                              <li 
                                key={idx} 
                                className="np-dropdown-item" 
                                onClick={() => {
                                  setDeliveryWarehouse(w.description);
                                  setShowWarehouseDropdown(false);
                                }}
                              >
                                {w.description}
                              </li>
                            ))}
                        </ul>
                      )}
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
                    <FaCreditCard /> {getText('cart_payment_liqpay', 'LiqPay / Приват24', 'LiqPay / Приват24', 'LiqPay / Privat24')}
                  </label>
                </div>

                <div className="form-field">
                  <textarea 
                    placeholder={getText('cart_comment_placeholder', 'Коментар до замовлення', 'Комментарий к заказу', 'Order comment')} 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    rows={2} 
                  />
                </div>
              </form>
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <span>{getText('cart_total', 'Всього:', 'Итого:', 'Total:')}</span>
                <span className="cart-total-price">{cartTotal.toLocaleString()} грн</span>
              </div>
              <button 
                type="submit" 
                form="checkout-form" 
                className="btn-primary cart-checkout-btn"
                disabled={loading}
              >
                {loading ? getText('cart_processing', 'Обробка...', 'Обработка...', 'Processing...') : getText('cart_btn_order', 'Оформити замовлення', 'Оформить заказ', 'Place order')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
