import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface Recommendation {
  id: string;
  type: 'frequently_bought' | 'seasonal' | 'trending' | 'customer_based' | 'similar';
  productId: string;
  productName: string;
  productImage: string | null;
  category: string;
  price: number;
  score: number;
  reason: string;
  metadata?: {
    relatedProducts?: string[];
    frequency?: number;
    seasonality?: string;
    customerSegment?: string;
  };
}

interface FrequentlyBoughtTogether {
  productId: string;
  productName: string;
  products: {
    id: string;
    name: string;
    frequency: number;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const type = searchParams.get('type') || 'all';

    // Get all products
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        orderItems: {
          include: {
            order: {
              include: {
                customer: true,
                orderItems: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Get orders for pattern analysis
    const orders = await db.order.findMany({
      where: {
        status: 'delivered',
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    const zai = await ZAI.create();
    const recommendations: Recommendation[] = [];

    // 1. Frequently Bought Together
    if (type === 'all' || type === 'frequently_bought') {
      const productPairs: Map<string, Map<string, number>> = new Map();
      
      orders.forEach(order => {
        const productIds = order.orderItems.map(item => item.productId);
        productIds.forEach(id1 => {
          productIds.forEach(id2 => {
            if (id1 !== id2) {
              if (!productPairs.has(id1)) {
                productPairs.set(id1, new Map());
              }
              const pairMap = productPairs.get(id1)!;
              pairMap.set(id2, (pairMap.get(id2) || 0) + 1);
            }
          });
        });
      });

      // Get top frequently bought together
      const frequentlyBoughtProducts: Recommendation[] = [];
      productPairs.forEach((pairs, mainProductId) => {
        const mainProduct = products.find(p => p.id === mainProductId);
        if (!mainProduct) return;

        const sortedPairs = Array.from(pairs.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);

        sortedPairs.forEach(([relatedProductId, frequency]) => {
          const relatedProduct = products.find(p => p.id === relatedProductId);
          if (relatedProduct && (!productId || relatedProductId === productId)) {
            frequentlyBoughtProducts.push({
              id: `fbt-${mainProductId}-${relatedProductId}`,
              type: 'frequently_bought',
              productId: relatedProductId,
              productName: relatedProduct.nameEn,
              productImage: relatedProduct.image,
              category: relatedProduct.category,
              price: relatedProduct.price,
              score: Math.min(0.95, 0.6 + (frequency / orders.length) * 2),
              reason: `Customers who bought ${mainProduct.nameEn} also bought this (${frequency} times together)`,
              metadata: {
                relatedProducts: [mainProduct.nameEn],
                frequency
              }
            });
          }
        });
      });

      recommendations.push(...frequentlyBoughtProducts.slice(0, 10));
    }

    // 2. Seasonal Products
    if (type === 'all' || type === 'seasonal') {
      const currentMonth = new Date().getMonth();
      const seasonalProducts = products.filter(p => {
        // Simulated seasonality logic
        if (p.category === 'sweets' && (currentMonth >= 9 || currentMonth <= 1)) return true; // Holiday season
        if (p.category === 'pastry' && currentMonth >= 3 && currentMonth <= 8) return true; // Spring/Summer
        return false;
      });

      seasonalProducts.forEach(product => {
        recommendations.push({
          id: `seasonal-${product.id}`,
          type: 'seasonal',
          productId: product.id,
          productName: product.nameEn,
          productImage: product.image,
          category: product.category,
          price: product.price,
          score: 0.85 + Math.random() * 0.1,
          reason: currentMonth >= 9 ? 'Perfect for holiday gatherings and celebrations' : 'Popular choice this season',
          metadata: {
            seasonality: currentMonth >= 9 ? 'Holiday Season' : 'Spring/Summer'
          }
        });
      });
    }

    // 3. Trending Products
    if (type === 'all' || type === 'trending') {
      // Calculate trending based on recent order velocity
      const productVelocity = products.map(product => {
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
        
        const recentCount = recentOrders.reduce((sum, item) => sum + item.quantity, 0);
        const previousCount = previousOrders.reduce((sum, item) => sum + item.quantity, 0);
        const velocity = previousCount > 0 ? (recentCount - previousCount) / previousCount : recentCount > 0 ? 1 : 0;
        
        return { product, velocity, recentCount };
      });

      const trendingProducts = productVelocity
        .filter(p => p.velocity > 0.2 && p.recentCount > 2)
        .sort((a, b) => b.velocity - a.velocity)
        .slice(0, 5);

      trendingProducts.forEach(({ product, velocity }) => {
        recommendations.push({
          id: `trending-${product.id}`,
          type: 'trending',
          productId: product.id,
          productName: product.nameEn,
          productImage: product.image,
          category: product.category,
          price: product.price,
          score: Math.min(0.95, 0.7 + velocity * 0.25),
          reason: `Trending now with ${Math.round(velocity * 100)}% increase in orders this week`,
          metadata: {
            frequency: Math.round(velocity * 100)
          }
        });
      });
    }

    // 4. Customer-Based Recommendations
    if (type === 'all' || type === 'customer_based') {
      if (customerId) {
        const customerOrders = orders.filter(o => o.customerId === customerId);
        const customerProducts = new Set(
          customerOrders.flatMap(o => o.orderItems.map(item => item.productId))
        );

        // Find similar customers
        const similarCustomers = orders.filter(o => {
          const orderProducts = new Set(o.orderItems.map(item => item.productId));
          const overlap = [...orderProducts].filter(id => customerProducts.has(id)).length;
          return overlap >= 2 && o.customerId !== customerId;
        });

        // Products bought by similar customers
        const similarCustomerProducts = new Map<string, number>();
        similarCustomers.forEach(order => {
          order.orderItems.forEach(item => {
            if (!customerProducts.has(item.productId)) {
              similarCustomerProducts.set(
                item.productId,
                (similarCustomerProducts.get(item.productId) || 0) + 1
              );
            }
          });
        });

        Array.from(similarCustomerProducts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([productId, count]) => {
            const product = products.find(p => p.id === productId);
            if (product) {
              recommendations.push({
                id: `customer-${customerId}-${productId}`,
                type: 'customer_based',
                productId,
                productName: product.nameEn,
                productImage: product.image,
                category: product.category,
                price: product.price,
                score: 0.75 + (count / similarCustomers.length) * 0.2,
                reason: `Customers with similar preferences ordered this ${count} times`,
                metadata: {
                  customerSegment: 'Similar taste profile'
                }
              });
            }
          });
      }
    }

    // 5. AI-Enhanced Recommendations
    try {
      const topProducts = products.slice(0, 5);
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a bakery recommendation expert. Suggest product pairings and recommendations.'
          },
          {
            role: 'user',
            content: `Based on these popular bakery products: ${topProducts.map(p => p.nameEn).join(', ')}. 
            Suggest the best product combination for a customer. Return as JSON: { "recommended": string, "reason": string, "pairing": string }`
          }
        ]
      });

      const aiSuggestion = completion.choices[0]?.message?.content;
      if (aiSuggestion) {
        // Add AI suggestion as metadata
        recommendations.forEach(rec => {
          if (rec.score > 0.85 && !rec.metadata?.aiSuggestion) {
            rec.metadata = {
              ...rec.metadata,
              aiSuggestion: aiSuggestion.slice(0, 150)
            };
          }
        });
      }
    } catch (error) {
      console.error('AI recommendation enhancement error:', error);
    }

    // Remove duplicates and sort by score
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(r => [r.productId + r.type, r])).values()
    ).sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      customerId,
      generatedAt: new Date().toISOString(),
      recommendations: uniqueRecommendations,
      summary: {
        total: uniqueRecommendations.length,
        byType: {
          frequently_bought: uniqueRecommendations.filter(r => r.type === 'frequently_bought').length,
          seasonal: uniqueRecommendations.filter(r => r.type === 'seasonal').length,
          trending: uniqueRecommendations.filter(r => r.type === 'trending').length,
          customer_based: uniqueRecommendations.filter(r => r.type === 'customer_based').length
        }
      }
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
