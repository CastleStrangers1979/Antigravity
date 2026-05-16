import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all payments with statistics
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const method = searchParams.get('method');
  const provider = searchParams.get('provider');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const stats = searchParams.get('stats');
  
  try {
    // Return statistics if requested
    if (stats === 'true') {
      const allPayments = await db.payment.findMany();
      
      const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const completedPayments = allPayments.filter(p => p.status === 'completed');
      const pendingPayments = allPayments.filter(p => p.status === 'pending');
      const failedPayments = allPayments.filter(p => p.status === 'failed');
      const refundedPayments = allPayments.filter(p => p.status === 'refunded');
      
      const completedAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
      const refundedAmount = refundedPayments.reduce((sum, p) => sum + p.refundedAmount, 0);
      
      // By method
      const byMethod: Record<string, { count: number; amount: number }> = {};
      allPayments.forEach(p => {
        if (!byMethod[p.method]) {
          byMethod[p.method] = { count: 0, amount: 0 };
        }
        byMethod[p.method].count++;
        byMethod[p.method].amount += p.amount;
      });
      
      // By provider
      const byProvider: Record<string, { count: number; amount: number }> = {};
      allPayments.forEach(p => {
        const prov = p.paymentProvider || 'cash';
        if (!byProvider[prov]) {
          byProvider[prov] = { count: 0, amount: 0 };
        }
        byProvider[prov].count++;
        byProvider[prov].amount += p.amount;
      });

      // Daily trends (last 7 days)
      const dailyTrends: { date: string; count: number; amount: number; completed: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayPayments = allPayments.filter(p => 
          new Date(p.createdAt) >= dayStart && new Date(p.createdAt) <= dayEnd
        );
        
        dailyTrends.push({
          date: dayStart.toISOString().split('T')[0],
          count: dayPayments.length,
          amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
          completed: dayPayments.filter(p => p.status === 'completed').length,
        });
      }

      return NextResponse.json({
        total: allPayments.length,
        totalAmount,
        completedCount: completedPayments.length,
        completedAmount,
        pendingCount: pendingPayments.length,
        pendingAmount,
        failedCount: failedPayments.length,
        refundedCount: refundedPayments.length,
        refundedAmount,
        byMethod,
        byProvider,
        dailyTrends,
      });
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (method) where.method = method;
    if (provider) where.paymentProvider = provider;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true, totalAmount: true },
        },
        customer: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json([]);
  }
}

// POST create payment
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Handle payment link creation
    if (data.createLink) {
      const payment = await db.payment.create({
        data: {
          orderId: data.orderId || null,
          customerId: data.customerId || null,
          amount: data.amount,
          currency: data.currency || 'EUR',
          method: data.method || 'link',
          status: 'pending',
          transactionId: `LINK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          paymentProvider: data.provider || 'link',
          paymentData: JSON.stringify({
            type: 'payment_link',
            description: data.description || '',
            expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            email: data.email || '',
            phone: data.phone || '',
            reference: data.reference || '',
          }),
          checkoutUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pay/${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        },
        include: {
          order: { select: { orderNumber: true } },
          customer: { select: { name: true } },
        },
      });

      return NextResponse.json({ success: true, payment, isLink: true });
    }

    // For demo payments, use the provided status or simulate success
    const status = data.status || (Math.random() > 0.1 ? 'completed' : 'failed');

    const payment = await db.payment.create({
      data: {
        orderId: data.orderId || null,
        customerId: data.customerId || null,
        amount: data.amount,
        currency: data.currency || 'EUR',
        method: data.method || 'cash',
        status: status,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paymentProvider: data.provider || 'demo',
        paymentData: JSON.stringify({ simulated: true, description: data.description || '' }),
      },
      include: {
        order: { select: { orderNumber: true } },
        customer: { select: { name: true } },
      },
    });

    // Update order payment status if linked
    if (data.orderId && status === 'completed') {
      await db.order.update({
        where: { id: data.orderId },
        data: { paymentStatus: 'paid', paymentMethod: data.method },
      });
    }

    return NextResponse.json({ success: status === 'completed', payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

// PUT update payment (for refunds)
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Handle refund
    if (data.action === 'refund') {
      const existingPayment = await db.payment.findUnique({
        where: { id: data.id },
      });

      if (!existingPayment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      if (existingPayment.status !== 'completed') {
        return NextResponse.json({ error: 'Only completed payments can be refunded' }, { status: 400 });
      }

      const refundAmount = data.amount || existingPayment.amount;
      
      const payment = await db.payment.update({
        where: { id: data.id },
        data: {
          status: 'refunded',
          refundedAmount: refundAmount,
          refundedAt: new Date(),
          refundReason: data.reason || 'Customer requested refund',
          paymentData: JSON.stringify({
            ...(existingPayment.paymentData ? JSON.parse(existingPayment.paymentData as string) : {}),
            refundDetails: {
              amount: refundAmount,
              reason: data.reason,
              refundedAt: new Date().toISOString(),
            },
          }),
        },
        include: {
          order: { select: { orderNumber: true } },
          customer: { select: { name: true } },
        },
      });

      // Update order if linked
      if (existingPayment.orderId) {
        await db.order.update({
          where: { id: existingPayment.orderId },
          data: { paymentStatus: 'refunded' },
        });
      }

      return NextResponse.json({ success: true, payment });
    }

    // Handle status update
    const payment = await db.payment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        notes: data.notes,
      },
      include: {
        order: { select: { orderNumber: true } },
        customer: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

// DELETE payment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    await db.payment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
