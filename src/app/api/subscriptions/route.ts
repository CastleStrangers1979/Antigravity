import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all subscriptions with customer and items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const frequency = searchParams.get('frequency');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (frequency) where.frequency = frequency;

    const subscriptions = await db.subscription.findMany({
      where,
      include: {
        customer: true,
        subscriptionItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      name,
      frequency,
      daysOfWeek,
      preferredTime,
      startDate,
      endDate,
      discount,
      notes,
      items,
    } = body;

    // Validate required fields
    if (!customerId || !name || !frequency || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, name, frequency, startDate' },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be: daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one subscription item is required' },
        { status: 400 }
      );
    }

    // Validate customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Validate all products exist
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }
    }

    // Calculate next delivery date based on frequency
    const start = new Date(startDate);
    let nextDeliveryDate = start;

    if (frequency === 'daily') {
      nextDeliveryDate = start;
    } else if (frequency === 'weekly') {
      // If daysOfWeek is provided, find the next matching day
      if (daysOfWeek && Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayIndex = today.getDay();
        
        let nextDay = daysOfWeek.findIndex((day: string) => {
          const dayIndex = dayNames.indexOf(day.toLowerCase());
          return dayIndex >= todayIndex;
        });

        if (nextDay === -1) {
          // No matching day found this week, use first day of next week
          const firstDayIndex = dayNames.indexOf(daysOfWeek[0].toLowerCase());
          const daysUntilNext = (7 - todayIndex + firstDayIndex) % 7 || 7;
          nextDeliveryDate = new Date(today);
          nextDeliveryDate.setDate(today.getDate() + daysUntilNext);
        } else {
          const dayIndex = dayNames.indexOf(daysOfWeek[nextDay].toLowerCase());
          const daysUntilNext = (dayIndex - todayIndex + 7) % 7;
          nextDeliveryDate = new Date(today);
          if (daysUntilNext > 0) {
            nextDeliveryDate.setDate(today.getDate() + daysUntilNext);
          }
        }
      }
    } else if (frequency === 'monthly') {
      // Set next delivery to the same day next month
      nextDeliveryDate = new Date(start);
    }

    // Create subscription with items
    const subscription = await db.subscription.create({
      data: {
        customerId,
        name,
        frequency,
        daysOfWeek: daysOfWeek ? JSON.stringify(daysOfWeek) : null,
        preferredTime: preferredTime || null,
        status: 'active',
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDeliveryDate,
        discount: discount || 0,
        notes: notes || null,
        subscriptionItems: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        subscriptionItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PUT - Update subscription status (pause/resume/cancel) or generate order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['pause', 'resume', 'cancel', 'generateOrder'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: pause, resume, cancel, or generateOrder' },
        { status: 400 }
      );
    }

    // Check if subscription exists
    const existingSubscription = await db.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        subscriptionItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Determine new status based on action
    let newStatus: string;
    let updateData: any = {};

    switch (action) {
      case 'pause':
        if (existingSubscription.status !== 'active') {
          return NextResponse.json(
            { error: 'Only active subscriptions can be paused' },
            { status: 400 }
          );
        }
        newStatus = 'paused';
        updateData = { status: newStatus };
        break;

      case 'resume':
        if (existingSubscription.status !== 'paused') {
          return NextResponse.json(
            { error: 'Only paused subscriptions can be resumed' },
            { status: 400 }
          );
        }
        newStatus = 'active';
        // Recalculate next delivery date when resuming
        const today = new Date();
        updateData = {
          status: newStatus,
          nextDeliveryDate: today,
        };
        break;

      case 'cancel':
        if (existingSubscription.status === 'cancelled') {
          return NextResponse.json(
            { error: 'Subscription is already cancelled' },
            { status: 400 }
          );
        }
        newStatus = 'cancelled';
        updateData = {
          status: newStatus,
          endDate: new Date(),
        };
        break;

      case 'generateOrder':
        if (existingSubscription.status !== 'active') {
          return NextResponse.json(
            { error: 'Only active subscriptions can generate orders' },
            { status: 400 }
          );
        }
        
        // Create an order from the subscription
        const orderCount = await db.order.count();
        const orderNumber = `SUB-${String(orderCount + 1).padStart(5, '0')}`;
        
        // Calculate total amount
        let subTotalAmount = 0;
        const orderItemsData = [];
        for (const item of existingSubscription.subscriptionItems) {
          if (!item.isActive) continue;
          const product = item.product;
          const itemTotal = product.price * item.quantity;
          subTotalAmount += itemTotal;
          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            total: itemTotal,
          });
        }
        
        // Apply subscription discount
        const discountAmount = existingSubscription.discount || 0;
        const finalTotal = subTotalAmount - discountAmount;
        
        const newOrder = await db.order.create({
          data: {
            orderNumber,
            customerId: existingSubscription.customerId,
            subscriptionId: existingSubscription.id,
            totalAmount: finalTotal,
            discount: discountAmount,
            subtotal: subTotalAmount,
            deliveryDate: existingSubscription.nextDeliveryDate,
            deliveryTime: existingSubscription.preferredTime,
            notes: existingSubscription.notes,
            status: 'confirmed',
            orderItems: {
              create: orderItemsData,
            },
          },
          include: {
            customer: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
        
        // Update subscription with new delivery count and next delivery date
        const nextDate = new Date(existingSubscription.nextDeliveryDate || new Date());
        if (existingSubscription.frequency === 'daily') {
          nextDate.setDate(nextDate.getDate() + 1);
        } else if (existingSubscription.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (existingSubscription.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        await db.subscription.update({
          where: { id },
          data: {
            totalDeliveries: existingSubscription.totalDeliveries + 1,
            nextDeliveryDate: nextDate,
          },
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Order generated from subscription',
          order: newOrder 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update subscription
    const updatedSubscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        subscriptionItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
