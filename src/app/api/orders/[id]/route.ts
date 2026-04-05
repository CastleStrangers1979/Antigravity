import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب طلب واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: true,
        deliveryLine: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT - تحديث طلب
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, driverId, deliveryLineId, deliveryDate, deliveryTime, notes } = body;

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        driverId,
        deliveryLineId,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        deliveryTime,
        notes,
      },
      include: {
        customer: true,
        driver: true,
        deliveryLine: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE - حذف طلب
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // حذف عناصر الطلب أولاً
    await db.orderItem.deleteMany({
      where: { orderId: id },
    });

    // حذف الطلب
    await db.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
