import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoOrders, demoCustomers, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع الطلبات
export async function GET(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      // Add customer data to orders
      const ordersWithCustomers = demoOrders.map(order => ({
        ...order,
        customer: demoCustomers.find(c => c.id === order.customerId)
      }));
      return NextResponse.json(ordersWithCustomers);
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        driver: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders, using demo data:', error);
    const ordersWithCustomers = demoOrders.map(order => ({
      ...order,
      customer: demoCustomers.find(c => c.id === order.customerId)
    }));
    return NextResponse.json(ordersWithCustomers);
  }
}
