import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

// GET all orders (admin only)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST create a new order (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, phone, comment, detailsJson } = body;

    if (!type || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newOrder = await prisma.order.create({
      data: {
        type,
        name,
        phone,
        comment: comment || '',
        detailsJson: detailsJson || '{}',
        status: 'new',
      },
    });

    // Send Telegram Notification asynchronously (don't block the API if it takes time)
    try {
      await sendTelegramNotification({
        id: newOrder.id,
        type: newOrder.type,
        name: newOrder.name,
        phone: newOrder.phone,
        comment: newOrder.comment,
        detailsJson: newOrder.detailsJson,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      });
    } catch (tgError) {
      console.error('Telegram notification failed to trigger:', tgError);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
