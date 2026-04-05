import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/promo-codes/[id] - Toggle promo code active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Get existing promo codes
    const promoSetting = await db.setting.findUnique({
      where: { key: 'promo_codes' }
    });

    let promoCodes: Array<{
      id: string;
      isActive: boolean;
      [key: string]: unknown;
    }> = [];
    
    if (promoSetting?.value) {
      try {
        promoCodes = JSON.parse(promoSetting.value);
      } catch {
        promoCodes = [];
      }
    }

    // Find and update promo code
    const promoIndex = promoCodes.findIndex(p => p.id === id);
    if (promoIndex !== -1) {
      promoCodes[promoIndex].isActive = isActive;
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}

// DELETE /api/promo-codes/[id] - Delete a promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get existing promo codes
    const promoSetting = await db.setting.findUnique({
      where: { key: 'promo_codes' }
    });

    let promoCodes: Array<{
      id: string;
      [key: string]: unknown;
    }> = [];
    
    if (promoSetting?.value) {
      try {
        promoCodes = JSON.parse(promoSetting.value);
      } catch {
        promoCodes = [];
      }
    }

    // Filter out the deleted promo code
    promoCodes = promoCodes.filter(p => p.id !== id);

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}
