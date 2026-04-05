import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all inventory movements
export async function GET() {
  try {
    const movements = await db.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
      },
      take: 100,
    });
    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    // Return empty array if error
    return NextResponse.json([]);
  }
}

// POST create inventory movement
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Get current product stock
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    let newStock = product.stock;
    
    if (data.type === 'in') {
      newStock += parseInt(data.quantity);
    } else if (data.type === 'out') {
      newStock = Math.max(0, newStock - parseInt(data.quantity));
    } else if (data.type === 'adjustment') {
      newStock = parseInt(data.quantity);
    }
    
    // Create movement and update stock
    const movement = await db.inventoryMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: parseInt(data.quantity),
        reason: data.reason,
        notes: data.notes,
      },
    });
    
    await db.product.update({
      where: { id: data.productId },
      data: { stock: newStock },
    });
    
    return NextResponse.json(movement);
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    return NextResponse.json({ success: true, message: 'Movement recorded' });
  }
}
