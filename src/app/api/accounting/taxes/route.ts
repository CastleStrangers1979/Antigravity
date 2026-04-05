import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dutch VAT rates
const VAT_RATES = {
  high: 21, // Standard rate
  low: 9,   // Reduced rate for food, books, etc.
  zero: 0,  // Zero rate for exports, intra-EU supplies
};

// GET - Fetch tax reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const quarter = searchParams.get('quarter');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (year) {
      const yearNum = parseInt(year);
      where.periodStart = { gte: new Date(yearNum, 0, 1) };
      where.periodEnd = { lte: new Date(yearNum, 11, 31) };
    }

    const taxReports = await db.taxReport.findMany({
      where,
      orderBy: { periodStart: 'desc' },
    });

    // Calculate current quarter data
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();
    const quarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
    const quarterEnd = new Date(currentYear, currentQuarter * 3, 0);

    // Get orders for the current quarter
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: quarterStart,
          lte: quarterEnd,
        },
        status: 'delivered',
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate VAT totals
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const taxAmount = totalSales * (VAT_RATES.low / 100); // Assuming food at low rate

    // Get expenses for input VAT
    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: quarterStart,
          lte: quarterEnd,
        },
        status: { in: ['approved', 'paid'] },
      },
    });

    const totalPurchases = expenses.reduce((sum, e) => sum + e.amount, 0);
    const inputVAT = totalPurchases * (VAT_RATES.high / 100); // Assuming business purchases at high rate

    // Quarterly summary
    const quarterlySummary = {
      quarter: currentQuarter,
      year: currentYear,
      periodStart: quarterStart,
      periodEnd: quarterEnd,
      totalSales,
      taxableAmount: totalSales,
      outputVAT: taxAmount,
      totalPurchases,
      inputVAT,
      netVAT: taxAmount - inputVAT, // VAT to pay or refund
      dueDate: getBTWDueDate(currentQuarter, currentYear),
    };

    // Generate BTW report data
    const btwReport = {
      quarter: currentQuarter,
      year: currentYear,
      // Box 1: Turnover (Omzet)
      box1_turnover: totalSales,
      // Box 1a: High rate (21%)
      box1a_highRate: 0, // Food products typically not at high rate
      box1a_vat: 0,
      // Box 1b: Low rate (9%)
      box1b_lowRate: totalSales,
      box1b_vat: taxAmount,
      // Box 1c: Zero rate
      box1c_zeroRate: 0,
      // Box 2: Private use
      box2_privateUse: 0,
      // Box 3: Goods to EU countries
      box3_goodsToEU: 0,
      // Box 4: Services to EU countries
      box4_servicesToEU: 0,
      // Box 5: Input VAT (Voorbelasting)
      box5_inputVAT: inputVAT,
      // Box 6: VAT to pay or refund
      box6_netVAT: taxAmount - inputVAT,
    };

    // Filing reminders
    const reminders = getFilingReminders(currentQuarter, currentYear);

    return NextResponse.json({
      taxReports,
      quarterlySummary,
      btwReport,
      vatRates: VAT_RATES,
      reminders,
    });
  } catch (error) {
    console.error('Error fetching tax reports:', error);
    return NextResponse.json({ error: 'Failed to fetch tax reports' }, { status: 500 });
  }
}

// POST - Create/submit a tax report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      periodStart,
      periodEnd,
      totalSales,
      totalPurchases,
      taxableAmount,
      taxRate,
      taxAmount,
      notes,
    } = body;

    // Generate reference number
    const count = await db.taxReport.count();
    const reference = `TAX-${String(count + 1).padStart(6, '0')}`;

    const taxReport = await db.taxReport.create({
      data: {
        type: type || 'btw',
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalSales: totalSales || 0,
        totalPurchases: totalPurchases || 0,
        taxableAmount: taxableAmount || 0,
        taxRate: taxRate || 21,
        taxAmount: taxAmount || 0,
        reference,
        notes,
      },
    });

    return NextResponse.json(taxReport, { status: 201 });
  } catch (error) {
    console.error('Error creating tax report:', error);
    return NextResponse.json({ error: 'Failed to create tax report' }, { status: 500 });
  }
}

// PUT - Update tax report status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidAt } = body;

    const updateData: Record<string, unknown> = { status };
    if (status === 'submitted') {
      updateData.submittedAt = new Date();
    }
    if (status === 'paid') {
      updateData.paidAt = paidAt ? new Date(paidAt) : new Date();
    }

    const taxReport = await db.taxReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(taxReport);
  } catch (error) {
    console.error('Error updating tax report:', error);
    return NextResponse.json({ error: 'Failed to update tax report' }, { status: 500 });
  }
}

// Helper: Get BTW due date for a quarter
function getBTWDueDate(quarter: number, year: number): Date {
  // BTW is due by the last day of the month following the quarter
  const dueMonth = quarter * 3; // April, July, October, January
  const dueYear = quarter === 4 ? year + 1 : year;
  return new Date(dueYear, dueMonth % 12, 0); // Last day of the month
}

// Helper: Get filing reminders
function getFilingReminders(currentQuarter: number, currentYear: number): Array<{
  type: string;
  period: string;
  dueDate: Date;
  status: string;
  daysRemaining: number;
}> {
  const reminders = [];
  const now = new Date();

  // BTW (VAT) reminder
  const btwDueDate = getBTWDueDate(currentQuarter, currentYear);
  const btwDaysRemaining = Math.ceil((btwDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  reminders.push({
    type: 'BTW (VAT)',
    period: `Q${currentQuarter} ${currentYear}`,
    dueDate: btwDueDate,
    status: btwDaysRemaining > 0 ? 'upcoming' : 'overdue',
    daysRemaining: btwDaysRemaining,
  });

  // Income tax reminder (annual)
  const incomeTaxDueDate = new Date(currentYear + 1, 4, 1); // May 1st of next year
  const incomeTaxDaysRemaining = Math.ceil((incomeTaxDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  reminders.push({
    type: 'Income Tax',
    period: `Year ${currentYear}`,
    dueDate: incomeTaxDueDate,
    status: incomeTaxDaysRemaining > 0 ? 'upcoming' : 'overdue',
    daysRemaining: incomeTaxDaysRemaining,
  });

  return reminders;
}
