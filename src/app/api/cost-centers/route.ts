import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const costCenters = await db.costCenter.findMany({
      include: {
        costs: true,
      },
    });
    return NextResponse.json(costCenters);
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    return NextResponse.json([], { status: 500 });
  }
}
