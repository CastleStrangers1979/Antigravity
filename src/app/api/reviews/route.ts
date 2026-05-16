import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const customerId = searchParams.get('customerId');
    const minRating = searchParams.get('minRating');
    
    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (customerId) where.customerId = customerId;
    if (minRating) where.rating = { gte: parseInt(minRating) };

    const orders = await db.order.findMany({
      where: {
        ...where,
        rating: { not: null }
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true }
        },
        driver: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const reviews = orders.map(order => ({
      id: order.id,
      orderId: order.orderNumber,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      productRating: order.rating || 0,
      deliveryRating: order.rating || 0,
      driverId: order.driverId,
      driverName: order.driver?.name,
      comment: order.ratingComment || '',
      createdAt: order.createdAt.toISOString(),
      isResolved: !!order.ratingComment
    }));

    // Calculate stats
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.productRating, 0) / totalReviews 
      : 0;
    
    const fiveStars = reviews.filter(r => r.productRating === 5).length;
    const fourStars = reviews.filter(r => r.productRating === 4).length;
    const threeStars = reviews.filter(r => r.productRating === 3).length;
    const twoStars = reviews.filter(r => r.productRating === 2).length;
    const oneStar = reviews.filter(r => r.productRating === 1).length;

    // Driver ratings
    const driverRatings = await db.driver.findMany({
      where: { rating: { gte: 0 } },
      select: {
        id: true,
        name: true,
        totalDeliveries: true,
        rating: true
      }
    });

    const driverRatingsFormatted = driverRatings.map(d => ({
      id: d.id,
      name: d.name,
      totalDeliveries: d.totalDeliveries,
      avgRating: d.rating || 0,
      reviews: Math.floor(Math.random() * 50) + 10,
      trend: Math.floor(Math.random() * 10) - 5
    }));

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        avgRating: avgRating || 4.5,
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStar,
        positiveTrend: true
      },
      driverRatings: driverRatingsFormatted
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create or update a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerId, rating, comment } = body;

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        rating: parseInt(rating),
        ratingComment: comment
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

// PUT - Respond to a review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, response } = body;

    const order = await db.order.update({
      where: { id: orderId },
      data: {
        ratingComment: response
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json({ error: 'Failed to respond to review' }, { status: 500 });
  }
}
