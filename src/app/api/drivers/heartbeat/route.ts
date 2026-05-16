import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, status, lat, lng, timestamp } = body;

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });
    }

    // Update driver's last location and status
    await db.driver.update({
      where: { id: driverId },
      data: {
        isOnline: status === 'online',
        latitude: lat,
        longitude: lng,
        lastLocationUpdate: new Date(),
      }
    });

    // If status is 'app_closed', create a critical alert
    if (status === 'app_closed') {
      await db.activityLog.create({
        data: {
          userId: driverId,
          userType: 'driver',
          action: 'TRACKING_EVASION_DETECTED',
          entity: 'Driver',
          entityId: driverId,
          details: `Driver app closed intentionally at ${timestamp || new Date().toISOString()}. Potential tracking evasion.`
        }
      });

      // Here you would also trigger a push notification to managers
      console.log(`[ALERT] Tracking Evasion Detected for Driver ${driverId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
