import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate batch number
function generateBatchNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `B${year}${month}${day}-${random}`;
}

// GET - Fetch production batches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const today = searchParams.get('today') === 'true';

    const where: any = {};
    if (status) where.status = status;
    
    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const batches = await db.productionBatch.findMany({
      where,
      include: {
        recipe: {
          include: { recipeIngredients: true }
        },
        mixer: true,
        oven: true,
        productionItems: {
          include: { product: true }
        },
        qualityChecks: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching production batches:', error);
    return NextResponse.json({ error: 'Failed to fetch production batches' }, { status: 500 });
  }
}

// POST - Create a new production batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipeId, 
      productId, 
      plannedQty, 
      mixerId, 
      ovenId, 
      ovenTemp,
      notes 
    } = body;

    const batch = await db.productionBatch.create({
      data: {
        batchNumber: generateBatchNumber(),
        recipeId: recipeId || null,
        productId: productId || null,
        plannedQty: parseInt(plannedQty) || 0,
        mixerId: mixerId || null,
        ovenId: ovenId || null,
        ovenTemp: ovenTemp ? parseInt(ovenTemp) : null,
        notes,
        status: 'planned',
      },
      include: {
        recipe: true,
        mixer: true,
        oven: true
      }
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating production batch:', error);
    return NextResponse.json({ error: 'Failed to create production batch' }, { status: 500 });
  }
}

// PUT - Update a production batch
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.actualQty !== undefined) updateData.actualQty = parseInt(data.actualQty) || null;
    if (data.mixerId !== undefined) updateData.mixerId = data.mixerId || null;
    if (data.ovenId !== undefined) updateData.ovenId = data.ovenId || null;
    if (data.ovenTemp !== undefined) updateData.ovenTemp = data.ovenTemp ? parseInt(data.ovenTemp) : null;
    if (data.qualityScore !== undefined) updateData.qualityScore = parseFloat(data.qualityScore) || null;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Handle stage transitions
    if (data.status === 'mixing' && !data.startTime) {
      updateData.startTime = new Date();
    }
    if (data.status === 'baking') {
      updateData.bakeStartTime = new Date();
    }
    if (data.status === 'cooling') {
      updateData.bakeEndTime = new Date();
    }
    if (data.status === 'completed') {
      updateData.endTime = new Date();
    }

    const batch = await db.productionBatch.update({
      where: { id },
      data: updateData,
      include: {
        recipe: true,
        mixer: true,
        oven: true,
        productionItems: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating production batch:', error);
    return NextResponse.json({ error: 'Failed to update production batch' }, { status: 500 });
  }
}

// DELETE - Delete a production batch
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Delete production items first
    await db.productionItem.deleteMany({
      where: { batchId: id }
    });

    // Delete quality checks
    await db.qualityCheck.deleteMany({
      where: { batchId: id }
    });

    // Delete batch
    await db.productionBatch.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting production batch:', error);
    return NextResponse.json({ error: 'Failed to delete production batch' }, { status: 500 });
  }
}
