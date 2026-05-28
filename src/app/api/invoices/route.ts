import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { demoInvoices, demoCustomers, shouldUseDemoData } from '@/lib/demo-data';

// GET - جلب جميع الفواتير
export async function GET(request: NextRequest) {
  try {
    if (shouldUseDemoData()) {
      const invoicesWithCustomers = demoInvoices.map(invoice => ({
        ...invoice,
        customer: demoCustomers.find(c => c.id === invoice.customerId)
      }));
      return NextResponse.json(invoicesWithCustomers);
    }

    const invoices = await db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true
          }
        }
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices, using demo data:', error);
    const invoicesWithCustomers = demoInvoices.map(invoice => ({
      ...invoice,
      customer: demoCustomers.find(c => c.id === invoice.customerId)
    }));
    return NextResponse.json(invoicesWithCustomers);
  }
}
