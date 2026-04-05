import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a unique referral code
function generateReferralCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

// GET - List all referrals with statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const referrals = await db.referral.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        referralTransactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const statistics = {
      totalReferrals: referrals.length,
      pending: referrals.filter((r) => r.status === 'pending').length,
      registered: referrals.filter((r) => r.status === 'registered').length,
      completed: referrals.filter((r) => r.status === 'completed').length,
      rewarded: referrals.filter((r) => r.status === 'rewarded').length,
      totalPointsAwarded: referrals.reduce((sum, r) => sum + r.pointsEarned, 0),
      conversionRate: referrals.length > 0
        ? ((referrals.filter((r) => r.status === 'completed' || r.status === 'rewarded').length / referrals.length) * 100).toFixed(1)
        : '0',
    };

    // Top referrers
    const referrerCounts = new Map<string, { count: number; points: number; customer: any }>();
    for (const referral of referrals) {
      const existing = referrerCounts.get(referral.customerId) || { count: 0, points: 0, customer: referral.customer };
      existing.count++;
      existing.points += referral.pointsEarned;
      referrerCounts.set(referral.customerId, existing);
    }

    const topReferrers = Array.from(referrerCounts.entries())
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 5)
      .map(([id, data]) => ({
        customerId: id,
        customer: data.customer,
        referralCount: data.count,
        totalPoints: data.points,
      }));

    return NextResponse.json({
      referrals,
      statistics,
      topReferrers,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

// POST - Create a new referral code or register a referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, customerId, referralCode, referredData } = body;

    // Action: Generate referral code for customer
    if (action === 'generateCode') {
      if (!customerId) {
        return NextResponse.json(
          { error: 'Customer ID is required' },
          { status: 400 }
        );
      }

      const customer = await db.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      // Check if customer already has a referral code
      if (customer.referralCode) {
        return NextResponse.json({
          referralCode: customer.referralCode,
          message: 'Customer already has a referral code',
        });
      }

      // Generate unique referral code
      let code = generateReferralCode(customer.name);
      let existingCode = await db.referral.findUnique({ where: { code } });
      
      while (existingCode) {
        code = generateReferralCode(customer.name);
        existingCode = await db.referral.findUnique({ where: { code } });
      }

      // Create referral record
      const referral = await db.referral.create({
        data: {
          code,
          customerId,
          status: 'pending',
        },
      });

      // Update customer with referral code
      await db.customer.update({
        where: { id: customerId },
        data: { referralCode: code },
      });

      return NextResponse.json({
        referralCode: code,
        referral,
      });
    }

    // Action: Register a referral (when someone uses a code)
    if (action === 'registerReferral') {
      if (!referralCode) {
        return NextResponse.json(
          { error: 'Referral code is required' },
          { status: 400 }
        );
      }

      const referral = await db.referral.findUnique({
        where: { code: referralCode },
        include: { customer: true },
      });

      if (!referral) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
      }

      // Update referral with new registration data
      const updatedReferral = await db.referral.update({
        where: { id: referral.id },
        data: {
          status: 'registered',
          referredEmail: referredData?.email || null,
          referredPhone: referredData?.phone || null,
          referredName: referredData?.name || null,
        },
      });

      return NextResponse.json(updatedReferral);
    }

    // Action: Complete a referral (award points)
    if (action === 'completeReferral') {
      const { referralId, referredCustomerId, points = 100 } = body;

      if (!referralId) {
        return NextResponse.json(
          { error: 'Referral ID is required' },
          { status: 400 }
        );
      }

      const referral = await db.referral.findUnique({
        where: { id: referralId },
        include: { customer: true },
      });

      if (!referral) {
        return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
      }

      // Award points to referrer
      await db.$transaction([
        // Create referral transaction
        db.referralTransaction.create({
          data: {
            referralId: referral.id,
            type: 'referral_bonus',
            points,
            description: `Referral bonus for referring ${referredData?.name || 'new customer'}`,
          },
        }),
        // Update referral status
        db.referral.update({
          where: { id: referral.id },
          data: {
            status: 'completed',
            pointsEarned: points,
            referredCustomerId: referredCustomerId || null,
            completedAt: new Date(),
          },
        }),
        // Update referrer's loyalty points
        db.customer.update({
          where: { id: referral.customerId },
          data: {
            loyaltyPoints: { increment: points },
          },
        }),
        // Create loyalty transaction
        db.loyaltyTransaction.create({
          data: {
            customerId: referral.customerId,
            points,
            type: 'earned',
            description: `Referral bonus - ${referral.code}`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Awarded ${points} points to ${referral.customer.name}`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing referral:', error);
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    );
  }
}

// PUT - Update referral status or settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralId, status, pointsEarned, rewardAmount } = body;

    if (!referralId) {
      return NextResponse.json(
        { error: 'Referral ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (pointsEarned !== undefined) updateData.pointsEarned = pointsEarned;
    if (rewardAmount !== undefined) updateData.rewardAmount = rewardAmount;

    const updatedReferral = await db.referral.update({
      where: { id: referralId },
      data: updateData,
    });

    return NextResponse.json(updatedReferral);
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    );
  }
}
