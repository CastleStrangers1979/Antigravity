import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all pre-orders with customer and items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const priority = searchParams.get('priority');
    const upcoming = searchParams.get('upcoming');
    const stats = searchParams.get('stats');
    const calendar = searchParams.get('calendar');

    // If calendar request - get pre-orders by month
    if (calendar === 'true') {
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const preOrders = await db.preOrder.findMany({
        where: {
          deliveryDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          customer: true,
          preOrderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: [
          { deliveryDate: 'asc' },
          { priority: 'desc' },
        ],
      });

      // Group by date
      const calendarData: Record<string, any[]> = {};
      preOrders.forEach(po => {
        const dateKey = new Date(po.deliveryDate).toISOString().split('T')[0];
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = [];
        }
        calendarData[dateKey].push(po);
      });

      return NextResponse.json(calendarData);
    }

    // If stats request
    if (stats === 'true') {
      const preOrders = await db.preOrder.findMany({
        include: {
          customer: true,
          preOrderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      const totalPreOrders = preOrders.length;
      const pendingCount = preOrders.filter(p => p.status === 'pending').length;
      const confirmedCount = preOrders.filter(p => p.status === 'confirmed').length;
      const processingCount = preOrders.filter(p => p.status === 'processing').length;
      const completedCount = preOrders.filter(p => p.status === 'completed').length;
      const cancelledCount = preOrders.filter(p => p.status === 'cancelled').length;
      
      const totalRevenue = preOrders
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.totalAmount, 0);
      
      const avgOrderValue = completedCount > 0 ? totalRevenue / completedCount : 0;
      
      // Conversion rate: completed / total (excluding cancelled)
      const nonCancelled = totalPreOrders - cancelledCount;
      const conversionRate = nonCancelled > 0 ? (completedCount / nonCancelled) * 100 : 0;

      // Top pre-ordered products
      const productCounts: Record<string, { product: any; count: number; revenue: number }> = {};
      preOrders.forEach(preOrder => {
        preOrder.preOrderItems.forEach(item => {
          if (!productCounts[item.productId]) {
            productCounts[item.productId] = { product: item.product, count: 0, revenue: 0 };
          }
          productCounts[item.productId].count += item.quantity;
          productCounts[item.productId].revenue += item.total;
        });
      });

      const topProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Revenue trends - last 7 days
      const today = new Date();
      const dailyRevenue: Array<{ date: string; count: number; revenue: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayPreOrders = preOrders.filter(p => {
          const pDate = new Date(p.createdAt).toISOString().split('T')[0];
          return pDate === dateStr && p.status === 'completed';
        });
        
        dailyRevenue.push({
          date: dateStr,
          count: dayPreOrders.length,
          revenue: dayPreOrders.reduce((sum, p) => sum + p.totalAmount, 0),
        });
      }

      // Priority breakdown
      const priorityBreakdown = {
        normal: preOrders.filter(p => p.priority === 0).length,
        high: preOrders.filter(p => p.priority === 1).length,
        urgent: preOrders.filter(p => p.priority === 2).length,
        vip: preOrders.filter(p => p.priority === 3).length,
      };

      return NextResponse.json({
        totalPreOrders,
        pendingCount,
        confirmedCount,
        processingCount,
        completedCount,
        cancelledCount,
        totalRevenue,
        avgOrderValue,
        conversionRate,
        topProducts,
        dailyRevenue,
        priorityBreakdown,
      });
    }

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (priority) where.priority = parseInt(priority);

    // If upcoming request, filter by delivery date
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.deliveryDate = {
        gte: today,
      };
      where.status = {
        in: ['pending', 'confirmed', 'processing'],
      };
    }

    const preOrders = await db.preOrder.findMany({
      where,
      include: {
        customer: true,
        preOrderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { deliveryDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(preOrders);
  } catch (error) {
    console.error('Error fetching pre-orders:', error);
    return NextResponse.json({ error: 'Failed to fetch pre-orders' }, { status: 500 });
  }
}

// POST - Create a new pre-order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      deliveryDate,
      deliveryTime,
      priority,
      notes,
      depositAmount,
      items,
    } = body;

    // Validate required fields
    if (!customerId || !deliveryDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, deliveryDate, items' },
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

    // Validate all products exist and calculate total
    let totalAmount = 0;
    const preOrderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
      notes?: string;
    }> = [];

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

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      preOrderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
        notes: item.notes,
      });
    }

    // Generate pre-order number
    const preOrderCount = await db.preOrder.count();
    const preOrderNumber = `PRE-${String(preOrderCount + 1).padStart(6, '0')}`;

    // Create pre-order with items
    const preOrder = await db.preOrder.create({
      data: {
        preOrderNumber,
        customerId,
        status: 'pending',
        deliveryDate: new Date(deliveryDate),
        deliveryTime: deliveryTime || null,
        priority: priority || 0,
        notes: notes || null,
        totalAmount,
        depositAmount: depositAmount || 0,
        isPaid: (depositAmount || 0) >= totalAmount,
        preOrderItems: {
          create: preOrderItems,
        },
      },
      include: {
        customer: true,
        preOrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(preOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating pre-order:', error);
    return NextResponse.json({ error: 'Failed to create pre-order' }, { status: 500 });
  }
}

// PUT - Update pre-order status or details
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority, notes, depositAmount, isPaid, reminderSent, action } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Check if pre-order exists
    const existingPreOrder = await db.preOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        preOrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingPreOrder) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: pending, confirmed, processing, completed, or cancelled' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }
    
    if (priority !== undefined) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (depositAmount !== undefined) updateData.depositAmount = depositAmount;
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (reminderSent !== undefined) {
      updateData.reminderSent = reminderSent;
      updateData.reminderSentAt = reminderSent ? new Date() : null;
    }

    // Handle convert to order action
    if (action === 'convertToOrder') {
      // Create an order from the pre-order
      const orderCount = await db.order.count();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(5, '0')}`;

      const order = await db.order.create({
        data: {
          orderNumber,
          customerId: existingPreOrder.customerId,
          totalAmount: existingPreOrder.totalAmount,
          deliveryDate: existingPreOrder.deliveryDate,
          deliveryTime: existingPreOrder.deliveryTime,
          notes: existingPreOrder.notes,
          status: 'confirmed',
          priority: existingPreOrder.priority === 3 ? 'urgent' : existingPreOrder.priority === 2 ? 'high' : 'normal',
          orderItems: {
            create: existingPreOrder.preOrderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
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

      // Update pre-order status to completed
      await db.preOrder.update({
        where: { id },
        data: { 
          status: 'completed',
          convertedToOrderId: order.id,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Pre-order converted to order',
        order 
      });
    }

    // Update pre-order
    const updatedPreOrder = await db.preOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        preOrderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPreOrder);
  } catch (error) {
    console.error('Error updating pre-order:', error);
    return NextResponse.json({ error: 'Failed to update pre-order' }, { status: 500 });
  }
}

// DELETE - Delete a pre-order
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

    // Check if pre-order exists
    const existingPreOrder = await db.preOrder.findUnique({
      where: { id },
    });

    if (!existingPreOrder) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }

    // Delete pre-order items first (cascade)
    await db.preOrderItem.deleteMany({
      where: { preOrderId: id },
    });

    // Delete pre-order
    await db.preOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Pre-order deleted successfully' });
  } catch (error) {
    console.error('Error deleting pre-order:', error);
    return NextResponse.json({ error: 'Failed to delete pre-order' }, { status: 500 });
  }
}
