import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع الطلبات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const driverId = searchParams.get('driverId');
    const deliveryLineId = searchParams.get('deliveryLineId');

    const where: any = {};
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;
    if (deliveryLineId) where.deliveryLineId = deliveryLineId;

    const orders = await db.order.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - إنشاء طلب جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, driverId, deliveryLineId, deliveryDate, deliveryTime, notes } = body;

    // إنشاء العميل أو البحث عنه
    let customerRecord = await db.customer.findFirst({
      where: { phone: customer.phone },
    });

    if (!customerRecord) {
      customerRecord = await db.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          city: customer.city,
          notes: customer.notes,
        },
      });
    }

    // حساب المبلغ الإجمالي
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          total: itemTotal,
        });
      }
    }

    // إنشاء رقم الطلب
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

    // إنشاء الطلب
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        driverId,
        deliveryLineId,
        totalAmount,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTime,
        notes,
        orderItems: {
          create: orderItems,
        },
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

    // تحديث المخزون
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
