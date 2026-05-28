import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoProducts, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع المنتجات
export async function GET(request: NextRequest) {
  try {
    // Use demo data if database is not available
    if (shouldUseDemoData()) {
      return NextResponse.json(demoProducts);
    }

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
    console.error('Error fetching products, using demo data:', error);
    return NextResponse.json(demoProducts);
  }
}

// POST - إضافة منتج جديد
export async function POST(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      return NextResponse.json({ message: 'Demo mode - product not saved' }, { status: 200 });
    }

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
