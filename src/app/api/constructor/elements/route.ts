import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// GET all constructor elements
export async function GET() {
  try {
    const elements = await prisma.constructorElement.findMany({});
    return NextResponse.json(elements);
  } catch (error) {
    console.error('Fetch elements error:', error);
    return NextResponse.json({ error: 'Failed to fetch constructor elements' }, { status: 500 });
  }
}

// POST create/update element (admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, nameUk, nameRu, nameEn, price, icon } = body;

    if (!id || !nameUk || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const element = await prisma.constructorElement.upsert({
      where: { id },
      update: {
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
        price: Number(price),
        icon: icon || '⚙️',
      },
      create: {
        id,
        nameUk,
        nameRu: nameRu || nameUk,
        nameEn: nameEn || nameUk,
        price: Number(price),
        icon: icon || '⚙️',
      },
    });

    return NextResponse.json(element);
  } catch (error) {
    console.error('Create element error:', error);
    return NextResponse.json({ error: 'Failed to create element' }, { status: 500 });
  }
}
