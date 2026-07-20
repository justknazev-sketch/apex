'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { openCart, cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();
  const router = useRouter();

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      Promise.resolve().then(() => setTheme(savedTheme));
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Check if admin is logged in
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAdminLoggedIn(true);
          }
        }
      } catch (e) {
        // Ignored
      }
    };
    checkAdmin();
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (pathname !== '/') {
      router.push(`/${targetId}`);
    } else {
      const el = document.querySelector(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="site-nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <span className="logo-apex">APEX</span>
          <span className="logo-force">FORCE</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-menu">
          <li><a href="#catalog" onClick={(e) => handleNavClick(e, '#catalog')}>{t('nav_catalog')}</a></li>
          <li><a href="#constructor" onClick={(e) => handleNavClick(e, '#constructor')}>{t('nav_constructor')}</a></li>

          <li><a href="#reviews" onClick={(e) => handleNavClick(e, '#reviews')}>{t('nav_reviews')}</a></li>
          <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>{t('nav_contact')}</a></li>
          {isAdminLoggedIn && (
            <li>
              <Link href="/admin/dashboard" className="nav-admin-link">
                ⚙️ Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right side controls */}
        <div className="nav-actions">
          {/* Language Switcher */}
          <div className="lang-switcher">
            <button 
              className={`lang-opt ${language === 'uk' ? 'active' : ''}`}
              onClick={() => setLanguage('uk')}
              title="Українська"
            >
              UK
            </button>
            <button 
              className={`lang-opt ${language === 'ru' ? 'active' : ''}`}
              onClick={() => setLanguage('ru')}
              title="Русский"
            >
              RU
            </button>
            <button 
              className={`lang-opt ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.8.5-.1 1 .3.9.8-.1.5-.5.9-1 .9-3.9.3-6.9 3.6-6.9 7.6 0 4.2 3.5 7.7 7.8 7.7 3.5 0 6.6-2.5 7.4-5.9.1-.5.6-.8 1.1-.7.5.1.8.6.7 1.1-.9 4.6-4.9 7.8-9.6 7.8-.1-.5 0-.5 0-.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0c-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.38-.38.38-1.02 0-1.41zm-1.06-10.96c.39-.39.39-1.03 0-1.41a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zm-11.31 11.3a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z" />
              </svg>
            )}
          </button>

          {/* Cart Icon Button */}
          <button className="cart-icon-btn" onClick={openCart} aria-label="Open Cart">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>

          {/* Contact Button */}
          <button 
            className="nav-cta-btn" 
            onClick={(e) => {
              if (pathname !== '/') {
                router.push('/#contact');
              } else {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {t('nav_cta')}
          </button>

          {/* Mobile menu toggle */}
          <button 
            className={`burger-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <ul className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <li><a href="#catalog" onClick={(e) => handleNavClick(e, '#catalog')}>{t('nav_catalog')}</a></li>
            <li><a href="#constructor" onClick={(e) => handleNavClick(e, '#constructor')}>{t('nav_constructor')}</a></li>

            <li><a href="#reviews" onClick={(e) => handleNavClick(e, '#reviews')}>{t('nav_reviews')}</a></li>
            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>{t('nav_contact')}</a></li>
            {isAdminLoggedIn && (
              <li>
                <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="nav-admin-link">
                  ⚙️ Панель управления
                </Link>
              </li>
            )}
            <li className="mobile-lang-row">
              <span className="lang-label">Мова / Язык / Lang:</span>
              <div className="lang-switcher">
                <button className={`lang-opt ${language === 'uk' ? 'active' : ''}`} onClick={() => { setLanguage('uk'); setMobileMenuOpen(false); }}>UK</button>
                <button className={`lang-opt ${language === 'ru' ? 'active' : ''}`} onClick={() => { setLanguage('ru'); setMobileMenuOpen(false); }}>RU</button>
                <button className={`lang-opt ${language === 'en' ? 'active' : ''}`} onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}>EN</button>
              </div>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
