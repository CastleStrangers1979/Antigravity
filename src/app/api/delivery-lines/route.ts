import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع خطوط التوزيع
export async function GET() {
  try {
    const deliveryLines = await db.deliveryLine.findMany({
      include: {
        drivers: {
          where: { isActive: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { nameAr: 'asc' },
    });

    return NextResponse.json(deliveryLines);
  } catch (error) {
    console.error('Error fetching delivery lines:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery lines' }, { status: 500 });
  }
}

// POST - إضافة خط توزيع جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, nameNl, region } = body;

    const deliveryLine = await db.deliveryLine.create({
      data: {
        nameAr,
        nameEn,
        nameNl,
        region,
      },
    });

    return NextResponse.json(deliveryLine, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery line:', error);
    return NextResponse.json({ error: 'Failed to create delivery line' }, { status: 500 });
  }
}
