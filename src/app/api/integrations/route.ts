import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all integrations
export async function GET(request: NextRequest) {
  try {
    const integrations = await db.accountingIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST - Create a new integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, apiEndpoint, apiKey, secretKey, companyId, settings } = body;
    
    const integration = await db.accountingIntegration.create({
      data: {
        name,
        apiEndpoint,
        apiKey,
        secretKey,
        companyid: companyId,
        settings: settings ? JSON.stringify(settings) : null,
        isActive: false,
      },
    });
    
    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
