import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all tracking data for active drivers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const orderId = searchParams.get('orderId');

    // If orderId is provided, get tracking for specific order
    if (orderId) {
      const tracks = await db.deliveryTrack.findMany({
        where: { orderId },
        include: {
          order: {
            include: {
              driver: { select: { id: true, name: true, phone: true } },
              customer: { select: { name: true, address: true, city: true, phone: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      // Transform to include driver at root level
      const transformedTracks = tracks.map(track => ({
        ...track,
        driver: track.order?.driver || null
      }));
      return NextResponse.json(transformedTracks);
    }

    // If driverId is provided, get tracking for specific driver
    if (driverId) {
      const driver = await db.driver.findUnique({
        where: { id: driverId },
        include: {
          orders: {
            where: { status: { in: ['confirmed', 'in_delivery'] } },
            include: {
              customer: true,
              orderItems: { include: { product: true } }
            }
          },
          driverLocations: {
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      });

      if (!driver) {
        return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
      }

      // Calculate ETA for each order
      const ordersWithETA = driver.orders.map(order => {
        // Simulate ETA calculation based on distance
        const baseETA = 15; // minutes
        const randomFactor = Math.random() * 20;
        const eta = Math.round(baseETA + randomFactor);

        return {
          ...order,
          estimatedArrival: eta,
          distance: (Math.random() * 10 + 1).toFixed(1) // km
        };
      });

      return NextResponse.json({
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          latitude: driver.latitude,
          longitude: driver.longitude,
          lastLocationUpdate: driver.lastLocationUpdate,
          isOnline: driver.isOnline,
          totalDeliveries: driver.totalDeliveries,
          rating: driver.rating
        },
        orders: ordersWithETA,
        locationHistory: driver.driverLocations
      });
    }

    // Get all active drivers with their locations
    const activeDrivers = await db.driver.findMany({
      where: { isActive: true },
      include: {
        orders: {
          where: { status: { in: ['confirmed', 'in_delivery'] } },
          include: {
            customer: { select: { name: true, address: true, city: true } }
          }
        },
        deliveryLine: true
      }
    });

    // Get recent delivery tracks
    const recentTracks = await db.deliveryTrack.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            driver: { select: { name: true } }
          }
        }
      }
    });
    // Transform to include driver at root level
    const transformedRecentTracks = recentTracks.map(track => ({
      ...track,
      driver: track.order?.driver || null
    }));

    // Calculate traffic conditions (simulated)
    const trafficConditions = [
      { area: 'Central Amsterdam', status: 'heavy', delay: 15 },
      { area: 'South District', status: 'moderate', delay: 8 },
      { area: 'North Region', status: 'light', delay: 2 },
    ];

    // Calculate delivery analytics
    const totalActiveDeliveries = activeDrivers.reduce((sum, d) => sum + d.orders.length, 0);
    const averageETA = 22; // minutes (simulated)

    return NextResponse.json({
      activeDrivers: activeDrivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        latitude: driver.latitude || 52.3676,
        longitude: driver.longitude || 4.9041,
        lastLocationUpdate: driver.lastLocationUpdate,
        isOnline: driver.isOnline,
        deliveryLine: driver.deliveryLine,
        activeOrdersCount: driver.orders.length,
        orders: driver.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          customer: order.customer,
          estimatedArrival: Math.round(15 + Math.random() * 20),
          distance: (Math.random() * 10 + 1).toFixed(1)
        }))
      })),
      recentTracks: transformedRecentTracks,
      trafficConditions,
      summary: {
        totalActiveDrivers: activeDrivers.length,
        totalActiveDeliveries,
        averageETA,
        onlineDrivers: activeDrivers.filter(d => d.isOnline).length
      }
    });

  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update driver location or create delivery track
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, driverId, orderId, latitude, longitude, status, notes, photo, signature, battery, speed, heading } = body;

    if (type === 'location_update' && driverId) {
      // Update driver location
      const updatedDriver = await db.driver.update({
        where: { id: driverId },
        data: {
          latitude,
          longitude,
          currentLocation: `${latitude}, ${longitude}`,
          lastLocationUpdate: new Date(),
          isOnline: true
        }
      });

      // Save location history
      await db.driverLocation.create({
        data: {
          driverId,
          latitude,
          longitude,
          battery,
          speed,
          heading
        }
      });

      return NextResponse.json({ success: true, driver: updatedDriver });
    }

    if (type === 'delivery_track' && orderId) {
      // Create delivery track entry
      const track = await db.deliveryTrack.create({
        data: {
          orderId,
          driverId,
          status,
          latitude,
          longitude,
          notes,
          photo,
          signature
        }
      });

      // Update order status if delivered
      if (status === 'delivered') {
        await db.order.update({
          where: { id: orderId },
          data: {
            status: 'delivered',
            deliveredAt: new Date(),
            signatureImage: signature
          }
        });

        // Update driver stats
        if (driverId) {
          await db.driver.update({
            where: { id: driverId },
            data: {
              totalDeliveries: { increment: 1 },
              completedToday: { increment: 1 }
            }
          });
        }
      }

      return NextResponse.json({ success: true, track });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
