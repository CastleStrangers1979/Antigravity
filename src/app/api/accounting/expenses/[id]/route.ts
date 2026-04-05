import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update a specific expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedBy, paidAt, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'approved' || status === 'paid') {
        updateData.approvedBy = approvedBy || 'admin';
        updateData.approvedAt = new Date();
      }
      if (status === 'paid') {
        updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
