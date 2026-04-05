import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Channel type definition
type Channel = 'sms' | 'email' | 'whatsapp' | 'push';

// Request body for sending notification
interface SendNotificationRequest {
  type: string;
  title: string;
  message: string;
  customerId?: string;
  driverId?: string;
  orderId?: string;
  channels?: Channel[];
}

// GET - Get sent notifications with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const driverId = searchParams.get('driverId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');
    const isSent = searchParams.get('isSent');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    if (customerId) where.customerId = customerId;
    if (driverId) where.driverId = driverId;
    if (orderId) where.orderId = orderId;
    if (type) where.type = type;
    if (isSent !== null) where.isSent = isSent === 'true';

    const notifications = await db.notification.findMany({
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
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await db.notification.count({ where });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching sent notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Send a new notification
export async function POST(request: Request) {
  try {
    const body: SendNotificationRequest = await request.json();
    const { type, title, message, customerId, driverId, orderId, channels } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    // Validate customer exists if provided
    if (customerId) {
      const customer = await db.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }
    }

    // Validate driver exists if provided
    if (driverId) {
      const driver = await db.driver.findUnique({
        where: { id: driverId },
      });
      if (!driver) {
        return NextResponse.json(
          { success: false, error: 'Driver not found' },
          { status: 404 }
        );
      }
    }

    // Validate order exists if provided
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    // Default channels if not provided
    const notificationChannels = channels || ['push'];
    const channelsString = JSON.stringify(notificationChannels);

    // Create notification record
    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        customerId: customerId || null,
        driverId: driverId || null,
        orderId: orderId || null,
        channels: channelsString,
        isSent: false,
        isRead: false,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    // Simulate sending through different channels
    const sendResults: Record<Channel, { sent: boolean; error?: string }> = {
      sms: { sent: false },
      email: { sent: false },
      whatsapp: { sent: false },
      push: { sent: false },
    };

    // Process each channel
    for (const channel of notificationChannels) {
      try {
        switch (channel) {
          case 'sms':
            // Simulate SMS sending
            // In production, integrate with SMS provider (e.g., Twilio)
            console.log(`[SMS] Sending to: ${notification.customer?.phone || notification.driver?.phone}`);
            sendResults.sms = { sent: true };
            break;

          case 'email':
            // Simulate Email sending
            // In production, integrate with email provider (e.g., SendGrid, Mailgun)
            console.log(`[Email] Sending to: ${notification.customer?.email || notification.driver?.email}`);
            sendResults.email = { sent: true };
            break;

          case 'whatsapp':
            // Simulate WhatsApp sending
            // In production, integrate with WhatsApp Business API
            console.log(`[WhatsApp] Sending to: ${notification.customer?.phone || notification.driver?.phone}`);
            sendResults.whatsapp = { sent: true };
            break;

          case 'push':
            // Simulate Push notification
            // In production, integrate with FCM/APNs
            console.log(`[Push] Sending notification: ${title}`);
            sendResults.push = { sent: true };
            break;
        }
      } catch (channelError) {
        sendResults[channel] = { sent: false, error: String(channelError) };
      }
    }

    // Check if at least one channel succeeded
    const anySent = notificationChannels.some(ch => sendResults[ch]?.sent);

    // Update notification status
    const updatedNotification = await db.notification.update({
      where: { id: notification.id },
      data: {
        isSent: anySent,
        sentAt: anySent ? new Date() : null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      sendResults,
      message: anySent
        ? 'Notification sent successfully'
        : 'Notification created but failed to send through any channel',
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
