import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apex-production.up.railway.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Получаем все товары для генерации динамических URL
  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/build`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
