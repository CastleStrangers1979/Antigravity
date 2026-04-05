import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all vehicles with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: Record<string, unknown> = {};
    if (activeOnly) where.isActive = true;

    const vehicles = await db.vehicle.findMany({
      where,
      include: {
        drivers: {
          where: { isActive: true },
          select: { id: true, name: true }
        },
        _count: {
          select: { 
            maintenances: true,
            fuelRecords: true,
            insurances: true,
            expenses: true
          }
        }
      },
      orderBy: { plateNumber: 'asc' },
    });

    // Calculate stats
    const stats = {
      total: vehicles.length,
      active: vehicles.filter(v => v.isActive).length,
      inactive: vehicles.filter(v => !v.isActive).length,
      totalMileage: vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0),
    };

    // Get maintenance alerts
    const maintenanceAlerts = await db.vehicleMaintenance.findMany({
      where: {
        status: { in: ['scheduled', 'in_progress'] },
        OR: [
          { nextMaintenanceDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
          { nextMaintenanceDate: { lte: new Date() } }
        ]
      },
      include: { vehicle: true },
      orderBy: { nextMaintenanceDate: 'asc' },
      take: 5
    });

    // Get insurance alerts
    const insuranceAlerts = await db.vehicleInsurance.findMany({
      where: {
        status: 'active',
        endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      include: { vehicle: true },
      orderBy: { endDate: 'asc' },
      take: 5
    });

    return NextResponse.json({ 
      vehicles, 
      stats,
      maintenanceAlerts,
      insuranceAlerts
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

// POST - Add new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      plateNumber, 
      type, 
      brand, 
      model, 
      year, 
      color, 
      fuelType, 
      mileage, 
      capacity, 
      purchaseDate, 
      currentValue, 
      notes 
    } = body;

    // Check if plate number already exists
    const existing = await db.vehicle.findUnique({
      where: { plateNumber }
    });

    if (existing) {
      return NextResponse.json({ error: 'Vehicle with this plate number already exists' }, { status: 400 });
    }

    const vehicle = await db.vehicle.create({
      data: {
        plateNumber,
        type,
        brand,
        model,
        year: year ? parseInt(year) : null,
        color,
        fuelType,
        mileage: mileage ? parseInt(mileage) : 0,
        capacity: capacity ? parseFloat(capacity) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        currentValue: currentValue ? parseFloat(currentValue) : null,
        notes,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}

// PUT - Update vehicle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    if (data.year) updateData.year = parseInt(data.year);
    if (data.mileage) updateData.mileage = parseInt(data.mileage);
    if (data.capacity) updateData.capacity = parseFloat(data.capacity);
    if (data.currentValue) updateData.currentValue = parseFloat(data.currentValue);
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);

    const vehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

// DELETE - Delete vehicle
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    await db.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
