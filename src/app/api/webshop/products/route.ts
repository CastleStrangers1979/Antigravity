import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/webshop/products - Get all products for webshop management
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        nameNl: true,
        description: true,
        price: true,
        image: true,
        category: true,
        stock: true,
        isActive: true,
        isFeatured: true,
      }
    });

    // Add isVisible property (derived from isActive)
    const webshopProducts = products.map(p => ({
      ...p,
      isVisible: p.isActive
    }));

    return NextResponse.json(webshopProducts);
  } catch (error) {
    console.error('Error fetching webshop products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
