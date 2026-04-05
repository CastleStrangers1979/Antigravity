import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // حذف البيانات القديمة
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.deliveryLine.deleteMany();
  await prisma.product.deleteMany();
  console.log('✅ Cleared old data');

  // إنشاء خطوط التوزيع التسعة
  const deliveryLines = await Promise.all([
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط روتردام',
        nameEn: 'Rotterdam Line',
        nameNl: 'Rotterdam Route',
        region: 'Rotterdam',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط دين هاخ',
        nameEn: 'The Hague Line',
        nameNl: 'Den Haag Route',
        region: 'The Hague',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط الكمار',
        nameEn: 'Alkmaar Line',
        nameNl: 'Alkmaar Route',
        region: 'Alkmaar',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط امستردام',
        nameEn: 'Amsterdam Line',
        nameNl: 'Amsterdam Route',
        region: 'Amsterdam',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط اوترخت ايندهوفن',
        nameEn: 'Utrecht-Eindhoven Line',
        nameNl: 'Utrecht-Eindhoven Route',
        region: 'Utrecht-Eindhoven',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط زفولا',
        nameEn: 'Zwolle Line',
        nameNl: 'Zwolle Route',
        region: 'Zwolle',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط انشخيده',
        nameEn: 'Enschede Line',
        nameNl: 'Enschede Route',
        region: 'Enschede',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط ارنهم',
        nameEn: 'Arnhem Line',
        nameNl: 'Arnhem Route',
        region: 'Arnhem',
      },
    }),
    prisma.deliveryLine.create({
      data: {
        nameAr: 'خط غرب المانيا',
        nameEn: 'West Germany Line',
        nameNl: 'West-Duitsland Route',
        region: 'West Germany',
      },
    }),
  ]);
  console.log('✅ Created 9 delivery lines');

  // إنشاء السائقين
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'أحمد محمد',
        phone: '+31612345678',
        email: 'ahmed@alqueen.nl',
        deliveryLineId: deliveryLines[0].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'محمد علي',
        phone: '+31623456789',
        email: 'mohammed@alqueen.nl',
        deliveryLineId: deliveryLines[1].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'خالد حسن',
        phone: '+31634567890',
        email: 'khalid@alqueen.nl',
        deliveryLineId: deliveryLines[2].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'عمر سعيد',
        phone: '+31645678901',
        email: 'omar@alqueen.nl',
        deliveryLineId: deliveryLines[3].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'يوسف إبراهيم',
        phone: '+31656789012',
        email: 'youssef@alqueen.nl',
        deliveryLineId: deliveryLines[4].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'عبدالله أحمد',
        phone: '+31667890123',
        email: 'abdullah@alqueen.nl',
        deliveryLineId: deliveryLines[5].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'محمود خالد',
        phone: '+31678901234',
        email: 'mahmoud@alqueen.nl',
        deliveryLineId: deliveryLines[6].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'سعيد عبدالرحمن',
        phone: '+31689012345',
        email: 'saeed@alqueen.nl',
        deliveryLineId: deliveryLines[7].id,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'فهد السعود',
        phone: '+31690123456',
        email: 'fahad@alqueen.nl',
        deliveryLineId: deliveryLines[8].id,
      },
    }),
  ]);
  console.log('✅ Created 9 drivers');

  // إنشاء المنتجات - خبز الملكة والشام والشهباء
  const products = await Promise.all([
    // 1. خبز الملكة ابيض ستاندر
    prisma.product.create({
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
    prisma.product.create({
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
    prisma.product.create({
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
    prisma.product.create({
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
    prisma.product.create({
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
    prisma.product.create({
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
    prisma.product.create({
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
  console.log('✅ Created 7 products');

  // إنشاء بعض العملاء
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'مطعم الشام',
        phone: '+31611111111',
        email: 'sham@restaurant.nl',
        address: 'Damrak 123',
        city: 'Amsterdam',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'سوبرماركت الحلال',
        phone: '+31622222222',
        email: 'halal@market.nl',
        address: 'Coolsingel 456',
        city: 'Rotterdam',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'مخبز السعادة',
        phone: '+31633333333',
        email: 'happiness@bakery.nl',
        address: 'Spui 789',
        city: 'The Hague',
      },
    }),
  ]);
  console.log('✅ Created 3 customers');

  // إنشاء طلبات تجريبية
  await prisma.order.create({
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

  await prisma.order.create({
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

  await prisma.order.create({
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
  console.log('✅ Created 3 sample orders');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
