'use client';

import React, { useState, useEffect } from 'react';
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

interface ConstructorPart {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  price: number;
  icon: string;
}

interface ColorPreset {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
}

interface HomeClientProps {
  initialProducts: Product[];
  initialParts: ConstructorPart[];
  initialColors: ColorPreset[];
}

export default function HomeClient({ initialProducts, initialParts, initialColors }: HomeClientProps) {
  const { t, language } = useLanguage();
  const { addToCart, cart } = useCart();

  // Products state (initialized from server-side props)
  const [products] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Constructor state (initialized from server-side props)
  const [parts] = useState<ConstructorPart[]>(initialParts);
  const [colors] = useState<ColorPreset[]>(initialColors);
  const [selectedParts, setSelectedParts] = useState<Record<string, ConstructorPart>>({});
  const [selectedColor, setSelectedColor] = useState<ColorPreset | null>(
    initialColors.length > 0 ? initialColors[0] : null
  );
  
  // Constructor lead form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custSuccess, setCustSuccess] = useState(false);

  // Consultation callback form state
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbInterest, setCbInterest] = useState('');
  const [cbHow, setCbHow] = useState('');
  const [cbComment, setCbComment] = useState('');
  const [cbSuccess, setCbSuccess] = useState(false);

  // Filter products on search and tab click
  useEffect(() => {
    let result = products;

    if (activeTab !== 'all') {
      result = result.filter((p) => p.category === activeTab);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const name = getLocalizedName(p).toLowerCase();
        return name.includes(q);
      });
    }

    setFilteredProducts(result);
  }, [activeTab, searchQuery, products]);

  const getLocalizedName = (item: Product | ConstructorPart | ColorPreset) => {
    if (language === 'ru') return item.nameRu;
    if (language === 'en') return item.nameEn;
    return item.nameUk; // Default Ukrainian
  };

  const getLocalizedBadge = (item: Product) => {
    if (language === 'ru') return item.badgeRu;
    if (language === 'en') return item.badgeEn;
    return item.badgeUk;
  };

  // Constructor actions
  const togglePart = (part: ConstructorPart) => {
    setSelectedParts((prev) => {
      const updated = { ...prev };
      if (updated[part.id]) {
        delete updated[part.id];
      } else {
        updated[part.id] = part;
      }
      return updated;
    });
  };

  const constructorTotal = Object.values(selectedParts).reduce((sum, item) => sum + item.price, 0);

  const handleConstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partsArray = Object.values(selectedParts);
    if (partsArray.length === 0) {
      alert(language === 'uk' ? 'Будь ласка, оберіть хоча б один елемент.' : 'Выберите хотя бы один элемент.');
      return;
    }
    if (!custName || !custPhone) {
      alert(language === 'uk' ? 'Заповніть ім\'я та телефон.' : 'Заполните имя и телефон.');
      return;
    }

    const orderDetails = {
      elements: partsArray.map(p => getLocalizedName(p)),
      color: selectedColor ? getLocalizedName(selectedColor) : 'Не обрано',
      price: constructorTotal
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customizer',
          name: custName,
          phone: custPhone,
          detailsJson: JSON.stringify(orderDetails)
        })
      });

      if (res.ok) {
        setCustSuccess(true);
        setSelectedParts({});
        setCustName('');
        setCustPhone('');
      } else {
        alert('Помилка при створенні заявки. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з\'єднання.');
    }
  };

  // Consultation Callback Form submission
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cbName || !cbPhone) {
      alert(language === 'uk' ? 'Заповніть обов\'язкові поля.' : 'Заполните обязательные поля.');
      return;
    }

    const details = {
      interestTopic: cbInterest || 'Загальна консультація',
      contactMethod: cbHow || 'Зателефонувати'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'callback',
          name: cbName,
          phone: cbPhone,
          comment: cbComment,
          detailsJson: JSON.stringify(details)
        })
      });

      if (res.ok) {
        setCbSuccess(true);
        setCbName('');
        setCbPhone('');
        setCbInterest('');
        setCbHow('');
        setCbComment('');
      } else {
        alert('Помилка при створенні заявки. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з\'єднання.');
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <header className="hero-wrapper">
        <div className="hero-content">
          <div className="hero-eyebrow">{t('hero_eyebrow')}</div>
          <h1>{t('hero_title')}</h1>
          <p className="hero-desc">{t('hero_desc')}</p>
          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero_btn_catalog')}
            </button>
            <button 
              className="btn-outline"
              onClick={() => document.getElementById('constructor')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero_btn_builder')}
            </button>
          </div>
        </div>
      </header>

      {/* Catalog Grid */}
      <section id="catalog">
        <div className="section-label">{t('catalog_label')}</div>
        <h2>{t('catalog_title')}</h2>
        <p className="section-desc">{t('catalog_desc')}</p>

        <div className="catalog-search-bar">
          <input 
            type="text" 
            placeholder={t('catalog_search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab filters */}
        <div className="category-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>{t('catalog_tab_all')}</button>
          <button className={`tab-btn ${activeTab === 'street' ? 'active' : ''}`} onClick={() => setActiveTab('street')}>{t('catalog_tab_street')}</button>
          <button className={`tab-btn ${activeTab === 'turnik' ? 'active' : ''}`} onClick={() => setActiveTab('turnik')}>{t('catalog_tab_turnik')}</button>
          <button className={`tab-btn ${activeTab === 'ruckhod' ? 'active' : ''}`} onClick={() => setActiveTab('ruckhod')}>{t('catalog_tab_ruckhod')}</button>
          <button className={`tab-btn ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>{t('catalog_tab_workout')}</button>
          <button className={`tab-btn ${activeTab === 'swedish' ? 'active' : ''}`} onClick={() => setActiveTab('swedish')}>{t('catalog_tab_swedish')}</button>
        </div>

        {/* Products listings */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-secondary)', padding: '40px' }}>
              {language === 'uk' ? 'Товарів не знайдено' : language === 'ru' ? 'Товаров не найдено' : 'No products found'}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isAdded = cart.some(item => item.id === p.id);
              let specs: [string, string][] = [];
              try {
                specs = JSON.parse(p.specsJson);
              } catch (e) {
                // ignore
              }
              const badge = getLocalizedBadge(p);

              return (
                <article className="product-card" key={p.id}>
                  <div className="product-photo-wrap">
                    {p.photo ? (
                      <Image 
                        src={p.photo} 
                        alt={getLocalizedName(p)} 
                        className="product-photo-img" 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="product-placeholder-icon">🏋️</span>
                    )}
                    {badge && <span className="product-badge">{badge}</span>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">
                      <Link href={`/product/${p.id}`} className="product-link">
                        {getLocalizedName(p)}
                      </Link>
                    </h3>
                    <ul className="product-specs-list">
                      {specs.slice(0, 3).map(([name, val], idx) => (
                        <li key={idx}>
                          <span className="spec-name">{name}:</span>
                          <span className="spec-val">{val}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="product-footer">
                      <div className="product-price-row">
                        <span className="product-price">{p.price} ₴</span>
                        <Link href={`/product/${p.id}`} className="product-detail-btn">
                          {language === 'uk' ? 'Детально' : language === 'ru' ? 'Подробнее' : 'Details'}
                        </Link>
                      </div>
                      <button 
                        className={`product-buy-btn ${isAdded ? 'in-cart' : ''}`}
                        onClick={() => addToCart({ id: p.id, name: getLocalizedName(p), price: p.price, photo: p.photo })}
                      >
                        {isAdded ? '✓ ' : ''}{isAdded ? t('product_in_cart') : t('product_buy')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Configurator / "Собери сам" */}
      <section id="constructor">
        <div className="section-label">{t('constructor_label')}</div>
        <h2>{t('constructor_title')}</h2>
        <p className="section-desc">{t('constructor_desc')}</p>

        <div className="constructor-wrapper">
          <div className="builder-panel">
            {/* Step 1: Parts selection */}
            <div className="builder-step-box">
              <div className="builder-step-header">{t('constructor_step_elements')}</div>
              <div className="parts-selector-grid">
                {parts.map((p) => {
                  const isSelected = !!selectedParts[p.id];
                  return (
                    <div 
                      key={p.id}
                      className={`part-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => togglePart(p)}
                    >
                      <span className="part-icon">{p.icon}</span>
                      <span className="part-name">{getLocalizedName(p)}</span>
                      <span className="part-price">+{p.price} ₴</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Color picker */}
            <div className="builder-step-box">
              <div className="builder-step-header">{t('constructor_step_color')}</div>
              <div className="color-circles-grid">
                {colors.map((c) => {
                  const isSelected = selectedColor?.id === c.id;
                  return (
                    <button 
                      key={c.id}
                      className={`color-circle-btn ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: c.id }}
                      onClick={() => setSelectedColor(c)}
                      title={getLocalizedName(c)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Configuration Summary & Order panel */}
          <div className="summary-sidebar">
            <div className="summary-header">{t('constructor_summary_title')}</div>
            
            {custSuccess ? (
              <div className="constructor-success-msg" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="success-icon">✓</div>
                <h4 style={{ margin: '10px 0' }}>{t('constructor_form_hint') === 'constructor_form_hint' ? 'Дякуємо!' : 'Заявку надіслано!'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('constructor_form_hint') === 'constructor_form_hint' ? 'Менеджер зателефонує вам найближчим часом.' : t('constructor_form_hint')}</p>
                <button className="btn-primary" style={{ marginTop: '16px', width: '100%' }} onClick={() => setCustSuccess(false)}>ОК</button>
              </div>
            ) : (
              <form onSubmit={handleConstructorSubmit}>
                <ul className="summary-item-list">
                  {Object.values(selectedParts).length === 0 ? (
                    <li className="summary-empty-msg" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                      {t('constructor_summary_empty')}
                    </li>
                  ) : (
                    Object.values(selectedParts).map((p) => (
                      <li className="summary-item-row" key={p.id}>
                        <span>{getLocalizedName(p)}</span>
                        <span className="val">+{p.price} ₴</span>
                      </li>
                    ))
                  )}
                  {selectedColor && (
                    <li className="summary-item-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                      <span>{t('constructor_step_color')}</span>
                      <span className="val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: selectedColor.id }} />
                        {getLocalizedName(selectedColor)}
                      </span>
                    </li>
                  )}
                </ul>

                <div className="summary-total-box">
                  <span className="summary-total-lbl">{t('constructor_summary_total')}</span>
                  <span className="summary-total-val">{constructorTotal} ₴</span>
                </div>

                <div className="form-field">
                  <input 
                    type="text" 
                    placeholder={t('constructor_form_name')} 
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="tel" 
                    placeholder={t('constructor_form_phone')} 
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {t('constructor_form_submit')}
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                  {t('constructor_form_hint')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>



      {/* Reviews */}
      <section id="reviews">
        <div className="section-label">{t('reviews_label')}</div>
        <h2>{t('reviews_title')}</h2>
        <p className="section-desc">{t('reviews_desc')}</p>

        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              {language === 'uk' 
                ? 'Замовили турнік для двору — якість металу відмінна, покриття рівне, монтаж простий. Дуже задоволені!'
                : language === 'ru'
                ? 'Заказали турник во двор — качество металла отличное, покрытие ровное, монтаж простой. Очень довольны!'
                : 'Ordered a pull-up bar for the yard — excellent steel quality, smooth coating, easy installation. Very satisfied!'}
            </p>
            <div className="review-author">
              <div className="review-avatar-lbl">АК</div>
              <div>
                <div className="review-author-name">Андрій К.</div>
                <div className="review-author-meta">{language === 'uk' ? 'Приватне замовлення' : language === 'ru' ? 'Частный заказ' : 'Private client'}</div>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              {language === 'uk' 
                ? 'Шведська стінка для спортзалу. Чітко за розмірами, все зварено акуратно. Рекомендую всім!'
                : language === 'ru'
                ? 'Шведская стенка для спортзала. Четко по размерам, все сварено аккуратно. Рекомендую всем!'
                : 'Swedish wall for the gym. Exact dimensions, welds are extremely neat. Recommend to everyone!'}
            </p>
            <div className="review-author">
              <div className="review-avatar-lbl">МП</div>
              <div>
                <div className="review-author-name">Марина П.</div>
                <div className="review-author-meta">Фітнес-клуб</div>
              </div>
            </div>
          </div>

          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              {language === 'uk' 
                ? 'Замовляли рукохід для дитячого майданчика. Конструкція міцна, діти в захваті. Дякуємо команді Apex Force!'
                : language === 'ru'
                ? 'Заказывали рукоход для детской площадки. Конструкция прочная, дети в восторге. Спасибо команде Apex Force!'
                : 'Ordered monkey bars for a kids playground. The construction is solid, kids are thrilled. Thanks Apex Force team!'}
            </p>
            <div className="review-author">
              <div className="review-avatar-lbl">ОС</div>
              <div>
                <div className="review-author-name">Олена С.</div>
                <div className="review-author-meta">ОСББ, м. Одеса</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts / Callback form */}
      <section id="contact">
        <div className="section-label">{t('contact_label')}</div>
        <div className="contact-wrapper-grid">
          
          <div className="contact-info-panel">
            <h2>{t('contact_title')}</h2>
            <p className="section-desc" style={{ marginBottom: '30px' }}>{t('contact_desc')}</p>
            
            <div className="contact-channels-list">
              <a href="tel:+380733730110" className="contact-channel-btn phone-btn">
                <span>📞 +38 (073) 373-01-10</span>
              </a>
              <a href="viber://chat?number=%2B380733730110" className="contact-channel-btn viber-btn">
                <span>💬 Viber: +380733730110</span>
              </a>
              <a href="https://t.me/+380733730110" target="_blank" rel="noopener noreferrer" className="contact-channel-btn telegram-btn">
                <span>✈️ Telegram Channel</span>
              </a>
              <a href="https://instagram.com/apexforce_vs" target="_blank" rel="noopener noreferrer" className="contact-channel-btn instagram-btn">
                <span>📸 Instagram: @apexforce_vs</span>
              </a>
              <a href="https://vm.tiktok.com/ZS9jaeKtFgwd4-f3Lsx/" target="_blank" rel="noopener noreferrer" className="contact-channel-btn tiktok-btn">
                <span>🎵 TikTok: apexforce_vs</span>
              </a>
            </div>
          </div>

          <div className="contact-form-container">
            {cbSuccess ? (
              <div className="callback-success-msg" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="success-icon" style={{ backgroundColor: '#2E7D32' }}>✓</div>
                <h3 style={{ marginTop: '20px' }}>{t('constructor_form_hint') === 'constructor_form_hint' ? 'Заявка прийнята!' : 'Заявка надіслана!'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '10px' }}>
                  {t('constructor_form_hint') === 'constructor_form_hint' ? 'Менеджер зателефонує вам найближчим часом.' : t('constructor_form_hint')}
                </p>
                <button className="btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => setCbSuccess(false)}>ОК</button>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit}>
                <h3>{t('contact_form_title')}</h3>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-field">
                    <input 
                      type="text" 
                      placeholder={t('contact_form_name')} 
                      value={cbName}
                      onChange={(e) => setCbName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <input 
                      type="tel" 
                      placeholder={t('contact_form_phone')} 
                      value={cbPhone}
                      onChange={(e) => setCbPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <select 
                    value={cbInterest} 
                    onChange={(e) => setCbInterest(e.target.value)}
                  >
                    <option value="">{t('contact_form_interest')}</option>
                    <option value="Турніки">{language === 'uk' ? 'Турніки' : language === 'ru' ? 'Турники' : 'Pull-up Bars'}</option>
                    <option value="Рукоходи">{language === 'uk' ? 'Рукоходи' : language === 'ru' ? 'Рукоходы' : 'Monkey Bars'}</option>
                    <option value="Бруси">{language === 'uk' ? 'Бруси' : language === 'ru' ? 'Брусья' : 'Parallel Bars'}</option>
                    <option value="Шведські стінки">{language === 'uk' ? 'Шведські стінки' : language === 'ru' ? 'Шведские стенки' : 'Swedish Walls'}</option>
                    <option value="Воркаут">{language === 'uk' ? 'Воркаут майданчики' : language === 'ru' ? 'Воркаут площадки' : 'Workout Stations'}</option>
                    <option value="Індивідуальний проект">{language === 'uk' ? 'Індивідуальний проект' : language === 'ru' ? 'Индивидуальный проект' : 'Custom Project'}</option>
                  </select>
                </div>

                <div className="form-field">
                  <select 
                    value={cbHow} 
                    onChange={(e) => setCbHow(e.target.value)}
                  >
                    <option value="">{t('contact_form_how')}</option>
                    <option value="Зателефонувати">{language === 'uk' ? 'Зателефонувати мені' : language === 'ru' ? 'Позвонить мне' : 'Call me'}</option>
                    <option value="Viber">{language === 'uk' ? 'Написати у Viber' : language === 'ru' ? 'Написать в Viber' : 'Message in Viber'}</option>
                    <option value="Telegram">{language === 'uk' ? 'Написати у Telegram' : language === 'ru' ? 'Написать в Telegram' : 'Message in Telegram'}</option>
                  </select>
                </div>

                <div className="form-field">
                  <textarea 
                    placeholder={t('contact_form_comment')} 
                    value={cbComment}
                    onChange={(e) => setCbComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {t('contact_form_submit')}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
