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
    const { id, nameUk, nameRu, nameEn } = body; // id is the hex value like "#2C2C2C"

    if (!id || !nameUk) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const color = await prisma.color.upsert({
      where: { id },
      update: {
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
      },
      create: {
        id,
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Create color error:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
}
