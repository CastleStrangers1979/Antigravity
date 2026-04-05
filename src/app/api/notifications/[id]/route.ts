import { NextResponse } from 'next/server';

// In-memory store for demo (shared with main route)
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

// PUT mark notification as read
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notification = globalThis.notificationsStore.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: true });
  }
}

// DELETE notification
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    globalThis.notificationsStore = globalThis.notificationsStore.filter(n => n.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ success: true });
  }
}
