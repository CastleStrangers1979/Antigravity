import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to escape CSV field
function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate CSV content
function generateCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(item => 
    headers.map(header => escapeCSV(item[header])).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

// Generate Excel-compatible XML (simple format)
function generateExcelXML(data: Record<string, unknown>[], headers: string[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Worksheet ss:Name="Export">\n';
  xml += '<Table>\n';
  
  // Header row
  xml += '<Row>\n';
  headers.forEach(header => {
    xml += `<Cell><Data ss:Type="String">${escapeCSV(header)}</Data></Cell>\n`;
  });
  xml += '</Row>\n';
  
  // Data rows
  data.forEach(item => {
    xml += '<Row>\n';
    headers.forEach(header => {
      const value = item[header];
      const type = typeof value === 'number' ? 'Number' : 'String';
      xml += `<Cell><Data ss:Type="${type}">${escapeCSV(value)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';
  });
  
  xml += '</Table>\n';
  xml += '</Worksheet>\n';
  xml += '</Workbook>';
  
  return xml;
}

// Generate PDF-like HTML report (can be converted to PDF)
function generatePDFHTML(title: string, data: Record<string, unknown>[], headers: string[]): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2D5A3D; border-bottom: 2px solid #D4A853; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #2D5A3D; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #E8DFD0; }
    tr:nth-child(even) { background: #F5EDE0; }
    .footer { margin-top: 30px; font-size: 12px; color: #7A6F63; }
  </style>
</head>
<body>
  <h1>مخبز الملكة - Al-Malika Bakery</h1>
  <h2>${title}</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
`;
  
  data.forEach(item => {
    html += '      <tr>\n';
    headers.forEach(header => {
      html += `        <td>${item[header] ?? ''}</td>\n`;
    });
    html += '      </tr>\n';
  });
  
  html += `
    </tbody>
  </table>
  <div class="footer">
    <p>© 2025 Al-Malika Bakery - All Rights Reserved</p>
  </div>
</body>
</html>
`;
  
  return html;
}

// POST - Export data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, type, dateRange } = body;
    
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];
    let filename = '';
    
    // Fetch data based on type
    switch (type) {
      case 'orders':
        const orders = await db.order.findMany({
          include: {
            customer: true,
            driver: true,
            orderItems: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 1000,
        });
        
        headers = ['Order Number', 'Customer', 'Phone', 'Address', 'Status', 'Total', 'Driver', 'Date'];
        data = orders.map(o => ({
          'Order Number': o.orderNumber,
          'Customer': o.customer.name,
          'Phone': o.customer.phone,
          'Address': `${o.customer.address}, ${o.customer.city}`,
          'Status': o.status,
          'Total': `€${o.totalAmount.toFixed(2)}`,
          'Driver': o.driver?.name ?? '-',
          'Date': new Date(o.createdAt).toLocaleDateString(),
        }));
        filename = 'orders_export';
        break;
        
      case 'products':
        const products = await db.product.findMany({
          orderBy: { category: 'asc' },
        });
        
        headers = ['Name (AR)', 'Name (EN)', 'Category', 'Price', 'Stock', 'SKU', 'Status'];
        data = products.map(p => ({
          'Name (AR)': p.nameAr,
          'Name (EN)': p.nameEn,
          'Category': p.category,
          'Price': `€${p.price.toFixed(2)}`,
          'Stock': p.stock,
          'SKU': p.sku ?? '-',
          'Status': p.isActive ? 'Active' : 'Inactive',
        }));
        filename = 'products_export';
        break;
        
      case 'customers':
        const customers = await db.customer.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1000,
        });
        
        headers = ['Name', 'Phone', 'Email', 'Address', 'City', 'Total Orders', 'Total Spent', 'Type'];
        data = customers.map(c => ({
          'Name': c.name,
          'Phone': c.phone,
          'Email': c.email ?? '-',
          'Address': c.address,
          'City': c.city,
          'Total Orders': c.totalOrders,
          'Total Spent': `€${c.totalSpent.toFixed(2)}`,
          'Type': c.customerType,
        }));
        filename = 'customers_export';
        break;
        
      case 'financial':
        const payments = await db.payment.findMany({
          include: { order: true, customer: true },
          orderBy: { createdAt: 'desc' },
          take: 1000,
        });
        
        headers = ['Transaction ID', 'Order', 'Customer', 'Amount', 'Method', 'Status', 'Date'];
        data = payments.map(p => ({
          'Transaction ID': p.transactionId ?? '-',
          'Order': p.order?.orderNumber ?? '-',
          'Customer': p.customer?.name ?? '-',
          'Amount': `€${p.amount.toFixed(2)}`,
          'Method': p.method,
          'Status': p.status,
          'Date': new Date(p.createdAt).toLocaleDateString(),
        }));
        filename = 'financial_export';
        break;
        
      case 'inventory':
        const inventory = await db.inventoryMovement.findMany({
          include: { product: true },
          orderBy: { createdAt: 'desc' },
          take: 1000,
        });
        
        headers = ['Product', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reason', 'Date'];
        data = inventory.map(i => ({
          'Product': i.product.nameAr,
          'Type': i.type,
          'Quantity': i.quantity,
          'Previous Stock': i.previousStock ?? '-',
          'New Stock': i.newStock ?? '-',
          'Reason': i.reason ?? '-',
          'Date': new Date(i.createdAt).toLocaleDateString(),
        }));
        filename = 'inventory_export';
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }
    
    // Generate export content based on format
    let content: string;
    let contentType: string;
    let fileExtension: string;
    
    switch (format) {
      case 'csv':
        content = generateCSV(data, headers);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
        
      case 'excel':
        content = generateExcelXML(data, headers);
        contentType = 'application/vnd.ms-excel';
        fileExtension = 'xlsx';
        break;
        
      case 'pdf':
        content = generatePDFHTML(filename.replace('_', ' ').toUpperCase(), data, headers);
        contentType = 'text/html';
        fileExtension = 'html'; // Note: In production, you'd generate actual PDF
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
    
    // Return the file
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${fileExtension}"`,
      },
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
