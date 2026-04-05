import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - جلب جميع المنتجات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameAr, nameEn, nameNl, description, price, image, category, stock, sku, weight, packSize, boxSize } = body;

    const product = await db.product.create({
      data: {
        nameAr,
        nameEn,
        nameNl,
        description,
        price: parseFloat(price),
        image,
        category,
        stock: parseInt(stock) || 0,
        sku,
        weight: weight ? parseInt(weight) : null,
        packSize: parseInt(packSize) || 5,
        boxSize: boxSize ? parseInt(boxSize) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
