import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to calculate next delivery date
function calculateNextDeliveryDate(
  frequency: string,
  daysOfWeek: string[] | null,
  dayOfMonth: number | null,
  startDate: Date
): Date {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
    const dayMap: Record<string, number> = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const targetDays = daysOfWeek.map(d => dayMap[d.toLowerCase()]).sort((a, b) => a - b);
    const currentDay = today.getDay();
    
    // Find the next occurrence
    for (const targetDay of targetDays) {
      if (targetDay > currentDay) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + (targetDay - currentDay));
        return nextDate;
      }
    }
    
    // If no day found this week, get first day of next week
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (7 - currentDay + targetDays[0]));
    return nextDate;
  }
  
  if (frequency === 'biweekly') {
    const twoWeeksFromNow = new Date(startDate);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    return twoWeeksFromNow;
  }
  
  if (frequency === 'monthly' && dayOfMonth) {
    const nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (nextDate <= today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  }
  
  // Default to one week from now
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return nextWeek;
}

// GET - List all recurring orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const frequency = searchParams.get('frequency');
    const stats = searchParams.get('stats');

    // If stats request
    if (stats === 'true') {
      const recurringOrders = await db.recurringOrder.findMany({
        include: {
          customer: true,
          recurringItems: {
            include: {
              product: true,
            },
          },
        },
      });

      const totalRecurring = recurringOrders.length;
      const activeCount = recurringOrders.filter(r => r.status === 'active').length;
      const pausedCount = recurringOrders.filter(r => r.status === 'paused').length;
      const cancelledCount = recurringOrders.filter(r => r.status === 'cancelled').length;

      // Frequency breakdown
      const weeklyCount = recurringOrders.filter(r => r.frequency === 'weekly').length;
      const biweeklyCount = recurringOrders.filter(r => r.frequency === 'biweekly').length;
      const monthlyCount = recurringOrders.filter(r => r.frequency === 'monthly').length;

      // Upcoming deliveries (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingDeliveries = recurringOrders.filter(r => {
        if (r.status !== 'active' || !r.nextDeliveryDate) return false;
        const deliveryDate = new Date(r.nextDeliveryDate);
        return deliveryDate >= today && deliveryDate <= nextWeek;
      });

      // Calculate estimated monthly revenue from recurring orders
      let estimatedMonthlyRevenue = 0;
      for (const order of recurringOrders.filter(r => r.status === 'active')) {
        const orderTotal = order.recurringItems.reduce((sum, item) => {
          return sum + (item.product.price * item.quantity);
        }, 0);
        
        if (order.frequency === 'weekly') {
          estimatedMonthlyRevenue += orderTotal * 4;
        } else if (order.frequency === 'biweekly') {
          estimatedMonthlyRevenue += orderTotal * 2;
        } else {
          estimatedMonthlyRevenue += orderTotal;
        }
      }

      return NextResponse.json({
        totalRecurring,
        activeCount,
        pausedCount,
        cancelledCount,
        weeklyCount,
        biweeklyCount,
        monthlyCount,
        upcomingDeliveriesCount: upcomingDeliveries.length,
        estimatedMonthlyRevenue,
      });
    }

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (frequency) where.frequency = frequency;

    const recurringOrders = await db.recurringOrder.findMany({
      where,
      include: {
        customer: true,
        recurringItems: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { generatedOrders: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { nextDeliveryDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(recurringOrders);
  } catch (error) {
    console.error('Error fetching recurring orders:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring orders' }, { status: 500 });
  }
}

// POST - Create a new recurring order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      name,
      frequency,
      daysOfWeek,
      dayOfMonth,
      preferredTime,
      startDate,
      endDate,
      priority,
      discount,
      notes,
      items,
    } = body;

    // Validate required fields
    if (!customerId || !name || !frequency || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, name, frequency, items' },
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

    // Calculate next delivery date
    const parsedDaysOfWeek = daysOfWeek ? JSON.parse(JSON.stringify(daysOfWeek)) : null;
    const nextDeliveryDate = calculateNextDeliveryDate(
      frequency,
      parsedDaysOfWeek,
      dayOfMonth || null,
      startDate ? new Date(startDate) : new Date()
    );

    // Create recurring order with items
    const recurringOrder = await db.recurringOrder.create({
      data: {
        customerId,
        name,
        frequency,
        daysOfWeek: parsedDaysOfWeek ? JSON.stringify(parsedDaysOfWeek) : null,
        dayOfMonth: dayOfMonth || null,
        preferredTime: preferredTime || null,
        status: 'active',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        nextDeliveryDate,
        priority: priority || 0,
        discount: discount || 0,
        notes: notes || null,
        recurringItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        recurringItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(recurringOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring order:', error);
    return NextResponse.json({ error: 'Failed to create recurring order' }, { status: 500 });
  }
}

// PUT - Update recurring order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      status, 
      name, 
      frequency, 
      daysOfWeek, 
      dayOfMonth, 
      preferredTime, 
      priority, 
      discount, 
      notes,
      action 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Check if recurring order exists
    const existingOrder = await db.recurringOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        recurringItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Handle generate order action
    if (action === 'generateOrder') {
      const orderCount = await db.order.count();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

      // Calculate total
      const orderTotal = existingOrder.recurringItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      const order = await db.order.create({
        data: {
          orderNumber,
          customerId: existingOrder.customerId,
          recurringOrderId: existingOrder.id,
          totalAmount: orderTotal,
          deliveryDate: existingOrder.nextDeliveryDate || new Date(),
          deliveryTime: existingOrder.preferredTime,
          notes: existingOrder.notes,
          status: 'pending',
          priority: existingOrder.priority === 3 ? 'urgent' : existingOrder.priority === 2 ? 'high' : 'normal',
          orderItems: {
            create: existingOrder.recurringItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              total: item.product.price * item.quantity,
            })),
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

      // Update recurring order
      const parsedDaysOfWeek = existingOrder.daysOfWeek ? JSON.parse(existingOrder.daysOfWeek) : null;
      const nextDelivery = calculateNextDeliveryDate(
        existingOrder.frequency,
        parsedDaysOfWeek,
        existingOrder.dayOfMonth,
        new Date()
      );

      await db.recurringOrder.update({
        where: { id },
        data: {
          totalDeliveries: existingOrder.totalDeliveries + 1,
          lastDeliveryDate: new Date(),
          nextDeliveryDate: nextDelivery,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Order generated from recurring template',
        order 
      });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      const validStatuses = ['active', 'paused', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: active, paused, or cancelled' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }
    
    if (name) updateData.name = name;
    if (frequency) updateData.frequency = frequency;
    if (daysOfWeek !== undefined) updateData.daysOfWeek = daysOfWeek ? JSON.stringify(daysOfWeek) : null;
    if (dayOfMonth !== undefined) updateData.dayOfMonth = dayOfMonth;
    if (preferredTime !== undefined) updateData.preferredTime = preferredTime;
    if (priority !== undefined) updateData.priority = priority;
    if (discount !== undefined) updateData.discount = discount;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate next delivery date if relevant fields changed
    if (frequency || daysOfWeek || dayOfMonth) {
      const parsedDaysOfWeek = updateData.daysOfWeek ? JSON.parse(updateData.daysOfWeek) : 
        (existingOrder.daysOfWeek ? JSON.parse(existingOrder.daysOfWeek) : null);
      
      updateData.nextDeliveryDate = calculateNextDeliveryDate(
        updateData.frequency || existingOrder.frequency,
        parsedDaysOfWeek,
        updateData.dayOfMonth !== undefined ? updateData.dayOfMonth : existingOrder.dayOfMonth,
        new Date()
      );
    }

    // Update recurring order
    const updatedOrder = await db.recurringOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        recurringItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating recurring order:', error);
    return NextResponse.json({ error: 'Failed to update recurring order' }, { status: 500 });
  }
}

// DELETE - Delete a recurring order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Check if recurring order exists
    const existingOrder = await db.recurringOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    // Delete recurring items first (cascade)
    await db.recurringOrderItem.deleteMany({
      where: { recurringOrderId: id },
    });

    // Delete recurring order
    await db.recurringOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Recurring order deleted successfully' });
  } catch (error) {
    console.error('Error deleting recurring order:', error);
    return NextResponse.json({ error: 'Failed to delete recurring order' }, { status: 500 });
  }
}
