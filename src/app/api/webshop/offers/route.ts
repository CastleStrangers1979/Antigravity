import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Banner interface for in-memory storage (until we add to Prisma schema)
// For now, we'll use the Setting model to store banner data as JSON

// GET /api/webshop/offers - Get all banners and offers
export async function GET() {
  try {
    // Get banners from settings
    const bannersSetting = await db.setting.findUnique({
      where: { key: 'webshop_banners' }
    });

    let banners = [];
    if (bannersSetting?.value) {
      try {
        banners = JSON.parse(bannersSetting.value);
      } catch {
        banners = [];
      }
    }

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// POST /api/webshop/offers - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titleAr, titleEn, titleNl, subtitleAr, subtitleEn, subtitleNl, imageUrl, linkUrl } = body;

    // Get existing banners
    const bannersSetting = await db.setting.findUnique({
      where: { key: 'webshop_banners' }
    });

    let banners: Array<{
      id: string;
      titleAr: string;
      titleEn: string;
      titleNl: string;
      subtitleAr: string;
      subtitleEn: string;
      subtitleNl: string;
      imageUrl: string;
      linkUrl: string;
      isActive: boolean;
      sortOrder: number;
    }> = [];
    
    if (bannersSetting?.value) {
      try {
        banners = JSON.parse(bannersSetting.value);
      } catch {
        banners = [];
      }
    }

    // Create new banner
    const newBanner = {
      id: `banner_${Date.now()}`,
      titleAr: titleAr || '',
      titleEn: titleEn || '',
      titleNl: titleNl || '',
      subtitleAr: subtitleAr || '',
      subtitleEn: subtitleEn || '',
      subtitleNl: subtitleNl || '',
      imageUrl: imageUrl || '',
      linkUrl: linkUrl || '',
      isActive: true,
      sortOrder: banners.length,
    };

    banners.push(newBanner);

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

    return NextResponse.json(newBanner);
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
