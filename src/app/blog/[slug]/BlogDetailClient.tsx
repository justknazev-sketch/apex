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
  const { language } = useLanguage();

  const title = language === 'en' ? post.titleEn || post.titleUk : language === 'ru' ? post.titleRu || post.titleUk : post.titleUk;
  const content = language === 'en' ? post.contentEn || post.contentUk : language === 'ru' ? post.contentRu || post.contentUk : post.contentUk;

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = post.videoUrl ? getYouTubeId(post.videoUrl) : null;

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Breadcrumb */}
        <nav className="blog-detail-breadcrumb">
          <Link href="/blog" className="blog-breadcrumb-link">
            ← {language === 'en' ? 'Back to Blog' : language === 'ru' ? 'Назад к блогу' : 'Назад до блогу'}
          </Link>
        </nav>

        {/* Header */}
        <header className="blog-detail-header">
          <div className="section-label">
            {language === 'en' ? 'Apex Force Blog' : language === 'ru' ? 'Блог Apex Force' : 'Блог Apex Force'}
          </div>
          <h1 className="blog-detail-title">{title}</h1>
          <div className="blog-detail-meta">
            {new Date(post.createdAt).toLocaleDateString(
              language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uk-UA',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </div>
        </header>

        {/* Media: video takes priority over photo */}
        {videoId ? (
          <div className="blog-detail-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : post.photo ? (
          <div className="blog-detail-photo">
            <img src={post.photo} alt={title} />
          </div>
        ) : null}

        {/* Content */}
        <div className="blog-detail-content">
          {content}
        </div>

        {/* Back link */}
        <div className="blog-detail-footer">
          <Link href="/blog" className="btn-outline">
            ← {language === 'en' ? 'All posts' : language === 'ru' ? 'Все статьи' : 'Всі статті'}
          </Link>
        </div>
      </div>
    </div>
  );
}
