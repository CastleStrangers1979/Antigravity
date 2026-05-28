import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - إنشاء بيانات تجريبية لحزمة الدخول السهل
// منتجات الخبز فقط + 3 طلبات + سائقين اثنين
export async function POST() {
  try {
    // حذف البيانات القديمة
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.invoice.deleteMany();
    await db.payment.deleteMany();
    await db.customer.deleteMany();
    await db.driver.deleteMany();
    await db.deliveryLine.deleteMany();
    await db.product.deleteMany();

    // إنشاء 9 خطوط توزيع تغطي جميع أنحاء هولندا
    const deliveryLines = await Promise.all([
      db.deliveryLine.create({
        data: {
          nameAr: 'خط أمستردام',
          nameEn: 'Amsterdam Line',
          nameNl: 'Amsterdam Route',
          region: 'Amsterdam',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط روتردام',
          nameEn: 'Rotterdam Line',
          nameNl: 'Rotterdam Route',
          region: 'Rotterdam',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط لاهاي',
          nameEn: 'The Hague Line',
          nameNl: 'Den Haag Route',
          region: 'The Hague',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط أوترخت',
          nameEn: 'Utrecht Line',
          nameNl: 'Utrecht Route',
          region: 'Utrecht',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط ألميلو',
          nameEn: 'Almelo Line',
          nameNl: 'Almelo Route',
          region: 'Almelo',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط إنشوله',
          nameEn: 'Enschede Line',
          nameNl: 'Enschede Route',
          region: 'Enschede',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط خرونينغن',
          nameEn: 'Groningen Line',
          nameNl: 'Groningen Route',
          region: 'Groningen',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط آيندهوفن',
          nameEn: 'Eindhoven Line',
          nameNl: 'Eindhoven Route',
          region: 'Eindhoven',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط نيميغن',
          nameEn: 'Nijmegen Line',
          nameNl: 'Nijmegen Route',
          region: 'Nijmegen',
        },
      }),
    ]);

    // إنشاء سائقين اثنين فقط (كما طلب المستخدم)
    const drivers = await Promise.all([
      db.driver.create({
        data: {
          name: 'أحمد محمد',
          phone: '+31612345678',
          email: 'ahmed@alqueen.nl',
          deliveryLineId: deliveryLines[0].id,
          isOnline: true,
          completedToday: 12,
          totalDeliveries: 450,
          rating: 4.8,
        },
      }),
      db.driver.create({
        data: {
          name: 'محمد علي',
          phone: '+31623456789',
          email: 'mohammed@alqueen.nl',
          deliveryLineId: deliveryLines[1].id,
          isOnline: true,
          completedToday: 8,
          totalDeliveries: 320,
          rating: 4.6,
        },
      }),
    ]);

    // إنشاء منتجات الخبز فقط (كما طلب المستخدم)
    const products = await Promise.all([
      // 1. خبز عربي كبير - €2.00
      db.product.create({
        data: {
          nameAr: 'خبز عربي كبير',
          nameEn: 'Large Arabic Bread',
          nameNl: 'Groot Arabisch Brood',
          description: 'ربطة ٥ أرغفة - مثالي للعائلات الكبيرة',
          price: 2.00,
          category: 'bread',
          sku: 'B001',
          weight: 350,
          packSize: 5,
          boxSize: 15,
          stock: 200,
        },
      }),
      // 2. خبز عربي صغير - €1.00
      db.product.create({
        data: {
          nameAr: 'خبز عربي صغير',
          nameEn: 'Small Arabic Bread',
          nameNl: 'Klein Arabisch Brood',
          description: 'ربطة ٥ أرغفة - مناسب للأفراد',
          price: 1.00,
          category: 'bread',
          sku: 'B002',
          weight: 200,
          packSize: 5,
          boxSize: 20,
          stock: 250,
        },
      }),
      // 3. خبز بر - €2.50
      db.product.create({
        data: {
          nameAr: 'خبز بر',
          nameEn: 'Whole Wheat Bread',
          nameNl: 'Volkoren Brood',
          description: 'ربطة ٥ أرغفة - صحي ومغذي',
          price: 2.50,
          category: 'bread',
          sku: 'B003',
          weight: 320,
          packSize: 5,
          boxSize: 15,
          stock: 180,
        },
      }),
      // 4. خبز سمسم - €2.20
      db.product.create({
        data: {
          nameAr: 'خبز سمسم',
          nameEn: 'Sesame Bread',
          nameNl: 'Sesam Brood',
          description: 'ربطة ٥ أرغفة - طعم مميز بالسمسم',
          price: 2.20,
          category: 'bread',
          sku: 'B004',
          weight: 300,
          packSize: 5,
          boxSize: 15,
          stock: 150,
        },
      }),
      // 5. خبز تورتيلا - €1.80
      db.product.create({
        data: {
          nameAr: 'خبز تورتيلا',
          nameEn: 'Tortilla Bread',
          nameNl: 'Tortilla Brood',
          description: 'عبوة ١٠ قطع - مثالي للسندويشات',
          price: 1.80,
          category: 'bread',
          sku: 'B005',
          weight: 250,
          packSize: 10,
          boxSize: 20,
          stock: 220,
        },
      }),
    ]);

    // إنشاء 3 عملاء تجريبيين
    const customers = await Promise.all([
      db.customer.create({
        data: {
          name: 'مطعم الشام',
          phone: '+31611111111',
          email: 'sham@restaurant.nl',
          address: 'Damrak 123',
          city: 'Amsterdam',
          customerType: 'wholesale',
          totalOrders: 45,
          totalSpent: 1250.00,
        },
      }),
      db.customer.create({
        data: {
          name: 'سوبرماركت الحلال',
          phone: '+31622222222',
          email: 'halal@market.nl',
          address: 'Coolsingel 456',
          city: 'Rotterdam',
          customerType: 'wholesale',
          totalOrders: 78,
          totalSpent: 2340.00,
        },
      }),
      db.customer.create({
        data: {
          name: 'مخبز السعادة',
          phone: '+31633333333',
          email: 'happiness@bakery.nl',
          address: 'Spui 789',
          city: 'The Hague',
          customerType: 'wholesale',
          totalOrders: 32,
          totalSpent: 890.00,
        },
      }),
    ]);

    // إنشاء 3 طلبات تجريبية
    await db.order.create({
      data: {
        orderNumber: 'ORD-00001',
        customerId: customers[0].id,
        driverId: drivers[0].id,
        deliveryLineId: deliveryLines[0].id,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: 25.00,
        deliveryDate: new Date(),
        deliveryTime: '09:00',
        notes: 'توصيل مبكر من فضلك',
        orderItems: {
          create: [
            { productId: products[0].id, quantity: 5, unitPrice: 2.00, total: 10.00 },
            { productId: products[2].id, quantity: 6, unitPrice: 2.50, total: 15.00 },
          ],
        },
      },
    });

    await db.order.create({
      data: {
        orderNumber: 'ORD-00002',
        customerId: customers[1].id,
        driverId: drivers[1].id,
        deliveryLineId: deliveryLines[1].id,
        status: 'confirmed',
        paymentStatus: 'pending',
        totalAmount: 42.20,
        deliveryDate: new Date(),
        deliveryTime: '10:30',
        notes: '',
        orderItems: {
          create: [
            { productId: products[1].id, quantity: 10, unitPrice: 1.00, total: 10.00 },
            { productId: products[3].id, quantity: 8, unitPrice: 2.20, total: 17.60 },
            { productId: products[4].id, quantity: 8, unitPrice: 1.80, total: 14.40 },
          ],
        },
      },
    });

    await db.order.create({
      data: {
        orderNumber: 'ORD-00003',
        customerId: customers[2].id,
        driverId: drivers[0].id,
        deliveryLineId: deliveryLines[0].id,
        status: 'in_delivery',
        paymentStatus: 'pending',
        totalAmount: 31.50,
        deliveryDate: new Date(),
        deliveryTime: '11:00',
        notes: 'عميل مهم - يرجى التواصل قبل الوصول',
        orderItems: {
          create: [
            { productId: products[0].id, quantity: 7, unitPrice: 2.00, total: 14.00 },
            { productId: products[2].id, quantity: 7, unitPrice: 2.50, total: 17.50 },
          ],
        },
      },
    });

    return NextResponse.json({
      message: 'Database seeded successfully - Easy Entry Package',
      data: {
        deliveryLines: deliveryLines.length,
        drivers: drivers.length,
        products: products.length,
        customers: customers.length,
        orders: 3,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
