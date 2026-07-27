import React from 'react';
import { prisma } from '@/lib/prisma';
import BlogClient from './BlogClient';

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <BlogClient posts={posts} />;
}
