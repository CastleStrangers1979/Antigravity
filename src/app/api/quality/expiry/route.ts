import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all expiry tracking records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (productId) where.productId = productId;

    const expiryRecords = await db.expiryTracking.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
            price: true,
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
      take: 50,
    });

    // Calculate statistics
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Fresh products (more than 7 days)
    const freshCount = await db.expiryTracking.count({
      where: {
        status: 'fresh',
      },
    });

    // Approaching expiry (3-7 days)
    const approachingCount = await db.expiryTracking.count({
      where: {
        status: 'approaching',
      },
    });

    // Expired products
    const expiredCount = await db.expiryTracking.count({
      where: {
        status: 'expired',
      },
    });

    // Products expiring within 3 days (urgent)
    const urgentExpiry = await db.expiryTracking.findMany({
      where: {
        expiryDate: {
          lte: threeDaysFromNow,
          gte: today,
        },
        status: { not: 'expired' },
      },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
            price: true,
          },
        },
      },
    });

    // Products expiring within 7 days
    const approachingExpiry = await db.expiryTracking.findMany({
      where: {
        expiryDate: {
          lte: sevenDaysFromNow,
          gt: threeDaysFromNow,
        },
        status: { not: 'expired' },
      },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
            price: true,
          },
        },
      },
    });

    // Calculate discount suggestions
    const discountSuggestions = urgentExpiry.map((record) => {
      const daysToExpiry = Math.ceil(
        (new Date(record.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      let discount = 0;
      if (daysToExpiry <= 1) discount = 50;
      else if (daysToExpiry <= 2) discount = 35;
      else if (daysToExpiry <= 3) discount = 25;
      else if (daysToExpiry <= 5) discount = 15;
      else discount = 10;

      return {
        ...record,
        daysToExpiry,
        suggestedDiscount: discount,
        originalPrice: record.product?.price || 0,
        discountedPrice: ((record.product?.price || 0) * (1 - discount / 100)).toFixed(2),
      };
    });

    return NextResponse.json({
      expiryRecords,
      stats: {
        freshCount,
        approachingCount,
        expiredCount,
        urgentCount: urgentExpiry.length,
      },
      urgentExpiry: discountSuggestions,
      approachingExpiry,
    });
  } catch (error) {
    console.error('Error fetching expiry tracking:', error);
    return NextResponse.json({ error: 'Failed to fetch expiry tracking' }, { status: 500 });
  }
}

// POST - Create a new expiry tracking record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      batchNumber,
      productionDate,
      expiryDate,
      quantity,
      remainingQty,
      notes,
    } = body;

    const production = new Date(productionDate);
    const expiry = new Date(expiryDate);
    const today = new Date();

    // Calculate days to expiry
    const daysToExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine status
    let status = 'fresh';
    if (daysToExpiry <= 0) status = 'expired';
    else if (daysToExpiry <= 3) status = 'approaching';

    const record = await db.expiryTracking.create({
      data: {
        productId,
        batchNumber,
        productionDate: production,
        expiryDate: expiry,
        quantity: parseInt(quantity),
        remainingQty: parseInt(remainingQty || quantity),
        status,
        daysToExpiry,
        notes,
      },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating expiry tracking:', error);
    return NextResponse.json({ error: 'Failed to create expiry tracking' }, { status: 500 });
  }
}

// PUT - Update an expiry tracking record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, discountApplied, status, remainingQty } = body;

    const record = await db.expiryTracking.update({
      where: { id },
      data: {
        discountApplied,
        status,
        remainingQty: remainingQty ? parseInt(remainingQty) : undefined,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating expiry tracking:', error);
    return NextResponse.json({ error: 'Failed to update expiry tracking' }, { status: 500 });
  }
}
