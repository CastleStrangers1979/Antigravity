import { NextResponse } from 'next/server';

// Notification template types
interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  channels: string[];
  variables: string[];
  category: string;
  isActive: boolean;
}

// Predefined notification templates for Al-Malika Bakery
const notificationTemplates: NotificationTemplate[] = [
  // Order Status Templates
  {
    id: 'order_confirmed',
    type: 'order_status',
    name: 'Order Confirmed',
    nameAr: 'تم تأكيد الطلب',
    title: 'Order Confirmed',
    titleAr: 'تم تأكيد طلبك',
    message: 'Your order #{{orderNumber}} has been confirmed and is being prepared. Estimated delivery: {{deliveryTime}}',
    messageAr: 'تم تأكيد طلبك رقم #{{orderNumber}} وجاري تحضيره. التوصيل المتوقع: {{deliveryTime}}',
    channels: ['sms', 'email', 'whatsapp', 'push'],
    variables: ['orderNumber', 'deliveryTime'],
    category: 'orders',
    isActive: true,
  },
  {
    id: 'order_preparing',
    type: 'order_status',
    name: 'Order Preparing',
    nameAr: 'جاري تحضير الطلب',
    title: 'Order Being Prepared',
    titleAr: 'جاري تحضير طلبك',
    message: 'Your order #{{orderNumber}} is now being prepared with fresh ingredients.',
    messageAr: 'جاري تحضير طلبك رقم #{{orderNumber}} بمكونات طازجة.',
    channels: ['push', 'whatsapp'],
    variables: ['orderNumber'],
    category: 'orders',
    isActive: true,
  },
  {
    id: 'order_ready',
    type: 'order_status',
    name: 'Order Ready',
    nameAr: 'الطلب جاهز',
    title: 'Order Ready for Delivery',
    titleAr: 'طلبك جاهز للتوصيل',
    message: 'Your order #{{orderNumber}} is ready and will be delivered soon by {{driverName}}.',
    messageAr: 'طلبك رقم #{{orderNumber}} جاهز وسيتم توصيله قريباً بواسطة {{driverName}}.',
    channels: ['sms', 'whatsapp', 'push'],
    variables: ['orderNumber', 'driverName'],
    category: 'orders',
    isActive: true,
  },
  {
    id: 'order_out_for_delivery',
    type: 'order_status',
    name: 'Out for Delivery',
    nameAr: 'في الطريق للتوصيل',
    title: 'Order Out for Delivery',
    titleAr: 'طلبك في الطريق إليك',
    message: 'Your order #{{orderNumber}} is out for delivery! Driver {{driverName}} will arrive soon. Contact: {{driverPhone}}',
    messageAr: 'طلبك رقم #{{orderNumber}} في الطريق إليك! السائق {{driverName}} سيصل قريباً. للتواصل: {{driverPhone}}',
    channels: ['sms', 'whatsapp', 'push'],
    variables: ['orderNumber', 'driverName', 'driverPhone'],
    category: 'orders',
    isActive: true,
  },
  {
    id: 'order_delivered',
    type: 'order_status',
    name: 'Order Delivered',
    nameAr: 'تم التوصيل',
    title: 'Order Delivered Successfully',
    titleAr: 'تم توصيل طلبك بنجاح',
    message: 'Your order #{{orderNumber}} has been delivered. Thank you for choosing Al-Malika Bakery!',
    messageAr: 'تم توصيل طلبك رقم #{{orderNumber}} بنجاح. شكراً لاختيارك مخبز الملكة!',
    channels: ['email', 'push'],
    variables: ['orderNumber'],
    category: 'orders',
    isActive: true,
  },
  {
    id: 'order_cancelled',
    type: 'order_status',
    name: 'Order Cancelled',
    nameAr: 'تم إلغاء الطلب',
    title: 'Order Cancelled',
    titleAr: 'تم إلغاء طلبك',
    message: 'Your order #{{orderNumber}} has been cancelled. Reason: {{reason}}. Refund will be processed within 3-5 business days.',
    messageAr: 'تم إلغاء طلبك رقم #{{orderNumber}}. السبب: {{reason}}. سيتم استرداد المبلغ خلال 3-5 أيام عمل.',
    channels: ['sms', 'email', 'push'],
    variables: ['orderNumber', 'reason'],
    category: 'orders',
    isActive: true,
  },

  // Driver Assignment Templates
  {
    id: 'driver_assigned',
    type: 'driver_assigned',
    name: 'Driver Assigned',
    nameAr: 'تم تعيين السائق',
    title: 'Driver Assigned',
    titleAr: 'تم تعيين سائق لطلبك',
    message: 'Driver {{driverName}} has been assigned to your order #{{orderNumber}}. Contact: {{driverPhone}}',
    messageAr: 'تم تعيين السائق {{driverName}} لطلبك رقم #{{orderNumber}}. للتواصل: {{driverPhone}}',
    channels: ['sms', 'push'],
    variables: ['driverName', 'orderNumber', 'driverPhone'],
    category: 'delivery',
    isActive: true,
  },

  // Driver Notifications
  {
    id: 'new_delivery_assignment',
    type: 'new_order',
    name: 'New Delivery Assignment',
    nameAr: 'مهمة توصيل جديدة',
    title: 'New Delivery Assignment',
    titleAr: 'مهمة توصيل جديدة',
    message: 'You have a new delivery assignment. Order #{{orderNumber}} to {{customerName}} at {{address}}.',
    messageAr: 'لديك مهمة توصيل جديدة. الطلب #{{orderNumber}} للعميل {{customerName}} على العنوان {{address}}.',
    channels: ['push', 'sms'],
    variables: ['orderNumber', 'customerName', 'address'],
    category: 'driver',
    isActive: true,
  },
  {
    id: 'delivery_schedule_reminder',
    type: 'delivery',
    name: 'Delivery Schedule Reminder',
    nameAr: 'تذكير جدول التوصيل',
    title: 'Delivery Schedule Reminder',
    titleAr: 'تذكير بجدول التوصيل',
    message: 'Reminder: You have {{ordersCount}} deliveries scheduled for today. Start time: {{startTime}}',
    messageAr: 'تذكير: لديك {{ordersCount}} توصيلات مجدولة لليوم. وقت البدء: {{startTime}}',
    channels: ['push'],
    variables: ['ordersCount', 'startTime'],
    category: 'driver',
    isActive: true,
  },

  // Payment Templates
  {
    id: 'payment_successful',
    type: 'payment',
    name: 'Payment Successful',
    nameAr: 'تم الدفع بنجاح',
    title: 'Payment Successful',
    titleAr: 'تم الدفع بنجاح',
    message: 'Payment of €{{amount}} for order #{{orderNumber}} has been processed successfully.',
    messageAr: 'تم معالجة دفعة بقيمة €{{amount}} للطلب رقم #{{orderNumber}} بنجاح.',
    channels: ['email', 'push'],
    variables: ['amount', 'orderNumber'],
    category: 'payment',
    isActive: true,
  },
  {
    id: 'payment_failed',
    type: 'payment',
    name: 'Payment Failed',
    nameAr: 'فشل الدفع',
    title: 'Payment Failed',
    titleAr: 'فشلت عملية الدفع',
    message: 'Payment for order #{{orderNumber}} has failed. Please try again or contact support.',
    messageAr: 'فشلت عملية الدفع للطلب رقم #{{orderNumber}}. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
    channels: ['sms', 'email', 'push'],
    variables: ['orderNumber'],
    category: 'payment',
    isActive: true,
  },
  {
    id: 'refund_processed',
    type: 'payment',
    name: 'Refund Processed',
    nameAr: 'تم استرداد المبلغ',
    title: 'Refund Processed',
    titleAr: 'تم استرداد المبلغ',
    message: 'Refund of €{{amount}} for order #{{orderNumber}} has been processed. It may take 3-5 business days to reflect in your account.',
    messageAr: 'تم استرداد مبلغ €{{amount}} للطلب رقم #{{orderNumber}}. قد يستغرق 3-5 أيام عمل للظهور في حسابك.',
    channels: ['email', 'push'],
    variables: ['amount', 'orderNumber'],
    category: 'payment',
    isActive: true,
  },

  // Loyalty Points Templates
  {
    id: 'points_earned',
    type: 'points_earned',
    name: 'Points Earned',
    nameAr: 'نقاط مكتسبة',
    title: 'Points Earned!',
    titleAr: 'نقاط مكتسبة!',
    message: 'You earned {{points}} loyalty points from your order! Total points: {{totalPoints}}',
    messageAr: 'لقد ربحت {{points}} نقاط ولاء من طلبك! مجموع نقاطك: {{totalPoints}}',
    channels: ['push'],
    variables: ['points', 'totalPoints'],
    category: 'loyalty',
    isActive: true,
  },
  {
    id: 'points_redeemed',
    type: 'points_earned',
    name: 'Points Redeemed',
    nameAr: 'تم استبدال النقاط',
    title: 'Points Redeemed',
    titleAr: 'تم استبدال النقاط',
    message: 'You redeemed {{points}} points for a €{{discount}} discount on your order. Remaining points: {{totalPoints}}',
    messageAr: 'تم استبدال {{points}} نقطة مقابل خصم €{{discount}} على طلبك. النقاط المتبقية: {{totalPoints}}',
    channels: ['push'],
    variables: ['points', 'discount', 'totalPoints'],
    category: 'loyalty',
    isActive: true,
  },
  {
    id: 'loyalty_tier_upgrade',
    type: 'points_earned',
    name: 'Loyalty Tier Upgrade',
    nameAr: 'ترقية مستوى الولاء',
    title: 'Congratulations! Tier Upgrade',
    titleAr: 'تهانينا! ترقية المستوى',
    message: 'You have been upgraded to {{tier}} tier! Enjoy exclusive benefits and rewards.',
    messageAr: 'تم ترقيتك إلى مستوى {{tier}}! استمتع بمزايا ومكافآت حصرية.',
    channels: ['email', 'push'],
    variables: ['tier'],
    category: 'loyalty',
    isActive: true,
  },

  // Low Stock Alert (Admin)
  {
    id: 'low_stock_alert',
    type: 'low_stock',
    name: 'Low Stock Alert',
    nameAr: 'تنبيه نقص المخزون',
    title: 'Low Stock Alert',
    titleAr: 'تنبيه نقص المخزون',
    message: 'Product "{{productName}}" is running low. Current stock: {{currentStock}} units. Minimum threshold: {{minStock}}.',
    messageAr: 'المنتج "{{productName}}" ينفد من المخزون. المخزون الحالي: {{currentStock}} وحدة. الحد الأدنى: {{minStock}}.',
    channels: ['email', 'push'],
    variables: ['productName', 'currentStock', 'minStock'],
    category: 'inventory',
    isActive: true,
  },

  // Marketing Campaigns
  {
    id: 'promotional_offer',
    type: 'campaign',
    name: 'Promotional Offer',
    nameAr: 'عرض ترويجي',
    title: 'Special Offer!',
    titleAr: 'عرض خاص!',
    message: 'Enjoy {{discount}}% off on all pastries this weekend! Use code: {{promoCode}}. Valid until {{endDate}}.',
    messageAr: 'استمتع بخصم {{discount}}% على جميع المعجنات هذا الاسبوع! استخدم الكود: {{promoCode}}. صالح حتى {{endDate}}.',
    channels: ['sms', 'email', 'whatsapp', 'push'],
    variables: ['discount', 'promoCode', 'endDate'],
    category: 'marketing',
    isActive: true,
  },
  {
    id: 'new_product_announcement',
    type: 'campaign',
    name: 'New Product Announcement',
    nameAr: 'إعلان منتج جديد',
    title: 'New Product Available!',
    titleAr: 'منتج جديد متوفر!',
    message: 'Try our new {{productName}}! Fresh from the oven. Order now and get {{discount}}% off your first order.',
    messageAr: 'جرب {{productName}} الجديد! طازج من الفرن. اطلب الآن واحصل على خصم {{discount}}% على طلبك الأول.',
    channels: ['email', 'push'],
    variables: ['productName', 'discount'],
    category: 'marketing',
    isActive: true,
  },

  // Subscription Templates
  {
    id: 'subscription_reminder',
    type: 'subscription',
    name: 'Subscription Reminder',
    nameAr: 'تذكير بالاشتراك',
    title: 'Subscription Reminder',
    titleAr: 'تذكير بالاشتراك',
    message: 'Your next delivery for subscription "{{subscriptionName}}" is scheduled for {{deliveryDate}}.',
    messageAr: 'التوصيل القادم لاشتراكك "{{subscriptionName}}" مجدول في {{deliveryDate}}.',
    channels: ['push', 'email'],
    variables: ['subscriptionName', 'deliveryDate'],
    category: 'subscription',
    isActive: true,
  },
  {
    id: 'subscription_paused',
    type: 'subscription',
    name: 'Subscription Paused',
    nameAr: 'تم إيقاف الاشتراك',
    title: 'Subscription Paused',
    titleAr: 'تم إيقاف اشتراكك',
    message: 'Your subscription "{{subscriptionName}}" has been paused. Resume anytime from your account.',
    messageAr: 'تم إيقاف اشتراكك "{{subscriptionName}}". يمكنك استئنافه في أي وقت من حسابك.',
    channels: ['email', 'push'],
    variables: ['subscriptionName'],
    category: 'subscription',
    isActive: true,
  },
];

// GET - Get all notification templates or filter by type/category
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'en';

    let filteredTemplates = [...notificationTemplates];

    // Filter by type if provided
    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    // Filter by category if provided
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    // Transform based on language preference
    const templates = filteredTemplates.map(template => ({
      id: template.id,
      type: template.type,
      name: language === 'ar' ? template.nameAr : template.name,
      title: language === 'ar' ? template.titleAr : template.title,
      message: language === 'ar' ? template.messageAr : template.message,
      channels: template.channels,
      variables: template.variables,
      category: template.category,
      isActive: template.isActive,
      // Include both languages for reference
      translations: {
        en: {
          name: template.name,
          title: template.title,
          message: template.message,
        },
        ar: {
          name: template.nameAr,
          title: template.titleAr,
          message: template.messageAr,
        },
      },
    }));

    // Get unique categories
    const categories = [...new Set(notificationTemplates.map(t => t.category))];

    // Get unique types
    const types = [...new Set(notificationTemplates.map(t => t.type))];

    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        total: templates.length,
        categories,
        types,
        availableLanguages: ['en', 'ar', 'nl', 'ku'],
      },
    });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification templates' },
      { status: 500 }
    );
  }
}

// POST - Preview a template with variables
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, variables, language = 'en' } = body;

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = notificationTemplates.find(t => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Replace variables in message
    let previewTitle = language === 'ar' ? template.titleAr : template.title;
    let previewMessage = language === 'ar' ? template.messageAr : template.message;

    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewTitle = previewTitle.replace(regex, String(value));
        previewMessage = previewMessage.replace(regex, String(value));
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        templateId: template.id,
        type: template.type,
        title: previewTitle,
        message: previewMessage,
        channels: template.channels,
        variables: template.variables,
        category: template.category,
      },
    });
  } catch (error) {
    console.error('Error previewing notification template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to preview notification template' },
      { status: 500 }
    );
  }
}
