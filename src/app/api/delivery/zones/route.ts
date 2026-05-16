import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all delivery zones (using deliveryLine as zones)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (zoneId) {
      const zone = await db.deliveryLine.findUnique({
        where: { id: zoneId }
      });

      if (!zone) {
        return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
      }

      return NextResponse.json(zone);
    }

    // Use deliveryLine as delivery zones
    const deliveryLines = await db.deliveryLine.findMany({
      include: {
        _count: { select: { drivers: true, orders: true } }
      },
      orderBy: { nameEn: 'asc' }
    });

    // Calculate zone statistics (simulated for demo)
    const zonesWithStats = deliveryLines.map(line => ({
      ...line,
      ordersCount: line._count.orders,
      avgDeliveryTime: Math.floor(Math.random() * 20) + 15,
      satisfactionRate: (Math.random() * 10 + 90).toFixed(1)
    }));

    return NextResponse.json({
      zones: zonesWithStats,
      deliveryLines: deliveryLines.map(line => ({
        id: line.id,
        nameAr: line.nameAr,
        nameEn: line.nameEn,
        nameNl: line.nameNl,
        region: line.region,
        color: line.color,
        driversCount: line._count.drivers,
        ordersCount: line._count.orders
      }))
    });

  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new delivery zone (using deliveryLine)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, nameNl, region, color, estimatedTime } = body;

    const zone = await db.deliveryLine.create({
      data: {
        nameAr: nameAr || body.name || 'منطقة جديدة',
        nameEn: nameEn || body.name || 'New Zone',
        nameNl: nameNl || body.name || 'Nieuwe Zone',
        region: region || 'Unknown',
        color: color || '#3B82F6',
        estimatedTime,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, zone });

  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a delivery zone (using deliveryLine)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nameAr, nameEn, nameNl, region, color, estimatedTime, isActive } = body;

    const zone = await db.deliveryLine.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        nameNl,
        region,
        color,
        estimatedTime,
        isActive
      }
    });

    return NextResponse.json({ success: true, zone });

  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a delivery zone (using deliveryLine)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    await db.deliveryLine.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
