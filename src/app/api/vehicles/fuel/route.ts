import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch fuel records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const fuelRecords = await db.fuelRecord.findMany({
      where,
      include: {
        vehicle: true
      },
      orderBy: { date: 'desc' },
    });

    // Calculate stats
    const totalQuantity = fuelRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalCost = fuelRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const avgPricePerLiter = totalQuantity > 0 ? totalCost / totalQuantity : 0;

    // Calculate efficiency per vehicle
    const vehicleStats: Record<string, { totalFuel: number; totalCost: number; records: number }> = {};
    fuelRecords.forEach(record => {
      const vid = record.vehicleId;
      if (!vehicleStats[vid]) {
        vehicleStats[vid] = { totalFuel: 0, totalCost: 0, records: 0 };
      }
      vehicleStats[vid].totalFuel += record.quantity || 0;
      vehicleStats[vid].totalCost += record.totalCost || 0;
      vehicleStats[vid].records += 1;
    });

    // Get vehicles for efficiency calculation
    const vehicles = await db.vehicle.findMany({
      where: { id: { in: Object.keys(vehicleStats) } },
      select: { id: true, mileage: true }
    });

    // Calculate cost per km (approximate)
    const efficiency = vehicles.map(v => {
      const stats = vehicleStats[v.id];
      const avgConsumption = stats.records > 0 ? stats.totalFuel / stats.records : 0;
      return {
        vehicleId: v.id,
        totalFuel: stats.totalFuel,
        totalCost: stats.totalCost,
        avgConsumption,
        costPerKm: v.mileage ? stats.totalCost / v.mileage : 0
      };
    });

    return NextResponse.json({ 
      fuelRecords, 
      stats: {
        total: fuelRecords.length,
        totalQuantity,
        totalCost,
        avgPricePerLiter,
        vehicleStats: efficiency
      }
    });
  } catch (error) {
    console.error('Error fetching fuel records:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel records' }, { status: 500 });
  }
}

// POST - Add fuel record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      driverId,
      date, 
      quantity, 
      pricePerLiter, 
      totalCost,
      mileage, 
      station, 
      receiptUrl,
      notes 
    } = body;

    const fuelRecord = await db.fuelRecord.create({
      data: {
        vehicleId,
        driverId,
        date: date ? new Date(date) : new Date(),
        quantity: quantity ? parseFloat(quantity) : 0,
        pricePerLiter: pricePerLiter ? parseFloat(pricePerLiter) : 0,
        totalCost: totalCost ? parseFloat(totalCost) : (quantity && pricePerLiter ? parseFloat(quantity) * parseFloat(pricePerLiter) : 0),
        mileage: mileage ? parseInt(mileage) : 0,
        station,
        receiptUrl,
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

    return NextResponse.json(fuelRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel record:', error);
    return NextResponse.json({ error: 'Failed to create fuel record' }, { status: 500 });
  }
}

// PUT - Update fuel record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = { ...data };
    if (data.quantity) updateData.quantity = parseFloat(data.quantity);
    if (data.pricePerLiter) updateData.pricePerLiter = parseFloat(data.pricePerLiter);
    if (data.totalCost) updateData.totalCost = parseFloat(data.totalCost);
    if (data.mileage) updateData.mileage = parseInt(data.mileage);
    if (data.date) updateData.date = new Date(data.date);

    const fuelRecord = await db.fuelRecord.update({
      where: { id },
      data: updateData,
      include: { vehicle: true }
    });

    return NextResponse.json(fuelRecord);
  } catch (error) {
    console.error('Error updating fuel record:', error);
    return NextResponse.json({ error: 'Failed to update fuel record' }, { status: 500 });
  }
}

// DELETE - Delete fuel record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Fuel record ID is required' }, { status: 400 });
    }

    await db.fuelRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fuel record:', error);
    return NextResponse.json({ error: 'Failed to delete fuel record' }, { status: 500 });
  }
}
