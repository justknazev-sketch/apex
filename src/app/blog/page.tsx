import React from 'react';
import { prisma } from '@/lib/prisma';
import BlogClient from './BlogClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 0; // Disable caching so it always gets the latest posts

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <Header />
      <div className="main-content" style={{ minHeight: '80vh', padding: '120px 24px 60px' }}>
        <BlogClient posts={posts} />
      </div>
      <Footer />
    </>
  );
}
