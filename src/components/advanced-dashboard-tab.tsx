'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Truck, Users, 
  Package, Clock, AlertTriangle, ChevronUp, ChevronDown, CalendarDays,
  BarChart3, PieChart, Activity, RefreshCw, ArrowUpRight, ArrowDownRight,
  Star, Award, Target, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Types
interface AnalyticsData {
  period: string;
  revenue: {
    total: number;
    byCategory: Record<string, number>;
    trends: Array<{ date: string; revenue: number; orders: number }>;
    comparison: {
      current: number;
      previous: number;
      change: number;
    };
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    peakHours: Array<{ hour: number; count: number }>;
    avgOrderValue: number;
    dailyVolume: Array<{ day: string; count: number }>;
    volumeTrend: Array<{ date: string; orders: number }>;
    comparison: {
      current: number;
      previous: number;
      change: number;
    };
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    segments: Record<string, number>;
    topCustomers: Array<{ id: string; name: string; orders: number; revenue: number }>;
    retentionRate: number;
    newVsReturning: { new: number; returning: number };
  };
  products: {
    topSellers: Array<{ id: string; name: string; nameAr: string; category: string; quantity: number; revenue: number; stock: number; minStock: number }>;
    lowStock: Array<{ id: string; name: string; nameAr: string; category: string; stock: number; minStock: number; stockPercentage: number }>;
    performanceByCategory: Record<string, { products: any[]; totalRevenue: number }>;
  };
  delivery: {
    successRate: number;
    avgDeliveryTime: number;
    driverPerformance: Array<{ id: string; name: string; deliveries: number; revenue: number; avgOrderValue: number; rating: number; efficiency: number }>;
    byLine: Array<{ name: string; orders: number; revenue: number }>;
  };
  predictions?: {
    salesForecast: {
      nextWeekRevenue: number;
      nextWeekOrders: number;
      confidenceLevel: number;
      trendDirection: string;
    };
    stockRecommendations: Array<{ productName: string; currentStock: number; recommendedStock: number; reason: string }>;
    promotionTiming: {
      bestDay: string;
      bestTime: string;
      recommendedProducts: string[];
      expectedImpact: string;
    };
    insights: string[];
  };
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    deliverySuccessRate: number;
  };
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, t }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-[#E8DFD0]">
        <p className="text-[#3D3229] font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('إيراد') || entry.name.includes('Revenue') ? '€' : ''}{entry.value?.toFixed(2) || entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Stats Card with Trend
function AdvancedStatsCard({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  format = 'number',
  invertColors = false
}: { 
  title: string; 
  value: number; 
  previousValue?: number;
  icon: React.ElementType; 
  format?: 'number' | 'currency' | 'percentage';
  invertColors?: boolean;
}) {
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = invertColors ? change < 0 : change > 0;
  
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-3xl font-bold text-[#3D3229]">
              {format === 'currency' && '€'}
              {format === 'percentage' ? value.toFixed(1) + '%' : value.toLocaleString()}
            </p>
            {previousValue !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
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

// Main Dashboard Component
export default function AdvancedDashboardTab() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period === 'custom' ? 'month' : period);
      if (period === 'custom' && customDateRange.from && customDateRange.to) {
        params.append('startDate', customDateRange.from.toISOString());
        params.append('endDate', customDateRange.to.toISOString());
      }
      
      const res = await fetch(`/api/analytics?${params.toString()}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  }, [period, customDateRange]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  // Colors for charts
  const COLORS = ['#D4A853', '#2D5A3D', '#7A6F63', '#B8923F', '#4A7A5C', '#9C8B7A'];
  const CATEGORY_COLORS: Record<string, string> = {
    bread: '#D4A853',
    pastry: '#2D5A3D',
    sweets: '#B8923F',
  };

  // Prepare chart data
  const salesChartData = analytics?.revenue.trends.map(item => ({
    date: item.date,
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  const productsPieData = analytics ? 
    Object.entries(analytics.revenue.byCategory).map(([name, value]) => ({
      name: language === 'ar' ? 
        (name === 'bread' ? 'خبز' : name === 'pastry' ? 'معجنات' : 'حلويات') : 
        name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: CATEGORY_COLORS[name] || COLORS[0]
    })) : [];

  const driverChartData = analytics?.delivery.driverPerformance.slice(0, 5).map(d => ({
    name: d.name,
    deliveries: d.deliveries,
    revenue: d.revenue,
    rating: d.rating,
  })) || [];

  const deliveryLineData = analytics?.delivery.byLine.map(line => ({
    name: line.name,
    orders: line.orders,
    revenue: line.revenue,
  })) || [];

  const hourlyData = analytics?.orders.peakHours.map(h => ({
    hour: `${h.hour}:00`,
    orders: h.count,
  })) || [];

  const customerSegmentsData = analytics ? [
    { name: language === 'ar' ? 'VIP' : 'VIP', value: analytics.customers.segments.vip, fill: '#D4A853' },
    { name: language === 'ar' ? 'منتظم' : 'Regular', value: analytics.customers.segments.regular, fill: '#2D5A3D' },
    { name: language === 'ar' ? 'ممتاز' : 'Active', value: analytics.customers.segments.occasional, fill: '#7A6F63' },
    { name: language === 'ar' ? 'جديد' : 'New', value: analytics.customers.segments.new, fill: '#B8923F' },
  ] : [];

  const isRTL = language === 'ar' || language === 'ku';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-64 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">
            {language === 'ar' ? 'لوحة التحكم المتقدمة' : 'Advanced Dashboard'}
          </h2>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? 'تحليلات شاملة مع رسوم بيانية تفاعلية' : 'Comprehensive analytics with interactive charts'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F5EDE0] rounded-lg p-1">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => setPeriod(p)}
                className={`${period === p ? 'bg-white shadow-sm text-[#2D5A3D]' : 'text-[#7A6F63]'} rounded-md text-xs`}
              >
                {p === 'day' && (language === 'ar' ? 'اليوم' : 'Day')}
                {p === 'week' && (language === 'ar' ? 'الأسبوع' : 'Week')}
                {p === 'month' && (language === 'ar' ? 'الشهر' : 'Month')}
                {p === 'year' && (language === 'ar' ? 'السنة' : 'Year')}
              </Button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#D4A853] text-[#D4A853]">
                <CalendarDays className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: customDateRange.from,
                  to: customDateRange.to,
                }}
                onSelect={(range) => {
                  setCustomDateRange({ from: range?.from, to: range?.to });
                  if (range?.from && range?.to) {
                    setPeriod('custom');
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={fetchAnalytics} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedStatsCard
          title={language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
          value={analytics?.revenue.total || 0}
          previousValue={analytics?.revenue.comparison.previous}
          icon={DollarSign}
          format="currency"
        />
        <AdvancedStatsCard
          title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
          value={analytics?.orders.total || 0}
          previousValue={analytics?.orders.comparison.previous}
          icon={ShoppingBag}
        />
        <AdvancedStatsCard
          title={language === 'ar' ? 'متوسط قيمة الطلب' : 'Avg Order Value'}
          value={analytics?.orders.avgOrderValue || 0}
          previousValue={analytics?.orders.comparison.previous ? 
            analytics.revenue.comparison.previous / analytics.orders.comparison.previous : undefined}
          icon={Target}
          format="currency"
        />
        <AdvancedStatsCard
          title={language === 'ar' ? 'معدل التوصيل الناجح' : 'Delivery Success'}
          value={analytics?.delivery.successRate || 0}
          icon={Truck}
          format="percentage"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#D4A853]/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'طلبات جديدة' : 'New Orders'}</p>
            <p className="text-2xl font-bold text-[#D4A853]">{analytics?.orders.byStatus.pending || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#2D5A3D]/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'قيد التوصيل' : 'In Delivery'}</p>
            <p className="text-2xl font-bold text-[#2D5A3D]">{analytics?.orders.byStatus.in_delivery || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#7A6F63]/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مكتملة' : 'Completed'}</p>
            <p className="text-2xl font-bold text-[#7A6F63]">{analytics?.orders.byStatus.delivered || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#B8923F]/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'عملاء جدد' : 'New Customers'}</p>
            <p className="text-2xl font-bold text-[#B8923F]">{analytics?.customers.new || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-[#4A7A5C]/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'عملاء عائدون' : 'Returning'}</p>
            <p className="text-2xl font-bold text-[#4A7A5C]">{analytics?.customers.returning || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-500/10 to-[#F5EDE0]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مخزون منخفض' : 'Low Stock'}</p>
            <p className="text-2xl font-bold text-red-500">{analytics?.products.lowStock.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'اتجاه المبيعات اليومية' : 'Daily Sales Trend'}
            </CardTitle>
            <CardDescription className="text-[#7A6F63]">
              {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4A853" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#7A6F63" 
                    fontSize={12}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <YAxis stroke="#7A6F63" fontSize={12} />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={language === 'ar' ? 'الإيراد' : 'Revenue'}
                    stroke="#D4A853"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Products Pie Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#2D5A3D]" />
              {language === 'ar' ? 'توزيع المبيعات حسب الفئة' : 'Sales by Category'}
            </CardTitle>
            <CardDescription className="text-[#7A6F63]">
              {language === 'ar' ? 'نسبة مبيعات كل فئة' : 'Sales percentage per category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={productsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Performance Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'أداء السائقين' : 'Driver Performance'}
            </CardTitle>
            <CardDescription className="text-[#7A6F63]">
              {language === 'ar' ? 'أفضل 5 سائقين' : 'Top 5 drivers'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                  <XAxis type="number" stroke="#7A6F63" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#7A6F63" 
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Legend />
                  <Bar 
                    dataKey="deliveries" 
                    name={language === 'ar' ? 'التوصيلات' : 'Deliveries'}
                    fill="#D4A853" 
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name={language === 'ar' ? 'الإيراد (€)' : 'Revenue (€)'}
                    fill="#2D5A3D" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Lines Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#2D5A3D]" />
              {language === 'ar' ? 'أداء خطوط التوزيع' : 'Delivery Lines Performance'}
            </CardTitle>
            <CardDescription className="text-[#7A6F63]">
              {language === 'ar' ? 'الطلبات والإيرادات حسب الخط' : 'Orders and revenue by line'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                  <XAxis dataKey="name" stroke="#7A6F63" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#7A6F63" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#7A6F63" fontSize={12} />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="orders" 
                    name={language === 'ar' ? 'الطلبات' : 'Orders'}
                    fill="#D4A853" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    name={language === 'ar' ? 'الإيراد (€)' : 'Revenue (€)'}
                    fill="#2D5A3D" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'أوقات الذروة' : 'Peak Hours'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                  <XAxis dataKey="hour" stroke="#7A6F63" fontSize={10} />
                  <YAxis stroke="#7A6F63" fontSize={10} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#D4A853" 
                    strokeWidth={2}
                    dot={{ fill: '#D4A853', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2D5A3D]" />
              {language === 'ar' ? 'شرائح العملاء' : 'Customer Segments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={customerSegmentsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {customerSegmentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    formatter={(value) => <span className="text-xs text-[#7A6F63]">{value}</span>}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#B8923F]" />
              {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <span className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل الاحتفاظ' : 'Retention Rate'}</span>
                <span className="font-bold text-[#2D5A3D]">{(analytics?.customers.retentionRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <span className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوسط التوصيل' : 'Avg Delivery'}</span>
                <span className="font-bold text-[#D4A853]">{(analytics?.delivery.avgDeliveryTime || 0).toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <span className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</span>
                <span className="font-bold text-[#3D3229]">{analytics?.customers.total || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'آخر 5 طلبات' : 'Last 5 Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analytics?.revenue.trends.slice(-5).reverse().map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                    <div>
                      <p className="font-medium text-[#3D3229]">{order.date}</p>
                      <p className="text-xs text-[#7A6F63]">{order.orders} {language === 'ar' ? 'طلب' : 'orders'}</p>
                    </div>
                    <span className="font-bold text-[#D4A853]">€{order.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Star className="h-5 w-5 text-[#B8923F]" />
              {language === 'ar' ? 'أفضل 5 منتجات' : 'Top 5 Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analytics?.products.topSellers.slice(0, 5).map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8923F] flex items-center justify-center text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[#3D3229]">
                          {language === 'ar' ? product.nameAr : product.name}
                        </p>
                        <p className="text-xs text-[#7A6F63]">{product.quantity} {language === 'ar' ? 'قطعة' : 'pcs'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2D5A3D]">€{product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {language === 'ar' ? 'التنبيهات' : 'Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analytics?.products.lowStock.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#3D3229]">
                        {language === 'ar' ? product.nameAr : product.name}
                      </p>
                      <p className="text-xs text-red-600">
                        {language === 'ar' ? `المخزون: ${product.stock} (الحد الأدنى: ${product.minStock})` : 
                          `Stock: ${product.stock} (Min: ${product.minStock})`}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics?.delivery.driverPerformance.filter(d => d.rating < 4).slice(0, 2).map((driver) => (
                  <div key={driver.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#3D3229]">{driver.name}</p>
                      <p className="text-xs text-yellow-700">
                        {language === 'ar' ? `التقييم: ${driver.rating.toFixed(1)}` : `Rating: ${driver.rating.toFixed(1)}`}
                      </p>
                    </div>
                  </div>
                ))}
                {analytics?.products.lowStock.length === 0 && (
                  <div className="text-center py-8 text-[#7A6F63]">
                    <Award className="h-12 w-12 mx-auto mb-2 text-[#2D5A3D]" />
                    <p>{language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {analytics?.predictions && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#F5EDE0] to-white">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'توصيات الذكاء الاصطناعي' : 'AI Insights'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-[#E8DFD0]">
                <p className="text-sm font-medium text-[#7A6F63] mb-2">
                  {language === 'ar' ? 'توقع الأسبوع القادم' : 'Next Week Forecast'}
                </p>
                <p className="text-2xl font-bold text-[#D4A853]">
                  €{analytics.predictions.salesForecast.nextWeekRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-[#2D5A3D] mt-1">
                  {analytics.predictions.salesForecast.confidenceLevel}% {language === 'ar' ? 'ثقة' : 'confidence'}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#E8DFD0]">
                <p className="text-sm font-medium text-[#7A6F63] mb-2">
                  {language === 'ar' ? 'أفضل وقت للترويج' : 'Best Promotion Time'}
                </p>
                <p className="text-lg font-bold text-[#2D5A3D]">
                  {analytics.predictions.promotionTiming.bestDay}
                </p>
                <p className="text-xs text-[#7A6F63]">
                  {analytics.predictions.promotionTiming.bestTime}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#E8DFD0]">
                <p className="text-sm font-medium text-[#7A6F63] mb-2">
                  {language === 'ar' ? 'الأثر المتوقع' : 'Expected Impact'}
                </p>
                <p className="text-lg font-bold text-[#B8923F]">
                  {analytics.predictions.promotionTiming.expectedImpact}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {analytics.predictions.insights.map((insight, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#FFFEF7] border border-[#E8DFD0] rounded-full text-xs text-[#7A6F63]">
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
