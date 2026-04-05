import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all safety checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const safetyChecks = await db.safetyCheck.findMany({
      where,
      orderBy: {
        checkedAt: 'desc',
      },
      take: 50,
    });

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayChecks = await db.safetyCheck.count({
      where: {
        checkedAt: {
          gte: today,
        },
      },
    });

    const passedChecks = await db.safetyCheck.count({
      where: {
        passed: true,
      },
    });

    const failedChecks = await db.safetyCheck.count({
      where: {
        passed: false,
      },
    });

    const totalChecks = passedChecks + failedChecks;
    const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    // Get checks due today
    const dueToday = await db.safetyCheck.findMany({
      where: {
        nextCheckDate: {
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          gte: today,
        },
      },
    });

    // Count by type
    const facilityChecks = await db.safetyCheck.count({
      where: { type: 'facility' },
    });

    const vehicleChecks = await db.safetyCheck.count({
      where: { type: 'vehicle' },
    });

    const equipmentChecks = await db.safetyCheck.count({
      where: { type: 'equipment' },
    });

    return NextResponse.json({
      safetyChecks,
      stats: {
        todayChecks,
        passedChecks,
        failedChecks,
        passRate,
        totalChecks,
        facilityChecks,
        vehicleChecks,
        equipmentChecks,
        dueTodayCount: dueToday.length,
      },
      dueToday,
    });
  } catch (error) {
    console.error('Error fetching safety checks:', error);
    return NextResponse.json({ error: 'Failed to fetch safety checks' }, { status: 500 });
  }
}

// POST - Create a new safety check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      entityId,
      checklist,
      score,
      passed,
      issues,
      checkedBy,
      nextCheckDate,
      notes,
    } = body;

    const safetyCheck = await db.safetyCheck.create({
      data: {
        type,
        entityId,
        checklist: checklist ? JSON.stringify(checklist) : null,
        score: score ? parseFloat(score) : null,
        passed,
        issues: issues ? JSON.stringify(issues) : null,
        checkedBy,
        nextCheckDate: nextCheckDate ? new Date(nextCheckDate) : null,
        notes,
      },
    });

    return NextResponse.json(safetyCheck);
  } catch (error) {
    console.error('Error creating safety check:', error);
    return NextResponse.json({ error: 'Failed to create safety check' }, { status: 500 });
  }
}

// PUT - Update a safety check
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (updateData.checklist) {
      updateData.checklist = JSON.stringify(updateData.checklist);
    }
    if (updateData.issues) {
      updateData.issues = JSON.stringify(updateData.issues);
    }
    if (updateData.score) {
      updateData.score = parseFloat(updateData.score);
    }
    if (updateData.nextCheckDate) {
      updateData.nextCheckDate = new Date(updateData.nextCheckDate);
    }

    const safetyCheck = await db.safetyCheck.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(safetyCheck);
  } catch (error) {
    console.error('Error updating safety check:', error);
    return NextResponse.json({ error: 'Failed to update safety check' }, { status: 500 });
  }
}
