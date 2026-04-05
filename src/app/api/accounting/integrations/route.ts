import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Available integrations
const AVAILABLE_INTEGRATIONS = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Connect to QuickBooks for accounting sync',
    logo: '/integrations/quickbooks.png',
    features: ['Invoice sync', 'Expense tracking', 'Financial reports'],
    status: 'available',
  },
  {
    id: 'exact',
    name: 'Exact',
    description: 'Dutch accounting software integration',
    logo: '/integrations/exact.png',
    features: ['BTW reports', 'Dutch tax compliance', 'E-invoicing'],
    status: 'available',
  },
  {
    id: 'afas',
    name: 'AFAS',
    description: 'Dutch business software integration',
    logo: '/integrations/afas.png',
    features: ['Payroll', 'Financial administration', 'HR management'],
    status: 'available',
  },
];

// GET - Fetch all integrations
export async function GET(request: NextRequest) {
  try {
    const savedIntegrations = await db.accountingIntegration.findMany();

    // Merge available integrations with saved ones
    const integrations = AVAILABLE_INTEGRATIONS.map(available => {
      const saved = savedIntegrations.find(s => s.name === available.id);
      return {
        ...available,
        savedId: saved?.id,
        isActive: saved?.isActive || false,
        lastSyncAt: saved?.lastSyncAt,
        syncStatus: saved?.syncStatus,
        companyId: saved?.companyid,
        hasApiKey: !!saved?.apiKey,
      };
    });

    // Sync status summary
    const syncSummary = {
      total: integrations.length,
      active: integrations.filter(i => i.isActive).length,
      lastSync: savedIntegrations.reduce((latest, i) => {
        if (i.lastSyncAt && (!latest || i.lastSyncAt > latest)) {
          return i.lastSyncAt;
        }
        return latest;
      }, null as Date | null),
    };

    return NextResponse.json({
      integrations,
      syncSummary,
      availableIntegrations: AVAILABLE_INTEGRATIONS,
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST - Connect/update an integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, apiKey, secretKey, companyId, apiEndpoint, settings } = body;

    // Check if integration already exists
    const existing = await db.accountingIntegration.findFirst({
      where: { name },
    });

    let integration;

    if (existing) {
      // Update existing integration
      integration = await db.accountingIntegration.update({
        where: { id: existing.id },
        data: {
          apiKey,
          secretKey,
          companyid: companyId,
          apiEndpoint,
          settings: settings ? JSON.stringify(settings) : null,
          isActive: true,
          syncStatus: 'connected',
        },
      });
    } else {
      // Create new integration
      integration = await db.accountingIntegration.create({
        data: {
          name,
          apiKey,
          secretKey,
          companyid: companyId,
          apiEndpoint,
          settings: settings ? JSON.stringify(settings) : null,
          isActive: true,
          syncStatus: 'connected',
        },
      });
    }

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error connecting integration:', error);
    return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 });
  }
}

// PUT - Sync or update integration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'sync') {
      // Simulate sync - in real implementation, this would call the external API
      const integration = await db.accountingIntegration.update({
        where: { id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'synced',
        },
      });

      return NextResponse.json({
        ...integration,
        message: 'Sync completed successfully',
        recordsSynced: Math.floor(Math.random() * 100) + 10, // Simulated count
      });
    }

    if (action === 'disconnect') {
      const integration = await db.accountingIntegration.update({
        where: { id },
        data: {
          isActive: false,
          syncStatus: 'disconnected',
        },
      });

      return NextResponse.json(integration);
    }

    // General update
    const integration = await db.accountingIntegration.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
  }
}

// DELETE - Remove an integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.accountingIntegration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
  }
}
