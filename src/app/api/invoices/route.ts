import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const invoices = await db.invoice.findMany({
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform to include customer at root level
    const transformed = invoices.map(inv => ({
      ...inv,
      customer: inv.customer || inv.order?.customer || null,
    }));
    
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json([], { status: 500 });
  }
}
