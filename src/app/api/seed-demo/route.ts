import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Create products (Arabic bread only)
    const products = await Promise.all([
      db.product.upsert({
        where: { id: "prod_large_arabic" },
        update: {},
        create: {
          id: "prod_large_arabic",
          nameAr: "خبز عربي كبير",
          nameEn: "Large Arabic Bread",
          nameNl: "Groot Arabisch Brood",
          price: 2.00,
          wholesalePrice: 1.60,
          category: "bread",
          sku: "B001",
          stock: 100,
          isActive: true,
        },
      }),
      db.product.upsert({
        where: { id: "prod_small_arabic" },
        update: {},
        create: {
          id: "prod_small_arabic",
          nameAr: "خبز عربي صغير",
          nameEn: "Small Arabic Bread",
          nameNl: "Klein Arabisch Brood",
          price: 1.00,
          wholesalePrice: 0.80,
          category: "bread",
          sku: "B002",
          stock: 150,
          isActive: true,
        },
      }),
      db.product.upsert({
        where: { id: "prod_bar" },
        update: {},
        create: {
          id: "prod_bar",
          nameAr: "خبز بر",
          nameEn: "Barley Bread",
          nameNl: "Gerstebrood",
          price: 2.50,
          wholesalePrice: 2.00,
          category: "bread",
          sku: "B003",
          stock: 80,
          isActive: true,
        },
      }),
      db.product.upsert({
        where: { id: "prod_sesame" },
        update: {},
        create: {
          id: "prod_sesame",
          nameAr: "خبز سمسم",
          nameEn: "Sesame Bread",
          nameNl: "Sesambrood",
          price: 2.20,
          wholesalePrice: 1.80,
          category: "bread",
          sku: "B004",
          stock: 60,
          isActive: true,
        },
      }),
      db.product.upsert({
        where: { id: "prod_tortilla" },
        update: {},
        create: {
          id: "prod_tortilla",
          nameAr: "خبز تورتيلا",
          nameEn: "Tortilla Bread",
          nameNl: "Tortilla",
          price: 1.80,
          wholesalePrice: 1.40,
          category: "bread",
          sku: "B005",
          stock: 90,
          isActive: true,
        },
      }),
    ]);

    // Create delivery lines (9 lines)
    const deliveryLines = await Promise.all([
      db.deliveryLine.upsert({
        where: { id: "line_1" },
        update: {},
        create: { id: "line_1", nameAr: "خط أمستردام", nameEn: "Amsterdam Line", nameNl: "Amsterdam Lijn", region: "Amsterdam", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_2" },
        update: {},
        create: { id: "line_2", nameAr: "خط روتردام", nameEn: "Rotterdam Line", nameNl: "Rotterdam Lijn", region: "Rotterdam", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_3" },
        update: {},
        create: { id: "line_3", nameAr: "خط لاهاي", nameEn: "The Hague Line", nameNl: "Den Haag Lijn", region: "Den Haag", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_4" },
        update: {},
        create: { id: "line_4", nameAr: "خط أوترخت", nameEn: "Utrecht Line", nameNl: "Utrecht Lijn", region: "Utrecht", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_5" },
        update: {},
        create: { id: "line_5", nameAr: "خط آيندهوفن", nameEn: "Eindhoven Line", nameNl: "Eindhoven Lijn", region: "Eindhoven", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_6" },
        update: {},
        create: { id: "line_6", nameAr: "خط خرونينغن", nameEn: "Groningen Line", nameNl: "Groningen Lijn", region: "Groningen", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_7" },
        update: {},
        create: { id: "line_7", nameAr: "خط ماستريخت", nameEn: "Maastricht Line", nameNl: "Maastricht Lijn", region: "Maastricht", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_8" },
        update: {},
        create: { id: "line_8", nameAr: "خط أرنهيم", nameEn: "Arnhem Line", nameNl: "Arnhem Lijn", region: "Arnhem", isActive: true },
      }),
      db.deliveryLine.upsert({
        where: { id: "line_9" },
        update: {},
        create: { id: "line_9", nameAr: "خط هارلم", nameEn: "Haarlem Line", nameNl: "Haarlem Lijn", region: "Haarlem", isActive: true },
      }),
    ]);

    // Create drivers
    const drivers = await Promise.all([
      db.driver.upsert({
        where: { id: "driver_demo_1" },
        update: {},
        create: {
          id: "driver_demo_1",
          name: "أحمد محمد",
          phone: "+31612345678",
          deliveryLineId: "line_1",
          isActive: true,
          isOnline: true,
        },
      }),
      db.driver.upsert({
        where: { id: "driver_demo_2" },
        update: {},
        create: {
          id: "driver_demo_2",
          name: "خالد علي",
          phone: "+31698765432",
          deliveryLineId: "line_2",
          isActive: true,
          isOnline: true,
        },
      }),
    ]);

    // Create customers
    const customers = await Promise.all([
      db.customer.upsert({
        where: { id: "cust_demo_1" },
        update: {},
        create: {
          id: "cust_demo_1",
          name: "مطعم الشام",
          phone: "+31611111111",
          address: "Damrak 123",
          city: "Amsterdam",
          customerType: "wholesale",
        },
      }),
      db.customer.upsert({
        where: { id: "cust_demo_2" },
        update: {},
        create: {
          id: "cust_demo_2",
          name: "سوبرماركت الحلو",
          phone: "+31622222222",
          address: "Coolsingel 456",
          city: "Rotterdam",
          customerType: "wholesale",
        },
      }),
      db.customer.upsert({
        where: { id: "cust_demo_3" },
        update: {},
        create: {
          id: "cust_demo_3",
          name: "مخبز السعادة",
          phone: "+31633333333",
          address: "Stationsstraat 789",
          city: "Utrecht",
          customerType: "wholesale",
        },
      }),
    ]);

    // Create orders
    const orderNumber = `ALM-${Date.now().toString().slice(-5)}`;
    const orders = await Promise.all([
      db.order.create({
        data: {
          orderNumber: `${orderNumber}1`,
          customerId: "cust_demo_1",
          driverId: "driver_demo_1",
          deliveryLineId: "line_1",
          status: "pending",
          paymentStatus: "unpaid",
          totalAmount: 45.50,
          subtotal: 45.50,
          orderItems: {
            create: [
              { productId: "prod_large_arabic", quantity: 10, unitPrice: 2.00, total: 20.00 },
              { productId: "prod_small_arabic", quantity: 15, unitPrice: 1.00, total: 15.00 },
              { productId: "prod_sesame", quantity: 5, unitPrice: 2.20, total: 10.50 },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          orderNumber: `${orderNumber}2`,
          customerId: "cust_demo_2",
          driverId: "driver_demo_2",
          deliveryLineId: "line_2",
          status: "in_delivery",
          paymentStatus: "unpaid",
          totalAmount: 78.00,
          subtotal: 78.00,
          orderItems: {
            create: [
              { productId: "prod_bar", quantity: 20, unitPrice: 2.50, total: 50.00 },
              { productId: "prod_tortilla", quantity: 10, unitPrice: 1.80, total: 18.00 },
              { productId: "prod_large_arabic", quantity: 5, unitPrice: 2.00, total: 10.00 },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          orderNumber: `${orderNumber}3`,
          customerId: "cust_demo_3",
          driverId: "driver_demo_1",
          deliveryLineId: "line_4",
          status: "completed",
          paymentStatus: "paid",
          totalAmount: 32.00,
          subtotal: 32.00,
          orderItems: {
            create: [
              { productId: "prod_sesame", quantity: 10, unitPrice: 2.20, total: 22.00 },
              { productId: "prod_small_arabic", quantity: 10, unitPrice: 1.00, total: 10.00 },
            ],
          },
        },
      }),
    ]);

    // Create invoices
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoices = await Promise.all([
      db.invoice.create({
        data: {
          invoiceNumber: `${invoiceNumber}1`,
          orderId: orders[0].id,
          customerId: "cust_demo_1",
          totalAmount: 45.50,
          subtotal: 45.50,
          status: "unpaid",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
      }),
      db.invoice.create({
        data: {
          invoiceNumber: `${invoiceNumber}2`,
          orderId: orders[1].id,
          customerId: "cust_demo_2",
          totalAmount: 78.00,
          subtotal: 78.00,
          status: "unpaid",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      }),
      db.invoice.create({
        data: {
          invoiceNumber: `${invoiceNumber}3`,
          orderId: orders[2].id,
          customerId: "cust_demo_3",
          totalAmount: 32.00,
          subtotal: 32.00,
          status: "paid",
          paidAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Demo data created successfully",
      data: {
        products: products.length,
        deliveryLines: deliveryLines.length,
        drivers: drivers.length,
        customers: customers.length,
        orders: orders.length,
        invoices: invoices.length,
      },
    });
  } catch (error) {
    console.error("Error creating demo data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create demo data" },
      { status: 500 }
    );
  }
}
