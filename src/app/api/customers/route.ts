import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all customers
export async function GET() {
  try {
    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json([]);
  }
}

// POST create customer
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const customer = await db.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        notes: data.notes || null,
        customerType: data.customerType || 'retail',
        loyaltyPoints: data.loyaltyPoints || 0,
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
      },
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 });
  }
}
