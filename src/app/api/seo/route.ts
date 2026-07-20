import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// GET all SEO metadata configs
export async function GET() {
  try {
    const seoConfigs = await prisma.seoMetadata.findMany({});
    
    // Map to a dictionary: { [route]: { titleUk, descUk, ... } }
    const dictionary: Record<string, {
      titleUk: string;
      titleRu: string | null;
      titleEn: string | null;
      descUk: string;
      descRu: string | null;
      descEn: string | null;
    }> = {};
    seoConfigs.forEach((cfg) => {
      dictionary[cfg.route] = {
        titleUk: cfg.titleUk,
        titleRu: cfg.titleRu,
        titleEn: cfg.titleEn,
        descUk: cfg.descUk,
        descRu: cfg.descRu,
        descEn: cfg.descEn,
      };
    });

    return NextResponse.json(dictionary);
  } catch (error) {
    console.error('Fetch SEO error:', error);
    return NextResponse.json({ error: 'Failed to fetch SEO metadata' }, { status: 500 });
  }
}

// POST update SEO configuration (admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { route, titleUk, titleRu, titleEn, descUk, descRu, descEn } = body;

    if (!route || !titleUk || !descUk) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedSeo = await prisma.seoMetadata.upsert({
      where: { route },
      update: {
        titleUk,
        titleRu: titleRu || titleUk,
        titleEn: titleEn || titleUk,
        descUk,
        descRu: descRu || descUk,
        descEn: descEn || descUk,
      },
      create: {
        route,
        titleUk,
        titleRu: titleRu || titleUk,
        titleEn: titleEn || titleUk,
        descUk,
        descRu: descRu || descUk,
        descEn: descEn || descUk,
      },
    });

    return NextResponse.json(updatedSeo);
  } catch (error) {
    console.error('Update SEO error:', error);
    return NextResponse.json({ error: 'Failed to update SEO metadata' }, { status: 500 });
  }
}
