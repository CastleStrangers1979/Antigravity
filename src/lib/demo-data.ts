// بيانات تجريبية للعرض
// Demo data for preview when database is not available

export const demoProducts = [
  { id: "1", nameAr: "خبز عربي كبير", nameEn: "Large Arabic Bread", nameNl: "Groot Arabisch Brood", price: 2.00, category: "bread", stock: 100, packSize: 5 },
  { id: "2", nameAr: "خبز عربي صغير", nameEn: "Small Arabic Bread", nameNl: "Klein Arabisch Brood", price: 1.00, category: "bread", stock: 150, packSize: 5 },
  { id: "3", nameAr: "خبز بر", nameEn: "Brown Bread", nameNl: "Bruin Brood", price: 2.50, category: "bread", stock: 80, packSize: 5 },
  { id: "4", nameAr: "خبز سمسم", nameEn: "Sesame Bread", nameNl: "Sesam Brood", price: 2.20, category: "bread", stock: 60, packSize: 5 },
  { id: "5", nameAr: "خبز تورتيلا", nameEn: "Tortilla Bread", nameNl: "Tortilla Brood", price: 1.80, category: "bread", stock: 90, packSize: 5 },
];

export const demoCustomers = [
  { id: "1", name: "مطعم الشام", phone: "0612345678", address: "Damrak 123, Amsterdam", city: "Amsterdam", customerType: "wholesale" },
  { id: "2", name: "سوبرماركت الحلال", phone: "0623456789", address: "Coolsingel 456, Rotterdam", city: "Rotterdam", customerType: "wholesale" },
  { id: "3", name: "مخبز السعادة", phone: "0634567890", address: "Spui 789, The Hague", city: "The Hague", customerType: "wholesale" },
];

export const demoDrivers = [
  { id: "1", name: "أحمد محمد", phone: "0645678901", isActive: true, isOnline: true, deliveryLineId: "1", completedToday: 5 },
  { id: "2", name: "عمر سعيد", phone: "0656789012", isActive: true, isOnline: true, deliveryLineId: "2", completedToday: 3 },
];

export const demoDeliveryLines = [
  { id: "1", nameAr: "خط أمستردام", nameEn: "Amsterdam Line", nameNl: "Amsterdam Route", region: "Amsterdam", isActive: true },
  { id: "2", nameAr: "خط روتردام", nameEn: "Rotterdam Line", nameNl: "Rotterdam Route", region: "Rotterdam", isActive: true },
  { id: "3", nameAr: "خط لاهاي", nameEn: "The Hague Line", nameNl: "Den Haag Route", region: "The Hague", isActive: true },
  { id: "4", nameAr: "خط أوترخت", nameEn: "Utrecht Line", nameNl: "Utrecht Route", region: "Utrecht", isActive: true },
  { id: "5", nameAr: "خط ألميلو", nameEn: "Almelo Line", nameNl: "Almelo Route", region: "Almelo", isActive: true },
  { id: "6", nameAr: "خط إنشوله", nameEn: "Enschede Line", nameNl: "Enschede Route", region: "Enschede", isActive: true },
  { id: "7", nameAr: "خط خرونينغن", nameEn: "Groningen Line", nameNl: "Groningen Route", region: "Groningen", isActive: true },
  { id: "8", nameAr: "خط آيندهوفن", nameEn: "Eindhoven Line", nameNl: "Eindhoven Route", region: "Eindhoven", isActive: true },
  { id: "9", nameAr: "خط نيميغن", nameEn: "Nijmegen Line", nameNl: "Nijmegen Route", region: "Nijmegen", isActive: true },
];

export const demoOrders = [
  { 
    id: "1", 
    orderNumber: "ORD-001", 
    customerId: "1",
    customer: { id: "1", name: "مطعم الشام", phone: "0612345678", address: "Damrak 123, Amsterdam", city: "Amsterdam" },
    status: "pending", 
    paymentStatus: "pending", 
    totalAmount: 25.00,
    deliveryDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  { 
    id: "2", 
    orderNumber: "ORD-002", 
    customerId: "2",
    customer: { id: "2", name: "سوبرماركت الحلال", phone: "0623456789", address: "Coolsingel 456, Rotterdam", city: "Rotterdam" },
    status: "in_delivery", 
    paymentStatus: "paid", 
    totalAmount: 35.50,
    deliveryDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  { 
    id: "3", 
    orderNumber: "ORD-003", 
    customerId: "3",
    customer: { id: "3", name: "مخبز السعادة", phone: "0634567890", address: "Spui 789, The Hague", city: "The Hague" },
    status: "completed", 
    paymentStatus: "paid", 
    totalAmount: 18.00,
    deliveryDate: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
];

export const demoInvoices = [
  { id: "1", invoiceNumber: "INV-001", customerId: "1", customerName: "مطعم الشام", totalAmount: 25.00, status: "unpaid", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "2", invoiceNumber: "INV-002", customerId: "2", customerName: "سوبرماركت الحلال", totalAmount: 35.50, status: "paid", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
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
