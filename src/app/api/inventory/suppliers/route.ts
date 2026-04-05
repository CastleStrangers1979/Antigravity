import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all suppliers
export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchaseOrders: true, supplierProducts: true }
        }
      },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json([]);
  }
}

// POST create supplier
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const supplier = await db.supplier.create({
      data: {
        name: data.name,
        nameAr: data.nameAr || null,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || 'Netherlands',
        postalCode: data.postalCode || null,
        website: data.website || null,
        taxNumber: data.taxNumber || null,
        paymentTerms: data.paymentTerms || null,
        currency: data.currency || 'EUR',
        rating: parseFloat(data.rating) || 5.0,
        leadTime: parseInt(data.leadTime) || 7,
        minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : null,
        isActive: data.isActive !== false,
        notes: data.notes || null,
      },
    });
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}

// PUT update supplier
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    const supplier = await db.supplier.update({
      where: { id },
      data: {
        name: updateData.name,
        nameAr: updateData.nameAr || null,
        contactPerson: updateData.contactPerson || null,
        email: updateData.email || null,
        phone: updateData.phone || null,
        address: updateData.address || null,
        city: updateData.city || null,
        country: updateData.country || 'Netherlands',
        postalCode: updateData.postalCode || null,
        website: updateData.website || null,
        taxNumber: updateData.taxNumber || null,
        paymentTerms: updateData.paymentTerms || null,
        currency: updateData.currency || 'EUR',
        rating: parseFloat(updateData.rating) || 5.0,
        leadTime: parseInt(updateData.leadTime) || 7,
        minOrderAmount: updateData.minOrderAmount ? parseFloat(updateData.minOrderAmount) : null,
        isActive: updateData.isActive !== false,
        notes: updateData.notes || null,
      },
    });
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

// DELETE supplier
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID required' }, { status: 400 });
    }
    
    await db.supplier.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}
