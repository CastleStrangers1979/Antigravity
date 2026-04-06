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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard, Wallet, Building, DollarSign, CheckCircle, XCircle, Clock,
  RefreshCw, Plus, Eye, Settings, Link2, Shield, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, Send, Ban
} from 'lucide-react';

// Types
interface PaymentProvider {
  id: string;
  name: string;
  type: string;
  logo: string;
  isActive: boolean;
  isConfigured: boolean;
  feePercent: number;
  feeFixed: number;
  totalTransactions: number;
  totalVolume: number;
  lastTransaction?: string;
}

interface Payment {
  id: string;
  orderId?: string;
  customerName: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
}

interface PaymentSettings {
  autoCapture: boolean;
  allowPartialRefund: boolean;
  sendReceipt: boolean;
  defaultCurrency: string;
  minAmount: number;
  maxAmount: number;
}

// Mock data
const mockProviders: PaymentProvider[] = [
  {
    id: 'ideal',
    name: 'iDEAL',
    type: 'bank_transfer',
    logo: '/icons/ideal.svg',
    isActive: true,
    isConfigured: true,
    feePercent: 0.5,
    feeFixed: 0.35,
    totalTransactions: 1250,
    totalVolume: 78500,
    lastTransaction: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mollie',
    name: 'Mollie',
    type: 'payment_gateway',
    logo: '/icons/mollie.svg',
    isActive: true,
    isConfigured: true,
    feePercent: 0.9,
    feeFixed: 0.25,
    totalTransactions: 890,
    totalVolume: 45200,
    lastTransaction: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment_gateway',
    logo: '/icons/stripe.svg',
    isActive: true,
    isConfigured: false,
    feePercent: 1.4,
    feeFixed: 0.25,
    totalTransactions: 0,
    totalVolume: 0,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'wallet',
    logo: '/icons/paypal.svg',
    isActive: false,
    isConfigured: false,
    feePercent: 2.9,
    feeFixed: 0.35,
    totalTransactions: 0,
    totalVolume: 0,
  },
  {
    id: 'cash',
    name: language => language === 'ar' ? 'نقداً' : 'Cash',
    type: 'cash',
    logo: '/icons/cash.svg',
    isActive: true,
    isConfigured: true,
    feePercent: 0,
    feeFixed: 0,
    totalTransactions: 450,
    totalVolume: 12500,
    lastTransaction: new Date(Date.now() - 1800000).toISOString(),
  },
];

const mockPayments: Payment[] = [
  {
    id: '1',
    orderId: 'ORD-2024-001',
    customerName: 'أحمد محمد',
    amount: 85.50,
    currency: 'EUR',
    method: 'iDEAL',
    provider: 'ideal',
    status: 'completed',
    transactionId: 'TRX-IDEAL-001234',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    paidAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '2',
    orderId: 'ORD-2024-002',
    customerName: 'سارة علي',
    amount: 120.00,
    currency: 'EUR',
    method: 'Mollie',
    provider: 'mollie',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    orderId: 'ORD-2024-003',
    customerName: 'محمد خالد',
    amount: 45.75,
    currency: 'EUR',
    method: 'Cash',
    provider: 'cash',
    status: 'completed',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    paidAt: new Date(Date.now() - 10700000).toISOString(),
  },
  {
    id: '4',
    orderId: 'ORD-2024-004',
    customerName: 'فاطمة حسن',
    amount: 200.00,
    currency: 'EUR',
    method: 'iDEAL',
    provider: 'ideal',
    status: 'refunded',
    transactionId: 'TRX-IDEAL-001235',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    paidAt: new Date(Date.now() - 86000000).toISOString(),
    refundedAt: new Date(Date.now() - 85000000).toISOString(),
    refundReason: 'Order cancelled by customer',
  },
  {
    id: '5',
    orderId: 'ORD-2024-005',
    customerName: 'عمر يوسف',
    amount: 65.25,
    currency: 'EUR',
    method: 'Mollie',
    provider: 'mollie',
    status: 'failed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function PaymentSystemTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>({
    autoCapture: true,
    allowPartialRefund: true,
    sendReceipt: true,
    defaultCurrency: 'EUR',
    minAmount: 1,
    maxAmount: 10000,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [configDialog, setConfigDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [providersRes, paymentsRes] = await Promise.all([
        fetch('/api/payments/providers'),
        fetch('/api/payments'),
      ]);
      
      if (providersRes.ok) {
        const data = await providersRes.json();
        setProviders(data.providers || mockProviders);
      } else {
        setProviders(mockProviders);
      }
      
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || mockPayments);
      } else {
        setPayments(mockPayments);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setProviders(mockProviders);
      setPayments(mockPayments);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const toggleProvider = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider?.isConfigured) {
      setSelectedProvider(provider);
      setConfigDialog(true);
      return;
    }
    
    const updatedProviders = providers.map(p =>
      p.id === providerId ? { ...p, isActive: !p.isActive } : p
    );
    setProviders(updatedProviders);
    
    try {
      await fetch('/api/payments/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, isActive: !provider.isActive }),
      });
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const refundPayment = async (paymentId: string) => {
    try {
      await fetch(`/api/payments/${paymentId}/refund`, { method: 'POST' });
      const updatedPayments = payments.map(p =>
        p.id === paymentId ? { ...p, status: 'refunded' as const, refundedAt: new Date().toISOString() } : p
      );
      setPayments(updatedPayments);
      showNotification(language === 'ar' ? 'تم استرداد المبلغ' : 'Payment refunded', 'success');
    } catch (error) {
      console.error('Error refunding payment:', error);
      showNotification(language === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    toast({
      title: type === 'success' ? (language === 'ar' ? 'نجاح' : 'Success') : (language === 'ar' ? 'خطأ' : 'Error'),
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'نظام الدفع الإلكتروني',
        overview: 'نظرة عامة',
        providers: 'بوابات الدفع',
        transactions: 'المعاملات',
        settings: 'الإعدادات',
        totalRevenue: 'إجمالي الإيرادات',
        todayPayments: 'مدفوعات اليوم',
        pendingPayments: 'معلقة',
        completedPayments: 'مكتملة',
        refundedPayments: 'مستردة',
        activeProviders: 'بوابات نشطة',
        totalTransactions: 'إجمالي المعاملات',
        configureProvider: 'تكوين البوابة',
        apiKey: 'مفتاح API',
        merchantId: 'معرف التاجر',
        secretKey: 'المفتاح السري',
        webhooksUrl: 'رابط Webhooks',
        save: 'حفظ',
        cancel: 'إلغاء',
        enable: 'تفعيل',
        disable: 'تعطيل',
        configure: 'تكوين',
        status: 'الحالة',
        amount: 'المبلغ',
        customer: 'العميل',
        method: 'الطريقة',
        date: 'التاريخ',
        actions: 'الإجراءات',
        refund: 'استرداد',
        view: 'عرض',
        transactionId: 'معرف المعاملة',
        orderId: 'رقم الطلب',
        refundReason: 'سبب الاسترداد',
        confirmRefund: 'تأكيد الاسترداد',
        autoCapture: 'الالتقاط التلقائي',
        allowPartialRefund: 'السماح بالاسترداد الجزئي',
        sendReceipt: 'إرسال إيصال',
        defaultCurrency: 'العملة الافتراضية',
        minAmount: 'الحد الأدنى',
        maxAmount: 'الحد الأقصى',
        filterByStatus: 'تصفية حسب الحالة',
        all: 'الكل',
        pending: 'معلق',
        completed: 'مكتمل',
        failed: 'فشل',
        refunded: 'مسترد',
        fee: 'الرسوم',
        volume: 'الحجم',
        refresh: 'تحديث',
        noTransactions: 'لا توجد معاملات',
        processingFee: 'رسوم المعالجة',
        netAmount: 'المبلغ الصافي',
      },
      en: {
        title: 'Payment System',
        overview: 'Overview',
        providers: 'Payment Providers',
        transactions: 'Transactions',
        settings: 'Settings',
        totalRevenue: 'Total Revenue',
        todayPayments: "Today's Payments",
        pendingPayments: 'Pending',
        completedPayments: 'Completed',
        refundedPayments: 'Refunded',
        activeProviders: 'Active Providers',
        totalTransactions: 'Total Transactions',
        configureProvider: 'Configure Provider',
        apiKey: 'API Key',
        merchantId: 'Merchant ID',
        secretKey: 'Secret Key',
        webhooksUrl: 'Webhooks URL',
        save: 'Save',
        cancel: 'Cancel',
        enable: 'Enable',
        disable: 'Disable',
        configure: 'Configure',
        status: 'Status',
        amount: 'Amount',
        customer: 'Customer',
        method: 'Method',
        date: 'Date',
        actions: 'Actions',
        refund: 'Refund',
        view: 'View',
        transactionId: 'Transaction ID',
        orderId: 'Order ID',
        refundReason: 'Refund Reason',
        confirmRefund: 'Confirm Refund',
        autoCapture: 'Auto Capture',
        allowPartialRefund: 'Allow Partial Refund',
        sendReceipt: 'Send Receipt',
        defaultCurrency: 'Default Currency',
        minAmount: 'Min Amount',
        maxAmount: 'Max Amount',
        filterByStatus: 'Filter by Status',
        all: 'All',
        pending: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        refunded: 'Refunded',
        fee: 'Fee',
        volume: 'Volume',
        refresh: 'Refresh',
        noTransactions: 'No transactions',
        processingFee: 'Processing Fee',
        netAmount: 'Net Amount',
      },
    };
    return translations[language]?.[key] || key;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700', label: t('pending') },
      completed: { className: 'bg-green-100 text-green-700', label: t('completed') },
      failed: { className: 'bg-red-100 text-red-700', label: t('failed') },
      refunded: { className: 'bg-gray-100 text-gray-700', label: t('refunded') },
    };
    const c = config[status] || { className: 'bg-gray-100 text-gray-700', label: status };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const filteredPayments = filterStatus === 'all' 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    activeProviders: providers.filter(p => p.isActive).length,
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
            <CreditCard className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إدارة المدفوعات والبوابات' : 'Manage payments & providers'}</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <DollarSign className="h-4 w-4 mr-2" />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Building className="h-4 w-4 mr-2" />
            {t('providers')}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Wallet className="h-4 w-4 mr-2" />
            {t('transactions')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            {t('settings')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6F63]">{t('totalRevenue')}</p>
                    <p className="text-xl font-bold text-[#2D5A3D]">€{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-[#D4A853]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6F63]">{t('completedPayments')}</p>
                    <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6F63]">{t('pendingPayments')}</p>
                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6F63]">{t('refundedPayments')}</p>
                    <p className="text-xl font-bold text-gray-600">{stats.refunded}</p>
                  </div>
                  <ArrowDownRight className="h-6 w-6 text-gray-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#7A6F63]">{t('activeProviders')}</p>
                    <p className="text-xl font-bold text-[#D4A853]">{stats.activeProviders}</p>
                  </div>
                  <Building className="h-6 w-6 text-[#D4A853]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'آخر المعاملات' : 'Recent Transactions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('orderId')}</TableHead>
                      <TableHead>{t('customer')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('method')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 5).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.orderId}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm text-[#7A6F63]">
                          {new Date(payment.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id} className={`border-0 shadow-md overflow-hidden ${!provider.isConfigured ? 'opacity-70' : ''}`}>
                <div className={`h-1 ${provider.isActive ? 'gold-gradient' : 'bg-gray-300'}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.isActive ? 'bg-[#D4A853]/10' : 'bg-gray-100'}`}>
                        {provider.type === 'bank_transfer' && <Building className="h-5 w-5 text-[#D4A853]" />}
                        {provider.type === 'payment_gateway' && <CreditCard className="h-5 w-5 text-[#D4A853]" />}
                        {provider.type === 'wallet' && <Wallet className="h-5 w-5 text-[#D4A853]" />}
                        {provider.type === 'cash' && <DollarSign className="h-5 w-5 text-[#D4A853]" />}
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#3D3229]">{typeof provider.name === 'function' ? provider.name(language) : provider.name}</CardTitle>
                        <p className="text-xs text-[#7A6F63]">{provider.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Switch
                      checked={provider.isActive}
                      onCheckedChange={() => toggleProvider(provider.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-[#F5EDE0] rounded-lg">
                      <p className="text-xs text-[#7A6F63]">{t('fee')}</p>
                      <p className="font-bold text-[#3D3229]">{provider.feePercent}% + €{provider.feeFixed}</p>
                    </div>
                    <div className="p-2 bg-[#F5EDE0] rounded-lg">
                      <p className="text-xs text-[#7A6F63]">{t('volume')}</p>
                      <p className="font-bold text-[#3D3229]">€{provider.totalVolume.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {!provider.isConfigured && (
                    <Button 
                      onClick={() => { setSelectedProvider(provider); setConfigDialog(true); }}
                      className="w-full border-[#D4A853] text-[#D4A853]"
                      variant="outline"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t('configure')}
                    </Button>
                  )}
                  
                  {provider.isConfigured && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#7A6F63]">{t('totalTransactions')}</span>
                      <span className="font-medium text-[#3D3229]">{provider.totalTransactions}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Filter */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-[#7A6F63]" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] border-[#E8DFD0]">
                    <SelectValue placeholder={t('filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                    <SelectItem value="failed">{t('failed')}</SelectItem>
                    <SelectItem value="refunded">{t('refunded')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {filteredPayments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-50" />
                    <p className="text-[#7A6F63]">{t('noTransactions')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F5EDE0]">
                        <TableHead>{t('orderId')}</TableHead>
                        <TableHead>{t('customer')}</TableHead>
                        <TableHead>{t('amount')}</TableHead>
                        <TableHead>{t('method')}</TableHead>
                        <TableHead>{t('transactionId')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.orderId}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell className="font-mono text-xs">{payment.transactionId || '-'}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-sm text-[#7A6F63]">
                            {new Date(payment.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {payment.status === 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => refundPayment(payment.id)}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <ArrowDownRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'إعدادات الدفع' : 'Payment Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div>
                  <p className="font-medium text-[#3D3229]">{t('autoCapture')}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'التقاط المدفوعات تلقائياً' : 'Automatically capture payments'}</p>
                </div>
                <Switch
                  checked={settings.autoCapture}
                  onCheckedChange={(v) => setSettings({ ...settings, autoCapture: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div>
                  <p className="font-medium text-[#3D3229]">{t('allowPartialRefund')}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'السماح باسترداد جزئي للمبلغ' : 'Allow partial amount refunds'}</p>
                </div>
                <Switch
                  checked={settings.allowPartialRefund}
                  onCheckedChange={(v) => setSettings({ ...settings, allowPartialRefund: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div>
                  <p className="font-medium text-[#3D3229]">{t('sendReceipt')}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إرسال إيصال للعميل' : 'Send receipt to customer'}</p>
                </div>
                <Switch
                  checked={settings.sendReceipt}
                  onCheckedChange={(v) => setSettings({ ...settings, sendReceipt: v })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('defaultCurrency')}</Label>
                  <Select value={settings.defaultCurrency} onValueChange={(v) => setSettings({ ...settings, defaultCurrency: v })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('minAmount')} (€)</Label>
                  <Input
                    type="number"
                    value={settings.minAmount}
                    onChange={(e) => setSettings({ ...settings, minAmount: parseFloat(e.target.value) })}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('maxAmount')} (€)</Label>
                  <Input
                    type="number"
                    value={settings.maxAmount}
                    onChange={(e) => setSettings({ ...settings, maxAmount: parseFloat(e.target.value) })}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
              <Button className="gold-gradient text-white border-0">
                {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configure Provider Dialog */}
      <Dialog open={configDialog} onOpenChange={setConfigDialog}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('configureProvider')}</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('apiKey')}</Label>
                <Input placeholder="sk_live_xxxxx" className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('merchantId')}</Label>
                <Input placeholder="MER-XXXXX" className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('secretKey')}</Label>
                <Input type="password" placeholder="••••••••" className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('webhooksUrl')}</Label>
                <Input value="https://al-malika.nl/api/webhooks/payments" disabled className="mt-1.5 border-[#E8DFD0] bg-gray-50" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialog(false)} className="border-[#E8DFD0]">
              {t('cancel')}
            </Button>
            <Button onClick={() => setConfigDialog(false)} className="gold-gradient text-white border-0">
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
