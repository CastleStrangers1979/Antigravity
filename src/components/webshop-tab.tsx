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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Package, Users, Tag, Image as ImageIcon, Eye, Smartphone, Monitor, Star, StarOff,
  Plus, Edit, Trash2, RefreshCw, ToggleLeft, ToggleRight, 
  Percent, Gift, Calendar, Clock, CheckCircle, XCircle, Search, Filter,
  Settings, CreditCard, Truck, Globe, Palette, BarChart3, TrendingUp,
  DollarSign, ShoppingCart, Bell, Mail, Phone, MapPin, Clock3, Sun, Moon,
  Palette as PaletteIcon, Layout, Save, Info, AlertCircle, ExternalLink,
  ShoppingBag, UserCheck, Activity, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Types
interface WebshopProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isVisible: boolean;
}

interface WebshopCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  createdAt: string;
  lastOrderDate: string | null;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts: string[];
}

interface Banner {
  id: string;
  titleAr: string;
  titleEn: string;
  titleNl: string;
  subtitleAr: string;
  subtitleEn: string;
  subtitleNl: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  storeNameNl: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryZones: { name: string; fee: number; minOrder: number }[];
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  showPrices: boolean;
  allowPreOrder: boolean;
  requireLogin: boolean;
}

interface PaymentProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  testMode: boolean;
  apiKey: string;
  merchantId: string;
}

interface WebshopStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  activeCustomers: number;
  avgOrderValue: number;
  topProducts: { name: string; sales: number }[];
  recentOrders: { id: string; customer: string; amount: number; status: string }[];
}

// Stats Card Component
function WebshopStatsCard({ title, value, icon: Icon, color, trend, trendUp }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-2xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${trendUp ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Store Preview Component
function StorePreview({ settings }: { settings: StoreSettings | null }) {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const getStoreName = () => {
    if (!settings) return language === 'ar' ? 'مخبز الملكة' : 'Al-Malika Bakery';
    if (language === 'ar') return settings.storeNameAr;
    if (language === 'nl') return settings.storeNameNl;
    return settings.storeNameEn;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'معاينة المتجر' : 'Store Preview'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? 'شاهد كيف يبدو متجرك للعملاء' : 'See how your store looks to customers'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F5EDE0] rounded-lg p-1">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('desktop')}
            className={viewMode === 'desktop' ? 'bg-[#2D5A3D] text-white' : 'text-[#7A6F63]'}
          >
            <Monitor className="h-4 w-4 mr-1" />
            {language === 'ar' ? 'سطح المكتب' : 'Desktop'}
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('mobile')}
            className={viewMode === 'mobile' ? 'bg-[#2D5A3D] text-white' : 'text-[#7A6F63]'}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            {language === 'ar' ? 'جوال' : 'Mobile'}
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className={`mx-auto border-4 border-[#E8DFD0] rounded-xl overflow-hidden shadow-xl bg-white transition-all duration-300 ${
        viewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
      }`}>
        {/* Mock Store Header */}
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7A5D] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">{getStoreName()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShoppingCart className="h-4 w-4" />
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Mock Banner */}
        <div className="bg-gradient-to-r from-[#D4A853] to-[#B8923F] p-4 text-center text-white">
          <p className="text-sm font-medium">
            {language === 'ar' ? 'خصم 20% على طلبك الأول!' : '20% OFF your first order!'}
          </p>
          <p className="text-xs opacity-90">
            {language === 'ar' ? 'استخدم كود: WELCOME20' : 'Use code: WELCOME20'}
          </p>
        </div>

        {/* Mock Categories */}
        <div className="p-3 bg-white border-b border-[#E8DFD0]">
          <div className="flex gap-2 overflow-x-auto">
            {['الكل', 'خبز', 'معجنات', 'حلويات'].map((cat, i) => (
              <div key={i} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                i === 0 ? 'bg-[#2D5A3D] text-white' : 'bg-[#F5EDE0] text-[#5C4033]'
              }`}>
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Mock Products Grid */}
        <div className="p-4 bg-[#F5EDE0]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[#3D3229]">
              {language === 'ar' ? 'منتجات مميزة' : 'Featured Products'}
            </p>
            <p className="text-xs text-[#D4A853]">{language === 'ar' ? 'عرض الكل' : 'View All'}</p>
          </div>
          <div className={`grid gap-3 ${viewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {[
              { name: language === 'ar' ? 'خبز عربي' : 'Arabic Bread', price: '€2.50' },
              { name: language === 'ar' ? 'صمون' : 'Samoons', price: '€1.80' },
              { name: language === 'ar' ? 'كعك بالجبن' : 'Cheese Rolls', price: '€3.50' },
              { name: language === 'ar' ? 'بقلاوة' : 'Baklava', price: '€8.00' },
            ].map((product, i) => (
              <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                <div className="aspect-square bg-[#E8DFD0] rounded-lg mb-2 flex items-center justify-center relative">
                  <Package className="h-6 w-6 text-[#D4A853]" />
                  {i === 0 && (
                    <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded">
                      {language === 'ar' ? 'جديد' : 'NEW'}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-[#3D3229] truncate">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-bold text-[#D4A853]">{product.price}</p>
                  <Button size="sm" className="h-6 w-6 p-0 bg-[#2D5A3D] text-white rounded-full">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Footer */}
        <div className="bg-[#3D3229] text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{settings?.phone || '+31 20 123 4567'}</span>
            </div>
            <div className="flex gap-2">
              <Globe className="h-4 w-4 opacity-70" />
              <Mail className="h-4 w-4 opacity-70" />
            </div>
          </div>
          <p className="text-xs text-center opacity-70">
            {language === 'ar' ? '© 2025 مخبز الملكة - جميع الحقوق محفوظة' : '© 2025 Al-Malika Bakery - All rights reserved'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Store Settings Component
function StoreSettingsTab() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings: StoreSettings = {
    storeNameAr: 'مخبز الملكة',
    storeNameEn: 'Al-Malika Bakery',
    storeNameNl: 'Al-Malika Bakkerij',
    phone: '+31 20 123 4567',
    email: 'info@almalika.nl',
    address: 'Straat 123',
    city: 'Amsterdam',
    postalCode: '1012 AB',
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false },
    },
    minOrderAmount: 10,
    deliveryFee: 3.50,
    freeDeliveryThreshold: 30,
    deliveryZones: [
      { name: 'Amsterdam Centrum', fee: 0, minOrder: 20 },
      { name: 'Amsterdam Noord', fee: 2.50, minOrder: 25 },
      { name: 'Amsterdam Zuid', fee: 2.50, minOrder: 25 },
    ],
    primaryColor: '#2D5A3D',
    secondaryColor: '#D4A853',
    logoUrl: '',
    showPrices: true,
    allowPreOrder: true,
    requireLogin: false,
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webshop/settings');
      const data = await res.json();
      setSettings(data || defaultSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(defaultSettings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/webshop/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setSaving(false);
  };

  const updateSetting = (key: keyof StoreSettings, value: unknown) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const daysOfWeek = [
    { key: 'monday', label: language === 'ar' ? 'الإثنين' : 'Monday' },
    { key: 'tuesday', label: language === 'ar' ? 'الثلاثاء' : 'Tuesday' },
    { key: 'wednesday', label: language === 'ar' ? 'الأربعاء' : 'Wednesday' },
    { key: 'thursday', label: language === 'ar' ? 'الخميس' : 'Thursday' },
    { key: 'friday', label: language === 'ar' ? 'الجمعة' : 'Friday' },
    { key: 'saturday', label: language === 'ar' ? 'السبت' : 'Saturday' },
    { key: 'sunday', label: language === 'ar' ? 'الأحد' : 'Sunday' },
  ];

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? 'تكوين إعدادات المتجر الأساسية' : 'Configure your store settings'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="green-gradient text-white border-0">
          <Save className="h-4 w-4 mr-2" />
          {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white border border-[#E8DFD0] h-auto p-1 flex-wrap">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63]">
            <Settings className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'عام' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="hours" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63]">
            <Clock3 className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'ساعات العمل' : 'Hours'}
          </TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63]">
            <Truck className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'التوصيل' : 'Delivery'}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63]">
            <Palette className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'المظهر' : 'Appearance'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'معلومات المتجر' : 'Store Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}</Label>
                  <Input
                    value={settings.storeNameAr}
                    onChange={(e) => updateSetting('storeNameAr', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}</Label>
                  <Input
                    value={settings.storeNameEn}
                    onChange={(e) => updateSetting('storeNameEn', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم المتجر (هولندي)' : 'Store Name (Dutch)'}</Label>
                  <Input
                    value={settings.storeNameNl}
                    onChange={(e) => updateSetting('storeNameNl', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => updateSetting('address', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'المدينة' : 'City'}</Label>
                  <Input
                    value={settings.city}
                    onChange={(e) => updateSetting('city', e.target.value)}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إعدادات الطلبات' : 'Order Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-[#D4A853]" />
                  <div>
                    <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'إظهار الأسعار' : 'Show Prices'}</p>
                    <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'عرض الأسعار للعملاء' : 'Display prices to customers'}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.showPrices}
                  onCheckedChange={(checked) => updateSetting('showPrices', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#D4A853]" />
                  <div>
                    <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'الطلب المسبق' : 'Pre-order'}</p>
                    <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'السماح بالطلبات المسبقة' : 'Allow pre-orders'}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.allowPreOrder}
                  onCheckedChange={(checked) => updateSetting('allowPreOrder', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-[#D4A853]" />
                  <div>
                    <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Require Login'}</p>
                    <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'طلب تسجيل الدخول للشراء' : 'Require login to order'}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.requireLogin}
                  onCheckedChange={(checked) => updateSetting('requireLogin', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'ساعات العمل' : 'Opening Hours'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-3 bg-[#F5EDE0] rounded-lg">
                    <div className="w-24 font-medium text-[#3D3229]">{day.label}</div>
                    <Switch
                      checked={!settings.openingHours[day.key]?.closed}
                      onCheckedChange={(checked) => updateSetting('openingHours', {
                        ...settings.openingHours,
                        [day.key]: { ...settings.openingHours[day.key], closed: !checked }
                      })}
                    />
                    {!settings.openingHours[day.key]?.closed ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={settings.openingHours[day.key]?.open || '09:00'}
                          onChange={(e) => updateSetting('openingHours', {
                            ...settings.openingHours,
                            [day.key]: { ...settings.openingHours[day.key], open: e.target.value }
                          })}
                          className="w-28 border-[#E8DFD0]"
                        />
                        <span className="text-[#7A6F63]">-</span>
                        <Input
                          type="time"
                          value={settings.openingHours[day.key]?.close || '17:00'}
                          onChange={(e) => updateSetting('openingHours', {
                            ...settings.openingHours,
                            [day.key]: { ...settings.openingHours[day.key], close: e.target.value }
                          })}
                          className="w-28 border-[#E8DFD0]"
                        />
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                        {language === 'ar' ? 'مغلق' : 'Closed'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إعدادات التوصيل' : 'Delivery Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الحد الأدنى للطلب (€)' : 'Min Order (€)'}</Label>
                  <Input
                    type="number"
                    value={settings.minOrderAmount}
                    onChange={(e) => updateSetting('minOrderAmount', parseFloat(e.target.value))}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'رسوم التوصيل (€)' : 'Delivery Fee (€)'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.deliveryFee}
                    onChange={(e) => updateSetting('deliveryFee', parseFloat(e.target.value))}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'توصيل مجاني فوق (€)' : 'Free Delivery Over (€)'}</Label>
                  <Input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => updateSetting('freeDeliveryThreshold', parseFloat(e.target.value))}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-[#3D3229] mb-3">{language === 'ar' ? 'مناطق التوصيل' : 'Delivery Zones'}</h4>
                <div className="space-y-2">
                  {settings.deliveryZones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#F5EDE0] rounded-lg">
                      <MapPin className="h-4 w-4 text-[#D4A853]" />
                      <span className="flex-1 font-medium text-[#3D3229]">{zone.name}</span>
                      <span className="text-sm text-[#7A6F63]">
                        {zone.fee === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `€${zone.fee.toFixed(2)}`}
                      </span>
                      <span className="text-xs text-[#7A6F63]">
                        {language === 'ar' ? 'الحد الأدنى:' : 'Min:'} €{zone.minOrder}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'تخصيص المظهر' : 'Appearance Customization'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اللون الرئيسي' : 'Primary Color'}</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border-[#E8DFD0]"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="flex-1 border-[#E8DFD0]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border-[#E8DFD0]"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="flex-1 border-[#E8DFD0]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'رابط الشعار' : 'Logo URL'}</Label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => updateSetting('logoUrl', e.target.value)}
                  className="mt-1.5 border-[#E8DFD0]"
                  placeholder="https://..."
                />
              </div>

              <div className="p-4 bg-[#F5EDE0] rounded-lg">
                <h4 className="font-medium text-[#3D3229] mb-2">{language === 'ar' ? 'معاينة الألوان' : 'Color Preview'}</h4>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: settings.primaryColor }} />
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: settings.secondaryColor }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Payment Providers Component
function PaymentProvidersTab() {
  const { language } = useLanguage();
  const [providers, setProviders] = useState<PaymentProvider[]>([
    { id: '1', name: 'Mollie', type: 'payment_gateway', isActive: true, testMode: true, apiKey: '', merchantId: '' },
    { id: '2', name: 'Stripe', type: 'payment_gateway', isActive: false, testMode: true, apiKey: '', merchantId: '' },
    { id: '3', name: 'iDEAL', type: 'bank_transfer', isActive: true, testMode: false, apiKey: '', merchantId: '' },
    { id: '4', name: 'PayPal', type: 'wallet', isActive: false, testMode: true, apiKey: '', merchantId: '' },
    { id: '5', name: 'Cash on Delivery', type: 'cod', isActive: true, testMode: false, apiKey: '', merchantId: '' },
  ]);

  const toggleProvider = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const toggleTestMode = (id: string) => {
    setProviders(providers.map(p => p.id === id ? { ...p, testMode: !p.testMode } : p));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-[#3D3229]">
          {language === 'ar' ? 'بوابات الدفع' : 'Payment Providers'}
        </h3>
        <p className="text-sm text-[#7A6F63]">
          {language === 'ar' ? 'إدارة طرق الدفع المتاحة' : 'Manage available payment methods'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className={`border-0 shadow-md ${!provider.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${provider.isActive ? 'bg-[#2D5A3D]/10' : 'bg-gray-100'}`}>
                    <CreditCard className={`h-5 w-5 ${provider.isActive ? 'text-[#2D5A3D]' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{provider.name}</p>
                    <p className="text-xs text-[#7A6F63]">{provider.type}</p>
                  </div>
                </div>
                <Switch
                  checked={provider.isActive}
                  onCheckedChange={() => toggleProvider(provider.id)}
                />
              </div>
              
              {provider.type !== 'cod' && (
                <>
                  <div className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg mb-3">
                    <span className="text-sm text-[#7A6F63]">{language === 'ar' ? 'وضع التجربة' : 'Test Mode'}</span>
                    <Switch
                      checked={provider.testMode}
                      onCheckedChange={() => toggleTestMode(provider.id)}
                    />
                  </div>
                  
                  {provider.isActive && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-[#7A6F63]">API Key</Label>
                        <Input
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) => setProviders(providers.map(p => p.id === provider.id ? { ...p, apiKey: e.target.value } : p))}
                          className="mt-1 border-[#E8DFD0] text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {provider.type === 'cod' && provider.isActive && (
                <div className="p-2 bg-[#D4A853]/10 rounded-lg text-xs text-[#5C4033]">
                  {language === 'ar' ? 'الدفع نقداً عند الاستلام' : 'Pay cash upon delivery'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Webshop Analytics Component
function WebshopAnalytics() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<WebshopStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock stats
    setStats({
      totalOrders: 1234,
      totalRevenue: 15432.50,
      todayOrders: 28,
      todayRevenue: 456.00,
      activeCustomers: 156,
      avgOrderValue: 12.50,
      topProducts: [
        { name: language === 'ar' ? 'خبز عربي' : 'Arabic Bread', sales: 234 },
        { name: language === 'ar' ? 'صمون' : 'Samoons', sales: 189 },
        { name: language === 'ar' ? 'كعك بالجبن' : 'Cheese Rolls', sales: 156 },
        { name: language === 'ar' ? 'بقلاوة' : 'Baklava', sales: 98 },
        { name: language === 'ar' ? 'كرواسون' : 'Croissant', sales: 76 },
      ],
      recentOrders: [
        { id: 'ORD-001', customer: 'Ahmed M.', amount: 15.50, status: 'delivered' },
        { id: 'ORD-002', customer: 'Fatima K.', amount: 23.00, status: 'pending' },
        { id: 'ORD-003', customer: 'Mohammed S.', amount: 8.75, status: 'in_delivery' },
        { id: 'ORD-004', customer: 'Sara A.', amount: 32.50, status: 'delivered' },
      ],
    });
    setLoading(false);
  }, [language]);

  if (loading || !stats) {
    return <div className="shimmer h-64 rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#3D3229]">
          {language === 'ar' ? 'تحليلات المتجر' : 'Store Analytics'}
        </h3>
        <p className="text-sm text-[#7A6F63]">
          {language === 'ar' ? 'إحصائيات وأداء المتجر' : 'Store statistics and performance'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <WebshopStatsCard
          title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]"
        />
        <WebshopStatsCard
          title={language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`€${stats.totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-[#D4A853] to-[#B8923F]"
        />
        <WebshopStatsCard
          title={language === 'ar' ? 'طلبات اليوم' : 'Today Orders'}
          value={stats.todayOrders}
          icon={Activity}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
          trendUp={true}
        />
        <WebshopStatsCard
          title={language === 'ar' ? 'إيرادات اليوم' : 'Today Revenue'}
          value={`€${stats.todayRevenue.toFixed(0)}`}
          icon={TrendingUp}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="+8%"
          trendUp={true}
        />
        <WebshopStatsCard
          title={language === 'ar' ? 'العملاء النشطين' : 'Active Customers'}
          value={stats.activeCustomers}
          icon={Users}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <WebshopStatsCard
          title={language === 'ar' ? 'متوسط الطلب' : 'Avg Order'}
          value={`€${stats.avgOrderValue.toFixed(2)}`}
          icon={BarChart3}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Top Selling Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-[#D4A853]' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#3D3229]">{product.name}</p>
                    <Progress value={(product.sales / stats.topProducts[0].sales) * 100} className="h-2 mt-1" />
                  </div>
                  <span className="text-sm text-[#7A6F63]">{product.sales} {language === 'ar' ? 'بيع' : 'sales'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                  <div>
                    <p className="font-mono text-sm font-medium text-[#3D3229]">{order.id}</p>
                    <p className="text-xs text-[#7A6F63]">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#D4A853]">€{order.amount.toFixed(2)}</p>
                    <Badge className={`text-xs ${
                      order.status === 'delivered' ? 'bg-[#2D5A3D] text-white' :
                      order.status === 'pending' ? 'bg-amber-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Product Catalog Component
function ProductCatalog() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<WebshopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webshop/products');
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

  const toggleVisibility = async (productId: string, isVisible: boolean) => {
    try {
      await fetch(`/api/webshop/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const toggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/webshop/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const getProductName = (product: WebshopProduct) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const filteredProducts = products.filter(p => 
    getProductName(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'كتالوج المنتجات' : 'Product Catalog'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? `${products.length} منتج` : `${products.length} products`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              className="pl-9 border-[#E8DFD0] w-full sm:w-[200px]"
            />
          </div>
          <Button onClick={fetchProducts} variant="outline" size="sm" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-0">
                <CardContent className="p-4">
                  <div className="shimmer h-16 rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-[#7A6F63]">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد منتجات' : 'No products found'}</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className={`border-0 shadow-sm bg-white ${!product.isVisible ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#F5EDE0] flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={getProductName(product)} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-6 w-6 text-[#D4A853]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#3D3229]">{getProductName(product)}</p>
                          {product.isFeatured && (
                            <Star className="h-4 w-4 text-[#D4A853] fill-[#D4A853]" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                          <span className="font-medium text-[#D4A853]">€{product.price.toFixed(2)}</span>
                          <span>•</span>
                          <span>{language === 'ar' ? 'المخزون:' : 'Stock:'} {product.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(product.id, product.isFeatured)}
                        title={product.isFeatured ? (language === 'ar' ? 'إزالة من المميزة' : 'Remove from featured') : (language === 'ar' ? 'إضافة للمميزة' : 'Add to featured')}
                        className={product.isFeatured ? 'text-[#D4A853]' : 'text-[#7A6F63]'}
                      >
                        {product.isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(product.id, product.isVisible)}
                        title={product.isVisible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                        className={product.isVisible ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Customer Accounts Component
function CustomerAccounts() {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<WebshopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'حسابات العملاء' : 'Customer Accounts'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? `${customers.length} عميل مسجل` : `${customers.length} registered customers`}
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن عميل...' : 'Search customers...'}
            className="pl-9 border-[#E8DFD0] w-full sm:w-[250px]"
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-0">
                <CardContent className="p-4">
                  <div className="shimmer h-16 rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-[#7A6F63]">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8923F] flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[#3D3229]">{customer.name}</p>
                        <p className="text-sm text-[#7A6F63]">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-[#2D5A3D] text-white">
                          {customer.totalOrders} {language === 'ar' ? 'طلب' : 'orders'}
                        </Badge>
                        <span className="font-medium text-[#D4A853]">€{customer.totalSpent.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[#7A6F63] mt-1">
                        {customer.loyaltyPoints} {language === 'ar' ? 'نقطة' : 'points'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Offers & Discounts Component
function OffersDiscounts() {
  const { language } = useLanguage();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrderAmount: '0',
    maxUses: '',
    startDate: '',
    endDate: '',
  });

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promo-codes');
      const data = await res.json();
      setPromoCodes(data);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          minOrderAmount: parseFloat(formData.minOrderAmount),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        }),
      });
      setIsDialogOpen(false);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '0',
        maxUses: '',
        startDate: '',
        endDate: '',
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error saving promo code:', error);
    }
  };

  const togglePromoCode = async (codeId: string, isActive: boolean) => {
    try {
      await fetch(`/api/promo-codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const deletePromoCode = async (codeId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        await fetch(`/api/promo-codes/${codeId}`, { method: 'DELETE' });
        fetchPromoCodes();
      } catch (error) {
        console.error('Error deleting promo code:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'العروض والخصومات' : 'Offers & Discounts'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? `${promoCodes.length} كود خصم` : `${promoCodes.length} promo codes`}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => setFormData({
              code: '',
              type: 'percentage',
              value: '',
              minOrderAmount: '0',
              maxUses: '',
              startDate: '',
              endDate: '',
            })}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'كود جديد' : 'New Code'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">
                {language === 'ar' ? 'إضافة كود خصم' : 'Add Promo Code'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الكود' : 'Code'}</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="mt-1.5 border-[#E8DFD0] uppercase"
                    placeholder="SAVE20"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'النوع' : 'Type'}</Label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{language === 'ar' ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                      <SelectItem value="fixed">{language === 'ar' ? 'مبلغ ثابت' : 'Fixed Amount'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">
                    {language === 'ar' ? 'القيمة' : 'Value'} {formData.type === 'percentage' ? '%' : '€'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    placeholder={formData.type === 'percentage' ? '20' : '5.00'}
                    required
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order (€)'}</Label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'الحد الأقصى للاستخدام' : 'Max Uses (optional)'}</Label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]"
                  placeholder={language === 'ar' ? 'غير محدود' : 'Unlimited'}
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-0">
                <CardContent className="p-4">
                  <div className="shimmer h-16 rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-8 text-[#7A6F63]">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد أكواد خصم' : 'No promo codes found'}</p>
            </div>
          ) : (
            promoCodes.map((promo) => (
              <Card key={promo.id} className={`border-0 shadow-sm bg-white ${!promo.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#B8923F] flex items-center justify-center text-white">
                        {promo.type === 'percentage' ? (
                          <Percent className="h-5 w-5" />
                        ) : (
                          <Gift className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-[#3D3229]">{promo.code}</p>
                          {promo.isActive ? (
                            <Badge className="bg-[#2D5A3D] text-white">
                              {language === 'ar' ? 'نشط' : 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                              {language === 'ar' ? 'غير نشط' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#7A6F63]">
                          {promo.type === 'percentage' ? `${promo.value}%` : `€${promo.value.toFixed(2)}`} {language === 'ar' ? 'خصم' : 'off'}
                          {promo.minOrderAmount > 0 && ` • ${language === 'ar' ? 'الحد الأدنى' : 'Min'} €${promo.minOrderAmount}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="text-[#7A6F63]">{promo.usedCount}/{promo.maxUses || '∞'}</p>
                        <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'استخدام' : 'uses'}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePromoCode(promo.id, promo.isActive)}
                        className={promo.isActive ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}
                      >
                        {promo.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePromoCode(promo.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Banner Management Component
function BannerManagement() {
  const { language } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    titleNl: '',
    subtitleAr: '',
    subtitleEn: '',
    subtitleNl: '',
    imageUrl: '',
    linkUrl: '',
  });

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webshop/offers');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/webshop/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({
        titleAr: '',
        titleEn: '',
        titleNl: '',
        subtitleAr: '',
        subtitleEn: '',
        subtitleNl: '',
        imageUrl: '',
        linkUrl: '',
      });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const toggleBanner = async (bannerId: string, isActive: boolean) => {
    try {
      await fetch(`/api/webshop/offers/${bannerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      try {
        await fetch(`/api/webshop/offers/${bannerId}`, { method: 'DELETE' });
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  const getBannerTitle = (banner: Banner) => {
    if (language === 'ar') return banner.titleAr;
    if (language === 'nl') return banner.titleNl;
    return banner.titleEn;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#3D3229]">
            {language === 'ar' ? 'إدارة البانرات' : 'Banner Management'}
          </h3>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? `${banners.length} بانر` : `${banners.length} banners`}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'بانر جديد' : 'New Banner'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E8DFD0] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">
                {language === 'ar' ? 'إضافة بانر' : 'Add Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان بالعربية' : 'Title (Arabic)'}</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان بالإنجليزية' : 'Title (English)'}</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان بالهولندية' : 'Title (Dutch)'}</Label>
                  <Input
                    value={formData.titleNl}
                    onChange={(e) => setFormData({...formData, titleNl: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    required
                  />
                </div>
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان الفرعي بالعربية' : 'Subtitle (Arabic)'}</Label>
                  <Input
                    value={formData.subtitleAr}
                    onChange={(e) => setFormData({...formData, subtitleAr: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان الفرعي بالإنجليزية' : 'Subtitle (English)'}</Label>
                  <Input
                    value={formData.subtitleEn}
                    onChange={(e) => setFormData({...formData, subtitleEn: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان الفرعي بالهولندية' : 'Subtitle (Dutch)'}</Label>
                  <Input
                    value={formData.subtitleNl}
                    onChange={(e) => setFormData({...formData, subtitleNl: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</Label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'رابط التحويل' : 'Link URL'}</Label>
                  <Input
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]"
                    placeholder="/products"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="border-0">
                <CardContent className="p-4">
                  <div className="shimmer h-32 rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : banners.length === 0 ? (
            <div className="col-span-full text-center py-8 text-[#7A6F63]">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد بانرات' : 'No banners found'}</p>
            </div>
          ) : (
            banners.map((banner) => (
              <Card key={banner.id} className={`border-0 shadow-sm bg-white overflow-hidden ${!banner.isActive ? 'opacity-60' : ''}`}>
                <div className="h-24 bg-gradient-to-r from-[#D4A853] to-[#B8923F] flex items-center justify-center">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt={getBannerTitle(banner)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-center p-4">
                      <p className="font-bold">{getBannerTitle(banner)}</p>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#3D3229]">{getBannerTitle(banner)}</p>
                      <p className="text-xs text-[#7A6F63]">{banner.linkUrl || (language === 'ar' ? 'بدون رابط' : 'No link')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBanner(banner.id, banner.isActive)}
                        className={banner.isActive ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBanner(banner.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Main Component
export default function WebshopTab() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState('preview');
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/webshop/settings');
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    void fetchSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">
            {language === 'ar' ? 'المتجر الإلكتروني' : 'Webshop Management'}
          </h2>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? 'إدارة متجرك الإلكتروني' : 'Manage your online store'}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <ScrollArea className="w-full">
          <TabsList className="bg-white border border-[#E8DFD0] h-auto p-1 flex-wrap w-max">
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3">
              <Monitor className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'المعاينة' : 'Preview'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3">
              <BarChart3 className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3">
              <Package className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3">
              <Users className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'العملاء' : 'Customers'}
            </TabsTrigger>
            <TabsTrigger value="offers" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3">
              <Tag className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'العروض' : 'Offers'}
            </TabsTrigger>
            <TabsTrigger value="banners" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3">
              <ImageIcon className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'البانرات' : 'Banners'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-3">
              <Settings className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-3">
              <CreditCard className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'الدفع' : 'Payments'}
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="preview" className="mt-4">
          <StorePreview settings={settings} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <WebshopAnalytics />
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <ProductCatalog />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <CustomerAccounts />
        </TabsContent>

        <TabsContent value="offers" className="mt-4">
          <OffersDiscounts />
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <StoreSettingsTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentProvidersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
