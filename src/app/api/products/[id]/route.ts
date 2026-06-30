import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// PUT update a product (admin only)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    const { category, nameUk, nameRu, nameEn, price, badgeUk, badgeRu, badgeEn, specsJson, photo } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        category: category ?? existingProduct.category,
        nameUk: nameUk ?? existingProduct.nameUk,
        nameRu: nameRu ?? existingProduct.nameRu,
        nameEn: nameEn ?? existingProduct.nameEn,
        price: price !== undefined ? Number(price) : existingProduct.price,
        badgeUk: badgeUk !== undefined ? badgeUk : existingProduct.badgeUk,
        badgeRu: badgeRu !== undefined ? badgeRu : existingProduct.badgeRu,
        badgeEn: badgeEn !== undefined ? badgeEn : existingProduct.badgeEn,
        specsJson: specsJson ?? existingProduct.specsJson,
        photo: photo ?? existingProduct.photo,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE a product (admin only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
