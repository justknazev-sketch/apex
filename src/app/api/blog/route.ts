import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug }
      });
      if (!post) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const isValid = await verifyToken(token || '');
    if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { slug, titleUk, titleRu, titleEn, contentUk, contentRu, contentEn, photo, videoUrl } = body;

    if (!slug || !titleUk) {
      return NextResponse.json({ error: 'Slug and titleUk are required' }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        titleUk,
        titleRu: titleRu || titleUk,
        titleEn: titleEn || titleUk,
        contentUk: contentUk || '',
        contentRu: contentRu || '',
        contentEn: contentEn || '',
        photo,
        videoUrl,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
