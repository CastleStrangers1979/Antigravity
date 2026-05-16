 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  Package, Calendar as CalendarIcon, Clock, AlertCircle, DollarSign, ShoppingBag, User,
  CheckCircle, XCircle, Bell, BellRing, TrendingUp, Plus, Edit, Trash2, Eye,
  RefreshCw, Play, Pause, Gift, Zap, Target, PieChart, LineChart, CreditCard,
  ArrowUpRight, ArrowDownRight, ChevronRight, ChevronLeft, Star, Award,
  Smartphone, Mail, MessageSquare
} from 'lucide-react';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  price: number;
  category: string;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
}

interface PreOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string | null;
}

interface PreOrder {
  id: string;
  customerId: string;
  customer: Customer;
  status: string;
  deliveryDate: string;
  deliveryTime: string | null;
  priority: number;
  notes: string | null;
  totalAmount: number;
  depositAmount: number;
  isPaid: boolean;
  reminderSent: boolean;
  createdAt: string;
  preOrderItems: PreOrderItem[];
}

interface SubscriptionItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  isActive: boolean;
}

interface Subscription {
  id: string;
  customerId: string;
  customer: Customer;
  name: string;
  frequency: string;
  daysOfWeek: string | null;
  preferredTime: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  nextDeliveryDate: string | null;
  totalDeliveries: number;
  discount: number;
  notes: string | null;
  subscriptionItems: SubscriptionItem[];
}

interface PreOrderStats {
  totalPreOrders: number;
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  topProducts: Array<{ product: Product; count: number; revenue: number }>;
  dailyRevenue: Array<{ date: string; count: number; revenue: number }>;
}

// Pre-order Status Badge Component
function PreOrderStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-amber-100 text-amber-700 border-amber-200', label: t('preorders.pending') },
    confirmed: { className: 'bg-blue-100 text-blue-700 border-blue-200', label: t('preorders.confirmed') },
    processing: { className: 'bg-purple-100 text-purple-700 border-purple-200', label: t('preorders.processing') },
    completed: { className: 'bg-green-100 text-green-700 border-green-200', label: t('preorders.completed') },
    cancelled: { className: 'bg-red-100 text-red-700 border-red-200', label: t('preorders.cancelled') },
  };

  const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-700', label: status };

  return (
    <Badge className={`${config.className} font-medium border`}>{config.label}</Badge>
  );
}

// Subscription Status Badge Component
function SubscriptionStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    active: { className: 'bg-green-100 text-green-700 border-green-200', label: t('subscriptions.active') },
    paused: { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: t('subscriptions.paused') },
    cancelled: { className: 'bg-gray-100 text-gray-700 border-gray-200', label: t('subscriptions.cancelled') },
  };

  const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-700', label: status };

  return (
    <Badge className={`${config.className} font-medium border`}>{config.label}</Badge>
  );
}

// Main PreOrders Tab Component
export default function PreOrdersTab() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  
  // State
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<PreOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'create' | 'subscriptions' | 'reminders' | 'analytics'>('dashboard');
  
  // Dialog states
  const [isPreOrderDialogOpen, setIsPreOrderDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  // Form states
  const [preOrderForm, setPreOrderForm] = useState({
    customerId: '',
    deliveryDate: '',
    deliveryTime: '',
    priority: 0,
    notes: '',
    depositAmount: 0,
    items: [] as Array<{ productId: string; quantity: number; notes: string }>,
  });
  
  const [subscriptionForm, setSubscriptionForm] = useState({
    customerId: '',
    name: '',
    frequency: 'weekly',
    daysOfWeek: [] as string[],
    preferredTime: '',
    startDate: '',
    endDate: '',
    discount: 0,
    notes: '',
    items: [] as Array<{ productId: string; quantity: number }>,
  });
  
  // Calendar state
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [selectedDatePreOrders, setSelectedDatePreOrders] = useState<PreOrder[]>([]);
  
  // Reminder settings
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    channels: ['sms', 'email'] as string[],
    hoursBefore: 24,
    dayBefore: true,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [preOrdersRes, subscriptionsRes, customersRes, productsRes, statsRes] = await Promise.all([
        fetch('/api/preorders?upcoming=true'),
        fetch('/api/subscriptions'),
        fetch('/api/customers'),
        fetch('/api/products'),
        fetch('/api/preorders?stats=true'),
      ]);
      
      setPreOrders(await preOrdersRes.json());
      setSubscriptions(await subscriptionsRes.json());
      setCustomers(await customersRes.json());
      setProducts(await productsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Filter pre-orders by calendar date
  useEffect(() => {
    if (calendarDate) {
      const dateStr = format(calendarDate, 'yyyy-MM-dd');
      const filtered = preOrders.filter(po => {
        const poDate = new Date(po.deliveryDate).toISOString().split('T')[0];
        return poDate === dateStr;
      });
      setSelectedDatePreOrders(filtered);
    }
  }, [calendarDate, preOrders]);

  // Helper functions
  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 3) return <Badge className="bg-red-500 text-white">{t('preorders.priorityUrgent')}</Badge>;
    if (priority >= 2) return <Badge className="bg-orange-500 text-white">{t('preorders.priorityHigh')}</Badge>;
    if (priority >= 1) return <Badge className="bg-yellow-500 text-white">{t('preorders.priorityNormal')}</Badge>;
    return <Badge className="bg-gray-400 text-white">{t('preorders.priorityLow')}</Badge>;
  };

  // Handle create pre-order
  const handleCreatePreOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preOrderForm),
      });
      
      if (res.ok) {
        toast({
          title: t('messages.success'),
          description: language === 'ar' ? 'تم إنشاء الطلب المسبق' : 'Pre-order created successfully',
        });
        setIsPreOrderDialogOpen(false);
        resetPreOrderForm();
        fetchData();
      } else {
        const error = await res.json();
        toast({
          title: t('messages.error'),
          description: error.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating pre-order:', error);
      toast({
        title: t('messages.error'),
        description: '',
        variant: 'destructive',
      });
    }
  };

  // Handle update pre-order status
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/preorders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (res.ok) {
        toast({
          title: t('messages.success'),
          description: language === 'ar' ? 'تم تحديث الحالة' : 'Status updated',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle create subscription
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionForm),
      });
      
      if (res.ok) {
        toast({
          title: t('messages.success'),
          description: language === 'ar' ? 'تم إنشاء الاشتراك' : 'Subscription created successfully',
        });
        setIsSubscriptionDialogOpen(false);
        resetSubscriptionForm();
        fetchData();
      } else {
        const error = await res.json();
        toast({
          title: t('messages.error'),
          description: error.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  // Handle subscription actions
  const handleSubscriptionAction = async (id: string, action: 'pause' | 'resume' | 'cancel' | 'generateOrder') => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      
      if (res.ok) {
        toast({
          title: t('messages.success'),
          description: action === 'generateOrder' 
            ? (language === 'ar' ? 'تم إنشاء الطلب' : 'Order generated')
            : (language === 'ar' ? 'تم تحديث الاشتراك' : 'Subscription updated'),
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Reset forms
  const resetPreOrderForm = () => {
    setPreOrderForm({
      customerId: '',
      deliveryDate: '',
      deliveryTime: '',
      priority: 0,
      notes: '',
      depositAmount: 0,
      items: [],
    });
  };

  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      customerId: '',
      name: '',
      frequency: 'weekly',
      daysOfWeek: [],
      preferredTime: '',
      startDate: '',
      endDate: '',
      discount: 0,
      notes: '',
      items: [],
    });
  };

  // Add product to pre-order form
  const addProductToPreOrder = (productId: string) => {
    if (!preOrderForm.items.find(i => i.productId === productId)) {
      setPreOrderForm({
        ...preOrderForm,
        items: [...preOrderForm.items, { productId, quantity: 1, notes: '' }],
      });
    }
  };

  // Remove product from pre-order form
  const removeProductFromPreOrder = (productId: string) => {
    setPreOrderForm({
      ...preOrderForm,
      items: preOrderForm.items.filter(i => i.productId !== productId),
    });
  };

  // Add product to subscription form
  const addProductToSubscription = (productId: string) => {
    if (!subscriptionForm.items.find(i => i.productId === productId)) {
      setSubscriptionForm({
        ...subscriptionForm,
        items: [...subscriptionForm.items, { productId, quantity: 1 }],
      });
    }
  };

  // Remove product from subscription form
  const removeProductFromSubscription = (productId: string) => {
    setSubscriptionForm({
      ...subscriptionForm,
      items: subscriptionForm.items.filter(i => i.productId !== productId),
    });
  };

  // Calculate pre-order total
  const calculatePreOrderTotal = () => {
    return preOrderForm.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Days of week
  const weekDays = [
    { value: 'sunday', label: language === 'ar' ? 'الأحد' : 'Sunday' },
    { value: 'monday', label: language === 'ar' ? 'الإثنين' : 'Monday' },
    { value: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : 'Tuesday' },
    { value: 'wednesday', label: language === 'ar' ? 'الأربعاء' : 'Wednesday' },
    { value: 'thursday', label: language === 'ar' ? 'الخميس' : 'Thursday' },
    { value: 'friday', label: language === 'ar' ? 'الجمعة' : 'Friday' },
    { value: 'saturday', label: language === 'ar' ? 'السبت' : 'Saturday' },
  ];

  const maxRevenue = Math.max(...(stats?.dailyRevenue.map(d => d.revenue) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Package className="h-7 w-7 text-[#D4A853]" />
            {t('preorders.title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">
            {preOrders.length} {language === 'ar' ? 'طلب مسبق' : 'pre-orders'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isPreOrderDialogOpen} onOpenChange={setIsPreOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-white border-0" onClick={() => { resetPreOrderForm(); setSelectedPreOrder(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('preorders.create')}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E8DFD0]">
        {(['dashboard', 'create', 'subscriptions', 'reminders', 'analytics'] as const).map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section)}
            className={activeSection === section 
              ? 'bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white' 
              : 'border-[#E8DFD0] text-[#7A6F63] hover:bg-[#F5EDE0]'
            }
          >
            {section === 'dashboard' && <PieChart className="h-4 w-4 mr-1" />}
            {section === 'create' && <Plus className="h-4 w-4 mr-1" />}
            {section === 'subscriptions' && <RefreshCw className="h-4 w-4 mr-1" />}
            {section === 'reminders' && <Bell className="h-4 w-4 mr-1" />}
            {section === 'analytics' && <LineChart className="h-4 w-4 mr-1" />}
            {section === 'dashboard' && t('preorders.dashboard')}
            {section === 'create' && t('preorders.create')}
            {section === 'subscriptions' && t('subscriptions.title')}
            {section === 'reminders' && t('reminders.title')}
            {section === 'analytics' && t('analytics.title')}
          </Button>
        ))}
      </div>

      {/* ==================== DASHBOARD SECTION ==================== */}
      {activeSection === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'الطلبات القادمة' : 'Upcoming'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{preOrders.length}</p>
                  </div>
                  <div className="p-3 rounded-xl gold-gradient">
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'في الانتظار' : 'Pending'}</p>
                    <p className="text-2xl font-bold text-amber-600">{stats?.pendingCount || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مؤكدة' : 'Confirmed'}</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.confirmedCount || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl green-gradient">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</p>
                    <p className="text-2xl font-bold text-[#D4A853]">€{(stats?.totalRevenue || 0).toFixed(0)}</p>
                  </div>
                  <div className="p-3 rounded-xl gold-gradient">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Pre-orders */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#D4A853]" />
                  {t('preorders.upcoming')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  {preOrders.length === 0 ? (
                    <div className="text-center py-8 text-[#7A6F63]">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('messages.noData')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {preOrders.slice(0, 10).map((preOrder) => (
                        <div key={preOrder.id} className="p-3 bg-[#F5EDE0] rounded-xl">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-[#3D3229]">{preOrder.customer.name}</p>
                              <p className="text-sm text-[#7A6F63]">
                                {new Date(preOrder.deliveryDate).toLocaleDateString()} 
                                {preOrder.deliveryTime && ` - ${preOrder.deliveryTime}`}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <PreOrderStatusBadge status={preOrder.status} t={t} />
                                {getPriorityBadge(preOrder.priority)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#D4A853]">€{preOrder.totalAmount.toFixed(2)}</p>
                              <p className="text-xs text-[#7A6F63]">{preOrder.preOrderItems.length} {language === 'ar' ? 'منتجات' : 'items'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(preOrder.id, 'confirmed')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {language === 'ar' ? 'تأكيد' : 'Confirm'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleUpdateStatus(preOrder.id, 'processing')}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              {language === 'ar' ? 'معالجة' : 'Process'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#D4A853]" />
                  {t('preorders.calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  className="rounded-md border"
                />
                <Separator className="my-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#3D3229]">
                    {language === 'ar' ? 'طلبات في' : 'Orders on'} {calendarDate?.toLocaleDateString()}
                  </p>
                  {selectedDatePreOrders.length === 0 ? (
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'لا توجد طلبات' : 'No orders'}</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDatePreOrders.map((po) => (
                        <div key={po.id} className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg text-sm">
                          <span className="font-medium">{po.customer.name}</span>
                          <span className="text-[#D4A853]">€{po.totalAmount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ==================== CREATE PRE-ORDER SECTION ==================== */}
      {activeSection === 'create' && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229]">{t('preorders.create')}</CardTitle>
            <CardDescription>{language === 'ar' ? 'إنشاء طلب مسبق جديد' : 'Create a new pre-order'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePreOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.selectCustomer')}</Label>
                  <Select value={preOrderForm.customerId} onValueChange={(v) => setPreOrderForm({...preOrderForm, customerId: v})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select customer'} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Date */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.deliveryDate')}</Label>
                  <Input 
                    type="date" 
                    value={preOrderForm.deliveryDate}
                    onChange={(e) => setPreOrderForm({...preOrderForm, deliveryDate: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                    required 
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.deliveryTime')}</Label>
                  <Input 
                    type="time" 
                    value={preOrderForm.deliveryTime}
                    onChange={(e) => setPreOrderForm({...preOrderForm, deliveryTime: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.priority')}</Label>
                  <Select value={preOrderForm.priority.toString()} onValueChange={(v) => setPreOrderForm({...preOrderForm, priority: parseInt(v)})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t('preorders.priorityLow')}</SelectItem>
                      <SelectItem value="1">{t('preorders.priorityNormal')}</SelectItem>
                      <SelectItem value="2">{t('preorders.priorityHigh')}</SelectItem>
                      <SelectItem value="3">{t('preorders.priorityUrgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Deposit Amount */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.deposit')} (€)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={preOrderForm.depositAmount}
                    onChange={(e) => setPreOrderForm({...preOrderForm, depositAmount: parseFloat(e.target.value) || 0})}
                    className="mt-1.5 border-[#E8DFD0]" 
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <Label className="text-[#7A6F63]">{t('preorders.notes')}</Label>
                  <Textarea 
                    value={preOrderForm.notes}
                    onChange={(e) => setPreOrderForm({...preOrderForm, notes: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                    rows={2}
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.selectProducts')}</Label>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {products.slice(0, 8).map((product) => (
                    <Button
                      key={product.id}
                      type="button"
                      variant={preOrderForm.items.find(i => i.productId === product.id) ? 'default' : 'outline'}
                      size="sm"
                      className={`h-auto py-2 flex-col ${preOrderForm.items.find(i => i.productId === product.id) ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                      onClick={() => preOrderForm.items.find(i => i.productId === product.id) 
                        ? removeProductFromPreOrder(product.id) 
                        : addProductToPreOrder(product.id)
                      }
                    >
                      <span className="text-sm">{getProductName(product)}</span>
                      <span className="text-xs opacity-80">€{product.price.toFixed(2)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Items */}
              {preOrderForm.items.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'المنتجات المحددة' : 'Selected Items'}</Label>
                  {preOrderForm.items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-[#3D3229]">{getProductName(product)}</span>
                          <span className="text-sm text-[#7A6F63]">€{product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = preOrderForm.items.map(i => 
                                i.productId === item.productId ? {...i, quantity: parseInt(e.target.value) || 1} : i
                              );
                              setPreOrderForm({...preOrderForm, items: newItems});
                            }}
                            className="w-20 border-[#E8DFD0]"
                          />
                          <span className="font-bold text-[#D4A853]">€{(product.price * item.quantity).toFixed(2)}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeProductFromPreOrder(item.productId)}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center p-3 bg-[#D4A853]/10 rounded-lg border border-[#D4A853]">
                    <span className="font-bold text-[#3D3229]">{t('preorders.totalAmount')}</span>
                    <span className="text-xl font-bold text-[#D4A853]">€{calculatePreOrderTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="gold-gradient text-white border-0 w-full md:w-auto">
                {t('actions.save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ==================== SUBSCRIPTIONS SECTION ==================== */}
      {activeSection === 'subscriptions' && (
        <>
          <div className="flex justify-end">
            <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="green-gradient text-white border-0" onClick={() => { resetSubscriptionForm(); setSelectedSubscription(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('subscriptions.create')}
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Active Subscriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subscriptions.filter(s => s.status !== 'cancelled').map((sub) => (
              <Card key={sub.id} className={`border-0 shadow-md overflow-hidden ${sub.status === 'active' ? 'ring-2 ring-[#2D5A3D]' : ''}`}>
                <div className={`h-2 ${sub.status === 'active' ? 'green-gradient' : 'bg-yellow-500'}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#3D3229] text-lg">{sub.name}</CardTitle>
                      <SubscriptionStatusBadge status={sub.status} t={t} />
                    </div>
                    <Badge className="bg-[#D4A853]/20 text-[#D4A853]">
                      {t(`subscriptions.${sub.frequency}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-[#7A6F63]">
                      <User className="h-4 w-4 text-[#D4A853]" />
                      <span>{sub.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7A6F63]">
                      <CalendarIcon className="h-4 w-4 text-[#D4A853]" />
                      <span>{language === 'ar' ? 'التوصيل القادم' : 'Next'}: {sub.nextDeliveryDate ? new Date(sub.nextDeliveryDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7A6F63]">
                      <Package className="h-4 w-4 text-[#D4A853]" />
                      <span>{sub.subscriptionItems.length} {language === 'ar' ? 'منتجات' : 'products'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7A6F63]">
                      <Clock className="h-4 w-4 text-[#D4A853]" />
                      <span>{sub.totalDeliveries} {t('subscriptions.totalDeliveries')}</span>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex gap-2">
                    {sub.status === 'active' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          onClick={() => handleSubscriptionAction(sub.id, 'pause')}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          {t('subscriptions.pause')}
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 green-gradient text-white border-0"
                          onClick={() => handleSubscriptionAction(sub.id, 'generateOrder')}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {t('subscriptions.generateOrder')}
                        </Button>
                      </>
                    )}
                    {sub.status === 'paused' && (
                      <Button 
                        size="sm" 
                        className="flex-1 green-gradient text-white border-0"
                        onClick={() => handleSubscriptionAction(sub.id, 'resume')}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {t('subscriptions.resume')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {subscriptions.filter(s => s.status !== 'cancelled').length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-[#D4A853] opacity-50" />
                <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد اشتراكات نشطة' : 'No active subscriptions'}</p>
              </CardContent>
            </Card>
          )}

          {/* Create Subscription Dialog */}
          <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
            <DialogContent className="max-w-lg bg-white border-[#E8DFD0] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('subscriptions.create')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم الاشتراك' : 'Subscription Name'}</Label>
                  <Input 
                    value={subscriptionForm.name}
                    onChange={(e) => setSubscriptionForm({...subscriptionForm, name: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                    required 
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.selectCustomer')}</Label>
                  <Select value={subscriptionForm.customerId} onValueChange={(v) => setSubscriptionForm({...subscriptionForm, customerId: v})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select customer'} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'التكرار' : 'Frequency'}</Label>
                    <Select value={subscriptionForm.frequency} onValueChange={(v) => setSubscriptionForm({...subscriptionForm, frequency: v})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('subscriptions.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('subscriptions.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('subscriptions.monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('subscriptions.startDate')}</Label>
                    <Input 
                      type="date" 
                      value={subscriptionForm.startDate}
                      onChange={(e) => setSubscriptionForm({...subscriptionForm, startDate: e.target.value})}
                      className="mt-1.5 border-[#E8DFD0]" 
                      required 
                    />
                  </div>
                </div>
                
                {subscriptionForm.frequency === 'weekly' && (
                  <div>
                    <Label className="text-[#7A6F63]">{t('subscriptions.daysOfWeek')}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {weekDays.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={subscriptionForm.daysOfWeek.includes(day.value) ? 'default' : 'outline'}
                          size="sm"
                          className={subscriptionForm.daysOfWeek.includes(day.value) ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}
                          onClick={() => {
                            const newDays = subscriptionForm.daysOfWeek.includes(day.value)
                              ? subscriptionForm.daysOfWeek.filter(d => d !== day.value)
                              : [...subscriptionForm.daysOfWeek, day.value];
                            setSubscriptionForm({...subscriptionForm, daysOfWeek: newDays});
                          }}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <Label className="text-[#7A6F63]">{t('preorders.selectProducts')}</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {products.slice(0, 6).map((product) => (
                      <Button
                        key={product.id}
                        type="button"
                        variant={subscriptionForm.items.find(i => i.productId === product.id) ? 'default' : 'outline'}
                        size="sm"
                        className={`h-auto py-2 justify-start ${subscriptionForm.items.find(i => i.productId === product.id) ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                        onClick={() => subscriptionForm.items.find(i => i.productId === product.id) 
                          ? removeProductFromSubscription(product.id) 
                          : addProductToSubscription(product.id)
                        }
                      >
                        <span className="text-sm truncate">{getProductName(product)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {subscriptionForm.items.length > 0 && (
                  <div className="space-y-2">
                    {subscriptionForm.items.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg text-sm">
                          <span>{getProductName(product)}</span>
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = subscriptionForm.items.map(i => 
                                i.productId === item.productId ? {...i, quantity: parseInt(e.target.value) || 1} : i
                              );
                              setSubscriptionForm({...subscriptionForm, items: newItems});
                            }}
                            className="w-16 h-8 border-[#E8DFD0]"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <DialogFooter>
                  <Button type="submit" className="green-gradient text-white border-0">{t('actions.save')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ==================== REMINDERS SECTION ==================== */}
      {activeSection === 'reminders' && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <BellRing className="h-5 w-5 text-[#D4A853]" />
              {t('reminders.automatic')}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'إعداد التذكيرات التلقائية للطلبات المسبقة' : 'Configure automatic reminders for pre-orders'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Reminders */}
            <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-[#D4A853]" />
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'تفعيل التذكيرات' : 'Enable Reminders'}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إرسال تذكيرات تلقائية قبل التوصيل' : 'Send automatic reminders before delivery'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setReminderSettings({...reminderSettings, enabled: !reminderSettings.enabled})}
                className={reminderSettings.enabled ? 'text-[#2D5A3D]' : 'text-gray-400'}
              >
                {reminderSettings.enabled ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </Button>
            </div>

            {/* Notification Channels */}
            <div>
              <Label className="text-[#7A6F63] mb-3 block">{language === 'ar' ? 'قنوات الإرسال' : 'Notification Channels'}</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={reminderSettings.channels.includes('sms') ? 'default' : 'outline'}
                  className={`h-auto py-3 flex-col ${reminderSettings.channels.includes('sms') ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                  onClick={() => {
                    const newChannels = reminderSettings.channels.includes('sms')
                      ? reminderSettings.channels.filter(c => c !== 'sms')
                      : [...reminderSettings.channels, 'sms'];
                    setReminderSettings({...reminderSettings, channels: newChannels});
                  }}
                >
                  <Smartphone className="h-5 w-5 mb-1" />
                  <span className="text-sm">{t('reminders.sms')}</span>
                </Button>
                <Button
                  type="button"
                  variant={reminderSettings.channels.includes('email') ? 'default' : 'outline'}
                  className={`h-auto py-3 flex-col ${reminderSettings.channels.includes('email') ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                  onClick={() => {
                    const newChannels = reminderSettings.channels.includes('email')
                      ? reminderSettings.channels.filter(c => c !== 'email')
                      : [...reminderSettings.channels, 'email'];
                    setReminderSettings({...reminderSettings, channels: newChannels});
                  }}
                >
                  <Mail className="h-5 w-5 mb-1" />
                  <span className="text-sm">{t('reminders.email')}</span>
                </Button>
                <Button
                  type="button"
                  variant={reminderSettings.channels.includes('whatsapp') ? 'default' : 'outline'}
                  className={`h-auto py-3 flex-col ${reminderSettings.channels.includes('whatsapp') ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                  onClick={() => {
                    const newChannels = reminderSettings.channels.includes('whatsapp')
                      ? reminderSettings.channels.filter(c => c !== 'whatsapp')
                      : [...reminderSettings.channels, 'whatsapp'];
                    setReminderSettings({...reminderSettings, channels: newChannels});
                  }}
                >
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span className="text-sm">{t('reminders.whatsapp')}</span>
                </Button>
              </div>
            </div>

            {/* Timing */}
            <div>
              <Label className="text-[#7A6F63] mb-3 block">{t('reminders.timing')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5EDE0] rounded-xl">
                  <Label className="text-sm text-[#7A6F63]">{t('reminders.hoursBefore')}</Label>
                  <Select 
                    value={reminderSettings.hoursBefore.toString()} 
                    onValueChange={(v) => setReminderSettings({...reminderSettings, hoursBefore: parseInt(v)})}
                  >
                    <SelectTrigger className="mt-2 border-[#E8DFD0] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {language === 'ar' ? 'ساعة' : 'hour'}</SelectItem>
                      <SelectItem value="2">2 {language === 'ar' ? 'ساعات' : 'hours'}</SelectItem>
                      <SelectItem value="4">4 {language === 'ar' ? 'ساعات' : 'hours'}</SelectItem>
                      <SelectItem value="12">12 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                      <SelectItem value="24">24 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                      <SelectItem value="48">48 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-[#F5EDE0] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3D3229]">{t('reminders.dayBefore')}</p>
                      <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'تذكير يوم قبل التوصيل' : 'Reminder a day before delivery'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setReminderSettings({...reminderSettings, dayBefore: !reminderSettings.dayBefore})}
                      className={reminderSettings.dayBefore ? 'text-[#2D5A3D]' : 'text-gray-400'}
                    >
                      {reminderSettings.dayBefore ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Button className="gold-gradient text-white border-0">
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ==================== ANALYTICS SECTION ==================== */}
      {activeSection === 'analytics' && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('analytics.totalPreorders')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{stats.totalPreOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl gold-gradient">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('analytics.conversionRate')}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-xl green-gradient">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('analytics.totalRevenue')}</p>
                    <p className="text-2xl font-bold text-[#D4A853]">€{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl gold-gradient">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{t('analytics.avgOrderValue')}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">€{stats.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4A853]" />
                  {t('analytics.topProducts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length === 0 ? (
                  <div className="text-center py-8 text-[#7A6F63]">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('messages.noData')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topProducts.map((item, index) => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={`${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'} text-white`}>
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-[#3D3229]">{getProductName(item.product)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#D4A853]">{item.count}</p>
                          <p className="text-xs text-[#7A6F63]">€{item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#2D5A3D]" />
                  {t('analytics.revenueTrends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-[200px]">
                  {stats.dailyRevenue.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-[#D4A853] to-[#B8923F] rounded-t-sm min-h-[4px]"
                        style={{ height: `${Math.max((day.revenue / maxRevenue) * 150, 4)}px` }}
                      />
                      <span className="text-xs text-[#7A6F63]">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'توزيع الحالات' : 'Status Distribution'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
                  <p className="text-sm text-[#7A6F63]">{t('preorders.pending')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmedCount}</p>
                  <p className="text-sm text-[#7A6F63]">{t('preorders.confirmed')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{stats.processingCount}</p>
                  <p className="text-sm text-[#7A6F63]">{t('preorders.processing')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
                  <p className="text-sm text-[#7A6F63]">{t('preorders.completed')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">{stats.cancelledCount}</p>
                  <p className="text-sm text-[#7A6F63]">{t('preorders.cancelled')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Pre-order Dialog */}
      <Dialog open={isPreOrderDialogOpen} onOpenChange={setIsPreOrderDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-[#E8DFD0] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('preorders.create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePreOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.selectCustomer')}</Label>
                <Select value={preOrderForm.customerId} onValueChange={(v) => setPreOrderForm({...preOrderForm, customerId: v})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select customer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deliveryDate')}</Label>
                <Input 
                  type="date" 
                  value={preOrderForm.deliveryDate}
                  onChange={(e) => setPreOrderForm({...preOrderForm, deliveryDate: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deliveryTime')}</Label>
                <Input 
                  type="time" 
                  value={preOrderForm.deliveryTime}
                  onChange={(e) => setPreOrderForm({...preOrderForm, deliveryTime: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.priority')}</Label>
                <Select value={preOrderForm.priority.toString()} onValueChange={(v) => setPreOrderForm({...preOrderForm, priority: parseInt(v)})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('preorders.priorityLow')}</SelectItem>
                    <SelectItem value="1">{t('preorders.priorityNormal')}</SelectItem>
                    <SelectItem value="2">{t('preorders.priorityHigh')}</SelectItem>
                    <SelectItem value="3">{t('preorders.priorityUrgent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deposit')} (€)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={preOrderForm.depositAmount}
                  onChange={(e) => setPreOrderForm({...preOrderForm, depositAmount: parseFloat(e.target.value) || 0})}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
            </div>

            {/* Products */}
            <div>
              <Label className="text-[#7A6F63]">{t('preorders.selectProducts')}</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {products.slice(0, 9).map((product) => (
                  <Button
                    key={product.id}
                    type="button"
                    variant={preOrderForm.items.find(i => i.productId === product.id) ? 'default' : 'outline'}
                    size="sm"
                    className={`h-auto py-2 justify-start ${preOrderForm.items.find(i => i.productId === product.id) ? 'bg-[#2D5A3D] text-white' : 'border-[#E8DFD0]'}`}
                    onClick={() => preOrderForm.items.find(i => i.productId === product.id) 
                      ? removeProductFromPreOrder(product.id) 
                      : addProductToPreOrder(product.id)
                    }
                  >
                    <span className="text-sm truncate">{getProductName(product)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {preOrderForm.items.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'المنتجات المحددة' : 'Selected Items'}</Label>
                {preOrderForm.items.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg text-sm">
                      <span>{getProductName(product)}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = preOrderForm.items.map(i => 
                              i.productId === item.productId ? {...i, quantity: parseInt(e.target.value) || 1} : i
                            );
                            setPreOrderForm({...preOrderForm, items: newItems});
                          }}
                          className="w-16 h-8 border-[#E8DFD0]"
                        />
                        <span className="font-bold text-[#D4A853]">€{(product.price * item.quantity).toFixed(2)}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeProductFromPreOrder(item.productId)}>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center p-2 bg-[#D4A853]/10 rounded-lg border border-[#D4A853]">
                  <span className="font-bold text-[#3D3229]">{t('preorders.totalAmount')}</span>
                  <span className="text-lg font-bold text-[#D4A853]">€{calculatePreOrderTotal().toFixed(2)}</span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-[#7A6F63]">{t('preorders.notes')}</Label>
              <Textarea 
                value={preOrderForm.notes}
                onChange={(e) => setPreOrderForm({...preOrderForm, notes: e.target.value})}
                className="mt-1.5 border-[#E8DFD0]" 
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
