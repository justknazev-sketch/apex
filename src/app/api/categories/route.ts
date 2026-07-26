import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = (await cookies()).get('admin_token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, nameUk, nameRu, nameEn, order } = body;

    const category = await prisma.productCategory.create({
      data: {
        id,
        nameUk,
        nameRu,
        nameEn,
        order: order || 0
      }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
