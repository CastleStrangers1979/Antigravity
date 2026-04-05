import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all quality checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;

    const checks = await db.qualityCheck.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
          },
        },
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: 50,
    });

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayChecks = await db.qualityCheck.count({
      where: {
        checkedAt: {
          gte: today,
        },
      },
    });

    const passedChecks = await db.qualityCheck.count({
      where: {
        passed: true,
      },
    });

    const failedChecks = await db.qualityCheck.count({
      where: {
        passed: false,
      },
    });

    const totalChecks = passedChecks + failedChecks;
    const passRate = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    // Get recent issues (checks with issues)
    const recentIssues = await db.qualityCheck.findMany({
      where: {
        issues: { not: null },
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      checks,
      stats: {
        todayChecks,
        passedChecks,
        failedChecks,
        passRate,
        totalChecks,
      },
      recentIssues,
    });
  } catch (error) {
    console.error('Error fetching quality checks:', error);
    return NextResponse.json({ error: 'Failed to fetch quality checks' }, { status: 500 });
  }
}

// POST - Create a new quality check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      productId,
      batchId,
      orderId,
      checklist,
      score,
      passed,
      issues,
      correctiveAction,
      checkedBy,
      notes,
    } = body;

    const check = await db.qualityCheck.create({
      data: {
        type,
        productId,
        batchId,
        orderId,
        checklist: checklist ? JSON.stringify(checklist) : null,
        score: score ? parseFloat(score) : null,
        passed,
        issues: issues ? JSON.stringify(issues) : null,
        correctiveAction,
        checkedBy,
        notes,
      },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            nameNl: true,
          },
        },
      },
    });

    return NextResponse.json(check);
  } catch (error) {
    console.error('Error creating quality check:', error);
    return NextResponse.json({ error: 'Failed to create quality check' }, { status: 500 });
  }
}

// PUT - Update a quality check
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

    const check = await db.qualityCheck.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(check);
  } catch (error) {
    console.error('Error updating quality check:', error);
    return NextResponse.json({ error: 'Failed to update quality check' }, { status: 500 });
  }
}
