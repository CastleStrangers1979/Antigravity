import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all campaigns with statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const type = searchParams.get('type');

    const where: any = {};
    if (activeOnly) where.isActive = true;
    if (type) where.type = type;

    const campaigns = await db.campaign.findMany({
      where,
      include: {
        _count: {
          select: { campaignCustomers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate aggregate statistics
    const statistics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.isActive).length,
      totalSent: campaigns.reduce((sum, c) => sum + c.totalSent, 0),
      totalOpened: campaigns.reduce((sum, c) => sum + c.totalOpened, 0),
      totalClicked: campaigns.reduce((sum, c) => sum + c.totalClicked, 0),
      totalConverted: campaigns.reduce((sum, c) => sum + c.totalConverted, 0),
    };

    // Add calculated metrics to each campaign
    const campaignsMetrics = campaigns.map((campaign) => ({
      ...campaign,
      recipientsCount: campaign._count.campaignCustomers,
      openRate: campaign.totalSent > 0 
        ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(2) 
        : '0.00',
      clickRate: campaign.totalSent > 0 
        ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(2) 
        : '0.00',
      conversionRate: campaign.totalSent > 0 
        ? ((campaign.totalConverted / campaign.totalSent) * 100).toFixed(2) 
        : '0.00',
    }));

    return NextResponse.json({
      campaigns: campaignsMetrics,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      targetSegment,
      discountPercent,
      discountAmount,
      pointsBonus,
      startDate,
      endDate,
      isActive = true,
    } = body;

    // Validate required fields
    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate campaign type
    const validTypes = ['discount', 'points', 'free_delivery', 'product'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid campaign type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const campaign = await db.campaign.create({
      data: {
        name,
        description: description || null,
        type,
        targetSegment: targetSegment || null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        discountAmount: discountAmount ? parseFloat(discountAmount) : null,
        pointsBonus: pointsBonus ? parseInt(pointsBonus) : null,
        startDate: start,
        endDate: end,
        isActive,
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalConverted: 0,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

// PUT - Update campaign (activate/deactivate or update details)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      type,
      targetSegment,
      discountPercent,
      discountAmount,
      pointsBonus,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const existingCampaign = await db.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (type !== undefined) updateData.type = type;
    if (targetSegment !== undefined) updateData.targetSegment = targetSegment || null;
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent ? parseFloat(discountPercent) : null;
    if (discountAmount !== undefined) updateData.discountAmount = discountAmount ? parseFloat(discountAmount) : null;
    if (pointsBonus !== undefined) updateData.pointsBonus = pointsBonus ? parseInt(pointsBonus) : null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Validate dates if both are being updated
    const finalStart = updateData.startDate || existingCampaign.startDate;
    const finalEnd = updateData.endDate || existingCampaign.endDate;
    if (finalEnd < finalStart) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const updatedCampaign = await db.campaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
