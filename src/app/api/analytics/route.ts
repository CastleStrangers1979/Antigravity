import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// GET comprehensive analytics data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'week';
  const includePredictions = searchParams.get('predictions') === 'true';
  
  try {
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        previousStartDate.setDate(now.getDate() - 2);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
    }

    // ==================== REVENUE ANALYTICS ====================
    const orders = await db.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        orderItems: { include: { product: true } },
        customer: true,
        deliveryLine: true,
        driver: true,
      },
    });

    const previousOrders = await db.order.findMany({
      where: { 
        createdAt: { 
          gte: previousStartDate,
          lt: startDate 
        } 
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Revenue by category
    const revenueByCategory: Record<string, number> = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const category = item.product.category;
        revenueByCategory[category] = (revenueByCategory[category] || 0) + item.total;
      });
    });

    // Daily/Weekly/Monthly revenue trends
    const revenueTrends: Record<string, { date: string; revenue: number; orders: number }> = {};
    orders.forEach(order => {
      const dateKey = period === 'year' 
        ? order.createdAt.toISOString().slice(0, 7) // YYYY-MM for monthly grouping
        : order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD for daily
      
      if (!revenueTrends[dateKey]) {
        revenueTrends[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      }
      revenueTrends[dateKey].revenue += order.totalAmount;
      revenueTrends[dateKey].orders += 1;
    });

    const salesChart = Object.values(revenueTrends).sort((a, b) => a.date.localeCompare(b.date));

    // ==================== ORDER ANALYTICS ====================
    const totalOrders = orders.length;
    const previousTotalOrders = previousOrders.length;
    const orderChange = previousTotalOrders > 0 ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100 : 0;

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      in_delivery: orders.filter(o => o.status === 'in_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    // Peak hours analysis
    const hourlyOrders: Record<number, number> = {};
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourlyOrders)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const previousAvgOrderValue = previousTotalOrders > 0 ? previousRevenue / previousTotalOrders : 0;
    const avgOrderValueChange = previousAvgOrderValue > 0 
      ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 
      : 0;

    // Order volume trends by day of week
    const dailyVolume: Record<number, { day: string; count: number }> = {
      0: { day: 'Sunday', count: 0 },
      1: { day: 'Monday', count: 0 },
      2: { day: 'Tuesday', count: 0 },
      3: { day: 'Wednesday', count: 0 },
      4: { day: 'Thursday', count: 0 },
      5: { day: 'Friday', count: 0 },
      6: { day: 'Saturday', count: 0 },
    };
    orders.forEach(order => {
      const dayOfWeek = new Date(order.createdAt).getDay();
      dailyVolume[dayOfWeek].count += 1;
    });

    // ==================== CUSTOMER ANALYTICS ====================
    const totalCustomers = await db.customer.count();
    const newCustomers = await db.customer.count({
      where: { createdAt: { gte: startDate } },
    });

    // Returning customers (ordered more than once in period)
    const customerOrderCounts: Record<string, number> = {};
    orders.forEach(order => {
      customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
    });

    const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const newCustomerOrders = Object.entries(customerOrderCounts)
      .filter(([_, count]) => count === 1)
      .length;

    // Customer segments by total spent
    const customersWithOrders = await db.customer.findMany({
      include: {
        orders: {
          where: { createdAt: { gte: startDate } },
        },
      },
    });

    const customerSegments = {
      vip: 0, // > €500
      regular: 0, // €100-500
      occasional: 0, // €50-100
      new: 0, // < €50
    };

    customersWithOrders.forEach(customer => {
      const spent = customer.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      if (spent >= 500) customerSegments.vip++;
      else if (spent >= 100) customerSegments.regular++;
      else if (spent >= 50) customerSegments.occasional++;
      else customerSegments.new++;
    });

    // Top customers by revenue
    const topCustomersData = await db.customer.findMany({
      include: {
        orders: {
          where: { createdAt: { gte: startDate } },
        },
      },
    });

    const topCustomers = topCustomersData
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        orders: customer.orders.length,
        revenue: customer.orders.reduce((sum, o) => sum + o.totalAmount, 0),
      }))
      .filter(c => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Customer retention (customers who ordered in both periods)
    const previousCustomerIds = new Set(previousOrders.map(o => o.customerId));
    const currentCustomerIds = new Set(orders.map(o => o.customerId));
    const retainedCustomers = [...currentCustomerIds].filter(id => previousCustomerIds.has(id)).length;
    const retentionRate = currentCustomerIds.size > 0 
      ? (retainedCustomers / (currentCustomerIds.size + previousCustomerIds.size - retainedCustomers)) * 100 
      : 0;

    // ==================== PRODUCT ANALYTICS ====================
    const productSales: Record<string, { 
      id: string; 
      name: string; 
      nameAr: string;
      category: string;
      quantity: number; 
      revenue: number; 
      stock: number;
      minStock: number;
    }> = {};

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            name: item.product.nameEn,
            nameAr: item.product.nameAr,
            category: item.product.category,
            quantity: 0,
            revenue: 0,
            stock: item.product.stock,
            minStock: item.product.minStock,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Low stock products
    const allProducts = await db.product.findMany({
      where: { isActive: true },
    });

    const lowStockProducts = allProducts
      .filter(p => p.stock < p.minStock)
      .map(p => ({
        id: p.id,
        name: p.nameEn,
        nameAr: p.nameAr,
        category: p.category,
        stock: p.stock,
        minStock: p.minStock,
        stockPercentage: Math.round((p.stock / p.minStock) * 100),
      }))
      .sort((a, b) => a.stockPercentage - b.stockPercentage);

    // Product performance by category
    const productPerformanceByCategory: Record<string, { products: typeof topProducts; totalRevenue: number }> = {};
    Object.values(productSales).forEach(product => {
      if (!productPerformanceByCategory[product.category]) {
        productPerformanceByCategory[product.category] = { products: [], totalRevenue: 0 };
      }
      productPerformanceByCategory[product.category].products.push(product);
      productPerformanceByCategory[product.category].totalRevenue += product.revenue;
    });

    // Sort products within each category
    Object.keys(productPerformanceByCategory).forEach(category => {
      productPerformanceByCategory[category].products.sort((a, b) => b.revenue - a.revenue);
    });

    // ==================== DELIVERY ANALYTICS ====================
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const deliverySuccessRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;

    // Average delivery time (estimated based on delivery date vs order date)
    const deliveryTimes = deliveredOrders
      .filter(o => o.deliveryDate)
      .map(o => {
        const orderDate = new Date(o.createdAt);
        const deliveryDate = new Date(o.deliveryDate!);
        return Math.abs(deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60); // hours
      });
    
    const avgDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length 
      : 0;

    // Driver performance
    const drivers = await db.driver.findMany({
      include: {
        orders: {
          where: { 
            createdAt: { gte: startDate },
            status: 'delivered',
          },
        },
      },
    });

    const driverPerformance = drivers
      .map(driver => {
        const deliveries = driver.orders.length;
        const revenue = driver.orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const avgOrderValue = deliveries > 0 ? revenue / deliveries : 0;
        
        return {
          id: driver.id,
          name: driver.name,
          deliveries,
          revenue,
          avgOrderValue,
          rating: driver.rating,
          efficiency: deliveries > 0 ? Math.round((revenue / deliveries) * 10) / 10 : 0,
        };
      })
      .filter(d => d.deliveries > 0)
      .sort((a, b) => b.deliveries - a.deliveries);

    // Delivery by line
    const deliveryByLine: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach(order => {
      const lineName = order.deliveryLine?.nameAr || order.deliveryLine?.nameEn || 'Unassigned';
      const lineId = order.deliveryLineId || 'none';
      if (!deliveryByLine[lineId]) {
        deliveryByLine[lineId] = { name: lineName, orders: 0, revenue: 0 };
      }
      deliveryByLine[lineId].orders += 1;
      deliveryByLine[lineId].revenue += order.totalAmount;
    });

    // ==================== AI PREDICTIONS ====================
    let predictions: {
      salesForecast: {
        nextWeekRevenue: number;
        nextWeekOrders: number;
        confidenceLevel: number;
        trendDirection: string;
      };
      stockRecommendations: {
        productName: string;
        currentStock: number;
        recommendedStock: number;
        reason: string;
      }[];
      promotionTiming: {
        bestDay: string;
        bestTime: string;
        recommendedProducts: string[];
        expectedImpact: string;
      };
      insights: string[];
    } | null = null;
    
    if (includePredictions) {
      try {
        const zai = await ZAI.create();
        
        // Prepare data summary for AI
        const dataSummary = {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          topProducts: topProducts.slice(0, 5).map(p => ({ name: p.name, quantity: p.quantity, revenue: p.revenue })),
          revenueTrends: salesChart.slice(-7),
          peakHours,
          lowStockProducts: lowStockProducts.slice(0, 5),
          categories: Object.entries(revenueByCategory).map(([cat, rev]) => ({ category: cat, revenue: rev })),
        };

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an expert business analyst for a bakery. Analyze the provided data and generate actionable predictions and recommendations in JSON format. Be specific and data-driven.`
            },
            {
              role: 'user',
              content: `Analyze this bakery business data and provide predictions in JSON format with this exact structure:
{
  "salesForecast": {
    "nextWeekRevenue": <number>,
    "nextWeekOrders": <number>,
    "confidenceLevel": <number between 0-100>,
    "trendDirection": "<up/down/stable>"
  },
  "stockRecommendations": [
    { "productName": "<string>", "currentStock": <number>, "recommendedStock": <number>, "reason": "<string>" }
  ],
  "promotionTiming": {
    "bestDay": "<string>",
    "bestTime": "<string>",
    "recommendedProducts": ["<string>"],
    "expectedImpact": "<string>"
  },
  "insights": ["<string>"]
}

Data: ${JSON.stringify(dataSummary)}`
            }
          ],
        });

        const predictionText = completion.choices[0]?.message?.content || '';
        
        // Parse the JSON from the response
        const jsonMatch = predictionText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          predictions = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Error generating predictions:', error);
        // Provide fallback predictions based on data analysis
        predictions = {
          salesForecast: {
            nextWeekRevenue: Math.round(totalRevenue * 1.1),
            nextWeekOrders: Math.round(totalOrders * 1.05),
            confidenceLevel: 75,
            trendDirection: revenueChange >= 0 ? 'up' : 'down',
          },
          stockRecommendations: lowStockProducts.slice(0, 3).map(p => ({
            productName: p.name,
            currentStock: p.stock,
            recommendedStock: p.minStock * 2,
            reason: 'Below minimum stock level',
          })),
          promotionTiming: {
            bestDay: dailyVolume[5].count > dailyVolume[6].count ? 'Friday' : 'Saturday',
            bestTime: peakHours[0] ? `${peakHours[0].hour}:00` : '10:00',
            recommendedProducts: topProducts.slice(0, 3).map(p => p.name),
            expectedImpact: '10-15% increase in sales',
          },
          insights: [
            `Revenue ${revenueChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(revenueChange).toFixed(1)}% compared to previous period`,
            `Top selling category: ${Object.entries(revenueByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
            `${lowStockProducts.length} products need restocking`,
          ],
        };
      }
    }

    // ==================== COMPARISON DATA ====================
    const comparison = {
      revenue: {
        current: totalRevenue,
        previous: previousRevenue,
        change: revenueChange,
      },
      orders: {
        current: totalOrders,
        previous: previousTotalOrders,
        change: orderChange,
      },
      avgOrderValue: {
        current: avgOrderValue,
        previous: previousAvgOrderValue,
        change: avgOrderValueChange,
      },
      customers: {
        current: Object.keys(customerOrderCounts).length,
        previous: previousCustomerIds.size,
        new: newCustomerOrders,
        returning: returningCustomers,
      },
    };

    return NextResponse.json({
      period,
      // Revenue Analytics
      revenue: {
        total: totalRevenue,
        byCategory: revenueByCategory,
        trends: salesChart,
        comparison: comparison.revenue,
      },
      // Order Analytics
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus,
        peakHours,
        avgOrderValue,
        dailyVolume: Object.values(dailyVolume),
        volumeTrend: salesChart.map(s => ({ date: s.date, orders: s.orders })),
        comparison: comparison.orders,
      },
      // Customer Analytics
      customers: {
        total: totalCustomers,
        new: newCustomers,
        returning: returningCustomers,
        segments: customerSegments,
        topCustomers,
        retentionRate,
        newVsReturning: {
          new: newCustomerOrders,
          returning: returningCustomers,
        },
      },
      // Product Analytics
      products: {
        topSellers: topProducts,
        lowStock: lowStockProducts,
        performanceByCategory: productPerformanceByCategory,
      },
      // Delivery Analytics
      delivery: {
        successRate: deliverySuccessRate,
        avgDeliveryTime,
        driverPerformance,
        byLine: Object.values(deliveryByLine),
      },
      // AI Predictions
      predictions,
      // Summary Stats
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        deliverySuccessRate,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Error fetching analytics' }, { status: 500 });
  }
}
