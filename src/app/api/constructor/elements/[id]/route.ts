import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// PUT update constructor element (admin only)
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
    const body = await request.json();
    const { nameUk, nameRu, nameEn, price, icon } = body;

    const existingElement = await prisma.constructorElement.findUnique({
      where: { id },
    });

    if (!existingElement) {
      return NextResponse.json({ error: 'Constructor element not found' }, { status: 404 });
    }

    const updated = await prisma.constructorElement.update({
      where: { id },
      data: {
        nameUk: nameUk ?? existingElement.nameUk,
        nameRu: nameRu ?? existingElement.nameRu,
        nameEn: nameEn ?? existingElement.nameEn,
        price: price !== undefined ? Number(price) : existingElement.price,
        icon: icon ?? existingElement.icon,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update element error:', error);
    return NextResponse.json({ error: 'Failed to update constructor element' }, { status: 500 });
  }
}

// DELETE a constructor element (admin only)
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

    const existingElement = await prisma.constructorElement.findUnique({
      where: { id },
    });

    if (!existingElement) {
      return NextResponse.json({ error: 'Constructor element not found' }, { status: 404 });
    }

    await prisma.constructorElement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Element deleted' });
  } catch (error) {
    console.error('Delete element error:', error);
    return NextResponse.json({ error: 'Failed to delete constructor element' }, { status: 500 });
  }
}
