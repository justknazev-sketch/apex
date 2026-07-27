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
    return text.substring(0, 150) + '...';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-label">Apex Force Blog</div>
      <h1 style={{ fontSize: '42px', marginBottom: '40px', color: 'var(--text-primary)' }}>Блог & Новини</h1>
      
      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Поки що немає статей.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          {posts.map(post => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition-smooth)'
              }}
              className="blog-card"
            >
              <div 
                style={{
                  width: '100%',
                  paddingBottom: '60%',
                  backgroundImage: post.photo ? `url(${post.photo})` : 'none',
                  backgroundColor: 'var(--bg-dark)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: '1px solid var(--border-light)'
                }}
              />
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {getTitle(post)}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {getExcerpt(post)}
                </p>
                <div style={{ marginTop: '20px', color: 'var(--red)', fontWeight: 700, fontSize: '14px' }}>
                  Читати далі →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
