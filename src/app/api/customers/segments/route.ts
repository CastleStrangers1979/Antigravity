import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get customer segments with counts and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCustomers = searchParams.get('includeCustomers') === 'true';

    // Get all customers with their order data
    const customers = await db.customer.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Classify customers into segments
    const segments = {
      vip: [] as typeof customers,
      active: [] as typeof customers,
      inactive: [] as typeof customers,
      new: [] as typeof customers,
      regular: [] as typeof customers,
    };

    // Customer segment classification logic
    for (const customer of customers) {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrderDate = customer.orders[0]?.createdAt;
      const daysSinceLastOrder = lastOrderDate
        ? Math.floor((now.getTime() - new Date(lastOrderDate).getTime()) / (24 * 60 * 60 * 1000))
        : 999;

      // VIP: High value customers (spent > 1000 EUR and ordered > 10 times)
      if (totalSpent > 1000 && totalOrders > 10) {
        segments.vip.push(customer);
      }
      // New: Created within last 30 days and less than 3 orders
      else if (new Date(customer.createdAt) > thirtyDaysAgo && totalOrders < 3) {
        segments.new.push(customer);
      }
      // Inactive: No orders in last 90 days
      else if (daysSinceLastOrder > 90 || (totalOrders === 0 && new Date(customer.createdAt) < thirtyDaysAgo)) {
        segments.inactive.push(customer);
      }
      // Active: Ordered within last 30 days
      else if (daysSinceLastOrder <= 30 && totalOrders >= 3) {
        segments.active.push(customer);
      }
      // Regular: All others
      else {
        segments.regular.push(customer);
      }
    }

    // Calculate segment statistics
    const segmentStats = {
      vip: {
        count: segments.vip.length,
        totalSpent: segments.vip.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrders: segments.vip.length > 0 
          ? segments.vip.reduce((sum, c) => sum + c.totalOrders, 0) / segments.vip.length 
          : 0,
      },
      active: {
        count: segments.active.length,
        totalSpent: segments.active.reduce((sum, c) => sum + c.totalSpent, 0),
        avgOrders: segments.active.length > 0 
          ? segments.active.reduce((sum, c) => sum + c.totalOrders, 0) / segments.active.length 
          : 0,
      },
      inactive: {
        count: segments.inactive.length,
        totalSpent: segments.inactive.reduce((sum, c) => sum + c.totalSpent, 0),
        potentialRevenue: segments.inactive.length * 50, // Estimated potential
      },
      new: {
        count: segments.new.length,
        potentialLTV: segments.new.length * 200, // Estimated lifetime value
        conversionRate: 65, // Target conversion rate
      },
      regular: {
        count: segments.regular.length,
        totalSpent: segments.regular.reduce((sum, c) => sum + c.totalSpent, 0),
      },
    };

    // Overall statistics
    const overallStats = {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgCustomerValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length 
        : 0,
      avgOrdersPerCustomer: customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length
        : 0,
      retentionRate: customers.length > 0
        ? ((segments.active.length + segments.vip.length) / customers.length) * 100
        : 0,
    };

    // Prepare response
    const response: any = {
      segments: segmentStats,
      overall: overallStats,
    };

    // Include customers if requested
    if (includeCustomers) {
      response.customers = {
        vip: segments.vip.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalSpent: c.totalSpent,
          totalOrders: c.totalOrders,
          lastOrderDate: c.lastOrderDate,
          loyaltyPoints: c.loyaltyPoints,
          loyaltyTier: c.loyaltyTier,
        })),
        active: segments.active.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalSpent: c.totalSpent,
          totalOrders: c.totalOrders,
          lastOrderDate: c.lastOrderDate,
          loyaltyPoints: c.loyaltyPoints,
        })),
        inactive: segments.inactive.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalSpent: c.totalSpent,
          totalOrders: c.totalOrders,
          lastOrderDate: c.lastOrderDate,
          daysSinceLastOrder: c.orders[0] 
            ? Math.floor((now.getTime() - new Date(c.orders[0].createdAt).getTime()) / (24 * 60 * 60 * 1000))
            : null,
        })),
        new: segments.new.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          createdAt: c.createdAt,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer segments' },
      { status: 500 }
    );
  }
}

// POST - Update customer segment manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, segment } = body;

    if (!customerId || !segment) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, segment' },
        { status: 400 }
      );
    }

    const validSegments = ['vip', 'active', 'inactive', 'new', 'regular'];
    if (!validSegments.includes(segment)) {
      return NextResponse.json(
        { error: `Invalid segment. Must be one of: ${validSegments.join(', ')}` },
        { status: 400 }
      );
    }

    // Update customer segment
    const updatedCustomer = await db.customer.update({
      where: { id: customerId },
      data: { segment },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer segment:', error);
    return NextResponse.json(
      { error: 'Failed to update customer segment' },
      { status: 500 }
    );
  }
}
