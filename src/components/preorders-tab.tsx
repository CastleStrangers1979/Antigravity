/* eslint-disable react-hooks/set-state-in-effect */
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, Clock, User, Phone, Plus, Edit, Trash2, Eye, RefreshCw,
  AlertCircle, CheckCircle, Star, Crown, Zap, ArrowRight, Repeat,
  ChevronLeft, ChevronRight, Bell, BellRing, Package, ShoppingCart,
  TrendingUp, DollarSign, CalendarDays, Settings
} from 'lucide-react';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  price: number;
  category: string;
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
}

interface PreOrder {
  id: string;
  preOrderNumber: string;
  customerId: string;
  customer: Customer;
  status: string;
  deliveryDate: Date;
  deliveryTime: string | null;
  priority: number;
  totalAmount: number;
  depositAmount: number;
  isPaid: boolean;
  notes: string | null;
  reminderSent: boolean;
  createdAt: Date;
  preOrderItems: PreOrderItem[];
}

interface RecurringOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  isActive: boolean;
}

interface RecurringOrder {
  id: string;
  customerId: string;
  customer: Customer;
  name: string;
  frequency: string;
  daysOfWeek: string | null;
  dayOfMonth: number | null;
  preferredTime: string | null;
  status: string;
  startDate: Date;
  nextDeliveryDate: Date | null;
  totalDeliveries: number;
  priority: number;
  discount: number;
  notes: string | null;
  recurringItems: RecurringOrderItem[];
  _count?: { generatedOrders: number };
}

// Priority Badge Component
function PriorityBadge({ priority, t }: { priority: number; t: (key: string) => string }) {
  const config: Record<number, { className: string; icon: React.ReactNode; label: string }> = {
    0: { className: 'bg-gray-100 text-gray-700 border-gray-200', icon: null, label: t('preorders.normal') },
    1: { className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Zap className="h-3 w-3" />, label: t('preorders.high') },
    2: { className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <AlertCircle className="h-3 w-3" />, label: t('preorders.urgent') },
    3: { className: 'bg-gradient-to-r from-[#D4A853] to-[#B8923F] text-white border-0', icon: <Crown className="h-3 w-3" />, label: 'VIP' },
  };

  const c = config[priority] || config[0];

  return (
    <Badge className={`${c.className} flex items-center gap-1 font-medium`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// Status Badge Component
function PreOrderStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-amber-100 text-amber-700', label: t('preorders.pending') },
    confirmed: { className: 'bg-blue-100 text-blue-700', label: t('preorders.confirmed') },
    processing: { className: 'bg-purple-100 text-purple-700', label: t('preorders.processing') },
    completed: { className: 'bg-green-100 text-green-700', label: t('preorders.completed') },
    cancelled: { className: 'bg-red-100 text-red-700', label: t('preorders.cancelled') },
  };

  const c = config[status] || { className: 'bg-gray-100 text-gray-700', label: status };

  return <Badge className={c.className}>{c.label}</Badge>;
}

// Calendar Component
function PreOrderCalendar({ 
  preOrders, 
  selectedDate, 
  onDateSelect,
  onPreOrderSelect,
  t,
  language
}: { 
  preOrders: PreOrder[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPreOrderSelect: (preOrder: PreOrder) => void;
  t: (key: string) => string;
  language: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);

  const getPreOrdersForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    return preOrders.filter(po => {
      const poDate = new Date(po.deliveryDate).toISOString().split('T')[0];
      return poDate === dateStr;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const dayNames = language === 'ar' 
    ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : language === 'nl'
    ? ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : language === 'nl'
    ? ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#D4A853]" />
            {t('preorders.calendar')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border-[#E8DFD0]"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-[#3D3229] min-w-[120px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border-[#E8DFD0]"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-[#7A6F63] py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 p-1 bg-[#F5EDE0]/30 rounded" />
          ))}
          
          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayOrders = getPreOrdersForDate(day);
            const hasUrgent = dayOrders.some(po => po.priority >= 2);
            
            return (
              <div
                key={day}
                className={`h-24 p-1 rounded cursor-pointer transition-all ${
                  isSelected(day) 
                    ? 'bg-[#2D5A3D]/10 ring-2 ring-[#2D5A3D]' 
                    : isToday(day) 
                    ? 'bg-[#D4A853]/10' 
                    : 'bg-white hover:bg-[#F5EDE0]'
                } ${hasUrgent ? 'border-2 border-orange-300' : 'border border-[#E8DFD0]'}`}
                onClick={() => onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              >
                <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-[#D4A853]' : 'text-[#3D3229]'}`}>
                  {day}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayOrders.slice(0, 3).map((po) => (
                    <div
                      key={po.id}
                      className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                        po.priority === 3 ? 'bg-[#D4A853] text-white' :
                        po.priority === 2 ? 'bg-orange-100 text-orange-700' :
                        po.priority === 1 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreOrderSelect(po);
                      }}
                    >
                      {po.preOrderNumber}
                    </div>
                  ))}
                  {dayOrders.length > 3 && (
                    <div className="text-xs text-[#7A6F63] px-1">
                      +{dayOrders.length - 3} {language === 'ar' ? 'المزيد' : 'more'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function PreOrdersTab() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState('advance');
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [recurringOrders, setRecurringOrders] = useState<RecurringOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recurringStats, setRecurringStats] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringOrder | null>(null);
  
  // Form states
  const [isPreOrderDialogOpen, setIsPreOrderDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [preOrderForm, setPreOrderForm] = useState({
    customerId: '',
    deliveryDate: '',
    deliveryTime: '',
    priority: 0,
    notes: '',
    depositAmount: '',
    items: [] as { productId: string; quantity: number }[],
  });
  const [recurringForm, setRecurringForm] = useState({
    customerId: '',
    name: '',
    frequency: 'weekly',
    daysOfWeek: [] as string[],
    dayOfMonth: 1,
    preferredTime: '',
    priority: 0,
    discount: '',
    notes: '',
    items: [] as { productId: string; quantity: number }[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [preOrdersRes, recurringRes, productsRes, customersRes, statsRes, recurringStatsRes] = await Promise.all([
        fetch('/api/preorders'),
        fetch('/api/recurring-orders'),
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/preorders?stats=true'),
        fetch('/api/recurring-orders?stats=true'),
      ]);
      
      setPreOrders(await preOrdersRes.json());
      setRecurringOrders(await recurringRes.json());
      setProducts(await productsRes.json());
      setCustomers(await customersRes.json());
      setStats(await statsRes.json());
      setRecurringStats(await recurringStatsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getCustomerName = (customer: Customer) => customer.name;

  // Pre-order handlers
  const handleCreatePreOrder = async () => {
    if (!preOrderForm.customerId || !preOrderForm.deliveryDate || preOrderForm.items.length === 0) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      await fetch('/api/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: preOrderForm.customerId,
          deliveryDate: preOrderForm.deliveryDate,
          deliveryTime: preOrderForm.deliveryTime || undefined,
          priority: preOrderForm.priority,
          notes: preOrderForm.notes || undefined,
          depositAmount: parseFloat(preOrderForm.depositAmount) || 0,
          items: preOrderForm.items,
        }),
      });
      
      setIsPreOrderDialogOpen(false);
      setPreOrderForm({
        customerId: '',
        deliveryDate: '',
        deliveryTime: '',
        priority: 0,
        notes: '',
        depositAmount: '',
        items: [],
      });
      fetchData();
    } catch (error) {
      console.error('Error creating pre-order:', error);
    }
  };

  const handleUpdatePreOrderStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/preorders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating pre-order:', error);
    }
  };

  const handleConvertToOrder = async (id: string) => {
    try {
      await fetch('/api/preorders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'convertToOrder' }),
      });
      fetchData();
    } catch (error) {
      console.error('Error converting to order:', error);
    }
  };

  const handleDeletePreOrder = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        await fetch(`/api/preorders?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting pre-order:', error);
      }
    }
  };

  // Recurring order handlers
  const handleCreateRecurringOrder = async () => {
    if (!recurringForm.customerId || !recurringForm.name || recurringForm.items.length === 0) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    try {
      await fetch('/api/recurring-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: recurringForm.customerId,
          name: recurringForm.name,
          frequency: recurringForm.frequency,
          daysOfWeek: recurringForm.frequency === 'weekly' ? recurringForm.daysOfWeek : undefined,
          dayOfMonth: recurringForm.frequency === 'monthly' ? recurringForm.dayOfMonth : undefined,
          preferredTime: recurringForm.preferredTime || undefined,
          priority: recurringForm.priority,
          discount: parseFloat(recurringForm.discount) || 0,
          notes: recurringForm.notes || undefined,
          items: recurringForm.items,
        }),
      });
      
      setIsRecurringDialogOpen(false);
      setRecurringForm({
        customerId: '',
        name: '',
        frequency: 'weekly',
        daysOfWeek: [],
        dayOfMonth: 1,
        preferredTime: '',
        priority: 0,
        discount: '',
        notes: '',
        items: [],
      });
      fetchData();
    } catch (error) {
      console.error('Error creating recurring order:', error);
    }
  };

  const handleUpdateRecurringStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/recurring-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating recurring order:', error);
    }
  };

  const handleGenerateOrder = async (id: string) => {
    try {
      await fetch('/api/recurring-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'generateOrder' }),
      });
      fetchData();
    } catch (error) {
      console.error('Error generating order:', error);
    }
  };

  const handleDeleteRecurringOrder = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        await fetch(`/api/recurring-orders?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting recurring order:', error);
      }
    }
  };

  const addPreOrderItem = (productId: string) => {
    const existing = preOrderForm.items.find(i => i.productId === productId);
    if (existing) {
      setPreOrderForm({
        ...preOrderForm,
        items: preOrderForm.items.map(i => 
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setPreOrderForm({
        ...preOrderForm,
        items: [...preOrderForm.items, { productId, quantity: 1 }],
      });
    }
  };

  const removePreOrderItem = (productId: string) => {
    setPreOrderForm({
      ...preOrderForm,
      items: preOrderForm.items.filter(i => i.productId !== productId),
    });
  };

  const addRecurringItem = (productId: string) => {
    const existing = recurringForm.items.find(i => i.productId === productId);
    if (existing) {
      setRecurringForm({
        ...recurringForm,
        items: recurringForm.items.map(i => 
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setRecurringForm({
        ...recurringForm,
        items: [...recurringForm.items, { productId, quantity: 1 }],
      });
    }
  };

  const removeRecurringItem = (productId: string) => {
    setRecurringForm({
      ...recurringForm,
      items: recurringForm.items.filter(i => i.productId !== productId),
    });
  };

  const weekDays = [
    { value: 'monday', label: language === 'ar' ? 'الإثنين' : language === 'nl' ? 'Maandag' : 'Monday' },
    { value: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : language === 'nl' ? 'Dinsdag' : 'Tuesday' },
    { value: 'wednesday', label: language === 'ar' ? 'الأربعاء' : language === 'nl' ? 'Woensdag' : 'Wednesday' },
    { value: 'thursday', label: language === 'ar' ? 'الخميس' : language === 'nl' ? 'Donderdag' : 'Thursday' },
    { value: 'friday', label: language === 'ar' ? 'الجمعة' : language === 'nl' ? 'Vrijdag' : 'Friday' },
    { value: 'saturday', label: language === 'ar' ? 'السبت' : language === 'nl' ? 'Zaterdag' : 'Saturday' },
    { value: 'sunday', label: language === 'ar' ? 'الأحد' : language === 'nl' ? 'Zondag' : 'Sunday' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('preorders.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{stats?.totalPreOrders || 0} {t('preorders.totalOrders')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('actions.refresh')}
          </Button>
          <Dialog open={isPreOrderDialogOpen} onOpenChange={setIsPreOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-white border-0" onClick={() => setPreOrderForm({ ...preOrderForm, customerId: '', deliveryDate: '', deliveryTime: '', priority: 0, notes: '', depositAmount: '', items: [] })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('preorders.add')}
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setRecurringForm({ ...recurringForm, customerId: '', name: '', frequency: 'weekly', daysOfWeek: [], dayOfMonth: 1, preferredTime: '', priority: 0, discount: '', notes: '', items: [] })}>
                <Repeat className="h-4 w-4 mr-2" />
                {t('preorders.addRecurring')}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A853]/20">
                <CalendarDays className="h-5 w-5 text-[#D4A853]" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.pending')}</p>
                <p className="text-xl font-bold text-[#3D3229]">{stats?.pendingCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.confirmed')}</p>
                <p className="text-xl font-bold text-[#3D3229]">{stats?.confirmedCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.processing')}</p>
                <p className="text-xl font-bold text-[#3D3229]">{stats?.processingCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.totalRevenue')}</p>
                <p className="text-xl font-bold text-[#3D3229]">€{(stats?.totalRevenue || 0).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#2D5A3D]/5 to-[#2D5A3D]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#2D5A3D]/20">
                <Repeat className="h-5 w-5 text-[#2D5A3D]" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.activeRecurring')}</p>
                <p className="text-xl font-bold text-[#3D3229]">{recurringStats?.activeCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#D4A853]/5 to-[#D4A853]/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A853]/20">
                <TrendingUp className="h-5 w-5 text-[#D4A853]" />
              </div>
              <div>
                <p className="text-xs text-[#7A6F63]">{t('preorders.monthlyEstimate')}</p>
                <p className="text-xl font-bold text-[#3D3229]">€{(recurringStats?.estimatedMonthlyRevenue || 0).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="bg-white border border-[#E8DFD0] h-auto p-1">
          <TabsTrigger value="advance" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <Calendar className="h-4 w-4 mr-2" />
            {t('preorders.advanceOrders')}
          </TabsTrigger>
          <TabsTrigger value="recurring" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <Repeat className="h-4 w-4 mr-2" />
            {t('preorders.recurringOrders')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <CalendarDays className="h-4 w-4 mr-2" />
            {t('preorders.calendar')}
          </TabsTrigger>
        </TabsList>

        {/* Advance Orders Section */}
        <TabsContent value="advance" className="mt-4">
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
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {preOrders.map((preOrder) => (
                  <Card key={preOrder.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-[#2D5A3D]">{preOrder.preOrderNumber}</span>
                              <PreOrderStatusBadge status={preOrder.status} t={t} />
                              <PriorityBadge priority={preOrder.priority} t={t} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#7A6F63]">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {preOrder.customer.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {preOrder.customer.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(preOrder.deliveryDate).toLocaleDateString()}
                              </span>
                              {preOrder.deliveryTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {preOrder.deliveryTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#D4A853]">€{preOrder.totalAmount.toFixed(2)}</div>
                            {preOrder.depositAmount > 0 && (
                              <div className="text-sm text-[#7A6F63]">
                                {t('preorders.deposit')}: €{preOrder.depositAmount.toFixed(2)}
                                {preOrder.isPaid && <CheckCircle className="h-4 w-4 inline ml-1 text-green-500" />}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {preOrder.preOrderItems.map((item) => (
                            <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                              {getProductName(item.product)} × {item.quantity}
                            </div>
                          ))}
                        </div>

                        {preOrder.reminderSent && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-[#2D5A3D]">
                            <BellRing className="h-4 w-4" />
                            <span>{t('preorders.reminderSent')}</span>
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
                              <DialogTitle className="text-[#3D3229]">{preOrder.preOrderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-[#7A6F63]">{t('preorders.status')}</Label>
                                <Select 
                                  value={preOrder.status} 
                                  onValueChange={(value) => handleUpdatePreOrderStatus(preOrder.id, value)}
                                >
                                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">{t('preorders.pending')}</SelectItem>
                                    <SelectItem value="confirmed">{t('preorders.confirmed')}</SelectItem>
                                    <SelectItem value="processing">{t('preorders.processing')}</SelectItem>
                                    <SelectItem value="completed">{t('preorders.completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('preorders.cancelled')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="p-4 bg-[#F5EDE0] rounded-xl">
                                <div className="font-medium text-[#3D3229]">{preOrder.customer.name}</div>
                                <div className="text-sm text-[#7A6F63] mt-1">{preOrder.customer.phone}</div>
                                <div className="text-sm text-[#7A6F63]">{preOrder.customer.address}, {preOrder.customer.city}</div>
                              </div>
                              <div>
                                <Label className="text-[#7A6F63]">{t('orders.items')}</Label>
                                <div className="mt-2 space-y-2">
                                  {preOrder.preOrderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-[#FFFEF7] rounded-lg border border-[#E8DFD0]">
                                      <span className="text-[#3D3229]">{getProductName(item.product)} × {item.quantity}</span>
                                      <span className="font-medium text-[#D4A853]">€{item.total.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-bold text-[#3D3229]">
                                    <span>{t('orders.total')}</span>
                                    <span className="text-[#D4A853]">€{preOrder.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1 green-gradient text-white border-0"
                                  onClick={() => handleConvertToOrder(preOrder.id)}
                                  disabled={preOrder.status === 'completed' || preOrder.status === 'cancelled'}
                                >
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  {t('preorders.convertToOrder')}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="border-red-200 text-red-500 hover:bg-red-50"
                                  onClick={() => handleDeletePreOrder(preOrder.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </Card>
                ))}
                {preOrders.length === 0 && (
                  <div className="text-center py-12 text-[#7A6F63]">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('messages.noData')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Recurring Orders Section */}
        <TabsContent value="recurring" className="mt-4">
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
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {recurringOrders.map((recurring) => (
                  <Card key={recurring.id} className={`card-hover border-0 shadow-md bg-white overflow-hidden ${recurring.status !== 'active' ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-[#2D5A3D]">{recurring.name}</span>
                              <Badge className={recurring.status === 'active' ? 'bg-green-100 text-green-700' : recurring.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                                {recurring.status === 'active' ? t('preorders.active') : recurring.status === 'paused' ? t('preorders.paused') : t('preorders.cancelled')}
                              </Badge>
                              <PriorityBadge priority={recurring.priority} t={t} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#7A6F63]">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {recurring.customer.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Repeat className="h-4 w-4" />
                                {recurring.frequency === 'weekly' ? t('preorders.weekly') : 
                                 recurring.frequency === 'biweekly' ? t('preorders.biweekly') : 
                                 t('preorders.monthly')}
                              </span>
                              {recurring.nextDeliveryDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(recurring.nextDeliveryDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[#D4A853]">{recurring._count?.generatedOrders || 0} {t('preorders.deliveries')}</div>
                            {recurring.discount > 0 && (
                              <div className="text-sm text-[#2D5A3D]">-{recurring.discount}% {t('preorders.discount')}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {recurring.recurringItems.filter(ri => ri.isActive).map((item) => (
                            <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                              {getProductName(item.product)} × {item.quantity}
                            </div>
                          ))}
                        </div>

                        {recurring.daysOfWeek && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {JSON.parse(recurring.daysOfWeek).map((day: string) => (
                              <Badge key={day} variant="outline" className="text-xs border-[#D4A853] text-[#D4A853]">
                                {weekDays.find(w => w.value === day)?.label || day}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white"
                          onClick={() => handleGenerateOrder(recurring.id)}
                          disabled={recurring.status !== 'active'}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {t('preorders.generate')}
                        </Button>
                        <Select 
                          value={recurring.status} 
                          onValueChange={(value) => handleUpdateRecurringStatus(recurring.id, value)}
                        >
                          <SelectTrigger className="w-[100px] h-8 border-[#E8DFD0] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t('preorders.active')}</SelectItem>
                            <SelectItem value="paused">{t('preorders.paused')}</SelectItem>
                            <SelectItem value="cancelled">{t('preorders.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteRecurringOrder(recurring.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {recurringOrders.length === 0 && (
                  <div className="text-center py-12 text-[#7A6F63]">
                    <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('messages.noData')}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Calendar Section */}
        <TabsContent value="calendar" className="mt-4">
          <PreOrderCalendar
            preOrders={preOrders}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onPreOrderSelect={setSelectedPreOrder}
            t={t}
            language={language}
          />
          
          {selectedPreOrder && (
            <Card className="mt-4 border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  {selectedPreOrder.preOrderNumber}
                  <PreOrderStatusBadge status={selectedPreOrder.status} t={t} />
                  <PriorityBadge priority={selectedPreOrder.priority} t={t} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#7A6F63]" />
                    <span className="text-[#3D3229]">{selectedPreOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#7A6F63]" />
                    <span className="text-[#3D3229]">{selectedPreOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#D4A853]" />
                    <span className="font-bold text-[#D4A853]">€{selectedPreOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPreOrder.preOrderItems.map((item) => (
                    <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                      {getProductName(item.product)} × {item.quantity}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    className="green-gradient text-white border-0"
                    onClick={() => handleConvertToOrder(selectedPreOrder.id)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {t('preorders.convertToOrder')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-[#E8DFD0]"
                    onClick={() => setSelectedPreOrder(null)}
                  >
                    {t('actions.cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Pre-Order Dialog */}
      <Dialog open={isPreOrderDialogOpen} onOpenChange={setIsPreOrderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('preorders.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('orders.customer')} *</Label>
                <Select value={preOrderForm.customerId} onValueChange={(value) => setPreOrderForm({ ...preOrderForm, customerId: value })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('orders.customer')} />
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
                <Label className="text-[#7A6F63]">{t('preorders.priority')}</Label>
                <Select value={preOrderForm.priority.toString()} onValueChange={(value) => setPreOrderForm({ ...preOrderForm, priority: parseInt(value) })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('preorders.normal')}</SelectItem>
                    <SelectItem value="1">{t('preorders.high')}</SelectItem>
                    <SelectItem value="2">{t('preorders.urgent')}</SelectItem>
                    <SelectItem value="3">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deliveryDate')} *</Label>
                <Input 
                  type="date" 
                  value={preOrderForm.deliveryDate} 
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, deliveryDate: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deliveryTime')}</Label>
                <Input 
                  type="time" 
                  value={preOrderForm.deliveryTime} 
                  onChange={(e) => setPreOrderForm({ ...preOrderForm, deliveryTime: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('preorders.deposit')}</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={preOrderForm.depositAmount} 
                onChange={(e) => setPreOrderForm({ ...preOrderForm, depositAmount: e.target.value })}
                className="mt-1.5 border-[#E8DFD0]" 
              />
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
              <Textarea 
                value={preOrderForm.notes} 
                onChange={(e) => setPreOrderForm({ ...preOrderForm, notes: e.target.value })}
                className="mt-1.5 border-[#E8DFD0]" 
              />
            </div>
            
            {/* Product Selection */}
            <div>
              <Label className="text-[#7A6F63]">{t('orders.items')} *</Label>
              <div className="mt-2 p-4 bg-[#F5EDE0] rounded-xl">
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {products.map((product) => {
                      const item = preOrderForm.items.find(i => i.productId === product.id);
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <div>
                            <div className="font-medium text-[#3D3229]">{getProductName(product)}</div>
                            <div className="text-sm text-[#D4A853]">€{product.price.toFixed(2)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item ? (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                                  if (item.quantity > 1) {
                                    setPreOrderForm({
                                      ...preOrderForm,
                                      items: preOrderForm.items.map(i => 
                                        i.productId === product.id ? { ...i, quantity: i.quantity - 1 } : i
                                      ),
                                    });
                                  } else {
                                    removePreOrderItem(product.id);
                                  }
                                }}>-</Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => addPreOrderItem(product.id)}>+</Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removePreOrderItem(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" className="border-[#D4A853] text-[#D4A853]" onClick={() => addPreOrderItem(product.id)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Total */}
            {preOrderForm.items.length > 0 && (
              <div className="flex justify-between items-center p-4 bg-[#FFFEF7] rounded-xl border border-[#E8DFD0]">
                <span className="font-medium text-[#3D3229]">{t('orders.total')}</span>
                <span className="text-xl font-bold text-[#D4A853]">
                  €{preOrderForm.items.reduce((sum, item) => {
                    const product = products.find(p => p.id === item.productId);
                    return sum + (product ? product.price * item.quantity : 0);
                  }, 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[#E8DFD0]" onClick={() => setIsPreOrderDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button className="gold-gradient text-white border-0" onClick={handleCreatePreOrder}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Recurring Order Dialog */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('preorders.addRecurring')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('orders.customer')} *</Label>
                <Select value={recurringForm.customerId} onValueChange={(value) => setRecurringForm({ ...recurringForm, customerId: value })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('orders.customer')} />
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
                <Label className="text-[#7A6F63]">{t('preorders.templateName')} *</Label>
                <Input 
                  value={recurringForm.name} 
                  onChange={(e) => setRecurringForm({ ...recurringForm, name: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]" 
                  placeholder={language === 'ar' ? 'مثال: طلب الأسبوعي' : 'e.g., Weekly Order'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.frequency')} *</Label>
                <Select value={recurringForm.frequency} onValueChange={(value) => setRecurringForm({ ...recurringForm, frequency: value, daysOfWeek: [], dayOfMonth: 1 })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{t('preorders.weekly')}</SelectItem>
                    <SelectItem value="biweekly">{t('preorders.biweekly')}</SelectItem>
                    <SelectItem value="monthly">{t('preorders.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.priority')}</Label>
                <Select value={recurringForm.priority.toString()} onValueChange={(value) => setRecurringForm({ ...recurringForm, priority: parseInt(value) })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('preorders.normal')}</SelectItem>
                    <SelectItem value="1">{t('preorders.high')}</SelectItem>
                    <SelectItem value="2">{t('preorders.urgent')}</SelectItem>
                    <SelectItem value="3">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {recurringForm.frequency === 'weekly' && (
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.deliveryDays')}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <div 
                      key={day.value}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        recurringForm.daysOfWeek.includes(day.value) 
                          ? 'bg-[#2D5A3D] text-white' 
                          : 'bg-[#F5EDE0] text-[#5C4033] hover:bg-[#E8DFD0]'
                      }`}
                      onClick={() => {
                        if (recurringForm.daysOfWeek.includes(day.value)) {
                          setRecurringForm({ ...recurringForm, daysOfWeek: recurringForm.daysOfWeek.filter(d => d !== day.value) });
                        } else {
                          setRecurringForm({ ...recurringForm, daysOfWeek: [...recurringForm.daysOfWeek, day.value] });
                        }
                      }}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recurringForm.frequency === 'monthly' && (
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.dayOfMonth')}</Label>
                <Select value={recurringForm.dayOfMonth.toString()} onValueChange={(value) => setRecurringForm({ ...recurringForm, dayOfMonth: parseInt(value) })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.preferredTime')}</Label>
                <Input 
                  type="time" 
                  value={recurringForm.preferredTime} 
                  onChange={(e) => setRecurringForm({ ...recurringForm, preferredTime: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('preorders.discount')} (%)</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={recurringForm.discount} 
                  onChange={(e) => setRecurringForm({ ...recurringForm, discount: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]" 
                />
              </div>
            </div>

            <div>
              <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
              <Textarea 
                value={recurringForm.notes} 
                onChange={(e) => setRecurringForm({ ...recurringForm, notes: e.target.value })}
                className="mt-1.5 border-[#E8DFD0]" 
              />
            </div>
            
            {/* Product Selection */}
            <div>
              <Label className="text-[#7A6F63]">{t('orders.items')} *</Label>
              <div className="mt-2 p-4 bg-[#F5EDE0] rounded-xl">
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {products.map((product) => {
                      const item = recurringForm.items.find(i => i.productId === product.id);
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <div>
                            <div className="font-medium text-[#3D3229]">{getProductName(product)}</div>
                            <div className="text-sm text-[#D4A853]">€{product.price.toFixed(2)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item ? (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => {
                                  if (item.quantity > 1) {
                                    setRecurringForm({
                                      ...recurringForm,
                                      items: recurringForm.items.map(i => 
                                        i.productId === product.id ? { ...i, quantity: i.quantity - 1 } : i
                                      ),
                                    });
                                  } else {
                                    removeRecurringItem(product.id);
                                  }
                                }}>-</Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => addRecurringItem(product.id)}>+</Button>
                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeRecurringItem(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" className="border-[#2D5A3D] text-[#2D5A3D]" onClick={() => addRecurringItem(product.id)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[#E8DFD0]" onClick={() => setIsRecurringDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button className="green-gradient text-white border-0" onClick={handleCreateRecurringOrder}>
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
