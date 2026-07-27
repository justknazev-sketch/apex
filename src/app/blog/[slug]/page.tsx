import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

export const revalidate = 0;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
