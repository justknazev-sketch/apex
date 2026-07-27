'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { FaPhoneAlt, FaViber, FaTelegramPlane, FaInstagram, FaTiktok } from 'react-icons/fa';
import { RAL_GROUPS, RAL_CLASSIC_COLLECTION, RalColor } from '@/lib/ralColors';

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
  photo?: string | null;
}

interface ColorPreset {
  id: string;
  ralCode?: string | null;
  nameUk: string;
  nameRu: string;
  nameEn: string;
}

interface Category {
  id: string;
  nameUk: string;
  nameRu: string;
  nameEn: string;
  order: number;
}

interface HomeClientProps {
  initialProducts: Product[];
  initialParts: ConstructorPart[];
  initialColors: ColorPreset[];
  initialCategories: Category[];
}

export default function HomeClient({ initialProducts, initialParts, initialColors, initialCategories }: HomeClientProps) {
  const { t, language } = useLanguage();
  const { addToCart, cart } = useCart();
  const router = useRouter();

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
  const [colorSearchQuery, setColorSearchQuery] = useState('');
  const [selectedRalGroup, setSelectedRalGroup] = useState<string>('all');
  
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
  }, [activeTab, searchQuery, products, language]);

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
          <div className="hero-eyebrow">
            {t('hero_eyebrow').includes('—') ? (
              <>
                <span>{t('hero_eyebrow').split('—')[0].trim()}</span>
                <span style={{ color: 'var(--red)', margin: '0 8px' }}>•</span>
                <span>{t('hero_eyebrow').split('—')[1].trim()}</span>
              </>
            ) : (
              t('hero_eyebrow')
            )}
          </div>
          <h1 className="hero-brand-title">
            <span className="logo-apex">APEX</span> <span className="logo-force">FORCE</span>
          </h1>
          <div className="hero-slogan-subtitle">
            {(() => {
              const raw = t('hero_title');
              const cleanText = raw.replace(/^APEX FORCE\s*[—\-]\s*/i, '').trim();
              const words = cleanText.split(' ');
              if (words.length > 1) {
                const lastWord = words.pop();
                return (
                  <>
                    <span>{words.join(' ')}</span>
                    <span className="hero-slogan-accent">{lastWord}</span>
                  </>
                );
              }
              return cleanText;
            })()}
          </div>
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
          {initialCategories.map(c => (
            <button key={c.id} className={`tab-btn ${activeTab === c.id ? 'active' : ''}`} onClick={() => setActiveTab(c.id)}>
              {getLocalizedName(c)}
            </button>
          ))}
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
                <article className="product-card" key={p.id} onClick={() => router.push(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="product-photo-wrap">
                    {p.photo ? (
                      <Image 
                        src={p.photo} 
                        alt={getLocalizedName(p)} 
                        className="product-photo-img" 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="product-placeholder-icon">🏋️</span>
                    )}
                    {badge && <span className="product-badge">{badge}</span>}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">
                      <span className="product-link">
                        {getLocalizedName(p)}
                      </span>
                    </h3>
                    {specs.find(([n]) => n.toLowerCase() === 'опис') && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '8px', lineHeight: '1.4' }}>
                        {specs.find(([n]) => n.toLowerCase() === 'опис')?.[1]}
                      </p>
                    )}
                    <ul className="product-specs-list">
                      {specs.filter(([n]) => n.toLowerCase() !== 'опис').slice(0, 3).map(([name, val], idx) => (
                        <li key={idx}>
                          <span className="spec-name">{name}:</span>
                          <span className="spec-val">{val}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="product-footer">
                      <div className="product-price-row">
                        <span className="product-price">{p.price} ₴</span>
                      </div>
                      <button 
                        className={`product-buy-btn ${isAdded ? 'in-cart' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: p.id, name: getLocalizedName(p), price: p.price, photo: p.photo });
                        }}
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
      {(() => {
        const fullRalList = RAL_CLASSIC_COLLECTION.map(r => ({
          id: r.hex,
          ralCode: r.ralCode,
          group: r.group,
          nameUk: r.nameUk,
          nameRu: r.nameRu,
          nameEn: r.nameEn,
        }));

        const allAvailableColors = [
          ...colors.map(c => ({
            ...c,
            group: RAL_CLASSIC_COLLECTION.find(r => r.ralCode === c.ralCode || r.hex.toLowerCase() === c.id.toLowerCase())?.group || 'grey'
          })),
          ...fullRalList.filter(r => !colors.some(c => c.ralCode === r.ralCode || c.id.toLowerCase() === r.id.toLowerCase()))
        ];

        return (
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
                      {p.photo ? (
                        <img 
                          src={p.photo} 
                          alt={getLocalizedName(p)} 
                          style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '8px' }} 
                        />
                      ) : (
                        <span className="part-icon">{p.icon || '🛠️'}</span>
                      )}
                      <span className="part-name">{getLocalizedName(p)}</span>
                      <span className="part-price">+{p.price} ₴</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: 2-Step RAL Color Selector */}
            <div className="builder-step-box">
              <div className="builder-step-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('constructor_step_color')}</span>
                {selectedColor && (
                  <span style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 700 }}>
                    {getLocalizedName(selectedColor)} {selectedColor.ralCode ? `(${selectedColor.ralCode})` : ''}
                  </span>
                )}
              </div>

              {/* Step 2.1: Group Category Tabs */}
              <div className="ral-group-tabs-bar">
                <button 
                  className={`ral-group-tab-btn ${selectedRalGroup === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedRalGroup('all')}
                >
                  <span className="ral-group-dot" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                  <span>{language === 'uk' ? 'Всі' : language === 'ru' ? 'Все' : 'All'} ({allAvailableColors.length})</span>
                </button>
                {RAL_GROUPS.map(grp => (
                  <button 
                    key={grp.key}
                    className={`ral-group-tab-btn ${selectedRalGroup === grp.key ? 'active' : ''}`}
                    onClick={() => setSelectedRalGroup(grp.key)}
                  >
                    <span className="ral-group-dot" style={{ backgroundColor: grp.colorSample }} />
                    <span>{language === 'uk' ? grp.nameUk : language === 'ru' ? grp.nameRu : grp.nameEn}</span>
                  </button>
                ))}
              </div>

              {/* Step 2.2: Search Bar */}
              <div className="ral-search-wrapper">
                <svg className="ral-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  className="ral-search-input"
                  placeholder={
                    language === 'uk' ? "Швидкий пошук за кодом RAL (напр. 7016, 9005, 3020)..." : 
                    language === 'ru' ? "Быстрый поиск по коду RAL (напр. 7016, 9005, 3020)..." : 
                    "Quick search by RAL code..."
                  }
                  value={colorSearchQuery}
                  onChange={(e) => setColorSearchQuery(e.target.value)}
                />
              </div>

              {/* Step 2.3: Shade Swatches Grid */}
              <div className="color-circles-grid">
                {allAvailableColors
                  .filter(c => {
                    // Group filter
                    if (selectedRalGroup !== 'all' && c.group !== selectedRalGroup) return false;
                    // Search filter
                    if (!colorSearchQuery) return true;
                    const q = colorSearchQuery.toLowerCase();
                    return (
                      c.id.toLowerCase().includes(q) ||
                      (c.ralCode && c.ralCode.toLowerCase().includes(q)) ||
                      c.nameUk.toLowerCase().includes(q) ||
                      c.nameRu.toLowerCase().includes(q) ||
                      c.nameEn.toLowerCase().includes(q)
                    );
                  })
                  .map((c, idx) => {
                    const isSelected = selectedColor?.id === c.id || (selectedColor?.ralCode && selectedColor.ralCode === c.ralCode);
                    return (
                      <button 
                        key={`${c.id}-${c.ralCode || idx}`}
                        className={`color-circle-btn ${isSelected ? 'selected' : ''}`}
                        style={{ backgroundColor: c.id }}
                        onClick={() => setSelectedColor(c)}
                        title={`${getLocalizedName(c)} ${c.ralCode ? `(${c.ralCode})` : ''}`}
                      >
                        {isSelected && <span className="swatch-check-mark">✓</span>}
                      </button>
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
        );
      })()}



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
            
            <div className="contact-main-action">
              <p className="contact-main-label">{t('constructor_form_hint') === 'constructor_form_hint' ? 'Швидкий зв\'язок / Быстрая связь:' : 'Швидкий зв\'язок:'}</p>
              <a href="tel:+380733730110" className="contact-huge-phone">
                <div className="phone-icon-pulse">
                  <FaPhoneAlt size={24} />
                </div>
                <span>+38 (073) 373-01-10</span>
              </a>
              
              <div className="contact-messengers-row">
                <a href="viber://chat?number=%2B380733730110" className="messenger-pill viber" aria-label="Viber">
                  <FaViber size={18} /> Viber
                </a>
                <a href="https://t.me/+380733730110" target="_blank" rel="noopener noreferrer" className="messenger-pill telegram" aria-label="Telegram">
                  <FaTelegramPlane size={18} /> Telegram
                </a>
              </div>
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
