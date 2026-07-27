import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// PUT update an order (admin only, e.g. status, paymentStatus, comment, delivery)
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
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, paymentStatus, comment, deliveryCity, deliveryWarehouse } = body;

    if (status && !['new', 'in_progress', 'done', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(comment !== undefined ? { comment } : {}),
        ...(deliveryCity !== undefined ? { deliveryCity } : {}),
        ...(deliveryWarehouse !== undefined ? { deliveryWarehouse } : {}),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE an order (admin only)
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
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
