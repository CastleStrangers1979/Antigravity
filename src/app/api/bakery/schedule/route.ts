import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch production schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const week = searchParams.get('week') === 'true';

    const where: any = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduleDate = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (week) {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      where.scheduleDate = {
        gte: startOfWeek,
        lte: endOfWeek
      };
    }

    const schedules = await db.productionSchedule.findMany({
      where,
      include: {
        scheduleItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: [
        { scheduleDate: 'asc' },
        { shift: 'asc' }
      ]
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching production schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch production schedules' }, { status: 500 });
  }
}

// POST - Create a production schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleDate, shift, items, notes } = body;

    const schedule = await db.productionSchedule.create({
      data: {
        scheduleDate: new Date(scheduleDate),
        shift: shift || 'morning',
        notes,
        scheduleItems: {
          create: items?.map((item: { productId: string; plannedQty: string; notes: string }) => ({
            productId: item.productId,
            plannedQty: parseInt(item.plannedQty) || 0,
            notes: item.notes
          })) || []
        }
      },
      include: {
        scheduleItems: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating production schedule:', error);
    return NextResponse.json({ error: 'Failed to create production schedule' }, { status: 500 });
  }
}

// PUT - Update a production schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, ...data } = body;

    const schedule = await db.productionSchedule.update({
      where: { id },
      data: {
        scheduleDate: data.scheduleDate ? new Date(data.scheduleDate) : undefined,
        shift: data.shift,
        status: data.status,
        notes: data.notes,
      }
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await db.productionScheduleItem.deleteMany({
        where: { scheduleId: id }
      });

      // Create new items
      await db.productionScheduleItem.createMany({
        data: items.map((item: { productId: string; plannedQty: string; notes: string }) => ({
          scheduleId: id,
          productId: item.productId,
          plannedQty: parseInt(item.plannedQty) || 0,
          notes: item.notes
        }))
      });
    }

    const updatedSchedule = await db.productionSchedule.findUnique({
      where: { id },
      include: {
        scheduleItems: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error updating production schedule:', error);
    return NextResponse.json({ error: 'Failed to update production schedule' }, { status: 500 });
  }
}

// DELETE - Delete a production schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    // Delete items first
    await db.productionScheduleItem.deleteMany({
      where: { scheduleId: id }
    });

    // Delete schedule
    await db.productionSchedule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting production schedule:', error);
    return NextResponse.json({ error: 'Failed to delete production schedule' }, { status: 500 });
  }
}
