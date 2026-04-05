import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET cost analysis and product costs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'products') {
      // Get products with cost analysis
      const products = await db.product.findMany({
        where: { isActive: true },
        orderBy: { nameEn: 'asc' },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          nameNl: true,
          category: true,
          price: true,
          costPrice: true,
          stock: true,
          minStock: true,
          sku: true,
        },
      });
      
      // Calculate margins
      const productsWithMargin = products.map(product => {
        const costPrice = product.costPrice || 0;
        const sellingPrice = product.price;
        const margin = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
        const profit = sellingPrice - costPrice;
        
        return {
          ...product,
          costPrice,
          sellingPrice,
          margin: Math.round(margin * 100) / 100,
          profit: Math.round(profit * 100) / 100,
          lowStock: product.stock < product.minStock,
        };
      });
      
      return NextResponse.json(productsWithMargin);
    }
    
    if (type === 'summary') {
      // Get summary statistics
      const products = await db.product.findMany({
        where: { isActive: true },
        select: {
          price: true,
          costPrice: true,
          stock: true,
          minStock: true,
        },
      });
      
      const totalProducts = products.length;
      const lowStockCount = products.filter(p => p.stock < p.minStock).length;
      
      let totalInventoryValue = 0;
      let totalPotentialProfit = 0;
      let totalCostValue = 0;
      
      for (const product of products) {
        const cost = product.costPrice || 0;
        totalInventoryValue += cost * product.stock;
        totalPotentialProfit += (product.price - cost) * product.stock;
        totalCostValue += cost * product.stock;
      }
      
      const averageMargin = products.length > 0 
        ? products.reduce((sum, p) => {
            const margin = p.price > 0 ? ((p.price - (p.costPrice || 0)) / p.price) * 100 : 0;
            return sum + margin;
          }, 0) / products.length
        : 0;
      
      return NextResponse.json({
        totalProducts,
        lowStockCount,
        totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
        totalPotentialProfit: Math.round(totalPotentialProfit * 100) / 100,
        totalCostValue: Math.round(totalCostValue * 100) / 100,
        averageMargin: Math.round(averageMargin * 100) / 100,
      });
    }
    
    if (type === 'expiry') {
      // Get expiry tracking data
      const expiryTracking = await db.expiryTracking.findMany({
        orderBy: { expiryDate: 'asc' },
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              nameNl: true,
            },
          },
        },
      });
      
      const today = new Date();
      const trackingWithDays = expiryTracking.map(track => {
        const daysToExpiry = Math.ceil((new Date(track.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = 'fresh';
        if (daysToExpiry <= 0) status = 'expired';
        else if (daysToExpiry <= 3) status = 'critical';
        else if (daysToExpiry <= 7) status = 'approaching';
        
        return {
          ...track,
          daysToExpiry,
          calculatedStatus: status,
        };
      });
      
      return NextResponse.json(trackingWithDays);
    }
    
    if (type === 'movements') {
      // Get stock movement history with filtering
      const movements = await db.inventoryMovement.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              nameNl: true,
              category: true,
            },
          },
        },
        take: 200,
      });
      
      return NextResponse.json(movements);
    }
    
    // Default: return all cost data
    return NextResponse.json({
      products: [],
      summary: {},
      expiry: [],
      movements: [],
    });
  } catch (error) {
    console.error('Error fetching cost data:', error);
    return NextResponse.json({ error: 'Failed to fetch cost data' }, { status: 500 });
  }
}

// POST - Update product cost or add expiry tracking
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'updateCost') {
      // Update product cost price
      const product = await db.product.update({
        where: { id: data.productId },
        data: { costPrice: parseFloat(data.costPrice) },
      });
      
      return NextResponse.json(product);
    }
    
    if (data.action === 'addExpiry') {
      // Add expiry tracking
      const expiry = await db.expiryTracking.create({
        data: {
          productId: data.productId,
          batchNumber: data.batchNumber || null,
          productionDate: new Date(data.productionDate),
          expiryDate: new Date(data.expiryDate),
          quantity: parseInt(data.quantity),
          remainingQty: parseInt(data.quantity),
          status: 'fresh',
          notes: data.notes || null,
        },
      });
      
      return NextResponse.json(expiry);
    }
    
    if (data.action === 'generateOrder') {
      // Generate auto purchase order for low stock items
      const lowStockProducts = await db.product.findMany({
        where: {
          isActive: true,
          stock: { lt: db.product.fields.minStock },
        },
      });
      
      if (lowStockProducts.length === 0) {
        return NextResponse.json({ message: 'No low stock products found' });
      }
      
      // Find default supplier or first active supplier
      const supplier = await db.supplier.findFirst({
        where: { isActive: true },
      });
      
      if (!supplier) {
        return NextResponse.json({ error: 'No active supplier found' }, { status: 400 });
      }
      
      // Generate order number
      const date = new Date();
      const orderNumber = `PO-AUTO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Calculate order items
      const items = lowStockProducts.map(product => {
        const reorderQty = (product.maxStock || product.minStock * 2) - product.stock;
        const costPrice = product.costPrice || product.price * 0.5;
        
        return {
          productId: product.id,
          quantity: Math.max(reorderQty, product.minStock),
          unitPrice: costPrice,
          totalPrice: costPrice * Math.max(reorderQty, product.minStock),
        };
      });
      
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.21;
      const totalAmount = subtotal + taxAmount;
      
      const purchaseOrder = await db.purchaseOrder.create({
        data: {
          orderNumber,
          supplierId: supplier.id,
          status: 'draft',
          orderDate: new Date(),
          subtotal,
          taxAmount,
          shippingCost: 0,
          totalAmount,
          notes: 'Auto-generated purchase order for low stock items',
          orderItems: {
            create: items,
          },
        },
        include: {
          supplier: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });
      
      return NextResponse.json(purchaseOrder);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing cost request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
