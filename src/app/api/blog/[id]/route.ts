import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const isValid = await verifyToken(token || '');
    if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { slug, titleUk, titleRu, titleEn, contentUk, contentRu, contentEn, photo, videoUrl } = body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        slug,
        titleUk,
        titleRu,
        titleEn,
        contentUk,
        contentRu,
        contentEn,
        photo,
        videoUrl,
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const isValid = await verifyToken(token || '');
    if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(paramId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
