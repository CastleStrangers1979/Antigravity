import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب منتج واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - تحديث منتج
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nameAr, nameEn, nameNl, description, price, image, category, stock, isActive, sku, weight, packSize, boxSize } = body;

    const product = await db.product.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        nameNl,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        image,
        category,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        isActive,
        sku,
        weight: weight !== undefined ? (weight ? parseInt(weight) : null) : undefined,
        packSize: packSize !== undefined ? parseInt(packSize) : undefined,
        boxSize: boxSize !== undefined ? (boxSize ? parseInt(boxSize) : null) : undefined,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - حذف منتج
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
