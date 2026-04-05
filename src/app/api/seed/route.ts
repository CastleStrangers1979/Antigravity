import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - إنشاء بيانات أولية
export async function POST() {
  try {
    // حذف البيانات القديمة
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.customer.deleteMany();
    await db.driver.deleteMany();
    await db.deliveryLine.deleteMany();
    await db.product.deleteMany();

    // إنشاء خطوط التوزيع التسعة
    const deliveryLines = await Promise.all([
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
          nameAr: 'خط دين هاخ',
          nameEn: 'The Hague Line',
          nameNl: 'Den Haag Route',
          region: 'The Hague',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط الكمار',
          nameEn: 'Alkmaar Line',
          nameNl: 'Alkmaar Route',
          region: 'Alkmaar',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط امستردام',
          nameEn: 'Amsterdam Line',
          nameNl: 'Amsterdam Route',
          region: 'Amsterdam',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط اوترخت ايندهوفن',
          nameEn: 'Utrecht-Eindhoven Line',
          nameNl: 'Utrecht-Eindhoven Route',
          region: 'Utrecht-Eindhoven',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط زفولا',
          nameEn: 'Zwolle Line',
          nameNl: 'Zwolle Route',
          region: 'Zwolle',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط انشخيده',
          nameEn: 'Enschede Line',
          nameNl: 'Enschede Route',
          region: 'Enschede',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط ارنهم',
          nameEn: 'Arnhem Line',
          nameNl: 'Arnhem Route',
          region: 'Arnhem',
        },
      }),
      db.deliveryLine.create({
        data: {
          nameAr: 'خط غرب المانيا',
          nameEn: 'West Germany Line',
          nameNl: 'West-Duitsland Route',
          region: 'West Germany',
        },
      }),
    ]);

    // إنشاء السائقين (سائق لكل خط)
    const drivers = await Promise.all([
      db.driver.create({
        data: {
          name: 'أحمد محمد',
          phone: '+31612345678',
          email: 'ahmed@alqueen.nl',
          deliveryLineId: deliveryLines[0].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'محمد علي',
          phone: '+31623456789',
          email: 'mohammed@alqueen.nl',
          deliveryLineId: deliveryLines[1].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'خالد حسن',
          phone: '+31634567890',
          email: 'khalid@alqueen.nl',
          deliveryLineId: deliveryLines[2].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'عمر سعيد',
          phone: '+31645678901',
          email: 'omar@alqueen.nl',
          deliveryLineId: deliveryLines[3].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'يوسف إبراهيم',
          phone: '+31656789012',
          email: 'youssef@alqueen.nl',
          deliveryLineId: deliveryLines[4].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'عبدالله أحمد',
          phone: '+31667890123',
          email: 'abdullah@alqueen.nl',
          deliveryLineId: deliveryLines[5].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'محمود خالد',
          phone: '+31678901234',
          email: 'mahmoud@alqueen.nl',
          deliveryLineId: deliveryLines[6].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'سعيد عبدالرحمن',
          phone: '+31689012345',
          email: 'saeed@alqueen.nl',
          deliveryLineId: deliveryLines[7].id,
        },
      }),
      db.driver.create({
        data: {
          name: 'فهد السعود',
          phone: '+31690123456',
          email: 'fahad@alqueen.nl',
          deliveryLineId: deliveryLines[8].id,
        },
      }),
    ]);

    // إنشاء المنتجات - خبز الملكة والشام والشهباء
    const products = await Promise.all([
      // 1. خبز الملكة ابيض ستاندر
      db.product.create({
        data: {
          nameAr: 'خبز الملكة ابيض ستاندر',
          nameEn: 'Al-Malika White Standard Bread',
          nameNl: 'Al-Malika Wit Standaard Brood',
          description: 'ربطة ٥ أرغفة - وزن ٣٢٠ غرام - الصندوق ١٥ ربطة',
          price: 2.50,
          category: 'bread',
          sku: 'B001',
          weight: 320,
          packSize: 5,
          boxSize: 15,
          stock: 200,
        },
      }),
      // 2. خبز الملكة اسمر ستاندر
      db.product.create({
        data: {
          nameAr: 'خبز الملكة اسمر ستاندر',
          nameEn: 'Al-Malika Brown Standard Bread',
          nameNl: 'Al-Malika Bruin Standaard Brood',
          description: 'ربطة ٥ أرغفة - وزن ٢٦٠ غرام - الصندوق ١٥ ربطة',
          price: 2.50,
          category: 'bread',
          sku: 'B002',
          weight: 260,
          packSize: 5,
          boxSize: 15,
          stock: 180,
        },
      }),
      // 3. خبز الملكة فاميلي ستاندر
      db.product.create({
        data: {
          nameAr: 'خبز الملكة فاميلي ستاندر',
          nameEn: 'Al-Malika Family Standard Bread',
          nameNl: 'Al-Malika Familie Standaard Brood',
          description: 'ربطة ٥ أرغفة - وزن ٤٢٠ غرام - الصندوق ١٠ ربطات',
          price: 3.50,
          category: 'bread',
          sku: 'B003',
          weight: 420,
          packSize: 5,
          boxSize: 10,
          stock: 150,
        },
      }),
      // 4. خبز الشام قياس صغير
      db.product.create({
        data: {
          nameAr: 'خبز الشام قياس صغير',
          nameEn: 'Al-Sham Small Size Bread',
          nameNl: 'Al-Sham Klein Formaat Brood',
          description: 'ربطة ٥ أرغفة - وزن ٢٦٠ غرام - الصندوق ١٥ ربطة',
          price: 2.00,
          category: 'bread',
          sku: 'B004',
          weight: 260,
          packSize: 5,
          boxSize: 15,
          stock: 200,
        },
      }),
      // 5. خبز الشهباء ابيض وسط
      db.product.create({
        data: {
          nameAr: 'خبز الشهباء ابيض وسط',
          nameEn: 'Al-Shahba White Medium Bread',
          nameNl: 'Al-Shahba Wit Medium Brood',
          description: 'ربطة ٥ أرغفة - وزن ٣٢٠ غرام - الصندوق ١٥ ربطة',
          price: 2.50,
          category: 'bread',
          sku: 'B005',
          weight: 320,
          packSize: 5,
          boxSize: 15,
          stock: 180,
        },
      }),
      // 6. خبز الشهباء فاميلي
      db.product.create({
        data: {
          nameAr: 'خبز الشهباء فاميلي',
          nameEn: 'Al-Shahba Family Bread',
          nameNl: 'Al-Shahba Familie Brood',
          description: 'ربطة ٥ أرغفة - وزن ٤٢٠ غرام - الصندوق ١٠ ربطات',
          price: 3.50,
          category: 'bread',
          sku: 'B006',
          weight: 420,
          packSize: 5,
          boxSize: 10,
          stock: 150,
        },
      }),
      // 7. خبز الشهباء اسمر ستاندر
      db.product.create({
        data: {
          nameAr: 'خبز الشهباء اسمر ستاندر',
          nameEn: 'Al-Shahba Brown Standard Bread',
          nameNl: 'Al-Shahba Bruin Standaard Brood',
          description: 'ربطة ٥ أرغفة - وزن ٢٦٠ غرام - الصندوق ١٥ ربطة',
          price: 2.50,
          category: 'bread',
          sku: 'B007',
          weight: 260,
          packSize: 5,
          boxSize: 15,
          stock: 180,
        },
      }),
    ]);

    // إنشاء بعض العملاء والطلبات التجريبية
    const customers = await Promise.all([
      db.customer.create({
        data: {
          name: 'مطعم الشام',
          phone: '+31611111111',
          email: 'sham@restaurant.nl',
          address: 'Damrak 123',
          city: 'Amsterdam',
        },
      }),
      db.customer.create({
        data: {
          name: 'سوبرماركت الحلال',
          phone: '+31622222222',
          email: 'halal@market.nl',
          address: 'Coolsingel 456',
          city: 'Rotterdam',
        },
      }),
      db.customer.create({
        data: {
          name: 'مخبز السعادة',
          phone: '+31633333333',
          email: 'happiness@bakery.nl',
          address: 'Spui 789',
          city: 'The Hague',
        },
      }),
    ]);

    // إنشاء طلبات تجريبية
    await db.order.create({
      data: {
        orderNumber: 'ORD-00001',
        customerId: customers[0].id,
        driverId: drivers[3].id,
        deliveryLineId: deliveryLines[3].id,
        status: 'pending',
        totalAmount: 25.00,
        deliveryDate: new Date(),
        deliveryTime: '09:00',
        notes: 'توصيل مبكر',
        orderItems: {
          create: [
            { productId: products[0].id, quantity: 5, unitPrice: 2.50, total: 12.50 },
            { productId: products[2].id, quantity: 3, unitPrice: 3.50, total: 10.50 },
          ],
        },
      },
    });

    await db.order.create({
      data: {
        orderNumber: 'ORD-00002',
        customerId: customers[1].id,
        driverId: drivers[0].id,
        deliveryLineId: deliveryLines[0].id,
        status: 'confirmed',
        totalAmount: 35.00,
        deliveryDate: new Date(),
        deliveryTime: '10:00',
        notes: '',
        orderItems: {
          create: [
            { productId: products[1].id, quantity: 10, unitPrice: 2.50, total: 25.00 },
            { productId: products[4].id, quantity: 4, unitPrice: 2.50, total: 10.00 },
          ],
        },
      },
    });

    await db.order.create({
      data: {
        orderNumber: 'ORD-00003',
        customerId: customers[2].id,
        driverId: drivers[1].id,
        deliveryLineId: deliveryLines[1].id,
        status: 'in_delivery',
        totalAmount: 50.00,
        deliveryDate: new Date(),
        deliveryTime: '11:00',
        notes: 'عميل مهم',
        orderItems: {
          create: [
            { productId: products[5].id, quantity: 5, unitPrice: 3.50, total: 17.50 },
            { productId: products[3].id, quantity: 8, unitPrice: 2.00, total: 16.00 },
            { productId: products[6].id, quantity: 6, unitPrice: 2.50, total: 15.00 },
          ],
        },
      },
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
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
