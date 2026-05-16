import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch financial statistics for the dashboard
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get orders for revenue calculation
    const orders = await db.order.findMany({
      where: {
        status: 'delivered',
        createdAt: { gte: startOfYear },
      },
    });

    // Calculate revenues
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    const quarterlyRevenue = orders
      .filter(o => new Date(o.createdAt) >= startOfQuarter)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Get expenses
    const expenses = await db.expense.findMany({
      where: {
        date: { gte: startOfYear },
        status: { in: ['approved', 'paid'] },
      },
    });

    // Calculate expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const monthlyExpenses = expenses
      .filter(e => new Date(e.date) >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const quarterlyExpenses = expenses
      .filter(e => new Date(e.date) >= startOfQuarter)
      .reduce((sum, e) => sum + e.amount, 0);

    // Get pending salary payments
    const pendingSalaries = await db.salaryPayment.findMany({
      where: { status: 'pending' },
    });

    const pendingPayments = pendingSalaries.reduce((sum, s) => sum + s.totalAmount, 0);

    // Calculate net profit
    const netProfit = totalRevenue - totalExpenses;

    // Get additional stats
    const totalOrders = await db.order.count({
      where: { status: 'delivered' },
    });

    const totalCustomers = await db.customer.count();
    const activeDrivers = await db.driver.count({ where: { isActive: true } });

    // Category breakdown for expenses
    const expensesByCategory = expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Top expense categories
    const topCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, total]) => ({ category, total }));

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; year: number; revenue: number; expenses: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      
      const monthExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date >= monthStart && date <= monthEnd;
      });

      const revenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      monthlyTrend.push({
        month: monthStart.toLocaleString('nl-NL', { month: 'short' }),
        year: monthStart.getFullYear(),
        revenue,
        expenses: expense,
        profit: revenue - expense,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      pendingPayments,
      monthlyRevenue,
      monthlyExpenses,
      quarterlyRevenue,
      quarterlyExpenses,
      stats: {
        totalOrders,
        totalCustomers,
        activeDrivers,
      },
      expensesByCategory,
      topCategories,
      monthlyTrend,
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json({ error: 'Failed to fetch financial stats' }, { status: 500 });
  }
}
