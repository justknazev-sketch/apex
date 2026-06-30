import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const whereClause = category && category !== 'all' ? { category } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create a new product (admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, nameUk, nameRu, nameEn, price, badgeUk, badgeRu, badgeEn, specsJson, photo } = body;

    if (!category || !nameUk || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        category,
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
        price: Number(price),
        badgeUk,
        badgeRu,
        badgeEn,
        specsJson: specsJson || '[]',
        photo: photo || '',
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
