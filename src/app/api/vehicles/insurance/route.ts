import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch insurance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    
    if (expiringSoon) {
      where.status = 'active';
      where.endDate = { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
    }

    const insurances = await db.vehicleInsurance.findMany({
      where,
      include: { vehicle: true },
      orderBy: { endDate: 'asc' },
    });

    // Calculate stats
    const totalPremium = insurances
      .filter(i => i.status === 'active')
      .reduce((sum, i) => sum + (i.premium || 0), 0);

    const expiringCount = insurances.filter(i => 
      i.status === 'active' && new Date(i.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    const activeCount = insurances.filter(i => i.status === 'active').length;

    return NextResponse.json({ 
      insurances, 
      stats: {
        total: insurances.length,
        active: activeCount,
        expiringSoon: expiringCount,
        totalPremium
      }
    });
  } catch (error) {
    console.error('Error fetching insurance records:', error);
    return NextResponse.json({ error: 'Failed to fetch insurance records' }, { status: 500 });
  }
}

// POST - Add insurance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      provider, 
      policyNumber, 
      type, 
      startDate, 
      endDate, 
      premium,
      coverage,
      documentUrl,
      notes 
    } = body;

    const insurance = await db.vehicleInsurance.create({
      data: {
        vehicleId,
        provider,
        policyNumber,
        type,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        premium: premium ? parseFloat(premium) : 0,
        coverage,
        documentUrl,
        status: 'active',
        notes,
      },
      include: { vehicle: true }
    });

    return NextResponse.json(insurance, { status: 201 });
  } catch (error) {
    console.error('Error creating insurance record:', error);
    return NextResponse.json({ error: 'Failed to create insurance record' }, { status: 500 });
  }
}

// PUT - Update insurance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    if (data.premium) updateData.premium = parseFloat(data.premium);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const insurance = await db.vehicleInsurance.update({
      where: { id },
      data: updateData,
      include: { vehicle: true }
    });

    return NextResponse.json(insurance);
  } catch (error) {
    console.error('Error updating insurance record:', error);
    return NextResponse.json({ error: 'Failed to update insurance record' }, { status: 500 });
  }
}

// DELETE - Delete insurance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Insurance ID is required' }, { status: 400 });
    }

    await db.vehicleInsurance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance record:', error);
    return NextResponse.json({ error: 'Failed to delete insurance record' }, { status: 500 });
  }
}
