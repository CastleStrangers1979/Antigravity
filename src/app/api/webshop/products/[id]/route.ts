import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/webshop/products/[id] - Update product visibility or featured status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isVisible, isFeatured } = body;

    const updateData: { isActive?: boolean; isFeatured?: boolean } = {};
    
    if (typeof isVisible === 'boolean') {
      updateData.isActive = isVisible;
    }
    
    if (typeof isFeatured === 'boolean') {
      updateData.isFeatured = isFeatured;
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
