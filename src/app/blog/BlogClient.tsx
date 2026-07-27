'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

type BlogPost = {
  id: number;
  slug: string;
  titleUk: string;
  titleRu: string;
  titleEn: string;
  contentUk: string;
  contentRu: string;
  contentEn: string;
  photo: string | null;
  videoUrl: string | null;
  createdAt: Date;
};

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const { language } = useLanguage();

  const getTitle = (post: BlogPost) => {
    if (language === 'en') return post.titleEn || post.titleUk;
    if (language === 'ru') return post.titleRu || post.titleUk;
    return post.titleUk;
  };

  const getExcerpt = (post: BlogPost) => {
    let text = post.contentUk;
    if (language === 'en') text = post.contentEn || text;
    if (language === 'ru') text = post.contentRu || text;
    if (!text) return '';
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  };

  const hasVideo = (post: BlogPost) => {
    return !!(post.videoUrl && post.videoUrl.length > 0);
  };

  return (
    <>
      {/* Blog Hero — в стиле hero главной страницы */}
      <header className="blog-hero-wrapper">
        <div className="blog-hero-content">
          <div className="section-label">Apex Force</div>
          <h1 className="blog-hero-title">
            {language === 'en' ? <>Blog & <span className="logo-force">News</span></> : 
             language === 'ru' ? <>Блог & <span className="logo-force">Новости</span></> : 
             <>Блог & <span className="logo-force">Новини</span></>}
          </h1>
          <p className="blog-hero-desc">
            {language === 'en' ? 'Special orders, crash tests, production cases and news from Apex Force' :
             language === 'ru' ? 'Спецзаказы, краш-тесты, кейсы производства и новости Apex Force' :
             'Спецзамовлення, краш-тести, кейси виробництва та новини Apex Force'}
          </p>
        </div>
      </header>

      {/* Blog Posts Grid */}
      <section className="blog-section">
        {posts.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">📝</div>
            <h2>
              {language === 'en' ? 'No posts yet' : 
               language === 'ru' ? 'Статей пока нет' : 
               'Статей поки немає'}
            </h2>
            <p>
              {language === 'en' ? 'Check back soon — we\'ll be posting soon!' :
               language === 'ru' ? 'Скоро появятся первые публикации!' :
               'Незабаром з\'являться перші публікації!'}
            </p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="blog-card"
              >
                <div className="blog-card-image">
                  {post.photo ? (
                    <div className="blog-card-photo" style={{ backgroundImage: `url(${post.photo})` }} />
                  ) : (
                    <div className="blog-card-photo blog-card-photo--empty">
                      <span>{hasVideo(post) ? '▶' : '📝'}</span>
                    </div>
                  )}
                  {hasVideo(post) && (
                    <div className="blog-card-video-badge">
                      <span>▶ Відео</span>
                    </div>
                  )}
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-date">
                    {new Date(post.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uk-UA',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </div>
                  <h3 className="blog-card-title">{getTitle(post)}</h3>
                  <p className="blog-card-excerpt">{getExcerpt(post)}</p>
                  <div className="blog-card-cta">
                    {language === 'en' ? 'Read more' : language === 'ru' ? 'Читать далее' : 'Читати далі'} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
