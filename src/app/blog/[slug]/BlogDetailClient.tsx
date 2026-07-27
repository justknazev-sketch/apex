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

export default function BlogDetailClient({ post }: { post: BlogPost }) {
  const { language, t } = useLanguage();

  const title = language === 'en' ? post.titleEn || post.titleUk : language === 'ru' ? post.titleRu || post.titleUk : post.titleUk;
  const content = language === 'en' ? post.contentEn || post.contentUk : language === 'ru' ? post.contentRu || post.contentUk : post.contentUk;

  // Function to extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;

  return (
    <div className="main-content" style={{ padding: '120px 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/blog" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>
        ← {t('back') === 'back' ? 'Назад до блогу' : t('back')}
      </Link>

      <h1 style={{ fontSize: '42px', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</h1>
      
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        {new Date(post.createdAt).toLocaleDateString()}
      </div>

      {post.photo && !videoId && (
        <div style={{ width: '100%', marginBottom: '40px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={post.photo} alt={title} style={{ width: '100%', display: 'block', height: 'auto' }} />
        </div>
      )}

      {videoId && (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', marginBottom: '40px', borderRadius: '12px' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
        {content}
      </div>
    </div>
  );
}
