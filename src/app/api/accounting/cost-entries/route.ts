import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch cost entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const costCenterId = searchParams.get('costCenterId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (costCenterId) where.costCenterId = costCenterId;
    if (category) where.category = category;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const costEntries = await db.costEntry.findMany({
      where,
      include: {
        costCenter: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(costEntries);
  } catch (error) {
    console.error('Error fetching cost entries:', error);
    return NextResponse.json({ error: 'Failed to fetch cost entries' }, { status: 500 });
  }
}

// POST - Create a cost entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { costCenterId, category, description, amount, date, notes } = body;

    const costEntry = await db.costEntry.create({
      data: {
        costCenterId,
        category,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        notes,
      },
      include: {
        costCenter: true,
      },
    });

    // Update cost center actual amount
    const costCenter = await db.costCenter.findUnique({
      where: { id: costCenterId },
      include: {
        costs: true,
      },
    });

    if (costCenter) {
      const actual = costCenter.costs.reduce((sum, c) => sum + c.amount, 0);
      await db.costCenter.update({
        where: { id: costCenterId },
        data: { actual },
      });
    }

    return NextResponse.json(costEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating cost entry:', error);
    return NextResponse.json({ error: 'Failed to create cost entry' }, { status: 500 });
  }
}

// DELETE - Delete a cost entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get the cost entry before deleting to update the cost center
    const costEntry = await db.costEntry.findUnique({
      where: { id },
    });

    if (costEntry) {
      await db.costEntry.delete({
        where: { id },
      });

      // Update cost center actual amount
      const costCenter = await db.costCenter.findUnique({
        where: { id: costEntry.costCenterId },
        include: {
          costs: true,
        },
      });

      if (costCenter) {
        const actual = costCenter.costs.reduce((sum, c) => sum + c.amount, 0);
        await db.costCenter.update({
          where: { id: costEntry.costCenterId },
          data: { actual },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cost entry:', error);
    return NextResponse.json({ error: 'Failed to delete cost entry' }, { status: 500 });
  }
}
