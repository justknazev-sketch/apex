import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('admin_token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { nameUk, nameRu, nameEn, order } = body;

    const category = await prisma.productCategory.update({
      where: { id },
      data: { nameUk, nameRu, nameEn, order }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('admin_token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const productsCount = await prisma.product.count({
      where: { category: id }
    });
    
    if (productsCount > 0) {
      return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 });
    }

    await prisma.productCategory.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
