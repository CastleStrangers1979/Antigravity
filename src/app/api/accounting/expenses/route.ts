import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isRecurring = searchParams.get('isRecurring');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (isRecurring !== null) where.isRecurring = isRecurring === 'true';
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Calculate summary stats
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = expenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);
    const approvedAmount = expenses
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory = expenses.reduce((acc, e) => {
      if (!acc[e.category]) {
        acc[e.category] = { total: 0, count: 0 };
      }
      acc[e.category].total += e.amount;
      acc[e.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Get recurring expenses
    const recurringExpenses = expenses.filter(e => e.isRecurring);

    // Category breakdown for charts
    const categoryBreakdown = Object.entries(byCategory).map(([cat, data]) => ({
      category: cat,
      total: data.total,
      count: data.count,
      percentage: totalAmount > 0 ? ((data.total / totalAmount) * 100).toFixed(1) : 0,
    }));

    return NextResponse.json({
      expenses,
      summary: {
        total: totalAmount,
        pending: pendingAmount,
        approved: approvedAmount,
        count: expenses.length,
        pendingCount: expenses.filter(e => e.status === 'pending').length,
        approvedCount: expenses.filter(e => e.status === 'approved').length,
        paidCount: expenses.filter(e => e.status === 'paid').length,
      },
      byCategory,
      categoryBreakdown,
      recurringExpenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      subcategory,
      description,
      amount,
      date,
      vendor,
      invoiceNumber,
      invoiceUrl,
      isRecurring,
      recurrencePeriod,
      notes,
    } = body;

    const expense = await db.expense.create({
      data: {
        category,
        subcategory,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        vendor,
        invoiceNumber,
        invoiceUrl,
        isRecurring: isRecurring || false,
        recurrencePeriod,
        notes,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

// PUT - Update expense (for approval workflow)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, approvedBy, paidAt } = body;

    const updateData: Record<string, unknown> = { status };
    if (status === 'approved' || status === 'paid') {
      updateData.approvedBy = approvedBy || 'admin';
      updateData.approvedAt = new Date();
    }
    if (status === 'paid') {
      updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
    }

    const expense = await db.expense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

// DELETE - Delete an expense
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
