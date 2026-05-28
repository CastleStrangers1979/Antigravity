 
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { LanguageProvider, useLanguage, Language } from '@/lib/i18n';
import { 
  BarChart3, ShoppingBag, Package, Users, Truck, Wallet, FileText, 
  RefreshCw, Menu, ChevronDown, MapPin, MapPinned, Cookie, ChefHat, 
  ShieldCheck, Warehouse, CreditCard, ShoppingCart, Store, Calendar, 
  Car, TrendingUp, Star, Smartphone, Bot, Bell, Link2, Globe, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order, Product, Driver, DeliveryLine, Vehicle } from '@/lib/types';

// Loading fallback
const TabLoading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-8 w-48 bg-[#F5EDE0] rounded-lg" />
      <div className="h-10 w-32 bg-[#F5EDE0] rounded-lg" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 bg-[#F5EDE0] rounded-2xl" />
      ))}
    </div>
  </div>
);

// Dynamic Imports
const AdvancedDashboardTab = dynamic(() => import('@/components/advanced-dashboard-tab'), { loading: () => <TabLoading /> });
const OrdersTab = dynamic(() => import('@/components/orders-tab-main'), { loading: () => <TabLoading /> });
const ProductsTab = dynamic(() => import('@/components/products-tab-main'), { loading: () => <TabLoading /> });
const DriversTab = dynamic(() => import('@/components/drivers-tab-main'), { loading: () => <TabLoading /> });
const AdvancedCustomerManagementTab = dynamic(() => import('@/components/AdvancedCustomerManagementTab'), { loading: () => <TabLoading /> });
const DeliveryLinesTab = dynamic(() => import('@/components/delivery-lines-tab-main'), { loading: () => <TabLoading /> });
const DriverApp = dynamic(() => import('@/components/driver-app-main'), { loading: () => <TabLoading /> });
const AIPredictionsTab = dynamic(() => import('@/components/ai-predictions-tab'), { loading: () => <TabLoading /> });
const QualitySafetyTab = dynamic(() => import('@/components/quality-safety-tab'), { loading: () => <TabLoading /> });
const AccountingTab = dynamic(() => import('@/components/accounting-tab'), { loading: () => <TabLoading /> });
const PreOrdersTab = dynamic(() => import('@/components/preorders-tab'), { loading: () => <TabLoading /> });
const InventoryTab = dynamic(() => import('@/components/inventory-tab'), { loading: () => <TabLoading /> });
const VehiclesTab = dynamic(() => import('@/components/vehicles-tab'), { loading: () => <TabLoading /> });
const BakeryTab = dynamic(() => import('@/components/bakery-tab'), { loading: () => <TabLoading /> });
const WebshopTab = dynamic(() => import('@/components/webshop-tab'), { loading: () => <TabLoading /> });
const IntegrationsTab = dynamic(() => import('@/components/integrations-tab'), { loading: () => <TabLoading /> });
const AdvancedReportsTab = dynamic(() => import('@/components/advanced-reports-tab'), { loading: () => <TabLoading /> });
const PaymentSystemTab = dynamic(() => import('@/components/payment-system-tab'), { loading: () => <TabLoading /> });
const POSTab = dynamic(() => import('@/components/pos-tab'), { loading: () => <TabLoading /> });
const DailyProductionTab = dynamic(() => import('@/components/daily-production-tab'), { loading: () => <TabLoading /> });
const CustomerReviewsTab = dynamic(() => import('@/components/customer-reviews-tab'), { loading: () => <TabLoading /> });
const CustomerChatbotTab = dynamic(() => import('@/components/customer-chatbot-tab'), { loading: () => <TabLoading /> });
const LiveTrackingTab = dynamic(() => import('@/components/live-tracking-tab'), { loading: () => <TabLoading /> });
const CustomerAppTab = dynamic(() => import('@/components/customer-app-tab'), { loading: () => <TabLoading /> });
const NotificationsTab = dynamic(() => import('@/components/NotificationsTab'), { loading: () => <TabLoading /> });
const ProductionAutomationTab = dynamic(() => import('@/components/production-automation-tab'), { loading: () => <TabLoading /> });
const UserManagementTab = dynamic(() => import('@/components/user-management-tab'), { loading: () => <TabLoading /> });





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

function GoldDust() {
  const [isClient, setIsClient] = useState(false);
  
  // Pre-generate random values to avoid hydration mismatch
  const particles = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      left: Math.random() * 100,
      top: 100 + Math.random() * 20,
      delay: Math.random() * 4,
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.3
    })), []
  );
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render on server to avoid hydration mismatch
  if (!isClient) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" suppressHydrationWarning>
      {particles.map((p, i) => (
        <div 
          key={i}
          className="gold-dust-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
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
          <SelectItem value="ku" className="hover:bg-[#F5EDE0]">Kurdish</SelectItem>
          <SelectItem value="tr" className="hover:bg-[#F5EDE0]">Turkish</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}





// Locked Features Configuration - الأقسام المقفلة للحزمة المتقدمة
const LOCKED_FEATURES = [
  'tracking',      // التتبع المباشر للسائقين عبر الخرائط والـ GPS 🔒
  'customerApp',   // تطبيق العملاء الكامل وسلة الشراء والطلب المباشر 🔒
  'packing',       // نظام تتبع الصناديق البلاستيكية والربطات لمنع الهدر والسرقة 🔒
  'notifications', // روبوت الاتصال التلقائي ونظام الإشعارات الملونة للمتأخرين عن الدفع 🔒
];

// Locked Feature Popup Component - رسالة احترافية ومميزة
function LockedFeatureDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-[#F5EDE0] via-white to-[#F5EDE0] border-2 border-[#D4A853] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#3D3229] flex items-center justify-center gap-3">
            <span className="text-4xl animate-pulse">🔒</span>
            <span className="font-bold">ميزة الحزمة المتقدمة</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="bg-gradient-to-r from-[#D4A853]/10 via-[#D4A853]/20 to-[#D4A853]/10 rounded-2xl p-6 border-2 border-[#D4A853]/40 shadow-inner">
            <p className="text-xl text-[#3D3229] leading-relaxed text-center font-medium">
              🔒 هذه الميزة متوفرة حصرياً في <span className="font-bold text-[#D4A853] text-2xl">الحزمة المتقدمة</span>
            </p>
            <div className="mt-6 space-y-3 text-base text-[#5C4033] bg-white/50 rounded-xl p-4">
              <p className="font-semibold text-[#3D3229] mb-3">✨ لتفعيل النظام المحاسبي المتكامل، أو تتبع الـ GPS المباشر، أو تشغيل تطبيق العملاء والربوت الآلي:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#2D5A3D]">✓</span>
                  <span>النظام المحاسبي المتكامل</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2D5A3D]">✓</span>
                  <span>تتبع الـ GPS المباشر</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2D5A3D]">✓</span>
                  <span>تطبيق العملاء والروبوت الآلي</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2D5A3D]">✓</span>
                  <span>تتبع الصناديق والربطات لمنع الهدر والسرقة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#2D5A3D]">✓</span>
                  <span>نظام الإشعارات الملونة للمتأخرين عن الدفع</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-[#D4A853] font-bold text-lg animate-pulse">
                📞 يرجى التواصل مع مطور النظام للترقية
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-[#D4A853] to-[#B8963D] text-white hover:opacity-90 px-10 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            حسناً، فهمت
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main App Component
function AppContent() {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ todayOrders: 0, pendingOrders: 0, inDelivery: 0, totalRevenue: 0 });
  const [seeded, setSeeded] = useState(false);
  const [showLockedDialog, setShowLockedDialog] = useState(false);

  // Role Simulator for Testing (In production, this comes from Auth)
  // Always use 'admin' role to show all sections in demo mode
  const [userRole] = useState('admin');

  const isProductionUser = userRole === 'production_head';
  const isAccountant = userRole === 'senior_accountant' || userRole === 'junior_accountant';
  const isAdmin = userRole === 'admin';

  // Handler for locked features
  const handleLockedFeature = (featureId: string) => {
    if (LOCKED_FEATURES.includes(featureId)) {
      setShowLockedDialog(true);
      return true; // Indicates the feature is locked
    }
    return false; // Feature is unlocked
  };

  // Safe tab change handler
  const handleTabChange = (tabId: string) => {
    if (handleLockedFeature(tabId)) {
      return; // Don't change tab if locked
    }
    setActiveTab(tabId);
  };

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
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'} arabic-pattern transition-colors duration-300`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] shadow-lg overflow-hidden">
        <GoldDust />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl overflow-hidden border-2 border-white/30 logo-shine-container animate-floating transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Image 
                    src="/logo.png" 
                    alt="Al Malika Logo" 
                    width={56} 
                    height={56} 
                    className="object-contain p-1"
                    priority
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-arabic-premium leading-tight">{t('app.title')}</h1>
                <p className="text-xs text-white/80 font-medium tracking-wide uppercase">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={fetchStats} className="text-white/70 hover:text-white hover:bg-white/10">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center gap-2">
              {/* Dropdown Menu for All Tabs */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-[#D4A853] text-[#5C4033] hover:bg-[#F5EDE0]">
                    <Menu className="h-4 w-4" />
                    <span>{t('nav.allSections')}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-[70vh] overflow-y-auto bg-white" align="start">
                  {/* Main Sections */}
                  <DropdownMenuLabel className="text-[#D4A853] font-bold">
                    {t('nav.mainSections')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveTab('dashboard')} className="gap-2 cursor-pointer">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>{t('app.dashboard')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('orders')} className="gap-2 cursor-pointer">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span>{t('nav.orders')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('products')} className="gap-2 cursor-pointer">
                    <Package className="h-4 w-4 text-primary" />
                    <span>{t('nav.products')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('customers')} className="gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-[#D4A853]" />
                    <span>{t('nav.customers')}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Delivery & Drivers */}
                  <DropdownMenuLabel className="text-[#D4A853] font-bold">
                    {t('nav.deliveryDrivers')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveTab('drivers')} className="gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{t('nav.drivers')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('deliveryLines')} className="gap-2 cursor-pointer">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{t('nav.deliveryLines')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('driverApp')} className="gap-2 cursor-pointer">
                    <Truck className="h-4 w-4 text-[#D4A853]" />
                    <span>{t('app.driverApp')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTabChange('tracking')} className="gap-2 cursor-pointer opacity-75">
                    <MapPinned className="h-4 w-4 text-[#D4A853]" />
                    <span>{t('nav.liveTracking')}</span>
                    <span className="mr-auto">🔒</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Production & Quality - Hidden from Accountants unless Admin */}
                  {(isAdmin || isProductionUser) && (
                    <>
                      <DropdownMenuLabel className="text-[#D4A853] font-bold">
                        {t('nav.productionQuality')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setActiveTab('bakery')} className="gap-2 cursor-pointer">
                        <Cookie className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.bakery')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('production')} className="gap-2 cursor-pointer">
                        <ChefHat className="h-4 w-4 text-[#2D5A3D]" />
                        <span>{t('nav.dailyProduction')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('packing')} className="gap-2 cursor-pointer opacity-75">
                        <Package className="h-4 w-4 text-[#2D5A3D]" />
                        <span>{t('nav.packingDashboard')}</span>
                        <span className="mr-auto">🔒</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('qualitySafety')} className="gap-2 cursor-pointer">
                        <ShieldCheck className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.qualitySafety')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('inventory')} className="gap-2 cursor-pointer">
                        <Warehouse className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.inventory')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Sales & Finance - Hidden from Production unless Admin */}
                  {(isAdmin || isAccountant) && (
                    <>
                      <DropdownMenuLabel className="text-[#D4A853] font-bold">
                        {t('nav.salesFinance')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setActiveTab('accounting')} className="gap-2 cursor-pointer">
                        <Wallet className="h-4 w-4 text-[#2D5A3D]" />
                        <span>{t('nav.accounting')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('payments')} className="gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4 text-[#2D5A3D]" />
                        <span>{t('nav.paymentSystem')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('pos')} className="gap-2 cursor-pointer">
                        <ShoppingCart className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.pos')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('webshop')} className="gap-2 cursor-pointer">
                        <Store className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.webshop')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('preorders')} className="gap-2 cursor-pointer">
                        <Calendar className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.preorders')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Vehicles & Assets */}
                  <DropdownMenuLabel className="text-[#D4A853] font-bold">
                    {t('nav.vehiclesAssets')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveTab('vehicles')} className="gap-2 cursor-pointer">
                    <Car className="h-4 w-4 text-[#2D5A3D]" />
                    <span>{t('nav.vehicles')}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Analytics & Reports */}
                  <DropdownMenuLabel className="text-[#D4A853] font-bold">
                    {t('nav.analyticsReports')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveTab('aiPredictions')} className="gap-2 cursor-pointer">
                    <TrendingUp className="h-4 w-4 text-[#2D5A3D]" />
                    <span>{t('nav.aiPredictions')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('reports')} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-[#D4A853]" />
                    <span>{t('nav.reports')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('reviews')} className="gap-2 cursor-pointer">
                    <Star className="h-4 w-4 text-[#D4A853]" />
                    <span>{t('nav.reviews')}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Customer Experience */}
                  <DropdownMenuLabel className="text-[#D4A853] font-bold">
                    {t('nav.customerExperience')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleTabChange('customerApp')} className="gap-2 cursor-pointer opacity-75">
                    <Smartphone className="h-4 w-4 text-[#2D5A3D]" />
                    <span>{t('nav.customerApp')}</span>
                    <span className="mr-auto">🔒</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('chatbot')} className="gap-2 cursor-pointer">
                    <Bot className="h-4 w-4 text-[#2D5A3D]" />
                    <span>{t('nav.chatbot')}</span>
                  </DropdownMenuItem>
                  
                  {/* System & Settings - Hidden unless Admin */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[#D4A853] font-bold">
                        {t('nav.system')}
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setActiveTab('users')} className="gap-2 cursor-pointer">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span>{isRTL ? 'إدارة المستخدمين' : 'User Management'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTabChange('notifications')} className="gap-2 cursor-pointer opacity-75">
                        <Bell className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.notifications')}</span>
                        <span className="mr-auto">🔒</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('integrations')} className="gap-2 cursor-pointer">
                        <Link2 className="h-4 w-4 text-[#D4A853]" />
                        <span>{t('nav.integrations')}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Quick Access Tabs - Horizontal Scrollable */}
              <div className="flex-1 overflow-x-auto scrollbar-thin">
                <TabsList className="h-10 bg-transparent gap-1 w-max min-w-full flex-nowrap inline-flex">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <BarChart3 className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('app.dashboard')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <ShoppingBag className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('nav.orders')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <Package className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('nav.products')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('nav.customers')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="drivers" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <Truck className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('nav.drivers')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="accounting" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <Wallet className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden md:inline">{t('accounting.title')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-white text-muted-foreground px-3 py-1.5 whitespace-nowrap text-sm">
                    <FileText className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden lg:inline">{t('nav.reports')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0 space-y-6 tabs-content-animate">
            <AdvancedDashboardTab />
          </TabsContent>

          <TabsContent value="orders" className="mt-0 tabs-content-animate">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="products" className="mt-0 tabs-content-animate">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="drivers" className="mt-0 tabs-content-animate">
            <DriversTab />
          </TabsContent>

          <TabsContent value="customers" className="mt-0 tabs-content-animate">
            <AdvancedCustomerManagementTab />
          </TabsContent>

          <TabsContent value="deliveryLines" className="mt-0 tabs-content-animate">
            <DeliveryLinesTab />
          </TabsContent>

          <TabsContent value="driverApp" className="mt-0 tabs-content-animate">
            <DriverApp />
          </TabsContent>

          <TabsContent value="aiPredictions" className="mt-0 tabs-content-animate">
            <AIPredictionsTab />
          </TabsContent>

          <TabsContent value="qualitySafety" className="mt-0 tabs-content-animate">
            <QualitySafetyTab />
          </TabsContent>

          <TabsContent value="accounting" className="mt-0 tabs-content-animate">
            <AccountingTab />
          </TabsContent>

          <TabsContent value="preorders" className="mt-0 tabs-content-animate">
            <PreOrdersTab />
          </TabsContent>

          <TabsContent value="inventory" className="mt-0 tabs-content-animate">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="vehicles" className="mt-0 tabs-content-animate">
            <VehiclesTab />
          </TabsContent>

          <TabsContent value="bakery" className="mt-0 tabs-content-animate">
            <BakeryTab />
          </TabsContent>

          <TabsContent value="webshop" className="mt-0 tabs-content-animate">
            <WebshopTab />
          </TabsContent>

          <TabsContent value="integrations" className="mt-0 tabs-content-animate">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 tabs-content-animate">
            <AdvancedReportsTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-0 tabs-content-animate">
            <PaymentSystemTab />
          </TabsContent>

          <TabsContent value="pos" className="mt-0 tabs-content-animate">
            <POSTab />
          </TabsContent>

          <TabsContent value="production" className="mt-0 tabs-content-animate">
            <DailyProductionTab />
          </TabsContent>

          <TabsContent value="packing" className="mt-0 tabs-content-animate">
            <ProductionAutomationTab />
          </TabsContent>

          <TabsContent value="reviews" className="mt-0 tabs-content-animate">
            <CustomerReviewsTab />
          </TabsContent>

          <TabsContent value="chatbot" className="mt-0 tabs-content-animate">
            <CustomerChatbotTab />
          </TabsContent>

          <TabsContent value="tracking" className="mt-0 tabs-content-animate">
            <LiveTrackingTab />
          </TabsContent>

          <TabsContent value="customerApp" className="mt-0 tabs-content-animate">
            <CustomerAppTab />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 tabs-content-animate">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="users" className="mt-0 tabs-content-animate">
            <UserManagementTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center overflow-hidden shadow-lg logo-shine-container animate-floating">
                <Image 
                  src="/logo.png" 
                  alt="Al Malika Logo" 
                  width={56} 
                  height={56} 
                  className="object-contain p-1"
                />
              </div>
              <div>
                <div className="font-bold text-[#3D3229]">{t('app.title')}</div>
                <div className="text-sm text-[#7A6F63]">{t('app.subtitle')}</div>
              </div>
            </div>
            <div className="text-center md:text-right text-sm text-[#7A6F63]">
              <p>Amsterdam, Netherlands</p>
              <p>© 2025 {t('app.title')} - {t('app.allRightsReserved')}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Locked Feature Dialog */}
      <LockedFeatureDialog open={showLockedDialog} onOpenChange={setShowLockedDialog} />
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
