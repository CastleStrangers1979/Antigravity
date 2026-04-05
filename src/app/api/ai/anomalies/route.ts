import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface Anomaly {
  id: string;
  type: 'order' | 'inventory' | 'delivery' | 'payment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityId: string;
  entityType: string;
  title: string;
  description: string;
  score: number;
  detectedAt: string;
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  metadata?: {
    value?: number;
    expectedValue?: number;
    deviation?: number;
    orderNumber?: string;
    productName?: string;
    driverName?: string;
    [key: string]: unknown;
  };
  suggestedAction?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const severity = searchParams.get('severity') || 'all';
    const status = searchParams.get('status') || 'all';

    const zai = await ZAI.create();
    const anomalies: Anomaly[] = [];

    // 1. Order Anomalies
    if (type === 'all' || type === 'order') {
      const orders = await db.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          orderItems: true,
          customer: true
        }
      });

      // Calculate average order value
      const avgOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0) / Math.max(orders.length, 1);
      const stdDev = Math.sqrt(
        orders.reduce((sum, o) => sum + Math.pow(o.totalAmount - avgOrderValue, 2), 0) / Math.max(orders.length, 1)
      );

      // Find high value orders (anomaly if > 2 std deviations)
      orders.forEach(order => {
        const deviation = (order.totalAmount - avgOrderValue) / stdDev;
        
        if (deviation > 2) {
          anomalies.push({
            id: `order-high-${order.id}`,
            type: 'order',
            severity: deviation > 3 ? 'critical' : deviation > 2.5 ? 'high' : 'medium',
            entityId: order.id,
            entityType: 'Order',
            title: `High Value Order Detected`,
            description: `Order ${order.orderNumber} has unusually high value of €${order.totalAmount.toFixed(2)}`,
            score: Math.min(1, deviation / 4),
            detectedAt: order.createdAt.toISOString(),
            status: 'new',
            metadata: {
              value: order.totalAmount,
              expectedValue: avgOrderValue,
              deviation: Math.round(deviation * 100),
              orderNumber: order.orderNumber
            },
            suggestedAction: 'Review order for potential fraud or special customer'
          });
        }

        // Check for unusual quantity patterns
        const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const avgQuantity = orders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0) / Math.max(orders.length, 1);
        
        if (totalQuantity > avgQuantity * 3) {
          anomalies.push({
            id: `order-qty-${order.id}`,
            type: 'order',
            severity: 'medium',
            entityId: order.id,
            entityType: 'Order',
            title: `Unusual Order Quantity`,
            description: `Order ${order.orderNumber} contains ${totalQuantity} items, significantly above average`,
            score: 0.7,
            detectedAt: order.createdAt.toISOString(),
            status: 'new',
            metadata: {
              value: totalQuantity,
              expectedValue: avgQuantity,
              deviation: Math.round(((totalQuantity - avgQuantity) / avgQuantity) * 100),
              orderNumber: order.orderNumber
            },
            suggestedAction: 'Verify customer intent and delivery capacity'
          });
        }
      });

      // Check for cancelled order patterns
      const cancelledOrders = orders.filter(o => o.status === 'cancelled');
      const cancellationRate = cancelledOrders.length / Math.max(orders.length, 1);
      
      if (cancellationRate > 0.15) {
        anomalies.push({
          id: 'order-cancellation-pattern',
          type: 'order',
          severity: 'medium',
          entityId: 'system',
          entityType: 'System',
          title: 'High Cancellation Rate',
          description: `Cancellation rate of ${(cancellationRate * 100).toFixed(1)}% is above normal threshold`,
          score: 0.65,
          detectedAt: new Date().toISOString(),
          status: 'new',
          metadata: {
            value: cancelledOrders.length,
            expectedValue: Math.round(orders.length * 0.1),
            deviation: Math.round((cancellationRate - 0.1) * 100)
          },
          suggestedAction: 'Investigate cancellation reasons and customer feedback'
        });
      }
    }

    // 2. Inventory Anomalies
    if (type === 'all' || type === 'inventory') {
      const products = await db.product.findMany({
        include: {
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }
      });

      products.forEach(product => {
        // Low stock alert
        if (product.stock < product.minStock) {
          anomalies.push({
            id: `inv-low-${product.id}`,
            type: 'inventory',
            severity: product.stock === 0 ? 'critical' : product.stock < product.minStock / 2 ? 'high' : 'medium',
            entityId: product.id,
            entityType: 'Product',
            title: `Low Stock Alert: ${product.nameEn}`,
            description: `${product.nameEn} stock is at ${product.stock} units (minimum: ${product.minStock})`,
            score: 0.8 + (1 - product.stock / product.minStock) * 0.15,
            detectedAt: new Date().toISOString(),
            status: 'new',
            metadata: {
              value: product.stock,
              expectedValue: product.minStock,
              deviation: Math.round(((product.minStock - product.stock) / product.minStock) * 100),
              productName: product.nameEn
            },
            suggestedAction: 'Reorder product immediately'
          });
        }

        // Overstock alert
        if (product.maxStock && product.stock > product.maxStock) {
          anomalies.push({
            id: `inv-over-${product.id}`,
            type: 'inventory',
            severity: 'low',
            entityId: product.id,
            entityType: 'Product',
            title: `Overstock: ${product.nameEn}`,
            description: `${product.nameEn} stock (${product.stock}) exceeds maximum (${product.maxStock})`,
            score: 0.5,
            detectedAt: new Date().toISOString(),
            status: 'new',
            metadata: {
              value: product.stock,
              expectedValue: product.maxStock,
              deviation: Math.round(((product.stock - product.maxStock) / product.maxStock) * 100),
              productName: product.nameEn
            },
            suggestedAction: 'Consider promotional pricing to reduce inventory'
          });
        }

        // Sudden demand spike detection
        const recentOrders = product.orderItems.filter(
          item => new Date(item.order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const previousOrders = product.orderItems.filter(
          item => {
            const date = new Date(item.order.createdAt);
            return date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
                   date <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          }
        );

        const recentQty = recentOrders.reduce((sum, item) => sum + item.quantity, 0);
        const previousQty = previousOrders.reduce((sum, item) => sum + item.quantity, 0);

        if (previousQty > 0 && recentQty > previousQty * 2.5) {
          anomalies.push({
            id: `inv-demand-${product.id}`,
            type: 'inventory',
            severity: 'high',
            entityId: product.id,
            entityType: 'Product',
            title: `Demand Spike: ${product.nameEn}`,
            description: `${product.nameEn} demand increased by ${Math.round(((recentQty - previousQty) / previousQty) * 100)}% this week`,
            score: 0.75,
            detectedAt: new Date().toISOString(),
            status: 'new',
            metadata: {
              value: recentQty,
              expectedValue: previousQty,
              deviation: Math.round(((recentQty - previousQty) / previousQty) * 100),
              productName: product.nameEn
            },
            suggestedAction: 'Increase production and verify stock levels'
          });
        }
      });
    }

    // 3. Delivery Anomalies
    if (type === 'all' || type === 'delivery') {
      const drivers = await db.driver.findMany({
        include: {
          orders: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      });

      // Calculate average deliveries per driver
      const avgDeliveries = drivers.reduce((sum, d) => sum + d.orders.length, 0) / Math.max(drivers.length, 1);

      drivers.forEach(driver => {
        // Driver overload
        if (driver.orders.length > avgDeliveries * 1.5) {
          anomalies.push({
            id: `delivery-overload-${driver.id}`,
            type: 'delivery',
            severity: 'medium',
            entityId: driver.id,
            entityType: 'Driver',
            title: `Driver Overload: ${driver.name}`,
            description: `${driver.name} has ${driver.orders.length} deliveries vs average ${Math.round(avgDeliveries)}`,
            score: 0.65,
            detectedAt: new Date().toISOString(),
            status: 'new',
            metadata: {
              value: driver.orders.length,
              expectedValue: Math.round(avgDeliveries),
              deviation: Math.round(((driver.orders.length - avgDeliveries) / avgDeliveries) * 100),
              driverName: driver.name
            },
            suggestedAction: 'Redistribute deliveries to other drivers'
          });
        }

        // Driver underperformance
        if (driver.orders.length < avgDeliveries * 0.3 && avgDeliveries > 5) {
          anomalies.push({
            id: `delivery-under-${driver.id}`,
            type: 'delivery',
            severity: 'low',
            entityId: driver.id,
            entityType: 'Driver',
            title: `Low Delivery Activity: ${driver.name}`,
            description: `${driver.name} has only ${driver.orders.length} deliveries this week`,
            score: 0.5,
            detectedAt: new Date().toISOString(),
            status: 'new',
            metadata: {
              value: driver.orders.length,
              expectedValue: Math.round(avgDeliveries),
              deviation: Math.round(((avgDeliveries - driver.orders.length) / avgDeliveries) * 100),
              driverName: driver.name
            },
            suggestedAction: 'Check driver availability and route assignment'
          });
        }
      });
    }

    // 4. Payment Anomalies
    if (type === 'all' || type === 'payment') {
      const payments = await db.payment.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Check for unusual payment patterns
      const failedPayments = payments.filter(p => p.status === 'failed');
      const failedRate = failedPayments.length / Math.max(payments.length, 1);

      if (failedRate > 0.05) {
        anomalies.push({
          id: 'payment-failed-pattern',
          type: 'payment',
          severity: 'medium',
          entityId: 'system',
          entityType: 'System',
          title: 'High Payment Failure Rate',
          description: `${(failedRate * 100).toFixed(1)}% of payments are failing`,
          score: 0.7,
          detectedAt: new Date().toISOString(),
          status: 'new',
          metadata: {
            value: failedPayments.length,
            expectedValue: Math.round(payments.length * 0.02),
            deviation: Math.round((failedRate - 0.02) * 100)
          },
          suggestedAction: 'Review payment gateway and customer payment methods'
        });
      }

      // Check for refund patterns
      const refunds = payments.filter(p => p.refundedAmount && p.refundedAmount > 0);
      const refundRate = refunds.length / Math.max(payments.length, 1);

      if (refundRate > 0.1) {
        anomalies.push({
          id: 'payment-refund-pattern',
          type: 'payment',
          severity: 'medium',
          entityId: 'system',
          entityType: 'System',
          title: 'High Refund Rate',
          description: `${(refundRate * 100).toFixed(1)}% of orders have refunds`,
          score: 0.6,
          detectedAt: new Date().toISOString(),
          status: 'new',
          metadata: {
            value: refunds.length,
            expectedValue: Math.round(payments.length * 0.05),
            deviation: Math.round((refundRate - 0.05) * 100)
          },
          suggestedAction: 'Analyze refund reasons and improve quality control'
        });
      }
    }

    // 5. AI-Enhanced Anomaly Detection
    try {
      const anomalySummary = anomalies.slice(0, 5).map(a => ({
        type: a.type,
        title: a.title,
        score: a.score
      }));

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an anomaly detection expert for bakery operations. Analyze patterns and suggest insights.'
          },
          {
            role: 'user',
            content: `Analyze these detected anomalies in a bakery system: ${JSON.stringify(anomalySummary)}. 
            Identify if there are any patterns or correlations. Return JSON: { "pattern": string, "recommendation": string }`
          }
        ]
      });

      const aiInsight = completion.choices[0]?.message?.content;
      if (aiInsight) {
        // Add AI insight to the first high severity anomaly
        const highSeverityIndex = anomalies.findIndex(a => a.severity === 'high' || a.severity === 'critical');
        if (highSeverityIndex >= 0) {
          anomalies[highSeverityIndex].suggestedAction = aiInsight.slice(0, 200);
        }
      }
    } catch (error) {
      console.error('AI anomaly analysis error:', error);
    }

    // Filter by severity and status
    const filteredAnomalies = anomalies.filter(a => {
      if (severity !== 'all' && a.severity !== severity) return false;
      if (status !== 'all' && a.status !== status) return false;
      return true;
    });

    // Sort by score (highest first)
    filteredAnomalies.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      anomalies: filteredAnomalies,
      summary: {
        total: filteredAnomalies.length,
        byType: {
          order: filteredAnomalies.filter(a => a.type === 'order').length,
          inventory: filteredAnomalies.filter(a => a.type === 'inventory').length,
          delivery: filteredAnomalies.filter(a => a.type === 'delivery').length,
          payment: filteredAnomalies.filter(a => a.type === 'payment').length
        },
        bySeverity: {
          critical: filteredAnomalies.filter(a => a.severity === 'critical').length,
          high: filteredAnomalies.filter(a => a.severity === 'high').length,
          medium: filteredAnomalies.filter(a => a.severity === 'medium').length,
          low: filteredAnomalies.filter(a => a.severity === 'low').length
        },
        byStatus: {
          new: filteredAnomalies.filter(a => a.status === 'new').length,
          investigating: filteredAnomalies.filter(a => a.status === 'investigating').length,
          resolved: filteredAnomalies.filter(a => a.status === 'resolved').length,
          ignored: filteredAnomalies.filter(a => a.status === 'ignored').length
        }
      }
    });

  } catch (error) {
    console.error('Anomalies API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect anomalies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { anomalyId, status, notes } = body;

    // In a real system, this would update the AnomalyLog model
    // For now, we just return success

    return NextResponse.json({
      success: true,
      message: 'Anomaly status updated',
      anomalyId,
      status,
      notes,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Anomaly update error:', error);
    return NextResponse.json(
      { error: 'Failed to update anomaly status' },
      { status: 500 }
    );
  }
}
