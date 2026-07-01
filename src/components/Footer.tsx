'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  const year = new Date().getFullYear();

  const pitch = {
    uk: 'Total Fitness Solutions — якісне та довговічне спортивне обладнання для вулиць та залів.',
    ru: 'Total Fitness Solutions — качественное и долговечное спортивное оборудование для улиц и залов.',
    en: 'Total Fitness Solutions — quality and durable sports equipment for outdoor and indoor use.',
  };

  const copy = {
    uk: `© ${year} Apex Force. Усі права захищені.`,
    ru: `© ${year} Apex Force. Все права защищены.`,
    en: `© ${year} Apex Force. All rights reserved.`,
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="logo-apex">APEX</span>
            <span className="logo-force">FORCE</span>
          </Link>
          <p className="footer-pitch">
            {pitch[language] || pitch.uk}
          </p>
        </div>

        <div className="footer-copy">
          {copy[language] || copy.uk}
        </div>

        <div className="footer-socials">
          {/* Viber */}
          <a href="viber://chat?number=%2B380733730110" className="social-btn viber" aria-label="Viber" title="Viber +380733730110">
            <span>Viber</span>
          </a>
          
          {/* Telegram */}
          <a href="https://t.me/+380733730110" target="_blank" rel="noopener noreferrer" className="social-btn telegram" aria-label="Telegram" title="Telegram Channel">
            <span>Telegram</span>
          </a>

          {/* Instagram */}
          <a href="https://instagram.com/apexforce_vs" target="_blank" rel="noopener noreferrer" className="social-btn instagram" aria-label="Instagram" title="Instagram apexforce_vs">
            <span>Instagram</span>
          </a>

          {/* TikTok */}
          <a href="https://vm.tiktok.com/ZS9jaeKtFgwd4-f3Lsx/" target="_blank" rel="noopener noreferrer" className="social-btn tiktok" aria-label="TikTok" title="TikTok Profile">
            <span>TikTok</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
