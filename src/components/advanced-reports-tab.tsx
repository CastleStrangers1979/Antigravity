'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  FileText, Download, Filter, Calendar, TrendingUp, TrendingDown,
  DollarSign, Package, Users, Truck, FileSpreadsheet, FileDown,
  BarChart3, PieChart as PieChartIcon, RefreshCw, Printer, Mail
} from 'lucide-react';

// Colors for charts
const COLORS = ['#D4A853', '#2D5A3D', '#7A6F63', '#E8DFD0', '#B8923F', '#3D3229'];

// Types
interface ReportData {
  sales: {
    total: number;
    growth: number;
    byCategory: { name: string; value: number }[];
    daily: { date: string; sales: number; orders: number }[];
    topProducts: { name: string; sales: number; quantity: number }[];
  };
  inventory: {
    lowStock: { name: string; current: number; min: number }[];
    movements: { type: string; count: number; value: number }[];
    byCategory: { name: string; count: number; value: number }[];
  };
  drivers: {
    performance: { name: string; deliveries: number; rating: number; revenue: number }[];
    byLine: { name: string; deliveries: number; efficiency: number }[];
  };
  taxes: {
    period: string;
    sales: number;
    purchases: number;
    taxAmount: number;
    rate: number;
  }[];
}

interface DateRange {
  start: string;
  end: string;
}

export default function AdvancedReportsTab() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [exportDialog, setExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  // Generate daily data function - defined before use
  const generateDailyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL', { weekday: 'short' }),
        sales: Math.floor(Math.random() * 1000) + 1500,
        orders: Math.floor(Math.random() * 20) + 30,
      });
    }
    return data;
  };

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?start=${dateRange.start}&end=${dateRange.end}`);
      const data = await res.json();
      
      // Transform data for reports
      setReportData({
        sales: {
          total: data.summary?.totalRevenue || 15420,
          growth: 12.5,
          byCategory: [
            { name: language === 'ar' ? 'خبز' : 'Bread', value: 8500 },
            { name: language === 'ar' ? 'معجنات' : 'Pastry', value: 4200 },
            { name: language === 'ar' ? 'حلويات' : 'Sweets', value: 2720 },
          ],
          daily: generateDailyData(),
          topProducts: [
            { name: language === 'ar' ? 'خبز صاج' : 'Saj Bread', sales: 3200, quantity: 640 },
            { name: language === 'ar' ? 'خبز عربي' : 'Arabic Bread', sales: 2800, quantity: 560 },
            { name: language === 'ar' ? 'فطير بالجبنة' : 'Cheese Pastry', sales: 1800, quantity: 180 },
            { name: language === 'ar' ? 'بقلاوة' : 'Baklava', sales: 1500, quantity: 75 },
            { name: language === 'ar' ? 'كنافة' : 'Kunafa', sales: 1200, quantity: 60 },
          ],
        },
        inventory: {
          lowStock: [
            { name: language === 'ar' ? 'خبز صاج' : 'Saj Bread', current: 15, min: 50 },
            { name: language === 'ar' ? 'فطير بالجبنة' : 'Cheese Pastry', current: 8, min: 30 },
            { name: language === 'ar' ? 'بقلاوة' : 'Baklava', current: 5, min: 20 },
          ],
          movements: [
            { type: language === 'ar' ? 'وارد' : 'In', count: 45, value: 5600 },
            { type: language === 'ar' ? 'صادر' : 'Out', count: 120, value: 4200 },
            { type: language === 'ar' ? 'مرتجع' : 'Return', count: 8, value: 320 },
          ],
          byCategory: [
            { name: language === 'ar' ? 'خبز' : 'Bread', count: 500, value: 2500 },
            { name: language === 'ar' ? 'معجنات' : 'Pastry', count: 200, value: 2000 },
            { name: language === 'ar' ? 'حلويات' : 'Sweets', count: 100, value: 1500 },
          ],
        },
        drivers: {
          performance: [
            { name: 'أحمد محمد', deliveries: 45, rating: 4.9, revenue: 2800 },
            { name: 'محمد علي', deliveries: 38, rating: 4.7, revenue: 2400 },
            { name: 'خالد حسن', deliveries: 35, rating: 4.8, revenue: 2200 },
            { name: 'عمر يوسف', deliveries: 32, rating: 4.6, revenue: 2000 },
            { name: 'سمير كمال', deliveries: 28, rating: 4.5, revenue: 1800 },
          ],
          byLine: [
            { name: language === 'ar' ? 'خط روتردام' : 'Rotterdam Line', deliveries: 85, efficiency: 92 },
            { name: language === 'ar' ? 'خط أمستردام' : 'Amsterdam Line', deliveries: 72, efficiency: 88 },
            { name: language === 'ar' ? 'خط لاهاي' : 'The Hague Line', deliveries: 65, efficiency: 95 },
            { name: language === 'ar' ? 'خط أوترخت' : 'Utrecht Line', deliveries: 58, efficiency: 90 },
          ],
        },
        taxes: [
          { period: '2024-Q1', sales: 45000, purchases: 28000, taxAmount: 3570, rate: 21 },
          { period: '2024-Q2', sales: 52000, purchases: 31000, taxAmount: 4410, rate: 21 },
          { period: '2024-Q3', sales: 48000, purchases: 29000, taxAmount: 3990, rate: 21 },
          { period: '2024-Q4', sales: 61000, purchases: 35000, taxAmount: 5460, rate: 21 },
        ],
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
    setLoading(false);
  }, [dateRange, language]);

  useEffect(() => {
    void fetchReportData();
  }, [dateRange, language]);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: exportFormat,
          type: activeReport,
          dateRange,
        }),
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${activeReport}-${dateRange.start}-${dateRange.end}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
    setExportDialog(false);
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'التقارير المتقدمة',
        salesReport: 'تقرير المبيعات',
        inventoryReport: 'تقرير المخزون',
        driversReport: 'تقرير السائقين',
        taxReport: 'التقرير الضريبي',
        totalSales: 'إجمالي المبيعات',
        growth: 'النمو',
        salesByCategory: 'المبيعات حسب الفئة',
        dailySales: 'المبيعات اليومية',
        topProducts: 'المنتجات الأكثر مبيعاً',
        lowStock: 'مخزون منخفض',
        inventoryMovements: 'حركة المخزون',
        driverPerformance: 'أداء السائقين',
        deliveriesByLine: 'التوصيلات حسب الخط',
        export: 'تصدير',
        exportReport: 'تصدير التقرير',
        selectFormat: 'اختر الصيغة',
        download: 'تحميل',
        cancel: 'إلغاء',
        from: 'من',
        to: 'إلى',
        product: 'المنتج',
        sales: 'المبيعات',
        quantity: 'الكمية',
        current: 'الحالي',
        minimum: 'الحد الأدنى',
        driver: 'السائق',
        deliveries: 'التوصيلات',
        rating: 'التقييم',
        revenue: 'الإيرادات',
        efficiency: 'الكفاءة',
        line: 'الخط',
        period: 'الفترة',
        purchases: 'المشتريات',
        taxAmount: 'مبلغ الضريبة',
        rate: 'النسبة',
        print: 'طباعة',
        email: 'إرسال بالبريد',
        refresh: 'تحديث',
        currentStock: 'المخزون الحالي',
        value: 'القيمة',
        count: 'العدد',
        type: 'النوع',
      },
      en: {
        title: 'Advanced Reports',
        salesReport: 'Sales Report',
        inventoryReport: 'Inventory Report',
        driversReport: 'Drivers Report',
        taxReport: 'Tax Report',
        totalSales: 'Total Sales',
        growth: 'Growth',
        salesByCategory: 'Sales by Category',
        dailySales: 'Daily Sales',
        topProducts: 'Top Products',
        lowStock: 'Low Stock',
        inventoryMovements: 'Inventory Movements',
        driverPerformance: 'Driver Performance',
        deliveriesByLine: 'Deliveries by Line',
        export: 'Export',
        exportReport: 'Export Report',
        selectFormat: 'Select Format',
        download: 'Download',
        cancel: 'Cancel',
        from: 'From',
        to: 'To',
        product: 'Product',
        sales: 'Sales',
        quantity: 'Quantity',
        current: 'Current',
        minimum: 'Minimum',
        driver: 'Driver',
        deliveries: 'Deliveries',
        rating: 'Rating',
        revenue: 'Revenue',
        efficiency: 'Efficiency',
        line: 'Line',
        period: 'Period',
        purchases: 'Purchases',
        taxAmount: 'Tax Amount',
        rate: 'Rate',
        print: 'Print',
        email: 'Send Email',
        refresh: 'Refresh',
        currentStock: 'Current Stock',
        value: 'Value',
        count: 'Count',
        type: 'Type',
      },
    };
    return translations[language]?.[key] || key;
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
            <BarChart3 className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">
            {t('from')}: {dateRange.start} | {t('to')}: {dateRange.end}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchReportData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
          <Button onClick={() => setExportDialog(true)} className="gold-gradient text-white border-0">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-5 w-5 text-[#7A6F63]" />
            <div className="flex items-center gap-2">
              <Label className="text-[#7A6F63]">{t('from')}:</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-[160px] border-[#E8DFD0]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-[#7A6F63]">{t('to')}:</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-[160px] border-[#E8DFD0]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    start: today.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                  });
                }}
                className="border-[#E8DFD0]"
              >
                {language === 'ar' ? 'اليوم' : 'Today'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setDateRange({
                    start: weekAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                  });
                }}
                className="border-[#E8DFD0]"
              >
                {language === 'ar' ? 'أسبوع' : 'Week'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setDateRange({
                    start: monthAgo.toISOString().split('T')[0],
                    end: today.toISOString().split('T')[0],
                  });
                }}
                className="border-[#E8DFD0]"
              >
                {language === 'ar' ? 'شهر' : 'Month'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="sales" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-2" />
            {t('salesReport')}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            {t('inventoryReport')}
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Truck className="h-4 w-4 mr-2" />
            {t('driversReport')}
          </TabsTrigger>
          <TabsTrigger value="taxes" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            {t('taxReport')}
          </TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          {reportData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{t('totalSales')}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">€{reportData.sales.total.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-[#D4A853]" />
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">+{reportData.sales.growth}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'الطلبات' : 'Orders'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">247</p>
                      </div>
                      <FileText className="h-8 w-8 text-[#2D5A3D]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوسط الطلب' : 'Avg Order'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">€62.43</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Category */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{t('salesByCategory')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reportData.sales.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {reportData.sales.byCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Daily Sales */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{t('dailySales')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={reportData.sales.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                        <XAxis dataKey="date" stroke="#7A6F63" />
                        <YAxis stroke="#7A6F63" />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#D4A853" fill="#D4A853" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229]">{t('topProducts')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t('product')}</TableHead>
                        <TableHead>{t('sales')}</TableHead>
                        <TableHead>{t('quantity')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.sales.topProducts.map((product, index) => (
                        <TableRow key={product.name}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>€{product.sales.toLocaleString()}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          {reportData && (
            <>
              {/* Low Stock Alert */}
              <Card className="border-0 shadow-md border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="text-[#3D3229] flex items-center gap-2">
                    <Package className="h-5 w-5 text-red-500" />
                    {t('lowStock')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('product')}</TableHead>
                        <TableHead>{t('current')}</TableHead>
                        <TableHead>{t('minimum')}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.inventory.lowStock.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <span className="text-red-600 font-bold">{item.current}</span>
                          </TableCell>
                          <TableCell>{item.minimum}</TableCell>
                          <TableCell>
                            <Progress 
                              value={(item.current / item.minimum) * 100} 
                              className="h-2 w-24"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Inventory by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'المخزون حسب الفئة' : 'Inventory by Category'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reportData.inventory.byCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                        <XAxis dataKey="name" stroke="#7A6F63" />
                        <YAxis stroke="#7A6F63" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#2D5A3D" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229]">{t('inventoryMovements')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('type')}</TableHead>
                          <TableHead>{t('count')}</TableHead>
                          <TableHead>{t('value')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.inventory.movements.map((movement) => (
                          <TableRow key={movement.type}>
                            <TableCell className="font-medium">{movement.type}</TableCell>
                            <TableCell>{movement.count}</TableCell>
                            <TableCell>€{movement.value.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Drivers Report */}
        <TabsContent value="drivers" className="space-y-6">
          {reportData && (
            <>
              {/* Driver Performance */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229]">{t('driverPerformance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{t('driver')}</TableHead>
                        <TableHead>{t('deliveries')}</TableHead>
                        <TableHead>{t('rating')}</TableHead>
                        <TableHead>{t('revenue')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.drivers.performance.map((driver, index) => (
                        <TableRow key={driver.name}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{driver.name}</TableCell>
                          <TableCell>{driver.deliveries}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-[#D4A853]">★</span>
                              {driver.rating}
                            </div>
                          </TableCell>
                          <TableCell>€{driver.revenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Deliveries by Line */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229]">{t('deliveriesByLine')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.drivers.byLine} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD0" />
                      <XAxis type="number" stroke="#7A6F63" />
                      <YAxis dataKey="name" type="category" stroke="#7A6F63" width={100} />
                      <Tooltip />
                      <Bar dataKey="deliveries" fill="#D4A853" />
                      <Bar dataKey="efficiency" fill="#2D5A3D" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tax Report */}
        <TabsContent value="taxes" className="space-y-6">
          {reportData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">€206,000</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">€123,000</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'ضريبة المبيعات' : 'Sales Tax'}</p>
                    <p className="text-2xl font-bold text-[#D4A853]">€17,430</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'ضريبة مستحقة' : 'Tax Due'}</p>
                    <p className="text-2xl font-bold text-red-600">€7,000</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'تقرير BTW الربع سنوي' : 'Quarterly BTW Report'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('period')}</TableHead>
                        <TableHead>{t('sales')}</TableHead>
                        <TableHead>{t('purchases')}</TableHead>
                        <TableHead>{t('taxAmount')}</TableHead>
                        <TableHead>{t('rate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.taxes.map((tax) => (
                        <TableRow key={tax.period}>
                          <TableCell className="font-medium">{tax.period}</TableCell>
                          <TableCell>€{tax.sales.toLocaleString()}</TableCell>
                          <TableCell>€{tax.purchases.toLocaleString()}</TableCell>
                          <TableCell>€{tax.taxAmount.toLocaleString()}</TableCell>
                          <TableCell>{tax.rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('exportReport')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#7A6F63]">{t('selectFormat')}</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExportDialog(false)} className="flex-1 border-[#E8DFD0]">
                {t('cancel')}
              </Button>
              <Button onClick={handleExport} className="flex-1 gold-gradient text-white border-0">
                <Download className="h-4 w-4 mr-2" />
                {t('download')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
