import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all salary payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');

    const where: Record<string, unknown> = {};
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;
    if (periodStart && periodEnd) {
      where.periodStart = { gte: new Date(periodStart) };
      where.periodEnd = { lte: new Date(periodEnd) };
    }

    const salaries = await db.salaryPayment.findMany({
      where,
      include: {
        driver: {
          include: {
            deliveryLine: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary stats
    const totalPaid = salaries
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const totalPending = salaries
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    // Get driver salary calculations
    const drivers = await db.driver.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: {
            status: 'delivered',
            createdAt: {
              gte: new Date(new Date().setDate(1)), // First day of current month
            },
          },
        },
        salaryPayments: {
          where: {
            periodStart: {
              gte: new Date(new Date().setDate(1)),
            },
          },
        },
      },
    });

    const driverCalculations = drivers.map(driver => {
      const baseSalary = driver.salaryBase || 2000;
      const perDelivery = driver.salaryPerDelivery || 2;
      const deliveriesThisMonth = driver.orders.length;
      const deliveryBonus = deliveriesThisMonth * perDelivery;

      return {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        deliveryLine: driver.deliveryLine,
        baseSalary,
        perDeliveryRate: perDelivery,
        deliveriesThisMonth,
        deliveryBonus,
        estimatedTotal: baseSalary + deliveryBonus,
        totalDeliveries: driver.totalDeliveries,
        rating: driver.rating,
      };
    });

    return NextResponse.json({
      salaries,
      driverCalculations,
      summary: {
        totalPaid,
        totalPending,
        count: salaries.length,
        paidCount: salaries.filter(s => s.status === 'paid').length,
        pendingCount: salaries.filter(s => s.status === 'pending').length,
      },
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 });
  }
}

// POST - Create a new salary payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      driverId,
      employeeName,
      periodStart,
      periodEnd,
      baseSalary,
      deliveryBonus,
      overtime,
      deductions,
      totalAmount,
      paymentMethod,
      notes,
    } = body;

    // Generate reference number
    const count = await db.salaryPayment.count();
    const reference = `SAL-${String(count + 1).padStart(6, '0')}`;

    const salary = await db.salaryPayment.create({
      data: {
        driverId,
        employeeName,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        baseSalary: baseSalary || 0,
        deliveryBonus: deliveryBonus || 0,
        overtime: overtime || 0,
        deductions: deductions || 0,
        totalAmount: totalAmount || 0,
        paymentMethod,
        reference,
        notes,
      },
      include: {
        driver: true,
      },
    });

    return NextResponse.json(salary, { status: 201 });
  } catch (error) {
    console.error('Error creating salary payment:', error);
    return NextResponse.json({ error: 'Failed to create salary payment' }, { status: 500 });
  }
}

// PUT - Update salary payment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidAt } = body;

    const salary = await db.salaryPayment.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : paidAt ? new Date(paidAt) : null,
      },
      include: {
        driver: true,
      },
    });

    return NextResponse.json(salary);
  } catch (error) {
    console.error('Error updating salary payment:', error);
    return NextResponse.json({ error: 'Failed to update salary payment' }, { status: 500 });
  }
}
