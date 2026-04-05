import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PromoCode interface for in-memory storage (until we add to Prisma schema)
// For now, we'll use the Setting model to store promo codes data as JSON

// GET /api/promo-codes - Get all promo codes
export async function GET() {
  try {
    // Get promo codes from settings
    const promoSetting = await db.setting.findUnique({
      where: { key: 'promo_codes' }
    });

    let promoCodes = [];
    if (promoSetting?.value) {
      try {
        promoCodes = JSON.parse(promoSetting.value);
      } catch {
        promoCodes = [];
      }
    }

    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST /api/promo-codes - Create a new promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, minOrderAmount, maxUses, startDate, endDate, applicableProducts } = body;

    // Get existing promo codes
    const promoSetting = await db.setting.findUnique({
      where: { key: 'promo_codes' }
    });

    let promoCodes: Array<{
      id: string;
      code: string;
      type: 'percentage' | 'fixed';
      value: number;
      minOrderAmount: number;
      maxUses: number | null;
      usedCount: number;
      startDate: string;
      endDate: string;
      isActive: boolean;
      applicableProducts: string[];
    }> = [];
    
    if (promoSetting?.value) {
      try {
        promoCodes = JSON.parse(promoSetting.value);
      } catch {
        promoCodes = [];
      }
    }

    // Check if code already exists
    if (promoCodes.some(p => p.code.toUpperCase() === code.toUpperCase())) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
    }

    // Create new promo code
    const newPromoCode = {
      id: `promo_${Date.now()}`,
      code: code.toUpperCase(),
      type: type || 'percentage',
      value: parseFloat(value) || 0,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxUses: maxUses ? parseInt(maxUses) : null,
      usedCount: 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      applicableProducts: applicableProducts || [],
    };

    promoCodes.push(newPromoCode);

    // Save back to settings
    await db.setting.upsert({
      where: { key: 'promo_codes' },
      update: { value: JSON.stringify(promoCodes) },
      create: {
        key: 'promo_codes',
        value: JSON.stringify(promoCodes),
        category: 'webshop',
      }
    });

    return NextResponse.json(newPromoCode);
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}
