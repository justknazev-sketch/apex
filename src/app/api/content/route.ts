import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// GET all static translations
export async function GET() {
  try {
    const translations = await prisma.contentText.findMany({});
    
    // Convert to a dictionary format for easier lookup: { key: { uk, ru, en } }
    const dictionary: Record<string, { uk: string; ru: string; en: string }> = {};
    translations.forEach((item) => {
      dictionary[item.key] = {
        uk: item.uk,
        ru: item.ru,
        en: item.en,
      };
    });

    return NextResponse.json(dictionary);
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json({ error: 'Failed to fetch content translations' }, { status: 500 });
  }
}

// POST update a translation key (admin only)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // We can support both single translation update or bulk array updates
    if (Array.isArray(body)) {
      // Bulk update
      for (const item of body) {
        const { key, uk, ru, en } = item;
        if (!key) continue;
        await prisma.contentText.upsert({
          where: { key },
          update: { uk, ru, en },
          create: { key, uk, ru, en },
        });
      }
      return NextResponse.json({ success: true, message: 'Translations updated successfully' });
    } else {
      // Single update
      const { key, uk, ru, en } = body;
      if (!key) {
        return NextResponse.json({ error: 'Missing translation key' }, { status: 400 });
      }

      const updated = await prisma.contentText.upsert({
        where: { key },
        update: { uk, ru, en },
        create: { key, uk, ru, en },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'Failed to update translations' }, { status: 500 });
  }
}
