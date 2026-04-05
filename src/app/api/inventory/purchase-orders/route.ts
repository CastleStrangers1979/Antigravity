import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all purchase orders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    
    const purchaseOrders = await db.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      take: 100,
    });
    
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json([]);
  }
}

// POST create purchase order
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Generate order number
    const date = new Date();
    const orderNumber = `PO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    // Calculate totals
    let subtotal = 0;
    const items = data.items || [];
    
    for (const item of items) {
      subtotal += parseFloat(item.unitPrice) * parseInt(item.quantity);
    }
    
    const taxAmount = subtotal * 0.21; // 21% VAT
    const totalAmount = subtotal + taxAmount + (parseFloat(data.shippingCost) || 0);
    
    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        status: data.status || 'draft',
        orderDate: new Date(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        subtotal,
        taxAmount,
        shippingCost: parseFloat(data.shippingCost) || 0,
        totalAmount,
        currency: data.currency || 'EUR',
        paymentStatus: 'pending',
        paymentDueDate: data.paymentDueDate ? new Date(data.paymentDueDate) : null,
        notes: data.notes || null,
        internalNotes: data.internalNotes || null,
        orderItems: {
          create: items.map((item: { productId: string; quantity: string; unitPrice: string }) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity),
          })),
        },
      },
      include: {
        supplier: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}

// PUT update purchase order
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    // If receiving items, update product stock
    if (updateData.status === 'received' && updateData.items) {
      for (const item of updateData.items as Array<{ productId: string; receivedQty: number }>) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });
        
        if (product && item.receivedQty > 0) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: product.stock + item.receivedQty },
          });
          
          // Create inventory movement
          await db.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'in',
              quantity: item.receivedQty,
              reason: 'purchase_order',
              reference: id,
            },
          });
        }
      }
    }
    
    const purchaseOrder = await db.purchaseOrder.update({
      where: { id },
      data: {
        status: updateData.status,
        expectedDate: updateData.expectedDate ? new Date(updateData.expectedDate) : null,
        receivedDate: updateData.status === 'received' ? new Date() : null,
        notes: updateData.notes || null,
        internalNotes: updateData.internalNotes || null,
        paymentStatus: updateData.paymentStatus,
      },
      include: {
        supplier: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
  }
}

// DELETE purchase order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Purchase order ID required' }, { status: 400 });
    }
    
    // Delete order items first
    await db.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: id },
    });
    
    await db.purchaseOrder.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json({ error: 'Failed to delete purchase order' }, { status: 500 });
  }
}
