import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
let mobileConfig = {
  pwaConfig: {
    appName: 'Al-Malika Bakery',
    shortName: 'Al-Malika',
    description: 'Order authentic Syrian bread and pastries from Al-Malika Bakery in the Netherlands',
    themeColor: '#2D5A3D',
    backgroundColor: '#FFFEF7',
    displayMode: 'standalone',
    orientation: 'portrait',
    startUrl: '/',
    scope: '/',
  },
  features: [
    { id: '1', name: 'Push Notifications', nameAr: 'الإشعارات الفورية', enabled: true, description: 'Receive order updates and promotions', descriptionAr: 'تلقي تحديثات الطلبات والعروض' },
    { id: '2', name: 'Offline Mode', nameAr: 'الوضع بدون اتصال', enabled: true, description: 'Browse products and view orders offline', descriptionAr: 'تصفح المنتجات وعرض الطلبات بدون اتصال' },
    { id: '3', name: 'Location Services', nameAr: 'خدمات الموقع', enabled: true, description: 'Track deliveries and find nearby stores', descriptionAr: 'تتبع التوصيلات والعثور على المتاجر القريبة' },
    { id: '4', name: 'Camera Integration', nameAr: 'تكامل الكاميرا', enabled: false, description: 'Scan QR codes for quick ordering', descriptionAr: 'مسح رموز QR للطلب السريع' },
    { id: '5', name: 'Biometric Login', nameAr: 'تسجيل الدخول البيومتري', enabled: true, description: 'Secure login with fingerprint or face', descriptionAr: 'تسجيل دخول آمن بالبصمة أو الوجه' },
    { id: '6', name: 'Dark Mode', nameAr: 'الوضع الداكن', enabled: true, description: 'Switch between light and dark themes', descriptionAr: 'التبديل بين السمات الفاتحة والداكنة' },
  ],
  deepLinks: [
    { id: '1', scheme: 'almalika', path: '/product/:id', action: 'VIEW_PRODUCT', isActive: true },
    { id: '2', scheme: 'almalika', path: '/order/:id', action: 'VIEW_ORDER', isActive: true },
    { id: '3', scheme: 'almalika', path: '/category/:name', action: 'VIEW_CATEGORY', isActive: true },
    { id: '4', scheme: 'https', path: 'al-malika.nl/app/promo/:code', action: 'APPLY_PROMO', isActive: true },
  ],
  storeLinks: {
    appleAppStore: 'https://apps.apple.com/nl/app/al-malika-bakery/id1234567890',
    googlePlayStore: 'https://play.google.com/store/apps/details?id=nl.almalika.bakery',
    qrCodeUrl: '/qr-app-download.png',
    totalDownloads: 3421,
    appleDownloads: 1456,
    googleDownloads: 1965,
  },
};

// GET - Fetch mobile configuration
export async function GET() {
  try {
    return NextResponse.json(mobileConfig);
  } catch (error) {
    console.error('Error fetching mobile config:', error);
    return NextResponse.json({ error: 'Failed to fetch mobile config' }, { status: 500 });
  }
}

// PUT - Update mobile configuration
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Update the config with the provided values
    if (body.pwaConfig) {
      mobileConfig.pwaConfig = { ...mobileConfig.pwaConfig, ...body.pwaConfig };
    }
    if (body.features) {
      mobileConfig.features = body.features;
    }
    if (body.deepLinks) {
      mobileConfig.deepLinks = body.deepLinks;
    }
    if (body.storeLinks) {
      mobileConfig.storeLinks = { ...mobileConfig.storeLinks, ...body.storeLinks };
    }
    
    return NextResponse.json({ success: true, config: mobileConfig });
  } catch (error) {
    console.error('Error updating mobile config:', error);
    return NextResponse.json({ error: 'Failed to update mobile config' }, { status: 500 });
  }
}
