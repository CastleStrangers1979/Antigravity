import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  actions: string[];
  metrics?: {
    current?: number;
    predicted?: number;
    change?: number;
  };
  createdAt: string;
}

export async function GET() {
  try {
    const zai = await ZAI.create();
    const insights: Insight[] = [];

    // Get data for insights generation
    const products = await db.product.findMany({
      where: { isActive: true },
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

    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        orderItems: true
      }
    });

    const customers = await db.customer.count();
    const drivers = await db.driver.count();

    // 1. Product Performance Insights
    const productPerformance = products.map(p => ({
      name: p.nameEn,
      category: p.category,
      sold: p.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      revenue: p.orderItems.reduce((sum, item) => sum + item.total, 0),
      stock: p.stock
    }));

    const topProducts = productPerformance.sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    const lowPerformers = productPerformance.filter(p => p.sold < 5 && p.stock > 20);

    insights.push({
      id: 'insight-top-products',
      type: 'performance',
      title: 'Top Performing Products',
      description: `${topProducts.map(p => p.name).join(', ')} are your best sellers this month`,
      impact: 'high',
      category: 'Sales',
      actionable: true,
      actions: [
        'Increase production for top products',
        'Feature prominently in marketing',
        'Ensure adequate stock levels'
      ],
      metrics: {
        current: topProducts.reduce((sum, p) => sum + p.revenue, 0),
        predicted: topProducts.reduce((sum, p) => sum + p.revenue, 0) * 1.15
      },
      createdAt: new Date().toISOString()
    });

    if (lowPerformers.length > 0) {
      insights.push({
        id: 'insight-low-performers',
        type: 'warning',
        title: 'Underperforming Products',
        description: `${lowPerformers.length} products have low sales but high stock`,
        impact: 'medium',
        category: 'Inventory',
        actionable: true,
        actions: [
          'Consider promotional pricing',
          'Review product positioning',
          'Evaluate product continuation'
        ],
        metrics: {
          current: lowPerformers.length
        },
        createdAt: new Date().toISOString()
      });
    }

    // 2. Revenue Insights
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = totalRevenue / Math.max(orders.length, 1);

    insights.push({
      id: 'insight-revenue-trend',
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: `Average order value is €${avgOrderValue.toFixed(2)}. Opportunity to increase through upselling.`,
      impact: 'high',
      category: 'Revenue',
      actionable: true,
      actions: [
        'Implement product bundles',
        'Train staff on upselling techniques',
        'Create minimum order incentives'
      ],
      metrics: {
        current: avgOrderValue,
        predicted: avgOrderValue * 1.2,
        change: 20
      },
      createdAt: new Date().toISOString()
    });

    // 3. Delivery Insights
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const inDelivery = orders.filter(o => o.status === 'in_delivery').length;

    if (pendingOrders > 10) {
      insights.push({
        id: 'insight-delivery-backlog',
        type: 'warning',
        title: 'Order Processing Backlog',
        description: `${pendingOrders} orders pending processing. Consider optimizing workflow.`,
        impact: 'high',
        category: 'Operations',
        actionable: true,
        actions: [
          'Assign additional drivers',
          'Prioritize high-value orders',
          'Review processing bottlenecks'
        ],
        metrics: {
          current: pendingOrders
        },
        createdAt: new Date().toISOString()
      });
    }

    // 4. Customer Insights
    if (customers > 50) {
      insights.push({
        id: 'insight-customer-base',
        type: 'opportunity',
        title: 'Growing Customer Base',
        description: `${customers} active customers. Focus on retention strategies.`,
        impact: 'medium',
        category: 'Customers',
        actionable: true,
        actions: [
          'Implement loyalty program',
          'Send personalized offers',
          'Request customer feedback'
        ],
        metrics: {
          current: customers
        },
        createdAt: new Date().toISOString()
      });
    }

    // 5. Stock Insights
    const lowStockProducts = products.filter(p => p.stock < p.minStock);
    if (lowStockProducts.length > 0) {
      insights.push({
        id: 'insight-stock-alert',
        type: 'warning',
        title: 'Low Stock Alert',
        description: `${lowStockProducts.length} products below minimum stock level`,
        impact: 'high',
        category: 'Inventory',
        actionable: true,
        actions: [
          'Reorder immediately',
          'Review demand forecasts',
          'Adjust minimum stock levels'
        ],
        metrics: {
          current: lowStockProducts.length
        },
        createdAt: new Date().toISOString()
      });
    }

    // 6. AI-Generated Insights
    try {
      const summaryData = {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: orders.length,
        topProduct: topProducts[0]?.name || 'N/A',
        avgOrderValue: avgOrderValue.toFixed(2)
      };

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence expert for a Syrian bakery in the Netherlands. Generate actionable insights.'
          },
          {
            role: 'user',
            content: `Analyze this bakery data and provide ONE strategic insight with a recommendation:
            Revenue: €${summaryData.totalRevenue}
            Orders: ${summaryData.totalOrders}
            Top Product: ${summaryData.topProduct}
            Avg Order: €${summaryData.avgOrderValue}
            
            Return JSON: { "insight": string, "recommendation": string, "expectedImpact": string }`
          }
        ]
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          insights.push({
            id: 'insight-ai-strategic',
            type: 'recommendation',
            title: 'AI Strategic Insight',
            description: parsed.insight,
            impact: 'high',
            category: 'Strategy',
            actionable: true,
            actions: [parsed.recommendation],
            metrics: {
              change: parseInt(parsed.expectedImpact) || 15
            },
            createdAt: new Date().toISOString()
          });
        } catch {
          // If not JSON, add as plain text
          insights.push({
            id: 'insight-ai-strategic',
            type: 'recommendation',
            title: 'AI Analysis',
            description: aiResponse.slice(0, 200),
            impact: 'medium',
            category: 'Strategy',
            actionable: true,
            actions: ['Review AI recommendation'],
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('AI insight generation error:', error);
    }

    // Sort by impact
    const impactOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      insights,
      summary: {
        total: insights.length,
        byImpact: {
          high: insights.filter(i => i.impact === 'high').length,
          medium: insights.filter(i => i.impact === 'medium').length,
          low: insights.filter(i => i.impact === 'low').length
        },
        byCategory: {
          Sales: insights.filter(i => i.category === 'Sales').length,
          Inventory: insights.filter(i => i.category === 'Inventory').length,
          Revenue: insights.filter(i => i.category === 'Revenue').length,
          Operations: insights.filter(i => i.category === 'Operations').length,
          Customers: insights.filter(i => i.category === 'Customers').length,
          Strategy: insights.filter(i => i.category === 'Strategy').length
        }
      }
    });

  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
