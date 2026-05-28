import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoDeliveryLines, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع خطوط التوزيع
export async function GET(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      return NextResponse.json(demoDeliveryLines);
    }

    const lines = await db.deliveryLine.findMany({
      orderBy: { nameAr: 'asc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(lines);
  } catch (error) {
    console.error('Error fetching delivery lines, using demo data:', error);
    return NextResponse.json(demoDeliveryLines);
  }
}
