import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all health certificates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const certificates = await db.healthCertificate.findMany({
      where,
      orderBy: {
        expiryDate: 'asc',
      },
    });

    // Calculate statistics
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Valid certificates
    const validCount = await db.healthCertificate.count({
      where: {
        status: 'valid',
        expiryDate: { gt: today },
      },
    });

    // Expiring soon (within 30 days)
    const expiringSoon = await db.healthCertificate.findMany({
      where: {
        status: 'valid',
        expiryDate: {
          lte: thirtyDaysFromNow,
          gt: today,
        },
      },
    });

    // Expired certificates
    const expiredCertificates = await db.healthCertificate.findMany({
      where: {
        status: 'expired',
      },
    });

    // Auto-update expired status
    for (const cert of certificates) {
      if (cert.status === 'valid' && new Date(cert.expiryDate) < today) {
        await db.healthCertificate.update({
          where: { id: cert.id },
          data: { status: 'expired' },
        });
      }
    }

    // Count by type
    const employeeCount = await db.healthCertificate.count({
      where: { type: 'employee' },
    });

    const vehicleCount = await db.healthCertificate.count({
      where: { type: 'vehicle' },
    });

    const facilityCount = await db.healthCertificate.count({
      where: { type: 'facility' },
    });

    return NextResponse.json({
      certificates,
      stats: {
        validCount,
        expiringSoonCount: expiringSoon.length,
        expiredCount: expiredCertificates.length,
        employeeCount,
        vehicleCount,
        facilityCount,
      },
      expiringSoon,
      expiredCertificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST - Create a new health certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      entityId,
      entityName,
      certNumber,
      issueDate,
      expiryDate,
      issuingAuthority,
      documentUrl,
      notes,
    } = body;

    const issue = new Date(issueDate);
    const expiry = new Date(expiryDate);
    const today = new Date();

    // Determine status
    let status = 'valid';
    if (expiry < today) status = 'expired';

    const certificate = await db.healthCertificate.create({
      data: {
        type,
        entityId,
        entityName,
        certNumber,
        issueDate: issue,
        expiryDate: expiry,
        issuingAuthority,
        documentUrl,
        status,
        notes,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
  }
}

// PUT - Update a certificate
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    const certificate = await db.healthCertificate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}

// DELETE - Delete a certificate
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    await db.healthCertificate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}
