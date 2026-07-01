import React from 'react';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const revalidate = 60; // Пересобирать страницу каждые 60 секунд (ISR) для кэширования и максимальной скорости

export default async function HomePage() {
  // Загружаем данные на сервере напрямую из базы данных
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const parts = await prisma.constructorElement.findMany({
    orderBy: { price: 'asc' },
  });

  const colors = await prisma.color.findMany();

  // Приведение типов для безопасной передачи в клиентский компонент
  const formattedProducts = products.map(p => ({
    id: p.id,
    category: p.category,
    nameUk: p.nameUk,
    nameRu: p.nameRu,
    nameEn: p.nameEn,
    price: p.price,
    badgeUk: p.badgeUk,
    badgeRu: p.badgeRu,
    badgeEn: p.badgeEn,
    specsJson: p.specsJson,
    photo: p.photo || undefined,
  }));

  const formattedParts = parts.map(part => ({
    id: part.id,
    nameUk: part.nameUk,
    nameRu: part.nameRu,
    nameEn: part.nameEn,
    price: part.price,
    icon: part.icon,
  }));

  const formattedColors = colors.map(c => ({
    id: c.id,
    nameUk: c.nameUk,
    nameRu: c.nameRu,
    nameEn: c.nameEn,
  }));

  return (
    <HomeClient 
      initialProducts={formattedProducts}
      initialParts={formattedParts}
      initialColors={formattedColors}
    />
  );
}
