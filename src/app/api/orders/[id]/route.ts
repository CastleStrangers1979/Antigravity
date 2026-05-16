import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { 
      status, 
      signatureImage, 
      signedByName, 
      items, 
      managerId 
    } = body;

    // Fetch existing order
    const order = await db.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data: any = { status };

    if (signatureImage) {
      data.signatureImage = signatureImage;
      data.signedByName = signedByName || 'Customer';
      data.signedAt = new Date();
    }

    if (status === 'delivered') {
      data.deliveredAt = new Date();
    }

    // Handle Adjustments (Returns/Extras) - Requires Manager Approval
    if (items && items.length > 0) {
      if (!managerId) {
        return NextResponse.json({ error: 'Manager approval required for adjustments' }, { status: 403 });
      }

      // Update total amount based on new items
      let newTotal = 0;
      
      // We delete existing items and recreate or update them
      // For simplicity in this demo, we'll update quantities
      for (const item of items) {
        await db.orderItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity, total: item.quantity * item.unitPrice }
        });
        newTotal += item.quantity * item.unitPrice;
      }

      data.totalAmount = newTotal;
      data.notes = `${order.notes || ''} [Adjusted by Manager: ${managerId}]`;

      // Log activity
      await db.activityLog.create({
        data: {
          userId: managerId,
          userType: 'manager',
          action: 'ORDER_ADJUSTED',
          entity: 'Order',
          entityId: id,
          details: `Order adjusted by manager. New total: ${newTotal}€`
        }
      });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data,
      include: {
        customer: true,
        orderItems: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
