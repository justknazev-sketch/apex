import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return { title: 'Товар не знайдено — Apex Force' };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { title: 'Товар не знайдено — Apex Force' };
    }

    return {
      title: `${product.nameUk} — Купити в Apex Force`,
      description: `Замовити ${product.nameUk} за ціною ${product.price} ₴. Виробництво та встановлення спортивного інвентаря Apex Force.`,
    };
  } catch (error) {
    return { title: 'Apex Force — Вершина Сили' };
  }
}

export default async function ProductPage(props: Props) {
  const { id } = await props.params;
  const productId = Number(id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient product={product} />
  );
}
