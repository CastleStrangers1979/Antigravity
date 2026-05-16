import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePaymentLink, sendDebtReminder } from '@/lib/payments/payment-links';

// GET - Fetch customers with overdue invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage'); // Optional filter by stage

    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: { notIn: ['paid', 'cancelled'] },
        dueDate: { lte: new Date() },
        // @ts-ignore
        ...(stage && stage !== 'all' ? { escalationStage: stage } : {})
      },
      include: {
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(overdueInvoices);
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch overdue invoices' }, { status: 500 });
  }
}

// POST - Trigger reminder or escalation
export async function POST(request: NextRequest) {
  try {
    const { invoiceId, action } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!invoice || !invoice.order?.customer) {
      return NextResponse.json({ error: 'Invoice or customer not found' }, { status: 404 });
    }

    const customer = invoice.order.customer;

    if (action === 'sendReminder') {
      const inv = invoice as any;
      // Determine stage based on remindersCount
      let newStage = 'green';
      if (inv.remindersCount >= 3) newStage = 'red';
      else if (inv.remindersCount === 2) newStage = 'orange';
      else if (inv.remindersCount === 1) newStage = 'yellow';

      // Generate payment link if not exists
      let paymentLink = inv.paymentLink;
      if (!paymentLink) {
        paymentLink = await generatePaymentLink({
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          customerName: customer.name,
          invoiceNumber: invoice.invoiceNumber
        });
      }

      // Send reminder (stubbed)
      await sendDebtReminder(
        'whatsapp',
        customer.phone,
        customer.name,
        invoice.totalAmount,
        invoice.invoiceNumber,
        paymentLink,
        newStage as any
      );

      // Update invoice
      await db.invoice.update({
        where: { id: invoiceId },
        data: {
          // @ts-ignore
          remindersCount: (invoice as any).remindersCount + 1,
          // @ts-ignore
          lastReminderAt: new Date(),
          // @ts-ignore
          escalationStage: newStage,
          // @ts-ignore
          paymentLink
        }
      });

      // Log activity
      await db.activityLog.create({
        data: {
          action: 'DEBT_REMINDER_SENT',
          entity: 'Invoice',
          entityId: invoiceId,
          details: `Reminder sent to ${customer.name} (Stage: ${newStage})`
        }
      });

      return NextResponse.json({ success: true, stage: newStage });
    }

    if (action === 'escalateToRobot') {
      await db.invoice.update({
        where: { id: invoiceId },
        // @ts-ignore
        data: { escalationStage: 'robot' }
      });
      // Log activity
      await db.activityLog.create({
        data: {
          action: 'DEBT_ESCALATED_ROBOT',
          entity: 'Invoice',
          entityId: invoiceId,
          details: 'Escalated to robot call stage'
        }
      });
      return NextResponse.json({ success: true, stage: 'robot' });
    }

    if (action === 'formalize') {
      // Simulate SnelStart Export
      const snelStartReference = `SS-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await db.invoice.update({
        where: { id: invoiceId },
        // @ts-ignore
        data: { 
          isFormal: true, 
          formalizedAt: new Date(),
          snelStartId: snelStartReference,
          pdfUrl: `/api/accounting/invoices/${invoiceId}/pdf`, // Mock PDF endpoint
          notes: `${(invoice as any).notes || ''} [Formalized & Exported to SnelStart: ${snelStartReference}]`
        }
      });
      // Log activity
      await db.activityLog.create({
        data: {
          action: 'DEBT_FORMALIZED',
          entity: 'Invoice',
          entityId: invoiceId,
          details: `Formalized for SnelStart (ID: ${snelStartReference})`
        }
      });

      return NextResponse.json({ 
        success: true, 
        isFormal: true, 
        snelStartId: snelStartReference 
      });
    }

    if (action === 'transferToIncasso') {
      if (!(invoice as any).isFormal) {
        return NextResponse.json({ 
          error: 'Invoice must be formalized before transferring to Incasso',
          requireFormalization: true 
        }, { status: 400 });
      }

      await db.invoice.update({
        where: { id: invoiceId },
        // @ts-ignore
        data: { escalationStage: 'incasso' }
      });
      // Log activity
      await db.activityLog.create({
        data: {
          action: 'DEBT_TRANSFERRED_INCASSO',
          entity: 'Invoice',
          entityId: invoiceId,
          details: 'Transferred to external collection agency'
        }
      });
      return NextResponse.json({ success: true, stage: 'incasso' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing debt action:', error);
    return NextResponse.json({ error: 'Failed to process debt action' }, { status: 500 });
  }
}

// PATCH - Manager approval for cash adjustment / debt write-off
export async function PATCH(request: NextRequest) {
  try {
    const { invoiceId, managerId, action, notes, signatureUrl } = await request.json();

    // In a real app, verify managerId and permissions here
    if (!managerId) {
      return NextResponse.json({ error: 'Manager approval required' }, { status: 403 });
    }

    if (action === 'markPaidCash') {
      await db.invoice.update({
        where: { id: invoiceId },
        // @ts-ignore
        data: {
          status: 'paid',
          paidAt: new Date(),
          signatureUrl,
          signedByName: managerId,
          signedAt: new Date(),
          notes: `${notes || ''} [Paid Cash approved by Manager: ${managerId}]`
        }
      });
      // Log activity
      await db.activityLog.create({
        data: {
          userId: managerId,
          userType: 'manager',
          action: 'CASH_PAYMENT_APPROVED',
          entity: 'Invoice',
          entityId: invoiceId,
          details: `Approved cash payment with signature.`
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error approving debt action:', error);
    return NextResponse.json({ error: 'Failed to approve action' }, { status: 500 });
  }
}
