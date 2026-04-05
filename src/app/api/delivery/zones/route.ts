import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all delivery zones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (zoneId) {
      const zone = await db.deliveryZone.findUnique({
        where: { id: zoneId }
      });

      if (!zone) {
        return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
      }

      return NextResponse.json(zone);
    }

    const zones = await db.deliveryZone.findMany({
      orderBy: { name: 'asc' }
    });

    // Get delivery lines for reference
    const deliveryLines = await db.deliveryLine.findMany({
      include: {
        _count: { select: { drivers: true, orders: true } }
      }
    });

    // Calculate zone statistics (simulated for demo)
    const zonesWithStats = zones.map(zone => ({
      ...zone,
      ordersCount: Math.floor(Math.random() * 100) + 10,
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

// POST - Create a new delivery zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, postalCodes, deliveryFee, minOrderAmount, estimatedTime } = body;

    const zone = await db.deliveryZone.create({
      data: {
        name,
        postalCodes: postalCodes ? JSON.stringify(postalCodes) : null,
        deliveryFee: deliveryFee || 0,
        minOrderAmount,
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

// PUT - Update a delivery zone
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, postalCodes, deliveryFee, minOrderAmount, estimatedTime, isActive } = body;

    const zone = await db.deliveryZone.update({
      where: { id },
      data: {
        name,
        postalCodes: postalCodes ? JSON.stringify(postalCodes) : undefined,
        deliveryFee,
        minOrderAmount,
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

// DELETE - Delete a delivery zone
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    await db.deliveryZone.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
