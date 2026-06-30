import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// PUT update color (admin only)
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
    const colorId = decodeURIComponent(id); // Decode hex string like "#2C2C2C"
    
    const body = await request.json();
    const { nameUk, nameRu, nameEn } = body;

    const existingColor = await prisma.color.findUnique({
      where: { id: colorId },
    });

    if (!existingColor) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    const updated = await prisma.color.update({
      where: { id: colorId },
      data: {
        nameUk: nameUk ?? existingColor.nameUk,
        nameRu: nameRu ?? existingColor.nameRu,
        nameEn: nameEn ?? existingColor.nameEn,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update color error:', error);
    return NextResponse.json({ error: 'Failed to update color' }, { status: 500 });
  }
}

// DELETE a color (admin only)
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
    const colorId = decodeURIComponent(id);

    const existingColor = await prisma.color.findUnique({
      where: { id: colorId },
    });

    if (!existingColor) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    await prisma.color.delete({
      where: { id: colorId },
    });

    return NextResponse.json({ success: true, message: 'Color deleted' });
  } catch (error) {
    console.error('Delete color error:', error);
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
