import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع السائقين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};
    if (activeOnly) where.isActive = true;

    const drivers = await db.driver.findMany({
      where,
      include: {
        deliveryLine: true,
        orders: {
          where: {
            status: {
              in: ['pending', 'confirmed', 'in_delivery'],
            },
          },
          include: {
            customer: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

// POST - إضافة سائق جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, deliveryLineId } = body;

    const driver = await db.driver.create({
      data: {
        name,
        phone,
        email,
        deliveryLineId,
      },
      include: {
        deliveryLine: true,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
  }
}
