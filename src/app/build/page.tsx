'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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

export default function BuildPage() {
  const { t, language } = useLanguage();

  const [parts, setParts] = useState<ConstructorPart[]>([]);
  const [colors, setColors] = useState<ColorPreset[]>([]);
  const [selectedParts, setSelectedParts] = useState<Record<string, ConstructorPart>>({});
  const [selectedColor, setSelectedColor] = useState<ColorPreset | null>(null);
  
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custSuccess, setCustSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConstructor = async () => {
      try {
        const partsRes = await fetch('/api/constructor/elements');
        const colorsRes = await fetch('/api/constructor/colors');
        if (partsRes.ok && colorsRes.ok) {
          const partsData = await partsRes.json();
          const colorsData = await colorsRes.json();
          setParts(partsData);
          setColors(colorsData);
          if (colorsData.length > 0) {
            setSelectedColor(colorsData[0]);
          }
        }
      } catch (err) {
        console.error('Error loading constructor data:', err);
      }
    };
    loadConstructor();
  }, []);

  const getLocalizedName = (item: ConstructorPart | ColorPreset) => {
    if (language === 'ru') return item.nameRu;
    if (language === 'en') return item.nameEn;
    return item.nameUk;
  };

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

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <section id="constructor" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--red)', fontWeight: '600' }}>
            ← {language === 'uk' ? 'Назад на головну' : 'Назад на главную'}
          </Link>
        </div>

        <div className="section-label">{t('constructor_label')}</div>
        <h2>{t('constructor_title')}</h2>
        <p className="section-desc">{t('constructor_desc')}</p>

        <div className="constructor-wrapper">
          <div className="builder-panel">
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

          <div className="summary-sidebar">
            <div className="summary-header">{t('constructor_summary_title')}</div>
            
            {custSuccess ? (
              <div className="constructor-success-msg" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="success-icon">✓</div>
                <h4 style={{ margin: '10px 0' }}>{language === 'uk' ? 'Дякуємо!' : 'Заявка надіслана!'}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('constructor_form_hint')}</p>
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

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Надсилання...' : t('constructor_form_submit')}
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                  {t('constructor_form_hint')}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
