 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
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
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Receipt, FileText, Building2,
  Plus, Edit, Trash2, Eye, RefreshCw, Calendar, CheckCircle, Clock, AlertCircle,
  CreditCard, Wallet, PieChart, BarChart3, Calculator, Landmark, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Types
interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  quarterlyRevenue: number;
  quarterlyExpenses: number;
}

interface SalaryPayment {
  id: string;
  driverId: string | null;
  driver?: { id: string; name: string } | null;
  employeeName: string | null;
  periodStart: string;
  periodEnd: string;
  baseSalary: number;
  deliveryBonus: number;
  overtime: number;
  deductions: number;
  totalAmount: number;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
}

interface Expense {
  id: string;
  category: string;
  subcategory: string | null;
  description: string;
  amount: number;
  date: string;
  vendor: string | null;
  invoiceNumber: string | null;
  isRecurring: boolean;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface TaxReport {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalPurchases: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  status: string;
  submittedAt: string | null;
  paidAt: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

interface CostCenter {
  id: string;
  name: string;
  type: string;
  budget: number | null;
  actual: number | null;
  variance: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  notes: string | null;
  costs: CostEntry[];
  createdAt: string;
}

interface CostEntry {
  id: string;
  costCenterId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  notes: string | null;
}

interface Driver {
  id: string;
  name: string;
  salaryBase: number | null;
  salaryPerDelivery: number | null;
}

// Stats Card Component
function AccountingStatsCard({ title, value, icon: Icon, trend, trendUp, colorClass }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}) {
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-2xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl shadow-md ${colorClass || 'bg-gradient-to-br from-[#D4A853] to-[#B8923F]'}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="h-1 gold-gradient" />
    </Card>
  );
}

// Financial Dashboard Sub-Tab
function FinancialDashboardTab() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0, totalExpenses: 0, netProfit: 0, pendingPayments: 0,
    monthlyRevenue: 0, monthlyExpenses: 0, quarterlyRevenue: 0, quarterlyExpenses: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounting/stats');
      const data = await res.json();
      setStats(data || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, pendingPayments: 0, monthlyRevenue: 0, monthlyExpenses: 0, quarterlyRevenue: 0, quarterlyExpenses: 0 });
    } catch (error) {
      console.error('Error fetching financial stats:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const profitMargin = stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AccountingStatsCard 
          title={t('accounting.totalRevenue')} 
          value={`€${stats.totalRevenue.toFixed(2)}`} 
          icon={TrendingUp}
          trend="+12%"
          trendUp={true}
          colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]"
        />
        <AccountingStatsCard 
          title={t('accounting.totalExpenses')} 
          value={`€${stats.totalExpenses.toFixed(2)}`} 
          icon={TrendingDown}
          trend="+5%"
          trendUp={false}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
        />
        <AccountingStatsCard 
          title={t('accounting.netProfit')} 
          value={`€${stats.netProfit.toFixed(2)}`} 
          icon={DollarSign}
          trend={stats.netProfit >= 0 ? `+${profitMargin}%` : `${profitMargin}%`}
          trendUp={stats.netProfit >= 0}
          colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]"
        />
        <AccountingStatsCard 
          title={t('accounting.pending')} 
          value={`€${stats.pendingPayments.toFixed(2)}`} 
          icon={Clock}
          colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Period Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 green-gradient" />
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#2D5A3D]" />
              {t('accounting.thisMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F63]">{t('accounting.revenue')}</span>
                <span className="text-xl font-bold text-[#2D5A3D]">€{stats.monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F63]">{t('accounting.expenses')}</span>
                <span className="text-xl font-bold text-red-500">€{stats.monthlyExpenses.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#3D3229]">{t('accounting.netProfit')}</span>
                <span className={`text-xl font-bold ${stats.monthlyRevenue - stats.monthlyExpenses >= 0 ? 'text-[#D4A853]' : 'text-red-500'}`}>
                  €{(stats.monthlyRevenue - stats.monthlyExpenses).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 gold-gradient" />
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#D4A853]" />
              {t('accounting.thisQuarter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F63]">{t('accounting.revenue')}</span>
                <span className="text-xl font-bold text-[#2D5A3D]">€{stats.quarterlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F63]">{t('accounting.expenses')}</span>
                <span className="text-xl font-bold text-red-500">€{stats.quarterlyExpenses.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#3D3229]">{t('accounting.netProfit')}</span>
                <span className={`text-xl font-bold ${stats.quarterlyRevenue - stats.quarterlyExpenses >= 0 ? 'text-[#D4A853]' : 'text-red-500'}`}>
                  €{(stats.quarterlyRevenue - stats.quarterlyExpenses).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Margin */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#D4A853]" />
            {t('accounting.profit')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#7A6F63]">{language === 'ar' ? 'هامش الربح' : 'Profit Margin'}</span>
              <span className="text-2xl font-bold text-[#D4A853]">{profitMargin}%</span>
            </div>
            <Progress value={parseFloat(profitMargin)} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Salary Management Sub-Tab
function SalaryManagementTab() {
  const { t, language } = useLanguage();
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    employeeName: '',
    periodStart: '',
    periodEnd: '',
    baseSalary: '',
    deliveryBonus: '',
    overtime: '',
    deductions: '',
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salariesRes, driversRes] = await Promise.all([
        fetch('/api/accounting/salaries'),
        fetch('/api/drivers'),
      ]);
      const salariesData = await salariesRes.json();
      const driversData = await driversRes.json();
      setSalaries(salariesData || []);
      setDrivers(driversData || []);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/accounting/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary) || 0,
          deliveryBonus: parseFloat(formData.deliveryBonus) || 0,
          overtime: parseFloat(formData.overtime) || 0,
          deductions: parseFloat(formData.deductions) || 0,
        }),
      });
      setIsDialogOpen(false);
      setFormData({ driverId: '', employeeName: '', periodStart: '', periodEnd: '', baseSalary: '', deliveryBonus: '', overtime: '', deductions: '', paymentMethod: 'bank_transfer', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving salary:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await fetch(`/api/accounting/salaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#D4A853]';
      case 'paid': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('accounting.pending');
      case 'paid': return t('accounting.paid');
      case 'cancelled': return language === 'ar' ? 'ملغي' : 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{t('accounting.salaries')}</h3>
          <p className="text-sm text-[#7A6F63]">{salaries.length} {language === 'ar' ? 'سجل' : 'records'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setFormData({ driverId: '', employeeName: '', periodStart: '', periodEnd: '', baseSalary: '', deliveryBonus: '', overtime: '', deductions: '', paymentMethod: 'bank_transfer', notes: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.addSalary')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('accounting.addSalary')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('accounting.driver')}</Label>
                  <Select value={formData.driverId} onValueChange={(value) => {
                    const driver = drivers.find(d => d.id === value);
                    setFormData({
                      ...formData, 
                      driverId: value, 
                      employeeName: driver?.name || '',
                      baseSalary: driver?.salaryBase?.toString() || formData.baseSalary
                    });
                  }}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('accounting.driver')} />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'من تاريخ' : 'From'}</Label>
                    <Input type="date" value={formData.periodStart} onChange={(e) => setFormData({...formData, periodStart: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إلى تاريخ' : 'To'}</Label>
                    <Input type="date" value={formData.periodEnd} onChange={(e) => setFormData({...formData, periodEnd: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{t('accounting.baseSalary')}</Label>
                    <Input type="number" step="0.01" value={formData.baseSalary} onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('accounting.bonus')}</Label>
                    <Input type="number" step="0.01" value={formData.deliveryBonus} onChange={(e) => setFormData({...formData, deliveryBonus: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إضافي' : 'Overtime'}</Label>
                    <Input type="number" step="0.01" value={formData.overtime} onChange={(e) => setFormData({...formData, overtime: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('accounting.deductions')}</Label>
                    <Input type="number" step="0.01" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</SelectItem>
                      <SelectItem value="cash">{language === 'ar' ? 'نقداً' : 'Cash'}</SelectItem>
                      <SelectItem value="check">{language === 'ar' ? 'شيك' : 'Check'}</SelectItem>
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
      </div>

      {/* Salaries List */}
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
            {salaries.map((salary) => (
              <Card key={salary.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">
                            {salary.driver?.name || salary.employeeName || '-'}
                          </span>
                          <Badge className={getStatusColor(salary.status)}>{getStatusLabel(salary.status)}</Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {new Date(salary.periodStart).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')} - {new Date(salary.periodEnd).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4A853]">€{salary.totalAmount.toFixed(2)}</div>
                        {salary.paidAt && (
                          <div className="text-xs text-[#7A6F63]">{language === 'ar' ? 'دفع في' : 'Paid'}: {new Date(salary.paidAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                        {t('accounting.baseSalary')}: €{salary.baseSalary.toFixed(2)}
                      </div>
                      {salary.deliveryBonus > 0 && (
                        <div className="px-3 py-1.5 bg-green-100 rounded-full text-xs text-green-700">
                          {t('accounting.bonus')}: +€{salary.deliveryBonus.toFixed(2)}
                        </div>
                      )}
                      {salary.overtime > 0 && (
                        <div className="px-3 py-1.5 bg-blue-100 rounded-full text-xs text-blue-700">
                          {language === 'ar' ? 'إضافي' : 'Overtime'}: +€{salary.overtime.toFixed(2)}
                        </div>
                      )}
                      {salary.deductions > 0 && (
                        <div className="px-3 py-1.5 bg-red-100 rounded-full text-xs text-red-700">
                          {t('accounting.deductions')}: -€{salary.deductions.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {salary.status === 'pending' && (
                    <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex items-center justify-center">
                      <Button onClick={() => handleMarkPaid(salary.id)} className="green-gradient text-white border-0">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('accounting.paid')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {salaries.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Expense Management Sub-Tab
function ExpenseManagementTab() {
  const { t, language } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    category: 'ingredients',
    subcategory: '',
    description: '',
    amount: '',
    date: '',
    vendor: '',
    invoiceNumber: '',
    isRecurring: false,
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounting/expenses');
      const data = await res.json();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/accounting/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount) || 0,
        }),
      });
      setIsDialogOpen(false);
      setFormData({ category: 'ingredients', subcategory: '', description: '', amount: '', date: '', vendor: '', invoiceNumber: '', isRecurring: false, notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/accounting/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', approvedAt: new Date().toISOString() }),
      });
      fetchData();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      ingredients: language === 'ar' ? 'المكونات' : 'Ingredients',
      utilities: language === 'ar' ? 'المرافق' : 'Utilities',
      rent: language === 'ar' ? 'الإيجار' : 'Rent',
      salaries: language === 'ar' ? 'الرواتب' : 'Salaries',
      maintenance: language === 'ar' ? 'الصيانة' : 'Maintenance',
      fuel: language === 'ar' ? 'الوقود' : 'Fuel',
      marketing: language === 'ar' ? 'التسويق' : 'Marketing',
      other: language === 'ar' ? 'أخرى' : 'Other',
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ingredients: 'bg-amber-100 text-amber-700',
      utilities: 'bg-blue-100 text-blue-700',
      rent: 'bg-purple-100 text-purple-700',
      salaries: 'bg-green-100 text-green-700',
      maintenance: 'bg-orange-100 text-orange-700',
      fuel: 'bg-red-100 text-red-700',
      marketing: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#D4A853]';
      case 'approved': return 'bg-blue-500';
      case 'paid': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredExpenses = filterCategory === 'all' ? expenses : expenses.filter(e => e.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{t('accounting.expenseManagement')}</h3>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المجموع' : 'Total'}: €{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="ingredients">{getCategoryLabel('ingredients')}</SelectItem>
              <SelectItem value="utilities">{getCategoryLabel('utilities')}</SelectItem>
              <SelectItem value="rent">{getCategoryLabel('rent')}</SelectItem>
              <SelectItem value="salaries">{getCategoryLabel('salaries')}</SelectItem>
              <SelectItem value="maintenance">{getCategoryLabel('maintenance')}</SelectItem>
              <SelectItem value="fuel">{getCategoryLabel('fuel')}</SelectItem>
              <SelectItem value="other">{getCategoryLabel('other')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setFormData({ category: 'ingredients', subcategory: '', description: '', amount: '', date: '', vendor: '', invoiceNumber: '', isRecurring: false, notes: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.addExpense')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('accounting.addExpense')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('accounting.category')}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingredients">{getCategoryLabel('ingredients')}</SelectItem>
                      <SelectItem value="utilities">{getCategoryLabel('utilities')}</SelectItem>
                      <SelectItem value="rent">{getCategoryLabel('rent')}</SelectItem>
                      <SelectItem value="salaries">{getCategoryLabel('salaries')}</SelectItem>
                      <SelectItem value="maintenance">{getCategoryLabel('maintenance')}</SelectItem>
                      <SelectItem value="fuel">{getCategoryLabel('fuel')}</SelectItem>
                      <SelectItem value="marketing">{getCategoryLabel('marketing')}</SelectItem>
                      <SelectItem value="other">{getCategoryLabel('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{t('accounting.amount')}</Label>
                    <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('accounting.date')}</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('accounting.vendor')}</Label>
                  <Input value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('accounting.invoice')}</Label>
                  <Input value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <DialogFooter>
                  <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Expenses List */}
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
            {filteredExpenses.map((expense) => (
              <Card key={expense.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">{expense.description}</span>
                          <Badge className={getCategoryColor(expense.category)}>{getCategoryLabel(expense.category)}</Badge>
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status === 'pending' ? t('accounting.pending') : expense.status === 'approved' ? t('accounting.approved') : expense.status === 'paid' ? t('accounting.paid') : expense.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {new Date(expense.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                          {expense.vendor && ` | ${expense.vendor}`}
                          {expense.invoiceNumber && ` | ${language === 'ar' ? 'فاتورة' : 'Inv'}: ${expense.invoiceNumber}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-500">€{expense.amount.toFixed(2)}</div>
                        {expense.isRecurring && (
                          <Badge variant="outline" className="border-[#D4A853] text-[#D4A853]">{t('accounting.recurring')}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expense.status === 'pending' && (
                    <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex items-center justify-center">
                      <Button onClick={() => handleApprove(expense.id)} className="gold-gradient text-white border-0">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('accounting.approve')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Tax Reports Sub-Tab
function TaxReportsTab() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<TaxReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'btw',
    periodStart: '',
    periodEnd: '',
    totalSales: '',
    totalPurchases: '',
    taxRate: '21',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounting/taxes');
      const data = await res.json();
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching tax reports:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/accounting/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalSales: parseFloat(formData.totalSales) || 0,
          totalPurchases: parseFloat(formData.totalPurchases) || 0,
          taxRate: parseFloat(formData.taxRate) || 21,
        }),
      });
      setIsDialogOpen(false);
      setFormData({ type: 'btw', periodStart: '', periodEnd: '', totalSales: '', totalPurchases: '', taxRate: '21', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving tax report:', error);
    }
  };

  const handleSubmitReport = async (id: string) => {
    try {
      await fetch(`/api/accounting/taxes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'submitted', submittedAt: new Date().toISOString() }),
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting tax report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-blue-500';
      case 'paid': return 'bg-[#2D5A3D]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{t('accounting.taxReports')}</h3>
          <p className="text-sm text-[#7A6F63]">{t('accounting.btwReport')} (VAT)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setFormData({ type: 'btw', periodStart: '', periodEnd: '', totalSales: '', totalPurchases: '', taxRate: '21', notes: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                {t('accounting.generateReport')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('accounting.btwReport')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'من تاريخ' : 'From'}</Label>
                    <Input type="date" value={formData.periodStart} onChange={(e) => setFormData({...formData, periodStart: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إلى تاريخ' : 'To'}</Label>
                    <Input type="date" value={formData.periodEnd} onChange={(e) => setFormData({...formData, periodEnd: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</Label>
                    <Input type="number" step="0.01" value={formData.totalSales} onChange={(e) => setFormData({...formData, totalSales: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}</Label>
                    <Input type="number" step="0.01" value={formData.totalPurchases} onChange={(e) => setFormData({...formData, totalPurchases: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}</Label>
                  <Select value={formData.taxRate} onValueChange={(value) => setFormData({...formData, taxRate: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="21">21% (Hoog tarief)</SelectItem>
                      <SelectItem value="9">9% (Laag tarief)</SelectItem>
                      <SelectItem value="0">0% (Vrijgesteld)</SelectItem>
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
      </div>

      {/* BTW Info Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#D4A853] to-[#B8923F]" />
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[#D4A853]" />
            {language === 'ar' ? 'نظام BTW في هولندا' : 'BTW (VAT) System - Netherlands'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F5EDE0] rounded-xl">
              <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المعدل العالي' : 'High Rate'}</p>
              <p className="text-2xl font-bold text-[#3D3229]">21%</p>
              <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'معظم السلع والخدمات' : 'Most goods & services'}</p>
            </div>
            <div className="p-4 bg-[#F5EDE0] rounded-xl">
              <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المعدل المنخفض' : 'Low Rate'}</p>
              <p className="text-2xl font-bold text-[#3D3229]">9%</p>
              <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'الغذاء والكتب' : 'Food, books, etc.'}</p>
            </div>
            <div className="p-4 bg-[#F5EDE0] rounded-xl">
              <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معفى' : 'Exempt'}</p>
              <p className="text-2xl font-bold text-[#3D3229]">0%</p>
              <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'خدمات محددة' : 'Specific services'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
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
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">
                            {t('accounting.btwReport')} - {t('accounting.quarter')}
                          </span>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status === 'draft' ? (language === 'ar' ? 'مسودة' : 'Draft') : report.status === 'submitted' ? (language === 'ar' ? 'مقدم' : 'Submitted') : t('accounting.paid')}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {new Date(report.periodStart).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')} - {new Date(report.periodEnd).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-[#F5EDE0] rounded-lg">
                        <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                        <p className="text-lg font-bold text-[#3D3229]">€{report.totalSales.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-[#F5EDE0] rounded-lg">
                        <p className="text-xs text-[#7A6F63]">{t('accounting.outputVAT')}</p>
                        <p className="text-lg font-bold text-red-500">€{(report.totalSales * report.taxRate / 100).toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-[#F5EDE0] rounded-lg">
                        <p className="text-xs text-[#7A6F63]">{t('accounting.inputVAT')}</p>
                        <p className="text-lg font-bold text-[#2D5A3D]">€{(report.totalPurchases * report.taxRate / 100).toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-[#D4A853]/20 rounded-lg">
                        <p className="text-xs text-[#7A6F63]">{t('accounting.netVAT')}</p>
                        <p className="text-lg font-bold text-[#D4A853]">€{report.taxAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {report.status === 'draft' && (
                    <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex items-center justify-center">
                      <Button onClick={() => handleSubmitReport(report.id)} className="gold-gradient text-white border-0">
                        <FileText className="h-4 w-4 mr-2" />
                        {t('accounting.submit')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {reports.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Cost Centers Sub-Tab
function CostCentersTab() {
  const { t, language } = useLanguage();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'production',
    budget: '',
    periodStart: '',
    periodEnd: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounting/cost-centers');
      const data = await res.json();
      setCostCenters(data || []);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/accounting/cost-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || null,
        }),
      });
      setIsDialogOpen(false);
      setFormData({ name: '', type: 'production', budget: '', periodStart: '', periodEnd: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving cost center:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      production: language === 'ar' ? 'الإنتاج' : 'Production',
      delivery: language === 'ar' ? 'التوصيل' : 'Delivery',
      admin: language === 'ar' ? 'الإدارة' : 'Admin',
      sales: language === 'ar' ? 'المبيعات' : 'Sales',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      production: 'bg-amber-100 text-amber-700',
      delivery: 'bg-blue-100 text-blue-700',
      admin: 'bg-purple-100 text-purple-700',
      sales: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{t('accounting.costCenters')}</h3>
          <p className="text-sm text-[#7A6F63]">{costCenters.length} {language === 'ar' ? 'مركز' : 'centers'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setFormData({ name: '', type: 'production', budget: '', periodStart: '', periodEnd: '', notes: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إضافة مركز' : 'Add Center'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إضافة مركز تكلفة' : 'Add Cost Center'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'النوع' : 'Type'}</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">{getTypeLabel('production')}</SelectItem>
                      <SelectItem value="delivery">{getTypeLabel('delivery')}</SelectItem>
                      <SelectItem value="admin">{getTypeLabel('admin')}</SelectItem>
                      <SelectItem value="sales">{getTypeLabel('sales')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('accounting.budget')}</Label>
                  <Input type="number" step="0.01" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'من' : 'From'}</Label>
                    <Input type="date" value={formData.periodStart} onChange={(e) => setFormData({...formData, periodStart: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'إلى' : 'To'}</Label>
                    <Input type="date" value={formData.periodEnd} onChange={(e) => setFormData({...formData, periodEnd: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
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

      {/* Cost Centers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-40 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {costCenters.map((center) => {
            const budgetUsage = center.budget && center.actual ? (center.actual / center.budget) * 100 : 0;
            const isOverBudget = center.budget && center.actual && center.actual > center.budget;
            
            return (
              <Card key={center.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className={`h-2 ${isOverBudget ? 'bg-red-500' : 'green-gradient'}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(center.type)}`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#3D3229]">{center.name}</CardTitle>
                        <CardDescription className="text-[#7A6F63]">{getTypeLabel(center.type)}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7A6F63]">{t('accounting.budget')}</span>
                      <span className="font-bold text-[#3D3229]">€{(center.budget || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7A6F63]">{t('accounting.actual')}</span>
                      <span className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-[#2D5A3D]'}`}>€{(center.actual || 0).toFixed(2)}</span>
                    </div>
                    {center.budget && (
                      <>
                        <Progress value={Math.min(budgetUsage, 100)} className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`} />
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#7A6F63]">{budgetUsage.toFixed(1)}% {language === 'ar' ? 'مستخدم' : 'used'}</span>
                          {isOverBudget && (
                            <Badge className="bg-red-500">{t('accounting.overBudget')}</Badge>
                          )}
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7A6F63]">{t('accounting.variance')}</span>
                      <span className={`font-bold ${(center.variance || 0) >= 0 ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                        €{(center.variance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {costCenters.length === 0 && (
            <div className="col-span-2 text-center py-12 text-[#7A6F63]">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('messages.noData')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Accounting Tab Component
export default function AccountingTab() {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('accounting.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إدارة مالية شاملة' : 'Comprehensive financial management'}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="h-12 bg-[#F5EDE0] gap-1 flex-wrap">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('accounting.dashboard')}</span>
          </TabsTrigger>
          <TabsTrigger value="salaries" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('accounting.salaries')}</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <Receipt className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('accounting.expenses')}</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('accounting.taxReports')}</span>
          </TabsTrigger>
          <TabsTrigger value="costCenters" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">{t('accounting.costCenters')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <FinancialDashboardTab />
        </TabsContent>
        <TabsContent value="salaries" className="mt-6">
          <SalaryManagementTab />
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
          <ExpenseManagementTab />
        </TabsContent>
        <TabsContent value="taxes" className="mt-6">
          <TaxReportsTab />
        </TabsContent>
        <TabsContent value="costCenters" className="mt-6">
          <CostCentersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
