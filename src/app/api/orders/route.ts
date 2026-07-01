import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

// Простой in-memory rate limiter: не более 1 заявки в минуту с одного IP
const submittedIPs = new Map<string, number>();

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
    // Rate limiting: 1 заявка в минуту с одного IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const lastSubmit = submittedIPs.get(ip) ?? 0;
    if (Date.now() - lastSubmit < 60_000) {
      return NextResponse.json(
        { error: 'Занадто багато запитів. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, name, phone, comment, detailsJson } = body;

    // Валидация обязательных полей
    if (!type || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Санитизация и валидация данных
    const trimmedName = String(name).trim();
    const trimmedPhone = String(phone).trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json({ error: 'Некоректне ім\'я (2–100 символів)' }, { status: 400 });
    }

    const phoneRegex = /^[\+\d\s\(\)\-]{7,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return NextResponse.json({ error: 'Некоректний номер телефону' }, { status: 400 });
    }

    const allowedTypes = ['order', 'customizer', 'callback'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Невірний тип заявки' }, { status: 400 });
    }

    const trimmedComment = comment ? String(comment).trim().slice(0, 1000) : '';

    // Записываем IP в rate limiter
    submittedIPs.set(ip, Date.now());

    const newOrder = await prisma.order.create({
      data: {
        type,
        name: trimmedName,
        phone: trimmedPhone,
        comment: trimmedComment,
        detailsJson: detailsJson || '{}',
        status: 'new',
      },
    });

    // Отправляем Telegram-уведомление асинхронно (не блокируем ответ API)
    sendTelegramNotification({
      id: newOrder.id,
      type: newOrder.type,
      name: newOrder.name,
      phone: newOrder.phone,
      comment: newOrder.comment,
      detailsJson: newOrder.detailsJson,
      status: newOrder.status,
      createdAt: newOrder.createdAt,
    }).catch((tgError) => {
      console.error('Telegram notification failed:', tgError);
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
