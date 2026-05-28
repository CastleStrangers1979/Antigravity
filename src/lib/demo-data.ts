// بيانات تجريبية للعرض
// Demo data for preview when database is not available

export const demoProducts = [
  { id: "1", nameAr: "خبز عربي كبير", nameEn: "Large Arabic Bread", price: 2.00, category: "bread", stock: 100 },
  { id: "2", nameAr: "خبز عربي صغير", nameEn: "Small Arabic Bread", price: 1.00, category: "bread", stock: 150 },
  { id: "3", nameAr: "خبز بر", nameEn: "Brown Bread", price: 2.50, category: "bread", stock: 80 },
  { id: "4", nameAr: "خبز سمسم", nameEn: "Sesame Bread", price: 2.20, category: "bread", stock: 60 },
  { id: "5", nameAr: "خبز تورتيلا", nameEn: "Tortilla Bread", price: 1.80, category: "bread", stock: 90 },
];

export const demoCustomers = [
  { id: "1", name: "أحمد محمد", phone: "0612345678", address: "Amsterdam", city: "Amsterdam" },
  { id: "2", name: "فاطمة علي", phone: "0623456789", address: "Rotterdam", city: "Rotterdam" },
  { id: "3", name: "محمد حسن", phone: "0634567890", address: "Utrecht", city: "Utrecht" },
];

export const demoDrivers = [
  { id: "1", name: "خالد السائق", phone: "0645678901", isActive: true },
  { id: "2", name: "عمر السائق", phone: "0656789012", isActive: true },
];

export const demoDeliveryLines = [
  { id: "1", nameAr: "خط أمستردام", nameEn: "Amsterdam Line", isActive: true },
  { id: "2", nameAr: "خط روتردام", nameEn: "Rotterdam Line", isActive: true },
  { id: "3", nameAr: "خط أوترخت", nameEn: "Utrecht Line", isActive: true },
  { id: "4", nameAr: "خط لاهاي", nameEn: "The Hague Line", isActive: true },
  { id: "5", nameAr: "خط ألميلو", nameEn: "Almelo Line", isActive: true },
  { id: "6", nameAr: "خط إنشوله", nameEn: "Enschede Line", isActive: true },
  { id: "7", nameAr: "خط خرونينغن", nameEn: "Groningen Line", isActive: true },
  { id: "8", nameAr: "خط آيندهوفن", nameEn: "Eindhoven Line", isActive: true },
  { id: "9", nameAr: "خط نيميغن", nameEn: "Nijmegen Line", isActive: true },
];

export const demoOrders = [
  { 
    id: "1", 
    orderNumber: "ORD-001", 
    customerId: "1", 
    status: "pending", 
    paymentStatus: "pending", 
    totalAmount: 10.00,
    createdAt: new Date().toISOString()
  },
  { 
    id: "2", 
    orderNumber: "ORD-002", 
    customerId: "2", 
    status: "in_delivery", 
    paymentStatus: "paid", 
    totalAmount: 15.00,
    createdAt: new Date().toISOString()
  },
  { 
    id: "3", 
    orderNumber: "ORD-003", 
    customerId: "3", 
    status: "completed", 
    paymentStatus: "paid", 
    totalAmount: 8.00,
    createdAt: new Date().toISOString()
  },
];

export const demoInvoices = [
  { id: "1", invoiceNumber: "INV-001", customerId: "1", totalAmount: 10.00, status: "unpaid" },
  { id: "2", invoiceNumber: "INV-002", customerId: "2", totalAmount: 15.00, status: "paid" },
];

// Helper to check if we should use demo data
export function shouldUseDemoData(): boolean {
  // Use demo data on cloud platforms that don't support SQLite persistence
  // Render, Netlify, Vercel all use ephemeral file systems
  if (typeof process !== 'undefined') {
    const nodeEnv = process.env.NODE_ENV;
    const render = process.env.RENDER || process.env.RENDER_SERVICE_ID;
    const netlify = process.env.NETLIFY || process.env.NETLIFY_SITE_NAME;
    const vercel = process.env.VERCEL;
    
    // Always use demo data on cloud platforms
    if (render || netlify || vercel) {
      return true;
    }
    
    // Use demo data if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      return true;
    }
    
    // In production on cloud, use demo data
    if (nodeEnv === 'production') {
      return true;
    }
  }
  return false;
}
