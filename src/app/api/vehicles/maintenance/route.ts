import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch maintenance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    
    if (upcoming) {
      where.OR = [
        { nextMaintenanceDate: { lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } },
        { status: 'scheduled' }
      ];
    }

    const maintenances = await db.vehicleMaintenance.findMany({
      where,
      include: {
        vehicle: {
          include: {
            drivers: {
              where: { isActive: true },
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' },
    });

    // Calculate total costs
    const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
    
    // Group by type
    const byType = maintenances.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Upcoming maintenance count
    const upcomingCount = maintenances.filter(m => 
      m.status === 'scheduled' && m.nextMaintenanceDate && new Date(m.nextMaintenanceDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    return NextResponse.json({ 
      maintenances, 
      stats: {
        total: maintenances.length,
        totalCost,
        byType,
        upcomingCount
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
  }
}

// POST - Add maintenance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      type, 
      description, 
      garage, 
      cost, 
      mileage, 
      startDate, 
      endDate, 
      status,
      nextMaintenanceDate,
      nextMaintenanceMileage,
      notes 
    } = body;

    const maintenance = await db.vehicleMaintenance.create({
      data: {
        vehicleId,
        type,
        description,
        garage,
        cost: cost ? parseFloat(cost) : 0,
        mileage: mileage ? parseInt(mileage) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'scheduled',
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
        nextMaintenanceMileage: nextMaintenanceMileage ? parseInt(nextMaintenanceMileage) : null,
        notes,
      },
      include: { vehicle: true }
    });

    // Update vehicle mileage if provided
    if (mileage) {
      const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
      if (vehicle && parseInt(mileage) > (vehicle.mileage || 0)) {
        await db.vehicle.update({
          where: { id: vehicleId },
          data: { mileage: parseInt(mileage) }
        });
      }
    }

    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
  }
}

// PUT - Update maintenance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    if (data.cost) updateData.cost = parseFloat(data.cost);
    if (data.mileage) updateData.mileage = parseInt(data.mileage);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.nextMaintenanceDate) updateData.nextMaintenanceDate = new Date(data.nextMaintenanceDate);
    if (data.nextMaintenanceMileage) updateData.nextMaintenanceMileage = parseInt(data.nextMaintenanceMileage);

    const maintenance = await db.vehicleMaintenance.update({
      where: { id },
      data: updateData,
      include: { vehicle: true }
    });

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 });
  }
}

// DELETE - Delete maintenance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Maintenance ID is required' }, { status: 400 });
    }

    await db.vehicleMaintenance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance record' }, { status: 500 });
  }
}
