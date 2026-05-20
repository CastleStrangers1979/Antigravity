"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  MapPin, 
  Smartphone, 
  Calculator, 
  Package, 
  Bot, 
  Lock, 
  Menu, 
  X, 
  Plus, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  deliveryLineId?: string;
}

interface DeliveryLine {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  driverId?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  customer?: Customer;
  driver?: Driver;
  orderItems?: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product?: Product;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  totalAmount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  customer?: Customer;
}

export default function BakeryDashboard() {
  const [sidebarOpen,SidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Stats
  const [todayOrders, setTodayOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [activeLines, setActiveLines] = useState(0);
  
  // Lock dialog
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

  // Fetch data function
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, customersRes, driversRes, linesRes, ordersRes, invoicesRes] = await Promise.all([
        fetch("/api/products").then(r => r.json()).catch(() => []),
        fetch("/api/customers").then(r => r.json()).catch(() => []),
        fetch("/api/drivers").then(r => r.json()).catch(() => []),
        fetch("/api/delivery-lines").then(r => r.json()).catch(() => []),
        fetch("/api/orders").then(r => r.json()).catch(() => []),
        fetch("/api/invoices").then(r => r.json()).catch(() => []),
      ]);
      
      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setCustomers(Array.isArray(customersRes) ? customersRes : []);
      setDrivers(Array.isArray(driversRes) ? driversRes : []);
      setDeliveryLines(Array.isArray(linesRes) ? linesRes : []);
      setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayOrdersData = Array.isArray(ordersRes) ? ordersRes.filter((o: Order) => 
        new Date(o.createdAt).toDateString() === today
      ) : [];
      
      setTodayOrders(todayOrdersData.length);
      setTodaySales(todayOrdersData.reduce((sum: number, o: Order) => sum + o.totalAmount, 0));
      setActiveLines(Array.isArray(linesRes) ? linesRes.filter((l: DeliveryLine) => l.isActive).length : 0);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Create demo data
  const createDemoData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seed-demo", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        toast.success("تم إنشاء البيانات التجريبية بنجاح!");
        await fetchAllData();
      } else {
        toast.error("حدث خطأ أثناء إنشاء البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء البيانات");
    }
    setLoading(false);
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        toast.success("تم تحديث حالة الطلب");
        await fetchAllData();
      }
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  // Show locked feature dialog
  const showLockedFeature = (featureName: string) => {
    setLockedFeature(featureName);
    setLockDialogOpen(true);
  };

  // Menu items
  const menuItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, locked: false },
    { id: "invoices", label: "الفواتير", icon: FileText, locked: false },
    { id: "drivers", label: "واجهة السائقين", icon: Truck, locked: false },
    { id: "gps-tracking", label: "تتبع السائقين GPS", icon: MapPin, locked: true },
    { id: "customer-app", label: "تطبيق العملاء", icon: Smartphone, locked: true },
    { id: "cost-centers", label: "مراكز التكلفة", icon: Calculator, locked: true },
    { id: "tracking", label: "تتبع الصناديق", icon: Package, locked: true },
    { id: "robot", label: "روبوت التحصيل", icon: Bot, locked: true },
  ];

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in_delivery": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "paid": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "unpaid": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "جديد";
      case "in_delivery": return "قيد التوصيل";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      case "paid": return "مدفوع";
      case "unpaid": return "غير مدفوع";
      default: return status;
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`} dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />
      
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-72" : "w-20"} transition-all duration-300 bg-gradient-to-b from-amber-900 to-amber-800 text-white flex flex-col shadow-xl`}>
          {/* Logo */}
          <div className="p-4 border-b border-amber-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍞</span>
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-lg text-amber-100">مخبز الملكة</h1>
                  <p className="text-xs text-amber-300">Al-Malika Bakery</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.locked ? showLockedFeature(item.label) : setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-amber-600 text-white shadow-lg"
                    : "text-amber-200 hover:bg-amber-700/50 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-right">{item.label}</span>
                    {item.locked && <Lock className="w-4 h-4 text-amber-400" />}
                  </>
                )}
              </button>
            ))}
          </nav>
          
          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 border-t border-amber-700/50 hover:bg-amber-700/50 transition-colors"
          >
            {sidebarOpen ? <ChevronRight className="w-5 h-5 mx-auto" /> : <ChevronLeft className="w-5 h-5 mx-auto" />}
          </button>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h2>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  حزمة 5,000 €
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={createDemoData}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء بيانات تجريبية
                </Button>
                
                <Button
                  onClick={fetchAllData}
                  disabled={loading}
                  variant="outline"
                  className="gap-2 border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
                
                <Button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  variant="ghost"
                  size="icon"
                  className="text-amber-800 dark:text-amber-200"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </header>
          
          {/* Content */}
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-blue-100">طلبات اليوم</CardDescription>
                      <CardTitle className="text-4xl font-bold">{todayOrders}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-blue-100">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm">طلب جديد</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-green-100">مبيعات اليوم</CardDescription>
                      <CardTitle className="text-4xl font-bold">€{todaySales.toFixed(2)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-green-100">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">إجمالي المبيعات</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-amber-100">خطوط التوزيع النشطة</CardDescription>
                      <CardTitle className="text-4xl font-bold">{activeLines}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-amber-100">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm">خط توزيع</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Delivery Lines */}
                <Card className="border-amber-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">خطوط التوزيع</CardTitle>
                    <CardDescription>قائمة خطوط التوزيع التسعة النشطة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {deliveryLines.length > 0 ? deliveryLines.map((line, idx) => (
                        <div
                          key={line.id}
                          className={`p-4 rounded-xl border-2 ${line.isActive ? "border-green-300 bg-green-50 dark:bg-green-900/20" : "border-gray-200 bg-gray-50 dark:bg-gray-800/20"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-amber-900 dark:text-amber-100">{line.nameAr}</span>
                            {line.isActive && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{line.nameEn}</p>
                        </div>
                      )) : (
                        <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>لا توجد خطوط توزيع. اضغط على "إنشاء بيانات تجريبية" للبدء.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Orders Table */}
                <Card className="border-amber-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">الطلبات الواردة</CardTitle>
                    <CardDescription>تحديث حالة الطلبات</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-amber-200 dark:border-gray-700">
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">رقم الطلب</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">العميل</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">المبلغ</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">الحالة</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">الدفع</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">إجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? orders.slice(0, 10).map((order) => (
                            <tr key={order.id} className="border-b border-amber-100 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-gray-800/50">
                              <td className="p-3 font-mono text-amber-900 dark:text-amber-100">{order.orderNumber}</td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">{order.customer?.name || "—"}</td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">€{order.totalAmount.toFixed(2)}</td>
                              <td className="p-3">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge className={getStatusColor(order.paymentStatus)}>
                                  {getStatusText(order.paymentStatus)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger className="w-36">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">جديد</SelectItem>
                                    <SelectItem value="in_delivery">قيد التوصيل</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                    <SelectItem value="cancelled">ملغي</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>لا توجد طلبات. اضغط على "إنشاء بيانات تجريبية" للبدء.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-6">
                <Card className="border-amber-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">فواتير الزبائن</CardTitle>
                    <CardDescription>عرض حالة الدفع للفواتير</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-amber-200 dark:border-gray-700">
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">رقم الفاتورة</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">العميل</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">المبلغ</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">الحالة</th>
                            <th className="text-right p-3 text-amber-800 dark:text-amber-200">تاريخ الاستحقاق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.length > 0 ? invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-b border-amber-100 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-gray-800/50">
                              <td className="p-3 font-mono text-amber-900 dark:text-amber-100">{invoice.invoiceNumber}</td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">{invoice.customer?.name || "—"}</td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">€{invoice.totalAmount.toFixed(2)}</td>
                              <td className="p-3">
                                <Badge className={getStatusColor(invoice.status)}>
                                  {getStatusText(invoice.status)}
                                </Badge>
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300">
                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("ar-SA") : "—"}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>لا توجد فواتير. اضغط على "إنشاء بيانات تجريبية" للبدء.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Drivers Tab */}
            {activeTab === "drivers" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {drivers.length > 0 ? drivers.map((driver) => (
                    <Card key={driver.id} className="border-amber-200 dark:border-gray-700 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-amber-900 dark:text-amber-100">{driver.name}</CardTitle>
                            <CardDescription>{driver.phone}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-medium mb-3 text-amber-800 dark:text-amber-200">مهام اليوم</h4>
                        <div className="space-y-2">
                          {orders
                            .filter(o => o.driverId === driver.id && o.status !== "completed")
                            .slice(0, 5)
                            .map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <span className="font-mono text-sm text-amber-900 dark:text-amber-100">{order.orderNumber}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer?.name}</p>
                                </div>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">جديد</SelectItem>
                                    <SelectItem value="in_delivery">قيد التوصيل</SelectItem>
                                    <SelectItem value="completed">مكتمل</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          {orders.filter(o => o.driverId === driver.id).length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">لا توجد مهام لهذا السائق</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                      <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا يوجد سائقون. اضغط على "إنشاء بيانات تجريبية" للبدء.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Locked Feature Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900">
              <Lock className="w-5 h-5" />
              ميزة مقفلة
            </DialogTitle>
            <DialogDescription className="text-lg py-4">
              <span className="font-medium text-amber-800">"{lockedFeature}"</span>
              <br />
              <br />
              هذه الميزة متوفرة في الحزمة المتقدمة.
              <br />
              <br />
              <span className="text-amber-600 font-medium">يرجى التواصل مع المطور للتفعيل.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setLockDialogOpen(false)} className="bg-amber-600 hover:bg-amber-700 text-white">
              حسناً
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
