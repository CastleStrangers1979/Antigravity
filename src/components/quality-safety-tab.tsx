/* eslint-disable react-hooks/set-state-in-effect */
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, AlertTriangle, Clock, CheckCircle, XCircle, Plus, Calendar,
  FileCheck, Truck, Building, User, Car, Settings, Bell, TrendingUp,
  ShieldAlert, Package, RefreshCw, Eye, DollarSign, Percent
} from 'lucide-react';

// Types
interface QualityCheck {
  id: string;
  type: string;
  productId: string | null;
  product?: { id: string; nameAr: string; nameEn: string; nameNl: string } | null;
  batchId: string | null;
  batch?: { id: string; batchNumber: string } | null;
  checklist: string | null;
  score: number | null;
  passed: boolean | null;
  issues: string | null;
  correctiveAction: string | null;
  checkedBy: string | null;
  checkedAt: string;
  notes: string | null;
}

interface QualityStats {
  todayChecks: number;
  passedChecks: number;
  failedChecks: number;
  passRate: number;
  totalChecks: number;
}

interface ExpiryRecord {
  id: string;
  productId: string;
  product?: { id: string; nameAr: string; nameEn: string; nameNl: string; price: number } | null;
  batchNumber: string | null;
  productionDate: string;
  expiryDate: string;
  quantity: number;
  remainingQty: number;
  status: string;
  daysToExpiry: number | null;
  discountApplied: number | null;
  notes: string | null;
  suggestedDiscount?: number;
  originalPrice?: number;
  discountedPrice?: string;
}

interface ExpiryStats {
  freshCount: number;
  approachingCount: number;
  expiredCount: number;
  urgentCount: number;
}

interface Certificate {
  id: string;
  type: string;
  entityId: string | null;
  entityName: string;
  certNumber: string | null;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string | null;
  documentUrl: string | null;
  status: string;
  reminderSent: boolean;
  notes: string | null;
}

interface CertificateStats {
  validCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  employeeCount: number;
  vehicleCount: number;
  facilityCount: number;
}

interface SafetyCheck {
  id: string;
  type: string;
  entityId: string | null;
  checklist: string | null;
  score: number | null;
  passed: boolean | null;
  issues: string | null;
  checkedBy: string | null;
  checkedAt: string;
  nextCheckDate: string | null;
  notes: string | null;
}

interface SafetyStats {
  todayChecks: number;
  passedChecks: number;
  failedChecks: number;
  passRate: number;
  totalChecks: number;
  facilityChecks: number;
  vehicleChecks: number;
  equipmentChecks: number;
  dueTodayCount: number;
}

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
}

// Stats Card Component
function QualityStatsCard({ title, value, icon: Icon, trend, colorClass }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  colorClass?: string;
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
          <div className={`p-3 rounded-xl shadow-md ${colorClass || 'bg-gradient-to-br from-[#D4A853] to-[#B8923F]'}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="h-1 gold-gradient" />
    </Card>
  );
}

// Quality Checks Sub-Tab
function QualityChecksTab() {
  const { t, language } = useLanguage();
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [stats, setStats] = useState<QualityStats>({ todayChecks: 0, passedChecks: 0, failedChecks: 0, passRate: 0, totalChecks: 0 });
  const [recentIssues, setRecentIssues] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    type: 'incoming',
    productId: '',
    score: '',
    passed: 'true',
    issues: '',
    correctiveAction: '',
    checkedBy: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [checksRes, productsRes] = await Promise.all([
        fetch('/api/quality/checks'),
        fetch('/api/products'),
      ]);
      const checksData = await checksRes.json();
      const productsData = await productsRes.json();
      setChecks(checksData.checks || []);
      setStats(checksData.stats || { todayChecks: 0, passedChecks: 0, failedChecks: 0, passRate: 0, totalChecks: 0 });
      setRecentIssues(checksData.recentIssues || []);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching quality checks:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quality/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          score: formData.score ? parseFloat(formData.score) : null,
          passed: formData.passed === 'true',
        }),
      });
      setIsDialogOpen(false);
      setFormData({ type: 'incoming', productId: '', score: '', passed: 'true', issues: '', correctiveAction: '', checkedBy: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving quality check:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      incoming: t('quality.incoming'),
      in_process: t('quality.inProcess'),
      final: t('quality.final'),
      delivery: t('quality.delivery'),
    };
    return types[type] || type;
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QualityStatsCard title={t('quality.todayChecks')} value={stats.todayChecks} icon={ClipboardCheck} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <QualityStatsCard title={t('quality.passRate')} value={`${stats.passRate}%`} icon={CheckCircle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <QualityStatsCard title={t('quality.passed')} value={stats.passedChecks} icon={CheckCircle} colorClass="bg-gradient-to-br from-green-500 to-green-600" />
        <QualityStatsCard title={t('quality.failed')} value={stats.failedChecks} icon={XCircle} colorClass="bg-gradient-to-br from-red-500 to-red-600" />
      </div>

      {/* Add Check Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('quality.checks')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('quality.addCheck')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('quality.addCheck')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">{t('quality.incoming')}</SelectItem>
                    <SelectItem value="in_process">{t('quality.inProcess')}</SelectItem>
                    <SelectItem value="final">{t('quality.final')}</SelectItem>
                    <SelectItem value="delivery">{t('quality.delivery')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('nav.products')}</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('nav.products')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {getProductName(product)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('quality.score')}</Label>
                  <Input type="number" min="0" max="100" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="85" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                  <Select value={formData.passed} onValueChange={(value) => setFormData({...formData, passed: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t('quality.passed')}</SelectItem>
                      <SelectItem value="false">{t('quality.failed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('quality.recentIssues')}</Label>
                <Textarea value={formData.issues} onChange={(e) => setFormData({...formData, issues: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('quality.correctiveAction')}</Label>
                <Textarea value={formData.correctiveAction} onChange={(e) => setFormData({...formData, correctiveAction: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.name')}</Label>
                <Input value={formData.checkedBy} onChange={(e) => setFormData({...formData, checkedBy: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Checks List */}
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
            {checks.map((check) => (
              <Card key={check.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex items-center p-4">
                  <div className={`p-3 rounded-xl ${check.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {check.passed ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                  </div>
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3D3229]">{getTypeLabel(check.type)}</span>
                      <Badge className={check.passed ? 'bg-[#2D5A3D]' : 'bg-red-500'}>
                        {check.passed ? t('quality.passed') : t('quality.failed')}
                      </Badge>
                    </div>
                    {check.product && (
                      <p className="text-sm text-[#7A6F63]">{getProductName(check.product as Product)}</p>
                    )}
                    <p className="text-xs text-[#7A6F63]">{new Date(check.checkedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}</p>
                  </div>
                  {check.score !== null && (
                    <div className="text-left">
                      <div className="text-2xl font-bold text-[#D4A853]">{check.score}%</div>
                      <Progress value={check.score} className="h-2 w-20" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {checks.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Expiry Tracking Sub-Tab
function ExpiryTrackingTab() {
  const { t, language } = useLanguage();
  const [records, setRecords] = useState<ExpiryRecord[]>([]);
  const [urgentExpiry, setUrgentExpiry] = useState<ExpiryRecord[]>([]);
  const [stats, setStats] = useState<ExpiryStats>({ freshCount: 0, approachingCount: 0, expiredCount: 0, urgentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    quantity: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expiryRes, productsRes] = await Promise.all([
        fetch('/api/quality/expiry'),
        fetch('/api/products'),
      ]);
      const expiryData = await expiryRes.json();
      const productsData = await productsRes.json();
      setRecords(expiryData.expiryRecords || []);
      setUrgentExpiry(expiryData.urgentExpiry || []);
      setStats(expiryData.stats || { freshCount: 0, approachingCount: 0, expiredCount: 0, urgentCount: 0 });
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching expiry tracking:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quality/expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ productId: '', batchNumber: '', productionDate: '', expiryDate: '', quantity: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving expiry tracking:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-[#2D5A3D]';
      case 'approaching': return 'bg-[#D4A853]';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QualityStatsCard title={t('expiry.fresh')} value={stats.freshCount} icon={Package} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <QualityStatsCard title={t('expiry.approaching')} value={stats.approachingCount} icon={AlertTriangle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <QualityStatsCard title={t('expiry.expired')} value={stats.expiredCount} icon={XCircle} colorClass="bg-gradient-to-br from-red-500 to-red-600" />
        <QualityStatsCard title={t('expiry.daysToExpiry')} value={stats.urgentCount} icon={Clock} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
      </div>

      {/* Discount Suggestions */}
      {urgentExpiry.length > 0 && (
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#D4A853] to-[#B8923F]" />
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#D4A853]" />
              {t('expiry.discount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {urgentExpiry.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                  <div>
                    <p className="font-medium text-[#3D3229]">
                      {record.product ? getProductName(record.product as Product) : '-'}
                    </p>
                    <p className="text-sm text-[#7A6F63]">
                      {record.daysToExpiry} {t('expiry.daysToExpiry')} | {t('expiry.batchNumber')}: {record.batchNumber || '-'}
                    </p>
                  </div>
                  <div className="text-left">
                    <Badge className="bg-[#D4A853] text-white mb-1">
                      {record.suggestedDiscount}% {t('expiry.discount')}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="line-through text-[#7A6F63]">€{record.originalPrice?.toFixed(2)}</span>
                      <span className="font-bold text-[#2D5A3D]">€{record.discountedPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Tracking Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('expiry.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('expiry.addTracking')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('expiry.addTracking')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('nav.products')}</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('nav.products')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {getProductName(product)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('expiry.batchNumber')}</Label>
                <Input value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('expiry.productionDate')}</Label>
                  <Input type="date" value={formData.productionDate} onChange={(e) => setFormData({...formData, productionDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('expiry.expiryDate')}</Label>
                  <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('orders.quantity')}</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Records List */}
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
            {records.map((record) => (
              <Card key={record.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex items-center p-4">
                  <div className={`p-3 rounded-xl ${record.status === 'fresh' ? 'bg-green-100' : record.status === 'approaching' ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <Package className={`h-6 w-6 ${record.status === 'fresh' ? 'text-green-600' : record.status === 'approaching' ? 'text-amber-600' : 'text-red-600'}`} />
                  </div>
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3D3229]">
                        {record.product ? getProductName(record.product as Product) : '-'}
                      </span>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status === 'fresh' ? t('expiry.fresh') : record.status === 'approaching' ? t('expiry.approaching') : t('expiry.expired')}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#7A6F63]">
                      {t('expiry.batchNumber')}: {record.batchNumber || '-'} | {t('orders.quantity')}: {record.remainingQty}/{record.quantity}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#3D3229]">
                      {new Date(record.expiryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                    </div>
                    <div className="text-xs text-[#7A6F63]">
                      {record.daysToExpiry !== null ? `${record.daysToExpiry} ${t('expiry.daysToExpiry')}` : ''}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {records.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Health Certificates Sub-Tab
function CertificatesTab() {
  const { t, language } = useLanguage();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({ validCount: 0, expiringSoonCount: 0, expiredCount: 0, employeeCount: 0, vehicleCount: 0, facilityCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'employee',
    entityName: '',
    certNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quality/certificates');
      const data = await res.json();
      setCertificates(data.certificates || []);
      setExpiringSoon(data.expiringSoon || []);
      setStats(data.stats || { validCount: 0, expiringSoonCount: 0, expiredCount: 0, employeeCount: 0, vehicleCount: 0, facilityCount: 0 });
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quality/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ type: 'employee', entityName: '', certNumber: '', issueDate: '', expiryDate: '', issuingAuthority: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <User className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'facility': return <Building className="h-5 w-5" />;
      default: return <FileCheck className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'employee': return t('cert.employee');
      case 'vehicle': return t('cert.vehicle');
      case 'facility': return t('cert.facility');
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QualityStatsCard title={t('cert.valid')} value={stats.validCount} icon={FileCheck} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <QualityStatsCard title={t('cert.expiringSoon')} value={stats.expiringSoonCount} icon={AlertTriangle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <QualityStatsCard title={t('cert.expired')} value={stats.expiredCount} icon={XCircle} colorClass="bg-gradient-to-br from-red-500 to-red-600" />
        <QualityStatsCard title={t('cert.employee')} value={stats.employeeCount} icon={User} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      {/* Expiring Soon Alerts */}
      {expiringSoon.length > 0 && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Bell className="h-5 w-5 text-[#D4A853]" />
              <span className="font-bold text-[#5C4033]">{t('cert.expiringSoon')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {expiringSoon.map((cert) => (
                <Badge key={cert.id} variant="outline" className="border-[#D4A853] text-[#5C4033]">
                  {cert.entityName} - {new Date(cert.expiryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Certificate Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('cert.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('cert.addCert')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('cert.addCert')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{t('cert.employee')}</SelectItem>
                    <SelectItem value="vehicle">{t('cert.vehicle')}</SelectItem>
                    <SelectItem value="facility">{t('cert.facility')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                <Input value={formData.entityName} onChange={(e) => setFormData({...formData, entityName: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('cert.certNumber')}</Label>
                <Input value={formData.certNumber} onChange={(e) => setFormData({...formData, certNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('cert.issueDate')}</Label>
                  <Input type="date" value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('cert.expiryDate')}</Label>
                  <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('cert.issuingAuthority')}</Label>
                <Input value={formData.issuingAuthority} onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Certificates List */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className={`h-2 ${cert.status === 'valid' ? 'green-gradient' : 'bg-gradient-to-r from-red-500 to-red-600'}`} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cert.status === 'valid' ? 'bg-[#2D5A3D]' : 'bg-red-500'} text-white`}>
                      {getTypeIcon(cert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#3D3229]">{cert.entityName}</span>
                        <Badge className={cert.status === 'valid' ? 'bg-[#2D5A3D]' : 'bg-red-500'}>
                          {cert.status === 'valid' ? t('cert.valid') : t('cert.expired')}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#7A6F63]">{getTypeLabel(cert.type)}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#7A6F63]">
                        <span>{t('cert.certNumber')}: {cert.certNumber || '-'}</span>
                        <span>{t('cert.expiryDate')}: {new Date(cert.expiryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {certificates.length === 0 && (
              <div className="col-span-2 text-center py-12 text-[#7A6F63]">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Safety Checks Sub-Tab
function SafetyChecksTab() {
  const { t, language } = useLanguage();
  const [checks, setChecks] = useState<SafetyCheck[]>([]);
  const [stats, setStats] = useState<SafetyStats>({ todayChecks: 0, passedChecks: 0, failedChecks: 0, passRate: 0, totalChecks: 0, facilityChecks: 0, vehicleChecks: 0, equipmentChecks: 0, dueTodayCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'facility',
    score: '',
    passed: 'true',
    issues: '',
    checkedBy: '',
    nextCheckDate: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quality/safety');
      const data = await res.json();
      setChecks(data.safetyChecks || []);
      setStats(data.stats || { todayChecks: 0, passedChecks: 0, failedChecks: 0, passRate: 0, totalChecks: 0, facilityChecks: 0, vehicleChecks: 0, equipmentChecks: 0, dueTodayCount: 0 });
    } catch (error) {
      console.error('Error fetching safety checks:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/quality/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          score: formData.score ? parseFloat(formData.score) : null,
          passed: formData.passed === 'true',
        }),
      });
      setIsDialogOpen(false);
      setFormData({ type: 'facility', score: '', passed: 'true', issues: '', checkedBy: '', nextCheckDate: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving safety check:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'facility': return <Building className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'equipment': return <Settings className="h-5 w-5" />;
      default: return <ShieldAlert className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'facility': return t('safety.facility');
      case 'vehicle': return t('safety.vehicle');
      case 'equipment': return t('safety.equipment');
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <QualityStatsCard title={t('safety.daily')} value={stats.todayChecks} icon={ShieldAlert} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <QualityStatsCard title={t('quality.passRate')} value={`${stats.passRate}%`} icon={CheckCircle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <QualityStatsCard title={t('safety.facility')} value={stats.facilityChecks} icon={Building} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
        <QualityStatsCard title={t('safety.vehicle')} value={stats.vehicleChecks} icon={Car} colorClass="bg-gradient-to-br from-purple-500 to-purple-600" />
      </div>

      {/* Add Safety Check Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('safety.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('safety.addSafetyCheck')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('safety.addSafetyCheck')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility">{t('safety.facility')}</SelectItem>
                    <SelectItem value="vehicle">{t('safety.vehicle')}</SelectItem>
                    <SelectItem value="equipment">{t('safety.equipment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('quality.score')}</Label>
                  <Input type="number" min="0" max="100" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="85" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                  <Select value={formData.passed} onValueChange={(value) => setFormData({...formData, passed: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t('quality.passed')}</SelectItem>
                      <SelectItem value="false">{t('quality.failed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('safety.issues')}</Label>
                <Textarea value={formData.issues} onChange={(e) => setFormData({...formData, issues: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('drivers.name')}</Label>
                <Input value={formData.checkedBy} onChange={(e) => setFormData({...formData, checkedBy: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('safety.nextCheckDate')}</Label>
                <Input type="date" value={formData.nextCheckDate} onChange={(e) => setFormData({...formData, nextCheckDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Safety Checks List */}
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
            {checks.map((check) => (
              <Card key={check.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex items-center p-4">
                  <div className={`p-3 rounded-xl ${check.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {getTypeIcon(check.type)}
                  </div>
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3D3229]">{getTypeLabel(check.type)}</span>
                      <Badge className={check.passed ? 'bg-[#2D5A3D]' : 'bg-red-500'}>
                        {check.passed ? t('quality.passed') : t('quality.failed')}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#7A6F63]">
                      {new Date(check.checkedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      {check.checkedBy && ` | ${check.checkedBy}`}
                    </p>
                    {check.issues && (
                      <p className="text-sm text-red-600 mt-1">{check.issues}</p>
                    )}
                  </div>
                  {check.score !== null && (
                    <div className="text-left">
                      <div className="text-2xl font-bold text-[#D4A853]">{check.score}%</div>
                      <Progress value={check.score} className="h-2 w-20" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {checks.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Main Quality & Safety Tab Component
export default function QualitySafetyTab() {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('checks');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('quality.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{t('quality.checks')}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="h-12 bg-[#F5EDE0] gap-1 flex-wrap">
          <TabsTrigger value="checks" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            {t('quality.checks')}
          </TabsTrigger>
          <TabsTrigger value="expiry" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <Clock className="h-4 w-4 mr-2" />
            {t('expiry.title')}
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4">
            <FileCheck className="h-4 w-4 mr-2" />
            {t('cert.title')}
          </TabsTrigger>
          <TabsTrigger value="safety" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-4">
            <ShieldAlert className="h-4 w-4 mr-2" />
            {t('safety.title')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="mt-6">
          <QualityChecksTab />
        </TabsContent>

        <TabsContent value="expiry" className="mt-6">
          <ExpiryTrackingTab />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CertificatesTab />
        </TabsContent>

        <TabsContent value="safety" className="mt-6">
          <SafetyChecksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
