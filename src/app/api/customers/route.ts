import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoCustomers, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع العملاء
export async function GET(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      return NextResponse.json(demoCustomers);
    }

    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers, using demo data:', error);
    return NextResponse.json(demoCustomers);
  }
}
