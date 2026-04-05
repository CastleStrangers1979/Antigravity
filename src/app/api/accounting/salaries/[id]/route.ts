import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update a specific salary payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paidAt, paymentMethod, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (status === 'paid') {
      updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
    }
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;

    const salary = await db.salaryPayment.update({
      where: { id },
      data: updateData,
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

// DELETE - Delete a salary payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.salaryPayment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting salary payment:', error);
    return NextResponse.json({ error: 'Failed to delete salary payment' }, { status: 500 });
  }
}
