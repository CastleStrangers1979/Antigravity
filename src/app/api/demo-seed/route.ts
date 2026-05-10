import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo data seeding API
export async function POST() {
  try {
    // Clear existing data first (in reverse dependency order)
    await db.$executeRaw`DELETE FROM Invoice`;
    await db.$executeRaw`DELETE FROM Payment`;
    await db.$executeRaw`DELETE FROM OrderItem`;
    await db.$executeRaw`DELETE FROM DeliveryTrack`;
    await db.$executeRaw`DELETE FROM Notification`;
    await db.$executeRaw`DELETE FROM "Order"`;
    await db.$executeRaw`DELETE FROM DriverLocation`;
    await db.$executeRaw`DELETE FROM Driver`;
    await db.$executeRaw`DELETE FROM DeliveryLine`;
    await db.$executeRaw`DELETE FROM CustomerAddress`;
    await db.$executeRaw`DELETE FROM Customer`;
    await db.$executeRaw`DELETE FROM Product`;
    await db.$executeRaw`DELETE FROM CostEntry`;
    await db.$executeRaw`DELETE FROM CostCenter`;
    await db.$executeRaw`DELETE FROM Vehicle`;

    // Create Products (Bread types)
    const products = await Promise.all([
      db.product.create({
        data: {
          id: 'prod_white',
          nameAr: 'خبز أبيض',
          nameEn: 'White Bread',
          nameNl: 'Wit Brood',
          category: 'bread',
          price: 2.00,
          wholesalePrice: 1.60,
          costPrice: 0.85,
          stock: 200,
          weight: 320,
          packSize: 5,
          boxSize: 15,
          sku: 'B001',
          isActive: true,
        }
      }),
      db.product.create({
        data: {
          id: 'prod_brown',
          nameAr: 'خبز أسمر',
          nameEn: 'Brown Bread',
          nameNl: 'Bruin Brood',
          category: 'bread',
          price: 2.50,
          wholesalePrice: 2.00,
          costPrice: 1.10,
          stock: 150,
          weight: 320,
          packSize: 5,
          boxSize: 15,
          sku: 'B002',
          isActive: true,
        }
      }),
      db.product.create({
        data: {
          id: 'prod_family',
          nameAr: 'خبز فاميلي',
          nameEn: 'Family Bread',
          nameNl: 'Familie Brood',
          category: 'bread',
          price: 3.00,
          wholesalePrice: 2.40,
          costPrice: 1.30,
          stock: 100,
          weight: 500,
          packSize: 3,
          boxSize: 12,
          sku: 'B003',
          isActive: true,
        }
      }),
      db.product.create({
        data: {
          id: 'prod_small',
          nameAr: 'خبز سمول',
          nameEn: 'Small Bread',
          nameNl: 'Klein Brood',
          category: 'bread',
          price: 1.50,
          wholesalePrice: 1.20,
          costPrice: 0.65,
          stock: 250,
          weight: 200,
          packSize: 8,
          boxSize: 20,
          sku: 'B004',
          isActive: true,
        }
      }),
    ]);

    // Create Delivery Lines
    const deliveryLines = await Promise.all([
      db.deliveryLine.create({
        data: {
          id: 'line_amsterdam',
          nameAr: 'خط أمستردام',
          nameEn: 'Amsterdam Line',
          nameNl: 'Amsterdam Route',
          region: 'Amsterdam',
          color: '#2D5A3D',
          isActive: true,
        }
      }),
      db.deliveryLine.create({
        data: {
          id: 'line_haarlem',
          nameAr: 'خط هارلم',
          nameEn: 'Haarlem Line',
          nameNl: 'Haarlem Route',
          region: 'Haarlem',
          color: '#D4A853',
          isActive: true,
        }
      }),
    ]);

    // Create Customers
    const customers = await Promise.all([
      db.customer.create({
        data: {
          id: 'cust_1',
          name: 'محمد علي',
          phone: '+31612345678',
          email: 'mohamed@email.com',
          address: 'Damrak 123',
          city: 'Amsterdam',
          postalCode: '1012 LG',
          customerType: 'wholesale',
          segment: 'vip',
          loyaltyPoints: 500,
          loyaltyTier: 'gold',
          totalOrders: 45,
          totalSpent: 1250.00,
          preferredLanguage: 'ar',
        }
      }),
      db.customer.create({
        data: {
          id: 'cust_2',
          name: 'Ahmed Hassan',
          phone: '+31623456789',
          email: 'ahmed@email.com',
          address: 'Leidsestraat 45',
          city: 'Amsterdam',
          postalCode: '1017 PN',
          customerType: 'retail',
          segment: 'regular',
          loyaltyPoints: 150,
          loyaltyTier: 'silver',
          totalOrders: 12,
          totalSpent: 280.00,
          preferredLanguage: 'en',
        }
      }),
      db.customer.create({
        data: {
          id: 'cust_3',
          name: 'Fatima Khalil',
          phone: '+31634567890',
          email: 'fatima@email.com',
          address: 'Albert Heijnweg 78',
          city: 'Haarlem',
          postalCode: '2031 ZA',
          customerType: 'wholesale',
          segment: 'vip',
          loyaltyPoints: 800,
          loyaltyTier: 'gold',
          totalOrders: 68,
          totalSpent: 2100.00,
          preferredLanguage: 'ar',
        }
      }),
    ]);

    // Create Drivers
    const drivers = await Promise.all([
      db.driver.create({
        data: {
          id: 'driver_1',
          name: 'أبو خالد',
          phone: '+31611111111',
          email: 'khaled@almalika.nl',
          deliveryLineId: 'line_amsterdam',
          isActive: true,
          isOnline: true,
          currentLocation: 'Amsterdam Centraal',
          latitude: 52.3676,
          longitude: 4.9041,
          totalDeliveries: 320,
          completedToday: 8,
          rating: 4.8,
        }
      }),
      db.driver.create({
        data: {
          id: 'driver_2',
          name: 'أبو يوسف',
          phone: '+31622222222',
          email: 'yousef@almalika.nl',
          deliveryLineId: 'line_haarlem',
          isActive: true,
          isOnline: true,
          currentLocation: 'Haarlem Station',
          latitude: 52.3874,
          longitude: 4.6462,
          totalDeliveries: 245,
          completedToday: 6,
          rating: 4.6,
        }
      }),
    ]);

    // Create Orders with different statuses
    const orders = [];
    const orderData = [
      { customerId: 'cust_1', status: 'pending', amount: 45.00, driverId: null },
      { customerId: 'cust_2', status: 'pending', amount: 18.50, driverId: null },
      { customerId: 'cust_3', status: 'confirmed', amount: 72.00, driverId: 'driver_1' },
      { customerId: 'cust_1', status: 'in_delivery', amount: 35.00, driverId: 'driver_1' },
      { customerId: 'cust_2', status: 'in_delivery', amount: 22.00, driverId: 'driver_2' },
      { customerId: 'cust_3', status: 'delivered', amount: 58.00, driverId: 'driver_1', deliveredAt: new Date() },
      { customerId: 'cust_1', status: 'delivered', amount: 41.50, driverId: 'driver_2', deliveredAt: new Date() },
    ];

    for (let i = 0; i < orderData.length; i++) {
      const order = await db.order.create({
        data: {
          id: `order_${i + 1}`,
          orderNumber: `ALM-${String(1000 + i).padStart(5, '0')}`,
          customerId: orderData[i].customerId,
          driverId: orderData[i].driverId,
          deliveryLineId: orderData[i].customerId === 'cust_3' ? 'line_haarlem' : 'line_amsterdam',
          status: orderData[i].status,
          paymentStatus: orderData[i].status === 'delivered' ? 'paid' : 'pending',
          paymentMethod: 'cash',
          totalAmount: orderData[i].amount,
          subtotal: orderData[i].amount,
          deliveryDate: new Date(),
          deliveryTime: '09:00-12:00',
          deliveredAt: orderData[i].deliveredAt,
        }
      });

      // Add order items
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: products[i % 4].id,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: products[i % 4].price,
          total: products[i % 4].price * (Math.floor(Math.random() * 5) + 1),
        }
      });

      orders.push(order);
    }

    // Create Cost Centers (مراكز التكلفة)
    const costCenters = await Promise.all([
      db.costCenter.create({
        data: {
          id: 'cc_white',
          name: 'خبز أبيض',
          type: 'production',
          budget: 5000.00,
          actual: 4750.00,
          variance: -250.00,
          periodStart: new Date(new Date().setDate(1)),
          periodEnd: new Date(new Date().setDate(30)),
        }
      }),
      db.costCenter.create({
        data: {
          id: 'cc_brown',
          name: 'خبز أسمر',
          type: 'production',
          budget: 3500.00,
          actual: 3800.00,
          variance: 300.00,
          periodStart: new Date(new Date().setDate(1)),
          periodEnd: new Date(new Date().setDate(30)),
        }
      }),
      db.costCenter.create({
        data: {
          id: 'cc_family',
          name: 'خبز فاميلي',
          type: 'production',
          budget: 2500.00,
          actual: 2400.00,
          variance: -100.00,
          periodStart: new Date(new Date().setDate(1)),
          periodEnd: new Date(new Date().setDate(30)),
        }
      }),
      db.costCenter.create({
        data: {
          id: 'cc_small',
          name: 'خبز سمول',
          type: 'production',
          budget: 2000.00,
          actual: 1900.00,
          variance: -100.00,
          periodStart: new Date(new Date().setDate(1)),
          periodEnd: new Date(new Date().setDate(30)),
        }
      }),
    ]);

    // Create Cost Entries for each center
    const costCategories = [
      { category: 'flour', description: 'استهلاك الطحين', amountRatio: 0.45 },
      { category: 'yeast', description: 'الخميرة', amountRatio: 0.08 },
      { category: 'improvers', description: 'المحسنات', amountRatio: 0.12 },
      { category: 'water', description: 'الماء', amountRatio: 0.05 },
      { category: 'electricity', description: 'الكهرباء', amountRatio: 0.15 },
      { category: 'labor', description: 'أجور العمال', amountRatio: 0.15 },
    ];

    for (const center of costCenters) {
      for (const cat of costCategories) {
        await db.costEntry.create({
          data: {
            costCenterId: center.id,
            category: cat.category,
            description: cat.description,
            amount: (center.actual || 0) * cat.amountRatio,
            date: new Date(),
          }
        });
      }
    }

    // Create Invoices
    const invoices = await Promise.all([
      db.invoice.create({
        data: {
          id: 'inv_1',
          orderId: 'order_1',
          invoiceNumber: 'INV-2025-001',
          customerId: 'cust_1',
          totalAmount: 45.00,
          taxAmount: 9.45,
          subtotal: 35.55,
          status: 'sent',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          sentAt: new Date(),
        }
      }),
      db.invoice.create({
        data: {
          id: 'inv_2',
          orderId: 'order_2',
          invoiceNumber: 'INV-2025-002',
          customerId: 'cust_2',
          totalAmount: 18.50,
          taxAmount: 3.89,
          subtotal: 14.61,
          status: 'paid',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          paidAt: new Date(),
          sentAt: new Date(),
        }
      }),
      db.invoice.create({
        data: {
          id: 'inv_3',
          orderId: 'order_3',
          invoiceNumber: 'INV-2025-003',
          customerId: 'cust_3',
          totalAmount: 72.00,
          taxAmount: 15.12,
          subtotal: 56.88,
          status: 'overdue',
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        }
      }),
    ]);

    // Create Vehicle
    await db.vehicle.create({
      data: {
        id: 'vehicle_1',
        plateNumber: 'AB-123-CD',
        type: 'van',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2021,
        fuelType: 'diesel',
        mileage: 45000,
        capacity: 500,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء البيانات التجريبية بنجاح!',
      data: {
        products: products.length,
        customers: customers.length,
        drivers: drivers.length,
        orders: orders.length,
        costCenters: costCenters.length,
        invoices: invoices.length,
      }
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء البيانات التجريبية',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'استخدم POST لإنشاء البيانات التجريبية'
  });
}
