/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Package, Truck, Users, MapPin, Plus, Edit, Trash2, Eye, Phone, Navigation,
  CheckCircle, Clock, AlertCircle, DollarSign, ShoppingBag, BarChart3,
  Globe, RefreshCw, Send, Store, Timer,
  TrendingUp, User, MapPinned, ChevronLeft, ChevronRight, CircleDot, Cookie, Heart, Scale, Box,
  Car, Fuel, Wrench, Shield, Receipt, Gauge, Calendar, AlertTriangle,
  ShieldCheck, Wallet, Link2, Warehouse, CreditCard, ShoppingCart, ChefHat,
  Star, MessageSquare, Bot, Bell, Smartphone, FileText
} from 'lucide-react';
import QualitySafetyTab from '@/components/quality-safety-tab';
import BakeryTab from '@/components/bakery-tab';
import VehiclesTab from '@/components/vehicles-tab';
import AccountingTab from '@/components/accounting-tab';
import PreOrdersTab from '@/components/preorders-tab';
import AdvancedCustomerManagementTab from '@/components/AdvancedCustomerManagementTab';
import WebshopTab from '@/components/webshop-tab';
import IntegrationsTab from '@/components/integrations-tab';
import InventoryTab from '@/components/inventory-tab';
import AdvancedDashboardTab from '@/components/advanced-dashboard-tab';
import AdvancedReportsTab from '@/components/advanced-reports-tab';
import PaymentSystemTab from '@/components/payment-system-tab';
import POSTab from '@/components/pos-tab';
import DailyProductionTab from '@/components/daily-production-tab';
import CustomerReviewsTab from '@/components/customer-reviews-tab';
import CustomerChatbotTab from '@/components/customer-chatbot-tab';
import LiveTrackingTab from '@/components/live-tracking-tab';
import CustomerAppTab from '@/components/customer-app-tab';
import NotificationsTab from '@/components/NotificationsTab';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  sku: string | null;
  weight: number | null;
  packSize: number;
  boxSize: number | null;
  stock: number;
  isActive: boolean;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  deliveryLineId: string | null;
  deliveryLine: { id: string; nameAr: string; nameEn: string; nameNl?: string; region?: string } | null;
  isActive: boolean;
  currentLocation: string | null;
  latitude: number | null;
  longitude: number | null;
  orders?: Order[];
}

interface DeliveryLine {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  region: string;
  isActive: boolean;
  drivers?: Driver[];
  _count?: { orders: number };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  notes: string | null;
}

interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  driverId: string | null;
  driver: Driver | null;
  deliveryLineId: string | null;
  deliveryLine: DeliveryLine | null;
  status: string;
  totalAmount: number;
  deliveryDate: string | null;
  deliveryTime: string | null;
  notes: string | null;
  orderItems: OrderItem[];
  createdAt: string;
}

// Vehicle Types
interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  fuelType: string | null;
  mileage: number;
  capacity: number | null;
  isActive: boolean;
  purchaseDate: string | null;
  currentValue: number | null;
  notes: string | null;
  drivers?: { id: string; name: string }[];
  _count?: {
    maintenances: number;
    fuelRecords: number;
    insurances: number;
    expenses: number;
  };
}

interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  type: string;
  description: string;
  garage: string | null;
  cost: number;
  mileage: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  nextMaintenanceDate: string | null;
  nextMaintenanceMileage: number | null;
  notes: string | null;
}

interface FuelRecord {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  driverId: string | null;
  date: string;
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  station: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

interface VehicleInsurance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  provider: string;
  policyNumber: string;
  type: string;
  startDate: string;
  endDate: string;
  premium: number;
  coverage: string | null;
  documentUrl: string | null;
  status: string;
  notes: string | null;
}

interface VehicleExpense {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  type: string;
  description: string;
  amount: number;
  date: string;
  receiptUrl: string | null;
  notes: string | null;
}

// Status Badge Component
function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'status-pending', label: t('orders.pending') },
    confirmed: { className: 'status-confirmed', label: t('orders.confirmed') },
    in_delivery: { className: 'status-in_delivery', label: t('orders.inDelivery') },
    delivered: { className: 'status-delivered', label: t('orders.delivered') },
    cancelled: { className: 'status-cancelled', label: t('orders.cancelled') },
  };

  const config = statusConfig[status] || { className: 'bg-gray-500 text-white', label: status };

  return (
    <Badge className={`${config.className} font-medium`}>{config.label}</Badge>
  );
}

// Category Icon Component
function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    bread: <CircleDot className="h-5 w-5" />,
    pastry: <Cookie className="h-5 w-5" />,
    sweets: <Heart className="h-5 w-5" />,
  };
  return icons[category] || <Package className="h-5 w-5" />;
}

// Language Selector Component
function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
      <Globe className="h-4 w-4 text-[#D4A853]" />
      <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
        <SelectTrigger className="w-[130px] border-0 bg-transparent text-white focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-[#E8DFD0]">
          <SelectItem value="ar" className="hover:bg-[#F5EDE0]">العربية</SelectItem>
          <SelectItem value="en" className="hover:bg-[#F5EDE0]">English</SelectItem>
          <SelectItem value="nl" className="hover:bg-[#F5EDE0]">Nederlands</SelectItem>
          <SelectItem value="ku" className="hover:bg-[#F5EDE0]">کوردی</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, trend }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-3xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className="text-xs text-[#2D5A3D] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#B8923F] shadow-md">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="h-1 gold-gradient" />
    </Card>
  );
}

// Orders Tab Component
function OrdersTab() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  const fetchDeliveryLines = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery-lines');
      const data = await res.json();
      setDeliveryLines(data);
    } catch (error) {
      console.error('Error fetching delivery lines:', error);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    void fetchDrivers();
    void fetchDeliveryLines();
  }, [fetchOrders, fetchDrivers, fetchDeliveryLines]);

  const updateOrderStatus = async (orderId: string, status: string, driverId?: string) => {
    try {
      const updateData: { status: string; driverId?: string } = { status };
      if (driverId) updateData.driverId = driverId;
      
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    if (language === 'ku') return product.nameAr;
    return product.nameEn;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_delivery: orders.filter(o => o.status === 'in_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('orders.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{orders.length} {t('orders.total')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] border-[#E8DFD0] bg-white">
              <SelectValue placeholder={t('actions.filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('orders.title')} ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">{t('orders.pending')} ({statusCounts.pending})</SelectItem>
              <SelectItem value="confirmed">{t('orders.confirmed')} ({statusCounts.confirmed})</SelectItem>
              <SelectItem value="in_delivery">{t('orders.inDelivery')} ({statusCounts.in_delivery})</SelectItem>
              <SelectItem value="delivered">{t('orders.delivered')} ({statusCounts.delivered})</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#2D5A3D]">{order.orderNumber}</span>
                          <StatusBadge status={order.status} t={t} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#7A6F63]">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.customer.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer.phone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-[#7A6F63]">{order.deliveryTime || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                          {getProductName(item.product)} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    
                    {order.driver && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-[#2D5A3D]">
                        <Truck className="h-4 w-4" />
                        <span>{order.driver.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
                          <Eye className="h-4 w-4 mr-1" />
                          {t('actions.view')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
                        <DialogHeader>
                          <DialogTitle className="text-[#3D3229]">{t('orders.orderNumber')}: {order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('orders.confirmed')}</SelectItem>
                                <SelectItem value="in_delivery">{t('orders.inDelivery')}</SelectItem>
                                <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.driver')}</Label>
                            <Select 
                              value={order.driverId || ''} 
                              onValueChange={(value) => updateOrderStatus(order.id, order.status, value)}
                            >
                              <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                                <SelectValue placeholder={t('orders.driver')} />
                              </SelectTrigger>
                              <SelectContent>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="p-4 bg-[#F5EDE0] rounded-xl">
                            <div className="font-medium text-[#3D3229]">{order.customer.name}</div>
                            <div className="text-sm text-[#7A6F63] mt-1">{order.customer.phone}</div>
                            <div className="text-sm text-[#7A6F63]">{order.customer.address}, {order.customer.city}</div>
                          </div>
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.items')}</Label>
                            <div className="mt-2 space-y-2">
                              {order.orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-[#FFFEF7] rounded-lg border border-[#E8DFD0]">
                                  <span className="text-[#3D3229]">{getProductName(item.product)} × {item.quantity}</span>
                                  <span className="font-medium text-[#D4A853]">€{item.total.toFixed(2)}</span>
                                </div>
                              ))}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-bold text-[#3D3229]">
                                <span>{t('orders.total')}</span>
                                <span className="text-[#D4A853]">€{order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Products Tab Component
function ProductsTab() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    nameAr: '', nameEn: '', nameNl: '', description: '', price: '', category: 'bread', stock: '',
    sku: '', weight: '', packSize: '5', boxSize: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData({ nameAr: '', nameEn: '', nameNl: '', description: '', price: '', category: 'bread', stock: '', sku: '', weight: '', packSize: '5', boxSize: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      nameNl: product.nameNl,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      packSize: product.packSize.toString(),
      boxSize: product.boxSize?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    if (language === 'ku') return product.nameAr;
    return product.nameEn;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      bread: t('products.bread'),
      pastry: t('products.pastry'),
      sweets: t('products.sweets'),
    };
    return categories[category] || category;
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categoryColors: Record<string, string> = {
    bread: 'from-amber-500 to-amber-600',
    pastry: 'from-orange-500 to-orange-600',
    sweets: 'from-rose-500 to-rose-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('products.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{products.length} {t('products.stock')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('products.category')}</SelectItem>
              <SelectItem value="bread">{t('products.bread')}</SelectItem>
              <SelectItem value="pastry">{t('products.pastry')}</SelectItem>
              <SelectItem value="sweets">{t('products.sweets')}</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => { setEditingProduct(null); setFormData({ nameAr: '', nameEn: '', nameNl: '', description: '', price: '', category: 'bread', stock: '', sku: '', weight: '', packSize: '5', boxSize: '' }); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('products.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{editingProduct ? t('products.edit') : t('products.add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('products.nameAr')}</Label>
                  <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('products.nameEn')}</Label>
                  <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('products.nameNl')}</Label>
                  <Input value={formData.nameNl} onChange={(e) => setFormData({...formData, nameNl: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('products.description')}</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{t('orders.price')} (€)</Label>
                    <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('products.stock')}</Label>
                    <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('products.category')}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bread">{t('products.bread')}</SelectItem>
                      <SelectItem value="pastry">{t('products.pastry')}</SelectItem>
                      <SelectItem value="sweets">{t('products.sweets')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">SKU</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="B001" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوزن (غرام)' : 'Weight (g)'}</Label>
                    <Input type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="320" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الأرغفة/الربطة' : 'Loaves/Pack'}</Label>
                    <Input type="number" value={formData.packSize} onChange={(e) => setFormData({...formData, packSize: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الربطات/الصندوق' : 'Packs/Box'}</Label>
                    <Input type="number" value={formData.boxSize} onChange={(e) => setFormData({...formData, boxSize: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="15" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-40 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`card-hover border-0 shadow-md overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}>
              <div className={`h-2 bg-gradient-to-r ${categoryColors[product.category]}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[product.category]} text-white`}>
                      <CategoryIcon category={product.category} />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#3D3229]">{getProductName(product)}</CardTitle>
                      <CardDescription className="text-[#7A6F63]">{getCategoryLabel(product.category)}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Product Specifications */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {product.weight && (
                    <div className="flex flex-col items-center p-2 bg-[#F5EDE0] rounded-lg">
                      <Scale className="h-4 w-4 text-[#D4A853] mb-1" />
                      <span className="text-xs text-[#7A6F63]">{language === 'ar' ? 'الوزن' : 'Weight'}</span>
                      <span className="text-sm font-bold text-[#3D3229]">{product.weight}g</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center p-2 bg-[#F5EDE0] rounded-lg">
                    <Package className="h-4 w-4 text-[#D4A853] mb-1" />
                    <span className="text-xs text-[#7A6F63]">{language === 'ar' ? 'الربطة' : 'Pack'}</span>
                    <span className="text-sm font-bold text-[#3D3229]">{product.packSize} {language === 'ar' ? 'رغيف' : 'pcs'}</span>
                  </div>
                  {product.boxSize && (
                    <div className="flex flex-col items-center p-2 bg-[#F5EDE0] rounded-lg">
                      <Box className="h-4 w-4 text-[#D4A853] mb-1" />
                      <span className="text-xs text-[#7A6F63]">{language === 'ar' ? 'الصندوق' : 'Box'}</span>
                      <span className="text-sm font-bold text-[#3D3229]">{product.boxSize} {language === 'ar' ? 'ربطة' : 'packs'}</span>
                    </div>
                  )}
                </div>
                
                {product.sku && (
                  <div className="text-xs text-[#7A6F63] mb-2">
                    SKU: <span className="font-mono font-medium">{product.sku}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-[#D4A853]">€{product.price.toFixed(2)}</span>
                  <Badge variant={product.stock < 20 ? 'destructive' : 'secondary'} className={product.stock < 20 ? '' : 'bg-[#2D5A3D] text-white'}>
                    {product.stock} {t('products.stock')}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-[#E8DFD0] text-[#7A6F63] hover:bg-[#F5EDE0]" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t('actions.edit')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#7A6F63]">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('messages.noData')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Drivers Tab Component
function DriversTab() {
  const { t, language } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', deliveryLineId: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [driversRes, linesRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/delivery-lines'),
      ]);
      const driversData = await driversRes.json();
      const linesData = await linesRes.json();
      setDrivers(driversData);
      setDeliveryLines(linesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ name: '', phone: '', email: '', deliveryLineId: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const getLineName = (line: DeliveryLine | { id: string; nameAr: string; nameEn: string; nameNl?: string; region?: string } | null) => {
    if (!line) return '-';
    if (language === 'ar') return line.nameAr;
    if (language === 'nl') return line.nameNl || line.nameEn;
    if (language === 'ku') return line.nameAr;
    return line.nameEn;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('drivers.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{drivers.length} {t('drivers.title')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => setFormData({ name: '', phone: '', email: '', deliveryLineId: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              {t('drivers.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('drivers.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.name')}</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.phone')}</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.email')}</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.line')}</Label>
                <Select value={formData.deliveryLineId} onValueChange={(value) => setFormData({...formData, deliveryLineId: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('drivers.line')} />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryLines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {getLineName(line)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((driver) => (
            <Card key={driver.id} className={`card-hover border-0 shadow-md overflow-hidden ${!driver.isActive ? 'opacity-60' : ''}`}>
              <div className="h-2 green-gradient" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center text-white font-bold text-lg">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-[#3D3229]">{driver.name}</CardTitle>
                    <Badge variant={driver.isActive ? 'default' : 'secondary'} className={driver.isActive ? 'bg-[#2D5A3D]' : ''}>
                      {driver.isActive ? t('products.active') : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#7A6F63]">
                    <Phone className="h-4 w-4 text-[#D4A853]" />
                    <span dir="ltr">{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#7A6F63]">
                    <MapPin className="h-4 w-4 text-[#D4A853]" />
                    <span>{getLineName(driver.deliveryLine)}</span>
                  </div>
                  {driver.orders && driver.orders.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E8DFD0]">
                      <span className="text-[#7A6F63]">{t('drivers.activeOrders')}: </span>
                      <Badge className="bg-[#D4A853]">{driver.orders.length}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Delivery Lines Tab Component
function DeliveryLinesTab() {
  const { t, language } = useLanguage();
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ nameAr: '', nameEn: '', nameNl: '', region: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-lines');
      const data = await res.json();
      setDeliveryLines(data);
    } catch (error) {
      console.error('Error fetching delivery lines:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/delivery-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ nameAr: '', nameEn: '', nameNl: '', region: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving delivery line:', error);
    }
  };

  const getLineName = (line: DeliveryLine) => {
    if (language === 'ar') return line.nameAr;
    if (language === 'nl') return line.nameNl;
    if (language === 'ku') return line.nameAr;
    return line.nameEn;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('lines.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{deliveryLines.length} {t('lines.title')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('lines.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('lines.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('products.nameAr')}</Label>
                <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('products.nameEn')}</Label>
                <Input value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('products.nameNl')}</Label>
                <Input value={formData.nameNl} onChange={(e) => setFormData({...formData, nameNl: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('lines.region')}</Label>
                <Input value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-28 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {deliveryLines.map((line) => (
            <Card key={line.id} className="card-hover border-0 shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#4A7A5C]" />
              <CardHeader className="pb-2">
                <CardTitle className="text-[#3D3229]">{getLineName(line)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-[#F5EDE0] rounded-lg">
                    <MapPin className="h-4 w-4 text-[#2D5A3D]" />
                    <span className="text-[#5C4033]">{t('lines.region')}: {line.region}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-[#F5EDE0] rounded-lg">
                    <Users className="h-4 w-4 text-[#2D5A3D]" />
                    <span className="text-[#5C4033]">{t('drivers.title')}: {line.drivers?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-[#F5EDE0] rounded-lg">
                    <ShoppingBag className="h-4 w-4 text-[#2D5A3D]" />
                    <span className="text-[#5C4033]">{t('orders.title')}: {line._count?.orders || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Driver App Component
function DriverApp() {
  const { t, language } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers?activeOnly=true');
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!selectedDriver) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?driverId=${selectedDriver}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  }, [selectedDriver]);

  useEffect(() => {
    void fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const updateLocation = async () => {
    if (!selectedDriver) return;
    const latitude = 52.0 + Math.random() * 0.5;
    const longitude = 4.0 + Math.random() * 1.5;
    try {
      await fetch(`/api/drivers/${selectedDriver}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latitude, 
          longitude,
          currentLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }),
      });
      alert(t('messages.success'));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    if (language === 'ku') return product.nameAr;
    return product.nameEn;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('driver.myOrders')}</h2>
          <p className="text-sm text-[#7A6F63]">{orders.length} {t('orders.title')}</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger className="w-[200px] border-[#E8DFD0] bg-white">
              <SelectValue placeholder={t('orders.driver')} />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={updateLocation} className="border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
            <Navigation className="h-4 w-4 mr-2" />
            {t('driver.updateLocation')}
          </Button>
        </div>
      </div>

      {!selectedDriver ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Truck className="h-16 w-16 mx-auto mb-4 text-[#D4A853] opacity-50" />
            <p className="text-[#7A6F63]">{t('messages.noData')}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-48 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-[#D4A853] opacity-50" />
                <p className="text-[#7A6F63]">{t('messages.noData')}</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="card-hover border-0 shadow-md overflow-hidden">
                <div className="h-1.5 status-in_delivery" />
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#2D5A3D] text-white">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#3D3229]">{order.orderNumber}</span>
                          <StatusBadge status={order.status} t={t} />
                        </div>
                        <span className="text-sm text-[#7A6F63]">{order.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#3D3229] flex items-center gap-2">
                        <User className="h-4 w-4 text-[#D4A853]" />
                        {t('driver.customerInfo')}
                      </h4>
                      <div className="p-4 bg-[#F5EDE0] rounded-xl space-y-2">
                        <div className="font-medium text-[#3D3229]">{order.customer.name}</div>
                        <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${order.customer.phone}`} className="text-[#2D5A3D] hover:underline">
                            {order.customer.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                          <MapPin className="h-4 w-4" />
                          <span>{order.customer.address}, {order.customer.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#3D3229] flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#D4A853]" />
                        {t('orders.items')}
                      </h4>
                      <div className="p-4 bg-[#FFFEF7] rounded-xl border border-[#E8DFD0] space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-[#3D3229]">{getProductName(item.product)} × {item.quantity}</span>
                            <span className="text-[#D4A853] font-medium">€{item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                      <strong>{t('orders.notes')}:</strong> {order.notes}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {order.status === 'pending' && (
                      <Button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="flex-1 green-gradient text-white border-0">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('actions.confirm')}
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button onClick={() => updateOrderStatus(order.id, 'in_delivery')} className="flex-1 gold-gradient text-white border-0">
                        <Truck className="h-4 w-4 mr-2" />
                        {t('driver.startDelivery')}
                      </Button>
                    )}
                    {order.status === 'in_delivery' && (
                      <Button onClick={() => updateOrderStatus(order.id, 'delivered')} className="flex-1 bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('driver.completeDelivery')}
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Badge className="bg-[#2D5A3D] text-white px-4 py-2 text-base">{t('orders.delivered')}</Badge>
                    )}
                    <Button variant="outline" asChild className="border-[#D4A853] text-[#D4A853]">
                      <a href={`tel:${order.customer.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {t('driver.callCustomer')}
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="border-[#2D5A3D] text-[#2D5A3D]">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address + ', ' + order.customer.city)}`} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-4 w-4 mr-2" />
                        {t('driver.navigate')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// AI & Predictions Tab Component
function AIPredictionsTab() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'predictions' | 'recommendations' | 'anomalies'>('predictions');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    predictions: { totalProducts: 0, averageConfidence: 0, highDemandProducts: 0 },
    recommendations: { total: 0, byType: { frequently_bought: 0, seasonal: 0, trending: 0, customer_based: 0 } },
    anomalies: { total: 0, bySeverity: { critical: 0, high: 0, medium: 0, low: 0 } }
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [predRes, recRes, anomRes] = await Promise.all([
        fetch('/api/ai/predictions'),
        fetch('/api/ai/recommendations'),
        fetch('/api/ai/anomalies')
      ]);
      
      const predData = await predRes.json();
      const recData = await recRes.json();
      const anomData = await anomRes.json();
      
      setPredictions(predData.predictions || []);
      setRecommendations(recData.recommendations || []);
      setAnomalies(anomData.anomalies || []);
      setSummary({
        predictions: predData.summary || { totalProducts: 0, averageConfidence: 0, highDemandProducts: 0 },
        recommendations: recData.summary || { total: 0, byType: { frequently_bought: 0, seasonal: 0, trending: 0, customer_based: 0 } },
        anomalies: anomData.summary || { total: 0, bySeverity: { critical: 0, high: 0, medium: 0, low: 0 } }
      });
    } catch (error) {
      console.error('Error fetching AI data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-[#2D5A3D]" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <div className="h-4 w-4 rounded-full bg-[#D4A853]" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return colors[severity] || 'bg-gray-500 text-white';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      frequently_bought: t('ai.frequentlyBought'),
      seasonal: t('ai.seasonal'),
      trending: t('ai.trending'),
      customer_based: t('ai.customerBased')
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('ai.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'تحليلات ذكية للمخبز' : 'Smart analytics for the bakery'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F5EDE0] rounded-lg p-1">
            {(['predictions', 'recommendations', 'anomalies'] as const).map((section) => (
              <Button
                key={section}
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(section)}
                className={`${activeSection === section ? 'bg-white shadow-sm text-[#2D5A3D]' : 'text-[#7A6F63]'} rounded-md`}
              >
                {section === 'predictions' && t('ai.demandForecast')}
                {section === 'recommendations' && t('ai.recommendations')}
                {section === 'anomalies' && t('ai.anomalyDetection')}
              </Button>
            ))}
          </div>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {activeSection === 'predictions' && (
          <>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 gold-gradient" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المنتجات المتوقعة' : 'Products Predicted'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.predictions.totalProducts}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#D4A853]/10">
                    <Package className="h-6 w-6 text-[#D4A853]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 green-gradient" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('ai.confidence')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{(summary.predictions.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#2D5A3D]/10">
                    <TrendingUp className="h-6 w-6 text-[#2D5A3D]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'طلب مرتفع' : 'High Demand'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.predictions.highDemandProducts}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {activeSection === 'recommendations' && (
          <>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 gold-gradient" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي التوصيات' : 'Total Recommendations'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.recommendations.total}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#D4A853]/10">
                    <Heart className="h-6 w-6 text-[#D4A853]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 green-gradient" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('ai.trending')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.recommendations.byType.trending}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#2D5A3D]/10">
                    <TrendingUp className="h-6 w-6 text-[#2D5A3D]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('ai.frequentlyBought')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.recommendations.byType.frequently_bought}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <ShoppingBag className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {activeSection === 'anomalies' && (
          <>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-red-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الشذوذات' : 'Total Anomalies'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.anomalies.total}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-orange-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('ai.critical')} + {t('ai.high')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.anomalies.bySeverity.critical + summary.anomalies.bySeverity.high}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <AlertCircle className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-yellow-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('ai.medium')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{summary.anomalies.bySeverity.medium}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {/* Predictions Section */}
            {activeSection === 'predictions' && predictions.map((pred) => (
              <Card key={pred.productId} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">{pred.productName}</span>
                          {getTrendIcon(pred.trend)}
                          <Badge className="bg-[#F5EDE0] text-[#5C4033]">{pred.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#7A6F63]">
                          <span>{t('ai.confidence')}: {(pred.predictions.daily.confidence * 100).toFixed(0)}%</span>
                          <span>{t('ai.accuracy')}: {pred.accuracy?.toFixed(0) || 85}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                        <p className="text-xs text-[#7A6F63]">{t('ai.daily')}</p>
                        <p className="text-xl font-bold text-[#D4A853]">{pred.predictions.daily.value}</p>
                      </div>
                      <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                        <p className="text-xs text-[#7A6F63]">{t('ai.weekly')}</p>
                        <p className="text-xl font-bold text-[#2D5A3D]">{pred.predictions.weekly.value}</p>
                      </div>
                      <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                        <p className="text-xs text-[#7A6F63]">{t('ai.monthly')}</p>
                        <p className="text-xl font-bold text-[#5C4033]">{pred.predictions.monthly.value}</p>
                      </div>
                    </div>

                    {pred.factors && pred.factors.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {pred.factors.slice(0, 3).map((factor: any, idx: number) => (
                          <div key={idx} className="px-3 py-1.5 bg-[#FFFEF7] border border-[#E8DFD0] rounded-full text-xs text-[#7A6F63]">
                            {factor.name}: {factor.impact}%
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Recommendations Section */}
            {activeSection === 'recommendations' && recommendations.map((rec) => (
              <Card key={rec.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">{rec.productName}</span>
                          <Badge className="bg-[#2D5A3D] text-white">{getTypeLabel(rec.type)}</Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {rec.reason}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#D4A853]">€{rec.price?.toFixed(2)}</div>
                        <div className="text-sm text-[#7A6F63]">{t('ai.score')}: {(rec.score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    {rec.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rec.metadata.frequency && (
                          <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                            {language === 'ar' ? 'التكرار' : 'Frequency'}: {rec.metadata.frequency}
                          </div>
                        )}
                        {rec.metadata.seasonality && (
                          <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                            {rec.metadata.seasonality}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Anomalies Section */}
            {activeSection === 'anomalies' && anomalies.map((anom) => (
              <Card key={anom.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${anom.severity === 'critical' ? 'text-red-500' : anom.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`} />
                          <span className="text-lg font-bold text-[#3D3229]">{anom.title}</span>
                          <Badge className={getSeverityColor(anom.severity)}>{t(`ai.${anom.severity}`)}</Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {anom.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#D4A853]">{(anom.score * 100).toFixed(0)}%</div>
                        <div className="text-sm text-[#7A6F63]">{t('ai.score')}</div>
                      </div>
                    </div>
                    
                    {anom.suggestedAction && (
                      <div className="mt-3 p-3 bg-[#FFFEF7] border border-[#E8DFD0] rounded-lg">
                        <p className="text-sm text-[#2D5A3D] font-medium">{t('ai.suggestedAction')}:</p>
                        <p className="text-sm text-[#7A6F63]">{anom.suggestedAction}</p>
                      </div>
                    )}

                    {anom.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {anom.metadata.value !== undefined && (
                          <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                            {language === 'ar' ? 'القيمة' : 'Value'}: {anom.metadata.value}
                          </div>
                        )}
                        {anom.metadata.deviation !== undefined && (
                          <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                            {t('ai.variance')}: {anom.metadata.deviation}%
                          </div>
                        )}
                        {anom.metadata.orderNumber && (
                          <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                            #{anom.metadata.orderNumber}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Empty State */}
            {((activeSection === 'predictions' && predictions.length === 0) ||
              (activeSection === 'recommendations' && recommendations.length === 0) ||
              (activeSection === 'anomalies' && anomalies.length === 0)) && (
              <div className="text-center py-12 text-[#7A6F63]">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Main App Component
function AppContent() {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ todayOrders: 0, pendingOrders: 0, inDelivery: 0, totalRevenue: 0 });
  const [seeded, setSeeded] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const orders: Order[] = await res.json();
      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      setStats({
        todayOrders: todayOrders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inDelivery: orders.filter(o => o.status === 'in_delivery').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const seedDatabase = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      setSeeded(true);
      fetchStats();
      alert(t('messages.success'));
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className={`min-h-screen bg-[#FFFEF7] ${isRTL ? 'rtl' : 'ltr'} arabic-pattern`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#2D5A3D] via-[#3A6B4A] to-[#2D5A3D] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center shadow-md">
                  <Store className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t('app.title')}</h1>
                <p className="text-xs text-white/70">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={fetchStats} className="text-white/70 hover:text-white hover:bg-white/10">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#E8DFD0] shadow-sm">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-thin">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 bg-transparent gap-1 w-max min-w-full flex-nowrap">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <BarChart3 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('app.dashboard')}</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <ShoppingBag className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.orders')}</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Package className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.products')}</span>
              </TabsTrigger>
              <TabsTrigger value="drivers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.drivers')}</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.customers')}</span>
              </TabsTrigger>
              <TabsTrigger value="deliveryLines" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.deliveryLines')}</span>
              </TabsTrigger>
              <TabsTrigger value="driverApp" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Truck className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('app.driverApp')}</span>
              </TabsTrigger>
              <TabsTrigger value="aiPredictions" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <TrendingUp className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.aiPredictions')}</span>
              </TabsTrigger>
              <TabsTrigger value="qualitySafety" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <ShieldCheck className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.qualitySafety')}</span>
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Car className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.vehicles')}</span>
              </TabsTrigger>
              <TabsTrigger value="bakery" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Cookie className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.bakery')}</span>
              </TabsTrigger>
              <TabsTrigger value="accounting" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Wallet className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('accounting.title')}</span>
              </TabsTrigger>
              <TabsTrigger value="preorders" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.preorders')}</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Warehouse className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.inventory') || 'Inventory'}</span>
              </TabsTrigger>
              <TabsTrigger value="webshop" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Store className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.webshop')}</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Link2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{t('nav.integrations')}</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <FileText className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'التقارير' : 'Reports'}</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <CreditCard className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'الدفع' : 'Payments'}</span>
              </TabsTrigger>
              <TabsTrigger value="pos" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <ShoppingCart className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'نقطة البيع' : 'POS'}</span>
              </TabsTrigger>
              <TabsTrigger value="production" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <ChefHat className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'الإنتاج' : 'Production'}</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Star className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'التقييمات' : 'Reviews'}</span>
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Bot className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'المحادثة' : 'Chatbot'}</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <MapPinned className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'التتبع' : 'Tracking'}</span>
              </TabsTrigger>
              <TabsTrigger value="customerApp" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Smartphone className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'تطبيق العملاء' : 'Customer App'}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3 py-2 whitespace-nowrap">
                <Bell className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0 space-y-6">
            <AdvancedDashboardTab />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="drivers" className="mt-0">
            <DriversTab />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <AdvancedCustomerManagementTab />
          </TabsContent>

          <TabsContent value="deliveryLines" className="mt-0">
            <DeliveryLinesTab />
          </TabsContent>

          <TabsContent value="driverApp" className="mt-0">
            <DriverApp />
          </TabsContent>

          <TabsContent value="aiPredictions" className="mt-0">
            <AIPredictionsTab />
          </TabsContent>

          <TabsContent value="qualitySafety" className="mt-0">
            <QualitySafetyTab />
          </TabsContent>

          <TabsContent value="accounting" className="mt-0">
            <AccountingTab />
          </TabsContent>

          <TabsContent value="preorders" className="mt-0">
            <PreOrdersTab />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="vehicles" className="mt-0">
            <VehiclesTab />
          </TabsContent>

          <TabsContent value="bakery" className="mt-0">
            <BakeryTab />
          </TabsContent>

          <TabsContent value="webshop" className="mt-0">
            <WebshopTab />
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <AdvancedReportsTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <PaymentSystemTab />
          </TabsContent>

          <TabsContent value="pos" className="mt-0">
            <POSTab />
          </TabsContent>

          <TabsContent value="production" className="mt-0">
            <DailyProductionTab />
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <CustomerReviewsTab />
          </TabsContent>

          <TabsContent value="chatbot" className="mt-0">
            <CustomerChatbotTab />
          </TabsContent>

          <TabsContent value="tracking" className="mt-0">
            <LiveTrackingTab />
          </TabsContent>

          <TabsContent value="customerApp" className="mt-0">
            <CustomerAppTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8DFD0] bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#3D3229]">{t('app.title')}</div>
                <div className="text-sm text-[#7A6F63]">{t('app.subtitle')}</div>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-[#7A6F63]">
              <p>Amsterdam, Netherlands</p>
              <p>© 2025 {t('app.title')} - جميع الحقوق محفوظة</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
