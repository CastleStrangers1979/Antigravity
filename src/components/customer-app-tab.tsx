'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Smartphone, Package, MapPin, Star, Gift, CreditCard, Bell, User,
  RefreshCw, Eye, Download, QrCode, TrendingUp, Users, Clock
} from 'lucide-react';

// Types
interface CustomerAppStats {
  activeUsers: number;
  totalDownloads: number;
  monthlyActive: number;
  avgSessionDuration: number;
  loyaltyPointsIssued: number;
  loyaltyPointsRedeemed: number;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  items: number;
  createdAt: string;
}

interface LoyaltyTier {
  name: string;
  minPoints: number;
  customers: number;
  benefits: string[];
}

export default function CustomerAppTab() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<CustomerAppStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customer-app/stats');
      const data = await res.json();
      setStats(data.stats || mockStats);
      setRecentOrders(data.orders || mockOrders);
      setLoyaltyTiers(data.tiers || mockTiers);
    } catch (error) {
      console.error('Error fetching customer app data:', error);
      setStats(mockStats);
      setRecentOrders(mockOrders);
      setLoyaltyTiers(mockTiers);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const mockStats: CustomerAppStats = {
    activeUsers: 1247,
    totalDownloads: 3421,
    monthlyActive: 892,
    avgSessionDuration: 8.5,
    loyaltyPointsIssued: 45600,
    loyaltyPointsRedeemed: 28400,
  };

  const mockOrders: CustomerOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'أحمد محمد',
      status: 'delivered',
      totalAmount: 85.50,
      items: 5,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'سارة علي',
      status: 'in_delivery',
      totalAmount: 120.00,
      items: 8,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'محمد خالد',
      status: 'pending',
      totalAmount: 45.75,
      items: 3,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const mockTiers: LoyaltyTier[] = [
    {
      name: language === 'ar' ? 'برونزي' : 'Bronze',
      minPoints: 0,
      customers: 450,
      benefits: [language === 'ar' ? 'خصم 5%' : '5% discount', language === 'ar' ? 'نقاط مضاعفة' : 'Double points'],
    },
    {
      name: language === 'ar' ? 'فضي' : 'Silver',
      minPoints: 500,
      customers: 320,
      benefits: [language === 'ar' ? 'خصم 10%' : '10% discount', language === 'ar' ? 'توصيل مجاني' : 'Free delivery'],
    },
    {
      name: language === 'ar' ? 'ذهبي' : 'Gold',
      minPoints: 1000,
      customers: 150,
      benefits: [language === 'ar' ? 'خصم 15%' : '15% discount', language === 'ar' ? 'أولوية الطلبات' : 'Priority orders'],
    },
    {
      name: language === 'ar' ? 'بلاتيني' : 'Platinum',
      minPoints: 2500,
      customers: 45,
      benefits: [language === 'ar' ? 'خصم 20%' : '20% discount', language === 'ar' ? 'هدايا حصرية' : 'Exclusive gifts'],
    },
  ];

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'تطبيق جوال للعملاء',
        overview: 'نظرة عامة',
        orders: 'الطلبات',
        loyalty: 'نقاط الولاء',
        download: 'تحميل التطبيق',
        activeUsers: 'المستخدمون النشطون',
        totalDownloads: 'إجمالي التحميلات',
        monthlyActive: 'النشطون شهرياً',
        avgSession: 'متوسط الجلسة',
        pointsIssued: 'نقاط مُصدرة',
        pointsRedeemed: 'نقاط مستبدلة',
        recentOrders: 'الطلبات الأخيرة',
        customer: 'العميل',
        status: 'الحالة',
        amount: 'المبلغ',
        items: 'الأصناف',
        date: 'التاريخ',
        delivered: 'تم التوصيل',
        inDelivery: 'قيد التوصيل',
        pending: 'معلق',
        loyaltyProgram: 'برنامج الولاء',
        tier: 'المستوى',
        customers: 'العملاء',
        benefits: 'المميزات',
        minPoints: 'الحد الأدنى',
        refresh: 'تحديث',
        viewDetails: 'عرض التفاصيل',
        scanToDownload: 'امسح للتحميل',
        appStore: 'App Store',
        googlePlay: 'Google Play',
      },
      en: {
        title: 'Customer Mobile App',
        overview: 'Overview',
        orders: 'Orders',
        loyalty: 'Loyalty Points',
        download: 'Download App',
        activeUsers: 'Active Users',
        totalDownloads: 'Total Downloads',
        monthlyActive: 'Monthly Active',
        avgSession: 'Avg Session',
        pointsIssued: 'Points Issued',
        pointsRedeemed: 'Points Redeemed',
        recentOrders: 'Recent Orders',
        customer: 'Customer',
        status: 'Status',
        amount: 'Amount',
        items: 'Items',
        date: 'Date',
        delivered: 'Delivered',
        inDelivery: 'In Delivery',
        pending: 'Pending',
        loyaltyProgram: 'Loyalty Program',
        tier: 'Tier',
        customers: 'Customers',
        benefits: 'Benefits',
        minPoints: 'Min Points',
        refresh: 'Refresh',
        viewDetails: 'View Details',
        scanToDownload: 'Scan to Download',
        appStore: 'App Store',
        googlePlay: 'Google Play',
      },
    };
    return translations[language]?.[key] || key;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      delivered: { className: 'bg-green-100 text-green-700', label: t('delivered') },
      in_delivery: { className: 'bg-blue-100 text-blue-700', label: t('inDelivery') },
      pending: { className: 'bg-amber-100 text-amber-700', label: t('pending') },
    };
    const c = config[status] || { className: 'bg-gray-100 text-gray-700', label: status };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
          <Button className="green-gradient text-white border-0">
            <Download className="h-4 w-4 mr-2" />
            {t('download')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Smartphone className="h-4 w-4 mr-2" />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            {t('orders')}
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Gift className="h-4 w-4 mr-2" />
            {t('loyalty')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{t('activeUsers')}</p>
                        <p className="text-2xl font-bold text-[#2D5A3D]">{stats.activeUsers.toLocaleString()}</p>
                      </div>
                      <Users className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{t('totalDownloads')}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{stats.totalDownloads.toLocaleString()}</p>
                      </div>
                      <Download className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{t('monthlyActive')}</p>
                        <p className="text-2xl font-bold text-[#D4A853]">{stats.monthlyActive}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{t('avgSession')}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{stats.avgSession}m</p>
                      </div>
                      <Clock className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Download Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{t('download')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 bg-[#F5EDE0] rounded-xl flex items-center justify-center">
                        <QrCode className="h-20 w-20 text-[#2D5A3D]" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-[#7A6F63]">{t('scanToDownload')}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-[#E8DFD0]">
                            <Download className="h-4 w-4 mr-1" />
                            {t('appStore')}
                          </Button>
                          <Button variant="outline" size="sm" className="border-[#E8DFD0]">
                            <Download className="h-4 w-4 mr-1" />
                            {t('googlePlay')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{t('loyaltyProgram')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#F5EDE0] rounded-xl">
                        <p className="text-sm text-[#7A6F63]">{t('pointsIssued')}</p>
                        <p className="text-2xl font-bold text-[#D4A853]">{stats.loyaltyPointsIssued.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-[#F5EDE0] rounded-xl">
                        <p className="text-sm text-[#7A6F63]">{t('pointsRedeemed')}</p>
                        <p className="text-2xl font-bold text-[#2D5A3D]">{stats.loyaltyPointsRedeemed.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{t('recentOrders')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead>#{language === 'ar' ? 'رقم' : 'Order'}</TableHead>
                    <TableHead>{t('customer')}</TableHead>
                    <TableHead>{t('items')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>€{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier, index) => (
              <Card key={tier.name} className={`border-0 shadow-md overflow-hidden ${index === 3 ? 'ring-2 ring-[#D4A853]' : ''}`}>
                <div className={`h-2 ${index === 0 ? 'bg-amber-600' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-[#D4A853]' : 'bg-gradient-to-r from-[#D4A853] to-[#2D5A3D]'}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#3D3229]">{tier.name}</CardTitle>
                  <CardDescription className="text-[#7A6F63]">
                    {t('minPoints')}: {tier.minPoints}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <p className="text-sm text-[#7A6F63]">{t('customers')}</p>
                    <p className="text-2xl font-bold text-[#2D5A3D]">{tier.customers}</p>
                  </div>
                  <div className="space-y-1">
                    {tier.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#3D3229]">
                        <Gift className="h-3 w-3 text-[#D4A853]" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
