import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic'; // Prevent build-time DB access on Railway

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://apex-production.up.railway.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Получаем товары для динамических URL — безопасно при недоступной БД
  try {
    const { prisma } = await import('@/lib/prisma');
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
    });

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/product/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    return [...staticPages, ...productPages];
  } catch {
    // БД недоступна при сборке — возвращаем только статические страницы
    return staticPages;
  }
}
