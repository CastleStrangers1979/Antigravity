'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Package, Truck, Users, DollarSign, ShoppingCart, MapPin, Phone, Clock,
  CheckCircle, AlertCircle, TrendingUp, TrendingDown, RefreshCw, Send,
  Cookie, Store, Calculator, FileText, User, Bell, Navigation, Loader2,
  Plus, Minus, CreditCard, Wallet, X, Check, Map
} from 'lucide-react';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  totalSpent: number;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  isOnline: boolean;
  currentLocation: string;
  latitude: number | null;
  longitude: number | null;
  totalDeliveries: number;
  completedToday: number;
  rating: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  driver: Driver | null;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  orderItems: { product: Product; quantity: number; total: number }[];
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  totalAmount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
}

interface CostCenter {
  id: string;
  name: string;
  budget: number;
  actual: number;
  variance: number;
  costs: { category: string; description: string; amount: number }[];
}

// Demo Mode Component
export default function DemoTab() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [activeView, setActiveView] = useState('bahjat');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  
  // Cart state
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Driver simulation state
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [driverLocation, setDriverLocation] = useState({ lat: 52.3676, lng: 4.9041 });

  // Seed demo data
  const seedDemoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo-seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeeded(true);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
    setLoading(false);
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const [productsRes, customersRes, driversRes, ordersRes, invoicesRes, costsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/drivers'),
        fetch('/api/orders'),
        fetch('/api/invoices'),
        fetch('/api/cost-centers'),
      ]);

      setProducts(await productsRes.json());
      setCustomers(await customersRes.json());
      setDrivers(await driversRes.json());
      setOrders(await ordersRes.json());
      setInvoices(await invoicesRes.json());
      setCostCenters(await costsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
   
  }, []);

  // Calculate dashboard stats
  const stats = {
    todaySales: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
    activeOrders: orders.filter(o => ['pending', 'confirmed', 'in_delivery'].includes(o.status)).length,
    availableDrivers: drivers.filter(d => d.isOnline).length,
    pendingAmount: invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.totalAmount, 0),
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500', label: 'جديد' },
      confirmed: { color: 'bg-blue-500', label: 'مؤكد' },
      in_delivery: { color: 'bg-purple-500', label: 'قيد التوصيل' },
      delivered: { color: 'bg-green-500', label: 'مكتمل' },
      paid: { color: 'bg-green-500', label: 'مدفوع' },
      sent: { color: 'bg-blue-500', label: 'مرسل' },
      overdue: { color: 'bg-red-500', label: 'متأخر' },
    };
    const { color, label } = config[status] || { color: 'bg-gray-500', label: status };
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  // Get product name
  const getProductName = (product: Product) => product.nameAr;

  // Cart helpers
  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0 || customers.length === 0) return;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customers[0].id,
          items: cart,
          paymentMethod,
        }),
      });
      
      if (res.ok) {
        setCart([]);
        fetchAllData();
        alert('تم إرسال الطلب بنجاح!');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  // Update order status (driver app)
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchAllData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Send notification
  const sendNotification = async (invoiceId: string) => {
    alert(`تم إرسال إشعار للفاتورة ${invoiceId}!`);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#2D5A3D] to-[#3D7A5D] p-6 rounded-xl text-white">
        <div>
          <h1 className="text-3xl font-bold">🥖 مخبز الملكة - النموذج التجريبي</h1>
          <p className="text-white/80 mt-1">اجتماع: بهجت (صاحب المخبز) وأبو مروان (المحاسب المالي)</p>
        </div>
        <Button
          onClick={seedDemoData}
          disabled={loading}
          className="bg-white text-[#2D5A3D] hover:bg-[#F5EDE0] font-bold px-6"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin ml-2" /> جاري الإنشاء...</>
          ) : seeded ? (
            <><RefreshCw className="h-5 w-5 ml-2" /> إعادة إنشاء البيانات</>
          ) : (
            <><Package className="h-5 w-5 ml-2" /> إنشاء بيانات تجريبية</>
          )}
        </Button>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2 bg-[#F5EDE0]">
          <TabsTrigger value="bahjat" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Store className="h-4 w-4 ml-2" />
            لوحة بهجت
          </TabsTrigger>
          <TabsTrigger value="raed" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white">
            <Calculator className="h-4 w-4 ml-2" />
            لوحة رائد
          </TabsTrigger>
          <TabsTrigger value="driver" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Truck className="h-4 w-4 ml-2" />
            تطبيق السائق
          </TabsTrigger>
          <TabsTrigger value="customer" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white">
            <ShoppingCart className="h-4 w-4 ml-2" />
            تطبيق العميل
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <FileText className="h-4 w-4 ml-2" />
            الفواتير
          </TabsTrigger>
        </TabsList>

        {/* ========== Bahjat Dashboard (Owner) ========== */}
        <TabsContent value="bahjat" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">مبيعات اليوم</p>
                    <p className="text-2xl font-bold text-[#2D5A3D]">€{stats.todaySales.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">طلبات نشطة</p>
                    <p className="text-2xl font-bold text-[#D4A853]">{stats.activeOrders}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <ShoppingCart className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">سائقين متاحين</p>
                    <p className="text-2xl font-bold text-[#2D5A3D]">{stats.availableDrivers}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">ديون مستحقة</p>
                    <p className="text-2xl font-bold text-red-600">€{stats.pendingAmount.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#2D5A3D] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                الطلبات الواردة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[400px]">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-[#7A6F63]">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات - اضغط على "إنشاء بيانات تجريبية"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 bg-[#F5EDE0] rounded-lg flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#2D5A3D]">{order.orderNumber}</span>
                            {getStatusBadge(order.status)}
                            {getStatusBadge(order.paymentStatus)}
                          </div>
                          <p className="text-sm text-[#7A6F63] mt-1">
                            {order.customer.name} - {order.customer.phone}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</p>
                          {order.driver && (
                            <p className="text-sm text-[#7A6F63]">🚚 {order.driver.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Driver Map Simulation */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#D4A853] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                مواقع السائقين (محاكاة)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {drivers.map(driver => (
                  <div key={driver.id} className="p-4 bg-[#F5EDE0] rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-bold text-[#3D3229]">{driver.name}</span>
                    </div>
                    <div className="space-y-2 text-sm text-[#7A6F63]">
                      <p>📍 {driver.currentLocation}</p>
                      <p>📦 التوصيلات اليوم: {driver.completedToday}</p>
                      <p>⭐ التقييم: {driver.rating}</p>
                      {driver.latitude && driver.longitude && (
                        <p className="text-xs font-mono">
                          🌐 {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Simple Map Placeholder */}
              <div className="mt-4 h-[200px] bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
                <p className="text-[#7A6F63]">🗺️ خريطة محاكاة مواقع السائقين</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="p-3 bg-green-100 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">تم دفع فاتورة INV-2025-002 بنجاح</span>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800">فاتورة INV-2025-001 تستحق خلال 14 يوم</span>
                </div>
                <div className="p-3 bg-red-100 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">فاتورة INV-2025-003 متأخرة 10 أيام!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Raed Dashboard (Accountant) ========== */}
        <TabsContent value="raed" className="space-y-6">
          {/* Cost Centers */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#D4A853] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                مراكز التكلفة
              </CardTitle>
              <CardDescription className="text-white/80">
                أبيض | أسمر | فاميلي | سمول
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {costCenters.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-[#7A6F63]">
                    اضغط على "إنشاء بيانات تجريبية" لعرض مراكز التكلفة
                  </div>
                ) : (
                  costCenters.map(center => (
                    <div key={center.id} className="p-4 bg-[#F5EDE0] rounded-lg">
                      <h3 className="font-bold text-[#3D3229] text-lg mb-3">{center.name}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#7A6F63]">الميزانية:</span>
                          <span className="font-medium">€{(center.budget || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#7A6F63]">الفعلي:</span>
                          <span className="font-medium">€{(center.actual || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#7A6F63]">الانحراف:</span>
                          <span className={`font-bold ${(center.variance || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{(center.variance || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown per Bundle */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#2D5A3D] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                تكلفة الربطة (تحليل مفصل)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8DFD0]">
                      <th className="text-right p-2 text-[#7A6F63]">العنصر</th>
                      <th className="text-center p-2 text-[#7A6F63]">أبيض</th>
                      <th className="text-center p-2 text-[#7A6F63]">أسمر</th>
                      <th className="text-center p-2 text-[#7A6F63]">فاميلي</th>
                      <th className="text-center p-2 text-[#7A6F63]">سمول</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#E8DFD0]">
                      <td className="p-2">🌾 الطحين</td>
                      <td className="text-center p-2">€0.38</td>
                      <td className="text-center p-2">€0.50</td>
                      <td className="text-center p-2">€0.59</td>
                      <td className="text-center p-2">€0.29</td>
                    </tr>
                    <tr className="border-b border-[#E8DFD0]">
                      <td className="p-2">🧪 الخميرة</td>
                      <td className="text-center p-2">€0.07</td>
                      <td className="text-center p-2">€0.09</td>
                      <td className="text-center p-2">€0.10</td>
                      <td className="text-center p-2">€0.05</td>
                    </tr>
                    <tr className="border-b border-[#E8DFD0]">
                      <td className="p-2">⚗️ المحسنات</td>
                      <td className="text-center p-2">€0.10</td>
                      <td className="text-center p-2">€0.13</td>
                      <td className="text-center p-2">€0.16</td>
                      <td className="text-center p-2">€0.08</td>
                    </tr>
                    <tr className="border-b border-[#E8DFD0]">
                      <td className="p-2">💧 الماء</td>
                      <td className="text-center p-2">€0.04</td>
                      <td className="text-center p-2">€0.06</td>
                      <td className="text-center p-2">€0.07</td>
                      <td className="text-center p-2">€0.03</td>
                    </tr>
                    <tr className="border-b border-[#E8DFD0]">
                      <td className="p-2">⚡ الكهرباء</td>
                      <td className="text-center p-2">€0.13</td>
                      <td className="text-center p-2">€0.17</td>
                      <td className="text-center p-2">€0.20</td>
                      <td className="text-center p-2">€0.10</td>
                    </tr>
                    <tr className="bg-[#F5EDE0]">
                      <td className="p-2 font-bold">📦 المجموع</td>
                      <td className="text-center p-2 font-bold text-[#2D5A3D]">€0.85</td>
                      <td className="text-center p-2 font-bold text-[#2D5A3D]">€1.10</td>
                      <td className="text-center p-2 font-bold text-[#2D5A3D]">€1.30</td>
                      <td className="text-center p-2 font-bold text-[#2D5A3D]">€0.65</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Profit & Loss Report */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                تقرير الأرباح والخسائر
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-800 font-medium">📈 الإيرادات</span>
                    <span className="text-2xl font-bold text-green-600">€{stats.todaySales.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-800 font-medium">📉 التكاليف</span>
                    <span className="text-xl font-bold text-red-600">€{(stats.todaySales * 0.45).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>• تكلفة المواد الخام: €{(stats.todaySales * 0.25).toFixed(2)}</p>
                    <p>• أجور العمال: €{(stats.todaySales * 0.12).toFixed(2)}</p>
                    <p>• مصاريف تشغيلية: €{(stats.todaySales * 0.08).toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div className="p-4 bg-[#2D5A3D] text-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">💰 صافي الربح</span>
                    <span className="text-2xl font-bold">€{(stats.todaySales * 0.55).toFixed(2)}</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">هامش الربح: 55%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variance Analysis */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                تحليل الانحرافات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">📊 انحراف الكمية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الكمية المعيارية:</span>
                      <span>500 ربطة</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الكمية الفعلية:</span>
                      <span>485 ربطة</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-600">
                      <span>الانحراف:</span>
                      <span>-15 ربطة (€-30.00)</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-2">💰 انحراف السعر</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السعر المعياري:</span>
                      <span>€2.00/كغ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>السعر الفعلي:</span>
                      <span>€2.08/كغ</span>
                    </div>
                    <div className="flex justify-between font-bold text-orange-600">
                      <span>الانحراف:</span>
                      <span>€0.08/كغ (€+38.80)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Driver App ========== */}
        <TabsContent value="driver" className="space-y-6">
          {/* Driver Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#2D5A3D] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                اختر السائق
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="border-[#E8DFD0]">
                  <SelectValue placeholder="اختر سائق..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - {driver.currentLocation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedDriver && (
            <>
              {/* Driver Orders */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-[#D4A853] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    طلباتي ({orders.filter(o => o.driver?.id === selectedDriver).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px]">
                    {orders.filter(o => o.driver?.id === selectedDriver).length === 0 ? (
                      <div className="text-center py-8 text-[#7A6F63]">
                        لا توجد طلبات مخصصة لك حالياً
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.filter(o => o.driver?.id === selectedDriver).map(order => (
                          <div key={order.id} className="p-4 bg-[#F5EDE0] rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-bold text-[#2D5A3D]">{order.orderNumber}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <span className="font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-[#7A6F63] space-y-1">
                              <p>👤 {order.customer.name}</p>
                              <p>📍 {order.customer.address}</p>
                              <p>📞 {order.customer.phone}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {order.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600"
                                  onClick={() => updateOrderStatus(order.id, 'in_delivery')}
                                >
                                  <Navigation className="h-4 w-4 ml-1" />
                                  بدء التوصيل
                                </Button>
                              )}
                              {order.status === 'in_delivery' && (
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                                >
                                  <Check className="h-4 w-4 ml-1" />
                                  تم التوصيل
                                </Button>
                              )}
                              {order.status === 'delivered' && (
                                <Badge className="bg-green-500">✓ مكتمل</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* GPS Simulation */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    محاكاة GPS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>خط العرض (Latitude)</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={driverLocation.lat}
                        onChange={(e) => setDriverLocation({...driverLocation, lat: parseFloat(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>خط الطول (Longitude)</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={driverLocation.lng}
                        onChange={(e) => setDriverLocation({...driverLocation, lng: parseFloat(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600">
                    <Navigation className="h-4 w-4 ml-2" />
                    تحديث الموقع
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ========== Customer App ========== */}
        <TabsContent value="customer" className="space-y-6">
          {/* Products Grid */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#D4A853] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                أنواع الخبز
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-4 text-center py-8 text-[#7A6F63]">
                    اضغط على "إنشاء بيانات تجريبية"
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product.id} className="p-4 bg-[#F5EDE0] rounded-lg text-center">
                      <div className="text-4xl mb-2">🥖</div>
                      <h3 className="font-bold text-[#3D3229]">{getProductName(product)}</h3>
                      <p className="text-xl font-bold text-[#D4A853] mt-2">€{product.price.toFixed(2)}</p>
                      <p className="text-sm text-[#7A6F63]">متوفر: {product.stock}</p>
                      <Button
                        size="sm"
                        className="mt-3 bg-[#2D5A3D] hover:bg-[#1D4A2D]"
                        onClick={() => addToCart(product.id)}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        أضف للسلة
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#2D5A3D] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                سلة التسوق ({cart.length} عناصر)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-[#7A6F63]">
                  السلة فارغة
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {cart.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.productId} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                            <div>
                              <span className="font-medium">{getProductName(product)}</span>
                              <span className="text-sm text-[#7A6F63] mr-2">€{product.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>المجموع:</span>
                    <span className="text-[#D4A853]">€{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <Label>طريقة الدفع</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            كاش
                          </div>
                        </SelectItem>
                        <SelectItem value="ideal">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            iDeal (محاكي)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full mt-4 bg-[#D4A853] hover:bg-[#B8923F]"
                    onClick={placeOrder}
                    disabled={cart.length === 0}
                  >
                    <Send className="h-4 w-4 ml-2" />
                    إرسال الطلب
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== Invoices ========== */}
        <TabsContent value="invoices" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-[#2D5A3D] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                نظام الفواتير والمدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[500px]">
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-[#7A6F63]">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد فواتير - اضغط على "إنشاء بيانات تجريبية"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map(invoice => (
                      <div key={invoice.id} className={`p-4 rounded-lg border-r-4 ${
                        invoice.status === 'paid' ? 'bg-green-50 border-green-500' :
                        invoice.status === 'overdue' ? 'bg-red-50 border-red-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#3D3229]">{invoice.invoiceNumber}</span>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <p className="text-sm text-[#7A6F63] mt-1">
                              العميل: {invoice.customer?.name || 'غير محدد'}
                            </p>
                            <p className="text-sm text-[#7A6F63]">
                              تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-bold text-[#D4A853]">€{invoice.totalAmount.toFixed(2)}</p>
                            {invoice.status !== 'paid' && (
                              <Button
                                size="sm"
                                className="mt-2 bg-[#2D5A3D] hover:bg-[#1D4A2D]"
                                onClick={() => sendNotification(invoice.invoiceNumber)}
                              >
                                <Bell className="h-4 w-4 ml-1" />
                                إرسال إشعار
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Add Invoice Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#D4A853] hover:bg-[#B8923F]">
                <Plus className="h-4 w-4 ml-2" />
                إضافة فاتورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>العميل</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر عميل..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المبلغ</Label>
                  <Input type="number" placeholder="0.00" className="mt-1" />
                </div>
                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <Button className="w-full bg-[#2D5A3D]">
                  <Check className="h-4 w-4 ml-2" />
                  حفظ الفاتورة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
