import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// GET all colors
export async function GET() {
  try {
    const colors = await prisma.color.findMany({});
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Fetch colors error:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

// POST create/update color (admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ralCode, nameUk, nameRu, nameEn } = body;

    if (!id || !nameUk) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const color = await prisma.color.upsert({
      where: { id },
      update: {
        ralCode: ralCode || null,
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
      },
      create: {
        id,
        ralCode: ralCode || null,
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Save color error:', error);
    return NextResponse.json({ error: 'Failed to save color' }, { status: 500 });
  }
}
