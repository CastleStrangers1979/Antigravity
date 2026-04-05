import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch webshop settings
export async function GET() {
  try {
    // Fetch all webshop-related settings from the Setting model
    const settings = await db.setting.findMany({
      where: {
        OR: [
          { key: { startsWith: 'webshop_' } },
          { category: 'webshop' },
        ],
      },
    });

    // Convert array to object for easier access
    const settingsObject: Record<string, string | null> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Default settings structure
    const defaultSettings = {
      // General Settings
      webshopEnabled: settingsObject.webshop_enabled === 'true',
      storeName: settingsObject.webshop_store_name || 'Al-Malika Bakery',
      storeDescription: settingsObject.webshop_store_description || 'Authentic Syrian Bread & Pastries',
      storePhone: settingsObject.webshop_store_phone || '+31 20 123 4567',
      storeEmail: settingsObject.webshop_store_email || 'info@al-malika.nl',
      storeAddress: settingsObject.webshop_store_address || 'Amsterdam, Netherlands',
      
      // Theme Settings
      primaryColor: settingsObject.webshop_primary_color || '#D4A853',
      secondaryColor: settingsObject.webshop_secondary_color || '#2D5A3D',
      logoUrl: settingsObject.webshop_logo_url || '/logo.png',
      
      // Display Settings
      productsPerPage: parseInt(settingsObject.webshop_products_per_page || '12'),
      showPrices: settingsObject.webshop_show_prices !== 'false',
      showStock: settingsObject.webshop_show_stock === 'true',
      showDescription: settingsObject.webshop_show_description !== 'false',
      
      // Cart Settings
      minOrderAmount: parseFloat(settingsObject.webshop_min_order_amount || '0'),
      deliveryFee: parseFloat(settingsObject.webshop_delivery_fee || '5.00'),
      freeDeliveryThreshold: parseFloat(settingsObject.webshop_free_delivery_threshold || '50'),
      
      // Tax Settings
      taxRate: parseFloat(settingsObject.webshop_tax_rate || '21'),
      taxIncluded: settingsObject.webshop_tax_included !== 'false',
      
      // Checkout Settings
      requirePhoneNumber: settingsObject.webshop_require_phone !== 'false',
      requireEmailAddress: settingsObject.webshop_require_email === 'true',
      allowGuestCheckout: settingsObject.webshop_guest_checkout !== 'false',
      termsRequired: settingsObject.webshop_terms_required !== 'false',
      
      // Payment Methods
      paymentMethods: settingsObject.webshop_payment_methods 
        ? JSON.parse(settingsObject.webshop_payment_methods) 
        : ['cash', 'card', 'ideal'],
      
      // Delivery Time Slots
      deliveryTimeSlots: settingsObject.webshop_delivery_time_slots 
        ? JSON.parse(settingsObject.webshop_delivery_time_slots) 
        : [
            { id: '1', label: '09:00 - 12:00', available: true },
            { id: '2', label: '12:00 - 15:00', available: true },
            { id: '3', label: '15:00 - 18:00', available: true },
            { id: '4', label: '18:00 - 21:00', available: true },
          ],
      
      // Customer Account Settings
      allowRegistration: settingsObject.webshop_allow_registration !== 'false',
      allowEmailLogin: settingsObject.webshop_email_login !== 'false',
      allowPhoneLogin: settingsObject.webshop_phone_login === 'true',
      allowSocialLogin: settingsObject.webshop_social_login === 'true',
      requireEmailVerification: settingsObject.webshop_email_verification === 'true',
      requirePhoneVerification: settingsObject.webshop_phone_verification === 'true',
      
      // Password Requirements
      minPasswordLength: parseInt(settingsObject.webshop_min_password_length || '8'),
      requireUppercase: settingsObject.webshop_require_uppercase === 'true',
      requireLowercase: settingsObject.webshop_require_lowercase === 'true',
      requireNumber: settingsObject.webshop_require_number === 'true',
      requireSpecialChar: settingsObject.webshop_require_special_char === 'true',
      
      // Loyalty Points
      showLoyaltyPoints: settingsObject.webshop_show_loyalty_points !== 'false',
      pointsPerEuro: parseInt(settingsObject.webshop_points_per_euro || '10'),
      pointsRedemptionRate: parseInt(settingsObject.webshop_points_redemption_rate || '100'),
      
      // Social Media Links
      socialMedia: settingsObject.webshop_social_media 
        ? JSON.parse(settingsObject.webshop_social_media) 
        : {
            facebook: '',
            instagram: '',
            whatsapp: '',
            twitter: '',
          },
      
      // Terms and Conditions
      termsUrl: settingsObject.webshop_terms_url || '',
      privacyUrl: settingsObject.webshop_privacy_url || '',
      
      // Order Confirmation
      sendOrderConfirmation: settingsObject.webshop_send_confirmation !== 'false',
      sendSmsConfirmation: settingsObject.webshop_send_sms_confirmation === 'true',
      sendEmailConfirmation: settingsObject.webshop_send_email_confirmation !== 'false',
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching webshop settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Update webshop settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Helper function to upsert a setting
    const upsertSetting = async (key: string, value: string | boolean | number | object | undefined) => {
      if (value === undefined) return;
      
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);
      
      await db.setting.upsert({
        where: { key },
        update: { 
          value: stringValue,
          category: 'webshop',
        },
        create: {
          key,
          value: stringValue,
          category: 'webshop',
        },
      });
    };

    // Map frontend keys to backend keys
    const keyMapping: Record<string, string> = {
      storeNameAr: 'webshop_store_name_ar',
      storeNameEn: 'webshop_store_name_en',
      storeNameNl: 'webshop_store_name_nl',
      phone: 'webshop_store_phone',
      email: 'webshop_store_email',
      address: 'webshop_store_address',
      city: 'webshop_store_city',
      postalCode: 'webshop_store_postal_code',
      primaryColor: 'webshop_primary_color',
      secondaryColor: 'webshop_secondary_color',
      logoUrl: 'webshop_logo_url',
      minOrderAmount: 'webshop_min_order_amount',
      deliveryFee: 'webshop_delivery_fee',
      freeDeliveryThreshold: 'webshop_free_delivery_threshold',
      showPrices: 'webshop_show_prices',
      allowPreOrder: 'webshop_allow_preorder',
      requireLogin: 'webshop_require_login',
      openingHours: 'webshop_opening_hours',
      deliveryZones: 'webshop_delivery_zones',
    };

    // Update settings
    for (const [frontendKey, backendKey] of Object.entries(keyMapping)) {
      if (body[frontendKey] !== undefined) {
        await upsertSetting(backendKey, body[frontendKey]);
      }
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error updating webshop settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// PUT - Update webshop settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Helper function to upsert a setting
    const upsertSetting = async (key: string, value: string | boolean | number | object | undefined) => {
      if (value === undefined) return;
      
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);
      
      await db.setting.upsert({
        where: { key },
        update: { 
          value: stringValue,
          category: 'webshop',
        },
        create: {
          key,
          value: stringValue,
          category: 'webshop',
        },
      });
    };

    // Update all settings
    const settingsToUpdate = [
      { key: 'webshop_enabled', value: body.webshopEnabled },
      { key: 'webshop_store_name', value: body.storeName },
      { key: 'webshop_store_description', value: body.storeDescription },
      { key: 'webshop_store_phone', value: body.storePhone },
      { key: 'webshop_store_email', value: body.storeEmail },
      { key: 'webshop_store_address', value: body.storeAddress },
      { key: 'webshop_primary_color', value: body.primaryColor },
      { key: 'webshop_secondary_color', value: body.secondaryColor },
      { key: 'webshop_logo_url', value: body.logoUrl },
      { key: 'webshop_products_per_page', value: body.productsPerPage },
      { key: 'webshop_show_prices', value: body.showPrices },
      { key: 'webshop_show_stock', value: body.showStock },
      { key: 'webshop_show_description', value: body.showDescription },
      { key: 'webshop_min_order_amount', value: body.minOrderAmount },
      { key: 'webshop_delivery_fee', value: body.deliveryFee },
      { key: 'webshop_free_delivery_threshold', value: body.freeDeliveryThreshold },
      { key: 'webshop_tax_rate', value: body.taxRate },
      { key: 'webshop_tax_included', value: body.taxIncluded },
      { key: 'webshop_require_phone', value: body.requirePhoneNumber },
      { key: 'webshop_require_email', value: body.requireEmailAddress },
      { key: 'webshop_guest_checkout', value: body.allowGuestCheckout },
      { key: 'webshop_terms_required', value: body.termsRequired },
      { key: 'webshop_payment_methods', value: body.paymentMethods },
      { key: 'webshop_delivery_time_slots', value: body.deliveryTimeSlots },
      { key: 'webshop_allow_registration', value: body.allowRegistration },
      { key: 'webshop_email_login', value: body.allowEmailLogin },
      { key: 'webshop_phone_login', value: body.allowPhoneLogin },
      { key: 'webshop_social_login', value: body.allowSocialLogin },
      { key: 'webshop_email_verification', value: body.requireEmailVerification },
      { key: 'webshop_phone_verification', value: body.requirePhoneVerification },
      { key: 'webshop_min_password_length', value: body.minPasswordLength },
      { key: 'webshop_require_uppercase', value: body.requireUppercase },
      { key: 'webshop_require_lowercase', value: body.requireLowercase },
      { key: 'webshop_require_number', value: body.requireNumber },
      { key: 'webshop_require_special_char', value: body.requireSpecialChar },
      { key: 'webshop_show_loyalty_points', value: body.showLoyaltyPoints },
      { key: 'webshop_points_per_euro', value: body.pointsPerEuro },
      { key: 'webshop_points_redemption_rate', value: body.pointsRedemptionRate },
      { key: 'webshop_social_media', value: body.socialMedia },
      { key: 'webshop_terms_url', value: body.termsUrl },
      { key: 'webshop_privacy_url', value: body.privacyUrl },
      { key: 'webshop_send_confirmation', value: body.sendOrderConfirmation },
      { key: 'webshop_send_sms_confirmation', value: body.sendSmsConfirmation },
      { key: 'webshop_send_email_confirmation', value: body.sendEmailConfirmation },
    ];

    for (const setting of settingsToUpdate) {
      await upsertSetting(setting.key, setting.value);
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error updating webshop settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
