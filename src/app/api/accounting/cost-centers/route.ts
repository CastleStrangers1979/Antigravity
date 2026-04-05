import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all cost centers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const costCenters = await db.costCenter.findMany({
      where,
      include: {
        costs: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        _count: {
          select: { costs: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculate budget vs actual for each cost center
    const costCentersWithStats = costCenters.map(cc => {
      const actual = cc.costs.reduce((sum, c) => sum + c.amount, 0);
      const budget = cc.budget || 0;
      const variance = budget - actual;
      const percentageUsed = budget > 0 ? ((actual / budget) * 100).toFixed(1) : '0';

      return {
        ...cc,
        calculated: {
          actual,
          variance,
          percentageUsed: parseFloat(percentageUsed),
          isOverBudget: actual > budget,
        },
      };
    });

    // Group by type
    const byType = costCentersWithStats.reduce((acc, cc) => {
      if (!acc[cc.type]) {
        acc[cc.type] = [];
      }
      acc[cc.type].push(cc);
      return acc;
    }, {} as Record<string, typeof costCentersWithStats>);

    // Summary statistics
    const totalBudget = costCentersWithStats.reduce((sum, cc) => sum + (cc.budget || 0), 0);
    const totalActual = costCentersWithStats.reduce((sum, cc) => sum + cc.calculated.actual, 0);
    const totalVariance = totalBudget - totalActual;

    return NextResponse.json({
      costCenters: costCentersWithStats,
      byType,
      summary: {
        totalBudget,
        totalActual,
        totalVariance,
        count: costCenters.length,
        overBudgetCount: costCentersWithStats.filter(cc => cc.calculated.isOverBudget).length,
      },
    });
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    return NextResponse.json({ error: 'Failed to fetch cost centers' }, { status: 500 });
  }
}

// POST - Create a new cost center
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, budget, periodStart, periodEnd, notes } = body;

    const costCenter = await db.costCenter.create({
      data: {
        name,
        type,
        budget: parseFloat(budget) || null,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        notes,
      },
    });

    return NextResponse.json(costCenter, { status: 201 });
  } catch (error) {
    console.error('Error creating cost center:', error);
    return NextResponse.json({ error: 'Failed to create cost center' }, { status: 500 });
  }
}

// PUT - Update a cost center
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, budget, periodStart, periodEnd, notes } = body;

    const costCenter = await db.costCenter.update({
      where: { id },
      data: {
        name,
        type,
        budget: budget ? parseFloat(budget) : null,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        notes,
      },
    });

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error('Error updating cost center:', error);
    return NextResponse.json({ error: 'Failed to update cost center' }, { status: 500 });
  }
}

// DELETE - Delete a cost center
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Delete associated cost entries first
    await db.costEntry.deleteMany({
      where: { costCenterId: id },
    });

    await db.costCenter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cost center:', error);
    return NextResponse.json({ error: 'Failed to delete cost center' }, { status: 500 });
  }
}
