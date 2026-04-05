import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all promotions (banners, promo codes, special offers)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'banner', 'promo_code', 'special_offer'
    
    // Fetch promotions from settings (since we're using Setting model)
    const promotionsSettings = await db.setting.findMany({
      where: {
        OR: [
          { key: { startsWith: 'webshop_banner_' } },
          { key: { startsWith: 'webshop_promo_' } },
          { key: { startsWith: 'webshop_offer_' } },
          { key: 'webshop_banners' },
          { key: 'webshop_promo_codes' },
          { key: 'webshop_special_offers' },
        ],
      },
    });

    // Convert to object
    const settingsObject: Record<string, string | null> = {};
    promotionsSettings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Parse promotions
    const banners = settingsObject.webshop_banners 
      ? JSON.parse(settingsObject.webshop_banners) 
      : getDefaultBanners();
    
    const promoCodes = settingsObject.webshop_promo_codes 
      ? JSON.parse(settingsObject.webshop_promo_codes) 
      : [];
    
    const specialOffers = settingsObject.webshop_special_offers 
      ? JSON.parse(settingsObject.webshop_special_offers) 
      : [];

    // Filter by type if specified
    if (type === 'banner') {
      return NextResponse.json({ banners });
    } else if (type === 'promo_code') {
      return NextResponse.json({ promoCodes });
    } else if (type === 'special_offer') {
      return NextResponse.json({ specialOffers });
    }

    return NextResponse.json({
      banners,
      promoCodes,
      specialOffers,
      loyaltyDisplay: {
        enabled: settingsObject.webshop_loyalty_display_enabled !== 'false',
        showPointsOnProduct: settingsObject.webshop_show_points_product === 'true',
        showPointsOnCart: settingsObject.webshop_show_points_cart !== 'false',
        showPointsHistory: settingsObject.webshop_show_points_history !== 'false',
      },
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST - Create a new promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    // Get existing promotions
    let existingPromotions: any[] = [];
    let settingKey = '';

    if (type === 'banner') {
      settingKey = 'webshop_banners';
      const setting = await db.setting.findUnique({ where: { key: settingKey } });
      existingPromotions = setting?.value ? JSON.parse(setting.value) : getDefaultBanners();
    } else if (type === 'promo_code') {
      settingKey = 'webshop_promo_codes';
      const setting = await db.setting.findUnique({ where: { key: settingKey } });
      existingPromotions = setting?.value ? JSON.parse(setting.value) : [];
    } else if (type === 'special_offer') {
      settingKey = 'webshop_special_offers';
      const setting = await db.setting.findUnique({ where: { key: settingKey } });
      existingPromotions = setting?.value ? JSON.parse(setting.value) : [];
    } else {
      return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
    }

    // Add new promotion with ID
    const newPromotion = {
      ...data,
      id: `promo_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existingPromotions.push(newPromotion);

    // Save to database
    await db.setting.upsert({
      where: { key: settingKey },
      update: { 
        value: JSON.stringify(existingPromotions),
        category: 'webshop',
      },
      create: {
        key: settingKey,
        value: JSON.stringify(existingPromotions),
        category: 'webshop',
      },
    });

    return NextResponse.json({ success: true, promotion: newPromotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}

// PUT - Update a promotion
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json({ error: 'Missing type, id, or data' }, { status: 400 });
    }

    // Get existing promotions
    let settingKey = '';
    if (type === 'banner') {
      settingKey = 'webshop_banners';
    } else if (type === 'promo_code') {
      settingKey = 'webshop_promo_codes';
    } else if (type === 'special_offer') {
      settingKey = 'webshop_special_offers';
    } else {
      return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
    }

    const setting = await db.setting.findUnique({ where: { key: settingKey } });
    if (!setting?.value) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    let promotions = JSON.parse(setting.value);
    const index = promotions.findIndex((p: any) => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Update promotion
    promotions[index] = {
      ...promotions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await db.setting.update({
      where: { key: settingKey },
      data: { value: JSON.stringify(promotions) },
    });

    return NextResponse.json({ success: true, promotion: promotions[index] });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE - Delete a promotion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    // Get existing promotions
    let settingKey = '';
    if (type === 'banner') {
      settingKey = 'webshop_banners';
    } else if (type === 'promo_code') {
      settingKey = 'webshop_promo_codes';
    } else if (type === 'special_offer') {
      settingKey = 'webshop_special_offers';
    } else {
      return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
    }

    const setting = await db.setting.findUnique({ where: { key: settingKey } });
    if (!setting?.value) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    let promotions = JSON.parse(setting.value);
    promotions = promotions.filter((p: any) => p.id !== id);

    // Save to database
    await db.setting.update({
      where: { key: settingKey },
      data: { value: JSON.stringify(promotions) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}

// Helper function to get default banners
function getDefaultBanners() {
  return [
    {
      id: 'banner_1',
      title: 'Welcome to Al-Malika Bakery',
      titleAr: 'مرحباً بكم في مخبز الملكة',
      subtitle: 'Authentic Syrian Bread & Pastries',
      subtitleAr: 'الخبز والمعجنات السورية الأصيلة',
      imageUrl: '/banner-1.jpg',
      linkUrl: '/products',
      buttonText: 'Shop Now',
      buttonTextAr: 'تسوق الآن',
      position: 'hero',
      isActive: true,
      order: 1,
    },
    {
      id: 'banner_2',
      title: 'Free Delivery Over €50',
      titleAr: 'توصيل مجاني للطلبات فوق €50',
      subtitle: 'Fresh bread delivered to your door',
      subtitleAr: 'خبز طازج يصل إلى بابك',
      imageUrl: '/banner-2.jpg',
      linkUrl: '/delivery',
      buttonText: 'Learn More',
      buttonTextAr: 'اعرف المزيد',
      position: 'promo',
      isActive: true,
      order: 2,
    },
  ];
}
