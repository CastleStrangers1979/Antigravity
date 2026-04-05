import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch equipment (mixers and ovens)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'mixers' or 'ovens'

    let result: any = {};

    if (type === 'mixers' || !type) {
      result.mixers = await db.mixer.findMany({
        include: {
          productionBatches: {
            where: { status: { in: ['mixing', 'proofing'] } },
            take: 1
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    if (type === 'ovens' || !type) {
      result.ovens = await db.oven.findMany({
        include: {
          productionBatches: {
            where: { status: { in: ['baking'] } },
            take: 1
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    // Return the appropriate result based on type
    if (type === 'mixers') {
      return NextResponse.json(result.mixers);
    } else if (type === 'ovens') {
      return NextResponse.json(result.ovens);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// POST - Create equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let equipment;

    if (type === 'mixer') {
      equipment = await db.mixer.create({
        data: {
          name: data.name,
          capacity: parseFloat(data.capacity) || 0,
          isActive: data.isActive ?? true,
          notes: data.notes,
        }
      });
    } else if (type === 'oven') {
      equipment = await db.oven.create({
        data: {
          name: data.name,
          type: data.ovenType || 'electric',
          capacity: parseInt(data.capacity) || 0,
          minTemp: parseInt(data.minTemp) || 50,
          maxTemp: parseInt(data.maxTemp) || 300,
          currentTemp: parseFloat(data.currentTemp) || null,
          targetTemp: parseFloat(data.targetTemp) || null,
          isActive: data.isActive ?? true,
          notes: data.notes,
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid equipment type' }, { status: 400 });
    }

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}

// PUT - Update equipment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    let equipment;

    if (type === 'mixer') {
      equipment = await db.mixer.update({
        where: { id },
        data: {
          name: data.name,
          capacity: parseFloat(data.capacity) || undefined,
          isActive: data.isActive,
          currentBatchId: data.currentBatchId,
          lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
          nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : undefined,
          notes: data.notes,
        }
      });
    } else if (type === 'oven') {
      equipment = await db.oven.update({
        where: { id },
        data: {
          name: data.name,
          type: data.ovenType,
          capacity: parseInt(data.capacity) || undefined,
          minTemp: parseInt(data.minTemp) || undefined,
          maxTemp: parseInt(data.maxTemp) || undefined,
          currentTemp: parseFloat(data.currentTemp) || null,
          targetTemp: parseFloat(data.targetTemp) || null,
          isActive: data.isActive,
          isHeating: data.isHeating,
          currentBatchId: data.currentBatchId,
          lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
          nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : undefined,
          notes: data.notes,
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid equipment type' }, { status: 400 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// DELETE - Delete equipment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Equipment ID and type are required' }, { status: 400 });
    }

    if (type === 'mixer') {
      await db.mixer.delete({ where: { id } });
    } else if (type === 'oven') {
      await db.oven.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid equipment type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
