import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoDrivers, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع السائقين
export async function GET(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      return NextResponse.json(demoDrivers);
    }

    const drivers = await db.driver.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers, using demo data:', error);
    return NextResponse.json(demoDrivers);
  }
}
