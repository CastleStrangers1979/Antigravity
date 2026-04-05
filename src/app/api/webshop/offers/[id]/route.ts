import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/webshop/offers/[id] - Toggle banner active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Get existing banners
    const bannersSetting = await db.setting.findUnique({
      where: { key: 'webshop_banners' }
    });

    let banners: Array<{
      id: string;
      isActive: boolean;
      [key: string]: unknown;
    }> = [];
    
    if (bannersSetting?.value) {
      try {
        banners = JSON.parse(bannersSetting.value);
      } catch {
        banners = [];
      }
    }

    // Find and update banner
    const bannerIndex = banners.findIndex(b => b.id === id);
    if (bannerIndex !== -1) {
      banners[bannerIndex].isActive = isActive;
    }

    // Save back to settings
    await db.setting.upsert({
      where: { key: 'webshop_banners' },
      update: { value: JSON.stringify(banners) },
      create: {
        key: 'webshop_banners',
        value: JSON.stringify(banners),
        category: 'webshop',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE /api/webshop/offers/[id] - Delete a banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get existing banners
    const bannersSetting = await db.setting.findUnique({
      where: { key: 'webshop_banners' }
    });

    let banners: Array<{
      id: string;
      [key: string]: unknown;
    }> = [];
    
    if (bannersSetting?.value) {
      try {
        banners = JSON.parse(bannersSetting.value);
      } catch {
        banners = [];
      }
    }

    // Filter out the deleted banner
    banners = banners.filter(b => b.id !== id);

    // Save back to settings
    await db.setting.upsert({
      where: { key: 'webshop_banners' },
      update: { value: JSON.stringify(banners) },
      create: {
        key: 'webshop_banners',
        value: JSON.stringify(banners),
        category: 'webshop',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
