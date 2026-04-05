import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch vehicle expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const expenses = await db.vehicleExpense.findMany({
      where,
      include: { vehicle: true },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Group by type
    const byType = expenses.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + (e.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    // Group by vehicle
    const byVehicle = expenses.reduce((acc, e) => {
      const vid = e.vehicleId;
      if (!acc[vid]) {
        acc[vid] = { 
          vehicleId: vid, 
          plateNumber: e.vehicle?.plateNumber || '',
          totalAmount: 0, 
          count: 0 
        };
      }
      acc[vid].totalAmount += e.amount || 0;
      acc[vid].count += 1;
      return acc;
    }, {} as Record<string, { vehicleId: string; plateNumber: string; totalAmount: number; count: number }>);

    return NextResponse.json({ 
      expenses, 
      stats: {
        total: expenses.length,
        totalAmount,
        byType,
        byVehicle: Object.values(byVehicle)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST - Add expense record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      type, 
      description, 
      amount, 
      date,
      receiptUrl,
      notes 
    } = body;

    const expense = await db.vehicleExpense.create({
      data: {
        vehicleId,
        type,
        description,
        amount: amount ? parseFloat(amount) : 0,
        date: date ? new Date(date) : new Date(),
        receiptUrl,
        notes,
      },
      include: { vehicle: true }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense record:', error);
    return NextResponse.json({ error: 'Failed to create expense record' }, { status: 500 });
  }
}

// PUT - Update expense record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.date) updateData.date = new Date(data.date);

    const expense = await db.vehicleExpense.update({
      where: { id },
      data: updateData,
      include: { vehicle: true }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense record:', error);
    return NextResponse.json({ error: 'Failed to update expense record' }, { status: 500 });
  }
}

// DELETE - Delete expense record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    await db.vehicleExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense record:', error);
    return NextResponse.json({ error: 'Failed to delete expense record' }, { status: 500 });
  }
}
