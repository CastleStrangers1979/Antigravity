import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update a specific tax report
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, submittedAt, paidAt, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      if (status === 'submitted') {
        updateData.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
      }
      if (status === 'paid') {
        updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;

    const taxReport = await db.taxReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(taxReport);
  } catch (error) {
    console.error('Error updating tax report:', error);
    return NextResponse.json({ error: 'Failed to update tax report' }, { status: 500 });
  }
}

// DELETE - Delete a tax report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.taxReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tax report:', error);
    return NextResponse.json({ error: 'Failed to delete tax report' }, { status: 500 });
  }
}
