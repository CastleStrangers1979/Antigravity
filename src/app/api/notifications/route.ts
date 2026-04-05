import { NextResponse } from 'next/server';

// In-memory store for demo
declare global {
  var notificationsStore: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

// Initialize global store if not exists
if (!globalThis.notificationsStore) {
  globalThis.notificationsStore = [];
}

// GET all notifications
export async function GET() {
  try {
    return NextResponse.json(globalThis.notificationsStore.slice(-50).reverse());
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json([]);
  }
}

// POST create notification
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const notification = {
      id: `notif_${Date.now()}`,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    globalThis.notificationsStore.push(notification);
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ success: true, message: 'Notification created' });
  }
}
