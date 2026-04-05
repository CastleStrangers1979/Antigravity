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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Crown, UserCheck, UserX, UserPlus, Star, Gift, Share2, 
  Megaphone, Mail, MessageSquare, Phone, Calendar, TrendingUp, 
  Package, RefreshCw, Plus, Eye, Send, Award, Copy, CheckCircle,
  Clock, AlertCircle, Target, Zap, Percent, Truck, Bell, Edit,
  Sparkles, Filter, Search, MoreVertical, Play, Pause, Square,
  ExternalLink, QrCode, Download
} from 'lucide-react';

interface SegmentStats {
  count: number;
  totalSpent?: number;
  avgOrders?: number;
  potentialRevenue?: number;
  potentialLTV?: number;
  conversionRate?: number;
}

interface SegmentData {
  vip: SegmentStats;
  active: SegmentStats;
  inactive: SegmentStats;
  new: SegmentStats;
  regular: SegmentStats;
}

interface OverallStats {
  totalCustomers: number;
  totalRevenue: number;
  avgCustomerValue: number;
  avgOrdersPerCustomer: number;
  retentionRate: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  channel: string;
  targetSegment: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  pointsBonus: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalConverted: number;
  messageTemplate?: string | null;
  openRate?: string;
  clickRate?: string;
  conversionRate?: string;
  recipientsCount?: number;
}

interface Referral {
  id: string;
  code: string;
  customerId: string;
  customer: { id: string; name: string; phone: string; email: string | null };
  referredEmail: string | null;
  referredPhone: string | null;
  referredName: string | null;
  status: string;
  pointsEarned: number;
  completedAt: string | null;
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  pending: number;
  registered: number;
  completed: number;
  rewarded: number;
  totalPointsAwarded: number;
  conversionRate: string;
}

interface Subscription {
  id: string;
  name: string;
  frequency: string;
  status: string;
  startDate: string;
  nextDeliveryDate: string | null;
  totalDeliveries: number;
  discount: number;
  customer: { id: string; name: string; phone: string; email: string | null; address: string; city: string };
  subscriptionItems: { id: string; quantity: number; product: { id: string; nameAr: string; nameEn: string; price: number } }[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  segment: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  referralCode: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
}

export default function AdvancedCustomerManagementTab() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'segments' | 'campaigns' | 'referrals' | 'subscriptions'>('segments');
  const [loading, setLoading] = useState(true);
  
  // Segments state
  const [segmentData, setSegmentData] = useState<SegmentData | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState({ totalCampaigns: 0, activeCampaigns: 0, totalSent: 0, totalOpened: 0 });
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '', description: '', type: 'discount', channel: 'all', targetSegment: 'all',
    discountPercent: '', discountAmount: '', pointsBonus: '', startDate: '', endDate: '', messageTemplate: ''
  });
  
  // Referrals state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [referralForm, setReferralForm] = useState({ customerId: '' });
  
  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    customerId: '', name: '', frequency: 'weekly', daysOfWeek: [] as string[],
    preferredTime: '', startDate: '', discount: '', notes: '', items: [] as { productId: string; quantity: number }[]
  });
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [segmentsRes, campaignsRes, referralsRes, subscriptionsRes, productsRes, customersRes] = await Promise.all([
        fetch('/api/customers/segments?includeCustomers=true'),
        fetch('/api/campaigns'),
        fetch('/api/referrals'),
        fetch('/api/subscriptions'),
        fetch('/api/products'),
        fetch('/api/customers'),
      ]);

      const segmentsData = await segmentsRes.json();
      const campaignsData = await campaignsRes.json();
      const referralsData = await referralsRes.json();
      const subscriptionsData = await subscriptionsRes.json();
      const productsData = await productsRes.json();
      const customersData = await customersRes.json();

      setSegmentData(segmentsData.segments);
      setOverallStats(segmentsData.overall);
      setCampaigns(campaignsData.campaigns || []);
      setCampaignStats(campaignsData.statistics || {});
      setReferrals(referralsData.referrals || []);
      setReferralStats(referralsData.statistics);
      setTopReferrers(referralsData.topReferrers || []);
      setSubscriptions(subscriptionsData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customer management data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Campaign handlers
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm),
      });
      if (res.ok) {
        setIsCampaignDialogOpen(false);
        setCampaignForm({
          name: '', description: '', type: 'discount', channel: 'all', targetSegment: 'all',
          discountPercent: '', discountAmount: '', pointsBonus: '', startDate: '', endDate: '', messageTemplate: ''
        });
        fetchData();
        showToast(language === 'ar' ? 'تم إنشاء الحملة بنجاح' : 'Campaign created successfully');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      showToast(language === 'ar' ? 'خطأ في إنشاء الحملة' : 'Error creating campaign', 'error');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      // Simulate sending campaign
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: campaignId, 
          totalSent: campaigns.find(c => c.id === campaignId)?.totalSent || 0 + 1 
        }),
      });
      if (res.ok) {
        fetchData();
        showToast(language === 'ar' ? 'تم إرسال الحملة' : 'Campaign sent');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const handleToggleCampaign = async (campaignId: string, isActive: boolean) => {
    try {
      await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaignId, isActive: !isActive }),
      });
      fetchData();
      showToast(isActive 
        ? (language === 'ar' ? 'تم إيقاف الحملة' : 'Campaign deactivated')
        : (language === 'ar' ? 'تم تفعيل الحملة' : 'Campaign activated')
      );
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  // Referral handlers
  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(language === 'ar' ? 'تم نسخ الكود' : 'Code copied');
  };

  const handleGenerateReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateCode',
          customerId: referralForm.customerId,
        }),
      });
      if (res.ok) {
        setIsReferralDialogOpen(false);
        setReferralForm({ customerId: '' });
        fetchData();
        showToast(language === 'ar' ? 'تم إنشاء كود الإحالة' : 'Referral code generated');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const handleCompleteReferral = async (referralId: string, points: number = 100) => {
    try {
      await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'completeReferral',
          referralId,
          points,
        }),
      });
      fetchData();
      showToast(language === 'ar' ? 'تم منح النقاط' : 'Points awarded');
    } catch (error) {
      console.error('Error completing referral:', error);
    }
  };

  // Subscription handlers
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionForm),
      });
      if (res.ok) {
        setIsSubscriptionDialogOpen(false);
        setSubscriptionForm({
          customerId: '', name: '', frequency: 'weekly', daysOfWeek: [],
          preferredTime: '', startDate: '', discount: '', notes: '', items: []
        });
        fetchData();
        showToast(language === 'ar' ? 'تم إنشاء الاشتراك' : 'Subscription created');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleSubscriptionAction = async (id: string, action: string) => {
    try {
      await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      fetchData();
      const messages: Record<string, string> = {
        pause: language === 'ar' ? 'تم إيقاف الاشتراك' : 'Subscription paused',
        resume: language === 'ar' ? 'تم استئناف الاشتراك' : 'Subscription resumed',
        cancel: language === 'ar' ? 'تم إلغاء الاشتراك' : 'Subscription cancelled',
        generateOrder: language === 'ar' ? 'تم إنشاء الطلب' : 'Order generated',
      };
      showToast(messages[action] || 'Done');
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  // Customer segment update
  const handleUpdateCustomerSegment = async (customerId: string, segment: string) => {
    try {
      await fetch('/api/customers/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, segment }),
      });
      fetchData();
      showToast(language === 'ar' ? 'تم تحديث الشريحة' : 'Segment updated');
    } catch (error) {
      console.error('Error updating segment:', error);
    }
  };

  // Helper functions
  const getSegmentIcon = (segment: string) => {
    const icons: Record<string, React.ReactNode> = {
      vip: <Crown className="h-5 w-5" />,
      active: <UserCheck className="h-5 w-5" />,
      inactive: <UserX className="h-5 w-5" />,
      new: <UserPlus className="h-5 w-5" />,
      regular: <Users className="h-5 w-5" />,
    };
    return icons[segment] || <Users className="h-5 w-5" />;
  };

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      vip: 'from-amber-500 to-yellow-600',
      active: 'from-green-500 to-emerald-600',
      inactive: 'from-gray-400 to-gray-500',
      new: 'from-blue-400 to-blue-500',
      regular: 'from-purple-400 to-purple-500',
    };
    return colors[segment] || 'from-gray-400 to-gray-500';
  };

  const getSegmentBgColor = (segment: string) => {
    const colors: Record<string, string> = {
      vip: 'bg-amber-100 text-amber-800 border-amber-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      regular: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[segment] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSegmentLabel = (segment: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      vip: { ar: 'عملاء VIP', en: 'VIP Customers' },
      active: { ar: 'عملاء نشطين', en: 'Active Customers' },
      inactive: { ar: 'عملاء غير نشطين', en: 'Inactive Customers' },
      new: { ar: 'عملاء جدد', en: 'New Customers' },
      regular: { ar: 'عملاء عاديين', en: 'Regular Customers' },
    };
    return labels[segment] ? (language === 'ar' ? labels[segment].ar : labels[segment].en) : segment;
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    return product.nameEn;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500 text-white',
      paused: 'bg-yellow-500 text-white',
      cancelled: 'bg-red-500 text-white',
      pending: 'bg-blue-500 text-white',
      completed: 'bg-green-500 text-white',
      registered: 'bg-purple-500 text-white',
      rewarded: 'bg-amber-500 text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getReferralStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      registered: { ar: 'مسجل', en: 'Registered' },
      completed: { ar: 'مكتمل', en: 'Completed' },
      rewarded: { ar: 'مكافأة', en: 'Rewarded' },
    };
    return labels[status] ? (language === 'ar' ? labels[status].ar : labels[status].en) : status;
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, React.ReactNode> = {
      sms: <Phone className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      whatsapp: <MessageSquare className="h-4 w-4" />,
      all: <Send className="h-4 w-4" />,
    };
    return icons[channel] || <Send className="h-4 w-4" />;
  };

  // Filter customers based on search and segment
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = customerSearch === '' || 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch);
    const matchesSegment = selectedSegment === 'all' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-[#2D5A3D] text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">
            {language === 'ar' ? 'إدارة العملاء المتقدمة' : 'Advanced Customer Management'}
          </h2>
          <p className="text-sm text-[#7A6F63]">
            {overallStats ? `${overallStats.totalCustomers} ${language === 'ar' ? 'عميل' : 'customers'}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F5EDE0] rounded-lg p-1">
            {(['segments', 'campaigns', 'referrals', 'subscriptions'] as const).map((section) => (
              <Button
                key={section}
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(section)}
                className={`${activeSection === section ? 'bg-white shadow-sm text-[#2D5A3D]' : 'text-[#7A6F63]'} rounded-md`}
              >
                {section === 'segments' && (language === 'ar' ? 'الشرائح' : 'Segments')}
                {section === 'campaigns' && (language === 'ar' ? 'الحملات' : 'Campaigns')}
                {section === 'referrals' && (language === 'ar' ? 'الإحالات' : 'Referrals')}
                {section === 'subscriptions' && (language === 'ar' ? 'الاشتراكات' : 'Subscriptions')}
              </Button>
            ))}
          </div>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Segments Section */}
          {activeSection === 'segments' && segmentData && overallStats && (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 gold-gradient" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{overallStats.totalCustomers}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#D4A853]/10">
                        <Users className="h-6 w-6 text-[#D4A853]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 green-gradient" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">€{overallStats.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#2D5A3D]/10">
                        <TrendingUp className="h-6 w-6 text-[#2D5A3D]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوسط قيمة العميل' : 'Avg Customer Value'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">€{overallStats.avgCustomerValue.toFixed(2)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Target className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل الاحتفاظ' : 'Retention Rate'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{overallStats.retentionRate.toFixed(1)}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Star className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Segment Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(segmentData).map(([segment, stats]) => (
                  <Card 
                    key={segment} 
                    className={`border-0 shadow-md overflow-hidden cursor-pointer transition-all ${
                      selectedSegment === segment ? 'ring-2 ring-[#D4A853]' : ''
                    }`}
                    onClick={() => setSelectedSegment(selectedSegment === segment ? 'all' : segment)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${getSegmentColor(segment)}`} />
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getSegmentColor(segment)} text-white`}>
                          {getSegmentIcon(segment)}
                        </div>
                        <div>
                          <p className="font-medium text-[#3D3229]">{getSegmentLabel(segment)}</p>
                          <p className="text-2xl font-bold text-[#D4A853]">{stats.count}</p>
                        </div>
                      </div>
                      {stats.totalSpent !== undefined && (
                        <p className="text-sm text-[#7A6F63]">
                          {language === 'ar' ? 'إجمالي الإنفاق:' : 'Total Spent:'} €{stats.totalSpent.toFixed(2)}
                        </p>
                      )}
                      {stats.avgOrders !== undefined && (
                        <p className="text-sm text-[#7A6F63]">
                          {language === 'ar' ? 'متوسط الطلبات:' : 'Avg Orders:'} {stats.avgOrders.toFixed(1)}
                        </p>
                      )}
                      {segment === 'inactive' && stats.potentialRevenue && (
                        <p className="text-sm text-[#7A6F63]">
                          {language === 'ar' ? 'الإيراد المحتمل:' : 'Potential Revenue:'} €{stats.potentialRevenue}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Auto-Classification Info */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-[#F5EDE0] to-white">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#D4A853]/10">
                      <Sparkles className="h-5 w-5 text-[#D4A853]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3D3229]">
                        {language === 'ar' ? 'التصنيف التلقائي' : 'Auto-Classification'}
                      </h4>
                      <p className="text-sm text-[#7A6F63] mt-1">
                        {language === 'ar' 
                          ? 'يتم تصنيف العملاء تلقائياً بناءً على سلوكهم: VIP (>€1000، >10 طلبات)، نشطين (طلب خلال 30 يوم)، غير نشطين (بدون طلب 90 يوم)، جدد (أقل من 30 يوم)'
                          : 'Customers are auto-classified based on behavior: VIP (>€1000, >10 orders), Active (ordered within 30 days), Inactive (no order in 90 days), New (<30 days)'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer List with Segment Filter */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-[#3D3229] flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#D4A853]" />
                      {language === 'ar' ? 'قائمة العملاء' : 'Customer List'}
                    </CardTitle>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
                        <Input
                          placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-9 w-full sm:w-48 border-[#E8DFD0]"
                        />
                      </div>
                      <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                        <SelectTrigger className="w-32 border-[#E8DFD0]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="active">{language === 'ar' ? 'نشطين' : 'Active'}</SelectItem>
                          <SelectItem value="inactive">{language === 'ar' ? 'غير نشطين' : 'Inactive'}</SelectItem>
                          <SelectItem value="new">{language === 'ar' ? 'جدد' : 'New'}</SelectItem>
                          <SelectItem value="regular">{language === 'ar' ? 'عاديين' : 'Regular'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الشريحة' : 'Segment'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الطلبات' : 'Orders'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الإنفاق' : 'Spent'}</TableHead>
                          <TableHead>{language === 'ar' ? 'النقاط' : 'Points'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-[#7A6F63] py-8">
                              {language === 'ar' ? 'لا يوجد عملاء' : 'No customers found'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCustomers.slice(0, 20).map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell>
                                <div className="font-medium text-[#3D3229]">{customer.name}</div>
                                {customer.email && (
                                  <div className="text-xs text-[#7A6F63]">{customer.email}</div>
                                )}
                              </TableCell>
                              <TableCell className="text-[#7A6F63]">{customer.phone}</TableCell>
                              <TableCell>
                                <Badge className={getSegmentBgColor(customer.segment)}>
                                  {getSegmentLabel(customer.segment)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[#3D3229]">{customer.totalOrders}</TableCell>
                              <TableCell className="text-[#D4A853] font-medium">€{customer.totalSpent.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-[#D4A853]" />
                                  <span className="text-[#3D3229]">{customer.loyaltyPoints}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions for Segments */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229] flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#D4A853]" />
                    {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-amber-300 hover:bg-amber-50"
                      onClick={() => {
                        setActiveSection('campaigns');
                        setCampaignForm(prev => ({ ...prev, targetSegment: 'vip' }));
                        setIsCampaignDialogOpen(true);
                      }}
                    >
                      <Crown className="h-6 w-6 text-amber-500" />
                      <span className="text-[#3D3229]">{language === 'ar' ? 'حملة VIP' : 'VIP Campaign'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-blue-300 hover:bg-blue-50"
                      onClick={() => {
                        setActiveSection('campaigns');
                        setCampaignForm(prev => ({ ...prev, targetSegment: 'inactive' }));
                        setIsCampaignDialogOpen(true);
                      }}
                    >
                      <Mail className="h-6 w-6 text-blue-500" />
                      <span className="text-[#3D3229]">{language === 'ar' ? 'إعادة تنشيط' : 'Re-engage'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50"
                      onClick={() => setActiveSection('referrals')}
                    >
                      <Gift className="h-6 w-6 text-green-500" />
                      <span className="text-[#3D3229]">{language === 'ar' ? 'مكافآت الإحالة' : 'Referral Rewards'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 border-purple-300 hover:bg-purple-50"
                      onClick={() => {
                        setActiveSection('subscriptions');
                        setIsSubscriptionDialogOpen(true);
                      }}
                    >
                      <Calendar className="h-6 w-6 text-purple-500" />
                      <span className="text-[#3D3229]">{language === 'ar' ? 'اشتراك جديد' : 'New Subscription'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaigns Section */}
          {activeSection === 'campaigns' && (
            <div className="space-y-6">
              {/* Campaign Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الحملات' : 'Total Campaigns'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{campaignStats.totalCampaigns}</p>
                      </div>
                      <Megaphone className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'حملات نشطة' : 'Active Campaigns'}</p>
                        <p className="text-2xl font-bold text-[#2D5A3D]">{campaignStats.activeCampaigns}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-[#2D5A3D]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'رسائل مرسلة' : 'Messages Sent'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{campaignStats.totalSent}</p>
                      </div>
                      <Send className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل الفتح' : 'Open Rate'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">
                          {campaignStats.totalSent > 0 ? ((campaignStats.totalOpened / campaignStats.totalSent) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      <Eye className="h-6 w-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Channel Icons Legend */}
              <div className="flex flex-wrap gap-4 p-3 bg-[#F5EDE0] rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span>SMS</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                  <Mail className="h-4 w-4 text-red-500" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span>WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                  <Send className="h-4 w-4 text-purple-500" />
                  <span>{language === 'ar' ? 'جميع القنوات' : 'All Channels'}</span>
                </div>
              </div>

              {/* Campaign List */}
              <div className="flex justify-end">
                <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="green-gradient text-white border-0" onClick={() => setCampaignForm({
                      name: '', description: '', type: 'discount', channel: 'all', targetSegment: 'all',
                      discountPercent: '', discountAmount: '', pointsBonus: '', startDate: '', endDate: '', messageTemplate: ''
                    })}>
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'حملة جديدة' : 'New Campaign'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
                    <DialogHeader>
                      <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إنشاء حملة تسويقية' : 'Create Marketing Campaign'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم الحملة' : 'Campaign Name'}</Label>
                        <Input 
                          value={campaignForm.name} 
                          onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})} 
                          className="mt-1.5 border-[#E8DFD0]" 
                          required 
                        />
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                        <Textarea 
                          value={campaignForm.description} 
                          onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})} 
                          className="mt-1.5 border-[#E8DFD0]" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'النوع' : 'Type'}</Label>
                          <Select value={campaignForm.type} onValueChange={(v) => setCampaignForm({...campaignForm, type: v})}>
                            <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discount">{language === 'ar' ? 'خصم' : 'Discount'}</SelectItem>
                              <SelectItem value="points">{language === 'ar' ? 'نقاط' : 'Points'}</SelectItem>
                              <SelectItem value="free_delivery">{language === 'ar' ? 'توصيل مجاني' : 'Free Delivery'}</SelectItem>
                              <SelectItem value="product">{language === 'ar' ? 'منتج مجاني' : 'Free Product'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'القناة' : 'Channel'}</Label>
                          <Select value={campaignForm.channel} onValueChange={(v) => setCampaignForm({...campaignForm, channel: v})}>
                            <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{language === 'ar' ? 'جميع القنوات' : 'All Channels'}</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'الشريحة المستهدفة' : 'Target Segment'}</Label>
                        <Select value={campaignForm.targetSegment} onValueChange={(v) => setCampaignForm({...campaignForm, targetSegment: v})}>
                          <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="active">{language === 'ar' ? 'نشطين' : 'Active'}</SelectItem>
                            <SelectItem value="inactive">{language === 'ar' ? 'غير نشطين' : 'Inactive'}</SelectItem>
                            <SelectItem value="new">{language === 'ar' ? 'جدد' : 'New'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {campaignForm.type === 'discount' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-[#7A6F63]">{language === 'ar' ? 'نسبة الخصم %' : 'Discount %'}</Label>
                            <Input 
                              type="number" 
                              value={campaignForm.discountPercent} 
                              onChange={(e) => setCampaignForm({...campaignForm, discountPercent: e.target.value})} 
                              className="mt-1.5 border-[#E8DFD0]" 
                            />
                          </div>
                          <div>
                            <Label className="text-[#7A6F63]">{language === 'ar' ? 'مبلغ الخصم €' : 'Discount Amount €'}</Label>
                            <Input 
                              type="number" 
                              value={campaignForm.discountAmount} 
                              onChange={(e) => setCampaignForm({...campaignForm, discountAmount: e.target.value})} 
                              className="mt-1.5 border-[#E8DFD0]" 
                            />
                          </div>
                        </div>
                      )}
                      {campaignForm.type === 'points' && (
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'نقاط المكافأة' : 'Bonus Points'}</Label>
                          <Input 
                            type="number" 
                            value={campaignForm.pointsBonus} 
                            onChange={(e) => setCampaignForm({...campaignForm, pointsBonus: e.target.value})} 
                            className="mt-1.5 border-[#E8DFD0]" 
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'نص الرسالة' : 'Message Template'}</Label>
                        <Textarea 
                          value={campaignForm.messageTemplate} 
                          onChange={(e) => setCampaignForm({...campaignForm, messageTemplate: e.target.value})} 
                          className="mt-1.5 border-[#E8DFD0]" 
                          placeholder={language === 'ar' ? 'مرحباً {name}، لديك عرض خاص...' : 'Hello {name}, you have a special offer...'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</Label>
                          <Input 
                            type="date" 
                            value={campaignForm.startDate} 
                            onChange={(e) => setCampaignForm({...campaignForm, startDate: e.target.value})} 
                            className="mt-1.5 border-[#E8DFD0]" 
                            required 
                          />
                        </div>
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                          <Input 
                            type="date" 
                            value={campaignForm.endDate} 
                            onChange={(e) => setCampaignForm({...campaignForm, endDate: e.target.value})} 
                            className="mt-1.5 border-[#E8DFD0]" 
                            required 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="gold-gradient text-white border-0">
                          {language === 'ar' ? 'إنشاء الحملة' : 'Create Campaign'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-12 text-center">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 text-[#D4A853] opacity-50" />
                        <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد حملات' : 'No campaigns found'}</p>
                        <p className="text-sm text-[#7A6F63] mt-2">
                          {language === 'ar' ? 'أنشئ حملتك الأولى للتواصل مع عملائك' : 'Create your first campaign to reach your customers'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    campaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-0 shadow-md bg-white overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                          <div className="flex-1 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-lg font-bold text-[#3D3229]">{campaign.name}</span>
                                  <Badge className={campaign.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                                    {campaign.isActive ? (language === 'ar' ? 'نشطة' : 'Active') : (language === 'ar' ? 'متوقفة' : 'Inactive')}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-[#7A6F63]">
                                    {getChannelIcon(campaign.channel)}
                                    <span className="text-sm">{campaign.channel === 'all' ? (language === 'ar' ? 'الكل' : 'All') : campaign.channel.toUpperCase()}</span>
                                  </div>
                                  {campaign.targetSegment && (
                                    <Badge variant="outline" className="border-[#D4A853] text-[#D4A853]">
                                      {getSegmentLabel(campaign.targetSegment)}
                                    </Badge>
                                  )}
                                </div>
                                {campaign.description && (
                                  <p className="text-sm text-[#7A6F63]">{campaign.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-[#D4A853]">
                                  {campaign.type === 'discount' && campaign.discountPercent && `${campaign.discountPercent}%`}
                                  {campaign.type === 'discount' && campaign.discountAmount && `€${campaign.discountAmount}`}
                                  {campaign.type === 'points' && campaign.pointsBonus && `${campaign.pointsBonus} ${language === 'ar' ? 'نقطة' : 'pts'}`}
                                  {campaign.type === 'free_delivery' && (language === 'ar' ? 'توصيل مجاني' : 'Free Delivery')}
                                  {campaign.type === 'product' && (language === 'ar' ? 'منتج مجاني' : 'Free Product')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-4 gap-4">
                              <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مرسل' : 'Sent'}</p>
                                <p className="text-xl font-bold text-[#D4A853]">{campaign.totalSent}</p>
                              </div>
                              <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مفتوح' : 'Opened'}</p>
                                <p className="text-xl font-bold text-[#2D5A3D]">{campaign.totalOpened}</p>
                              </div>
                              <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'نقر' : 'Clicked'}</p>
                                <p className="text-xl font-bold text-blue-500">{campaign.totalClicked}</p>
                              </div>
                              <div className="p-3 bg-[#F5EDE0] rounded-lg text-center">
                                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'تحويل' : 'Converted'}</p>
                                <p className="text-xl font-bold text-purple-500">{campaign.totalConverted}</p>
                              </div>
                            </div>

                            {/* Campaign Dates */}
                            <div className="mt-3 flex items-center gap-4 text-sm text-[#7A6F63]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(campaign.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(campaign.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              className="green-gradient text-white"
                              onClick={() => handleSendCampaign(campaign.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {language === 'ar' ? 'إرسال' : 'Send'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleCampaign(campaign.id, campaign.isActive)}
                            >
                              {campaign.isActive ? (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  {language === 'ar' ? 'إيقاف' : 'Pause'}
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  {language === 'ar' ? 'تفعيل' : 'Activate'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Referrals Section */}
          {activeSection === 'referrals' && referralStats && (
            <div className="space-y-6">
              {/* Referral Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الإحالات' : 'Total Referrals'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{referralStats.totalReferrals}</p>
                      </div>
                      <Share2 className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مكتملة' : 'Completed'}</p>
                        <p className="text-2xl font-bold text-[#2D5A3D]">{referralStats.completed}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-[#2D5A3D]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'النقاط الممنوحة' : 'Points Awarded'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{referralStats.totalPointsAwarded}</p>
                      </div>
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{referralStats.conversionRate}%</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Referral Program Info */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-[#2D5A3D]/10 to-[#D4A853]/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#2D5A3D]/20">
                      <Gift className="h-5 w-5 text-[#2D5A3D]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3D3229]">
                        {language === 'ar' ? 'برنامج الإحالة' : 'Referral Program'}
                      </h4>
                      <p className="text-sm text-[#7A6F63] mt-1">
                        {language === 'ar' 
                          ? 'يحصل المُحيل على 100 نقطة عند إحالة عميل جديد يقوم بأول طلب. يمكن استبدال النقاط بخصومات أو منتجات مجانية.'
                          : 'Referrers earn 100 points when their referred customer makes their first order. Points can be redeemed for discounts or free products.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Referral Code Dialog */}
              <div className="flex justify-end">
                <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="green-gradient text-white border-0" onClick={() => setReferralForm({ customerId: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'إنشاء كود إحالة' : 'Generate Referral Code'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
                    <DialogHeader>
                      <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إنشاء كود إحالة' : 'Generate Referral Code'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGenerateReferralCode} className="space-y-4">
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'اختر العميل' : 'Select Customer'}</Label>
                        <Select value={referralForm.customerId} onValueChange={(v) => setReferralForm({ customerId: v })}>
                          <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                            <SelectValue placeholder={language === 'ar' ? 'اختر عميل...' : 'Select customer...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.filter(c => !c.referralCode).map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name} - {customer.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="gold-gradient text-white border-0" disabled={!referralForm.customerId}>
                          {language === 'ar' ? 'إنشاء الكود' : 'Generate Code'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Top Referrers */}
              {topReferrers.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229] flex items-center gap-2">
                      <Crown className="h-5 w-5 text-[#D4A853]" />
                      {language === 'ar' ? 'أفضل المُحيلين' : 'Top Referrers'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {topReferrers.map((referrer, index) => (
                        <div key={referrer.customerId} className={`p-4 rounded-xl text-center ${
                          index === 0 ? 'bg-gradient-to-br from-amber-100 to-yellow-50 border-2 border-[#D4A853]' : 'bg-[#F5EDE0]'
                        }`}>
                          <div className={`text-2xl font-bold mb-2 ${index === 0 ? 'text-[#D4A853]' : 'text-[#3D3229]'}`}>
                            #{index + 1}
                          </div>
                          <div className="font-medium text-[#3D3229]">{referrer.customer.name}</div>
                          <div className="text-sm text-[#7A6F63]">{referrer.referralCount} {language === 'ar' ? 'إحالة' : 'referrals'}</div>
                          <div className="text-sm font-bold text-[#2D5A3D]">{referrer.totalPoints} {language === 'ar' ? 'نقطة' : 'pts'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Referrals List */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'سجل الإحالات' : 'Referral History'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
                          <TableHead>{language === 'ar' ? 'المُحيل' : 'Referrer'}</TableHead>
                          <TableHead>{language === 'ar' ? 'المُحال' : 'Referred'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                          <TableHead>{language === 'ar' ? 'النقاط' : 'Points'}</TableHead>
                          <TableHead>{language === 'ar' ? 'إجراء' : 'Action'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-[#7A6F63] py-8">
                              {language === 'ar' ? 'لا توجد إحالات' : 'No referrals found'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          referrals.map((referral) => (
                            <TableRow key={referral.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="px-2 py-1 bg-[#F5EDE0] rounded text-[#D4A853] font-mono font-bold">
                                    {referral.code}
                                  </code>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => copyReferralCode(referral.code)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-[#3D3229]">{referral.customer.name}</div>
                                  <div className="text-xs text-[#7A6F63]">{referral.customer.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {referral.referredName || referral.referredEmail || referral.referredPhone || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(referral.status)}>
                                  {getReferralStatusLabel(referral.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-[#2D5A3D]">{referral.pointsEarned}</TableCell>
                              <TableCell>
                                {referral.status === 'registered' && (
                                  <Button 
                                    size="sm" 
                                    className="green-gradient text-white"
                                    onClick={() => handleCompleteReferral(referral.id, 100)}
                                  >
                                    <Award className="h-4 w-4 mr-1" />
                                    {language === 'ar' ? 'مكافأة' : 'Reward'}
                                  </Button>
                                )}
                                {referral.status === 'pending' && (
                                  <span className="text-xs text-[#7A6F63]">{language === 'ar' ? 'في انتظار التسجيل' : 'Awaiting registration'}</span>
                                )}
                                {(referral.status === 'completed' || referral.status === 'rewarded') && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscriptions Section */}
          {activeSection === 'subscriptions' && (
            <div className="space-y-6">
              {/* Subscription Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الاشتراكات' : 'Total Subscriptions'}</p>
                        <p className="text-2xl font-bold text-[#3D3229]">{subscriptions.length}</p>
                      </div>
                      <Calendar className="h-6 w-6 text-[#D4A853]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'نشطة' : 'Active'}</p>
                        <p className="text-2xl font-bold text-[#2D5A3D]">{subscriptions.filter(s => s.status === 'active').length}</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-[#2D5A3D]" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوقفة' : 'Paused'}</p>
                        <p className="text-2xl font-bold text-yellow-500">{subscriptions.filter(s => s.status === 'paused').length}</p>
                      </div>
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'توصيلات اليوم' : 'Daily Deliveries'}</p>
                        <p className="text-2xl font-bold text-blue-500">{subscriptions.filter(s => s.frequency === 'daily' && s.status === 'active').length}</p>
                      </div>
                      <Truck className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Subscription Dialog */}
              <div className="flex justify-end gap-2">
                <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="green-gradient text-white border-0" 
                      onClick={() => setSubscriptionForm({
                        customerId: '', name: '', frequency: 'weekly', daysOfWeek: [],
                        preferredTime: '', startDate: '', discount: '', notes: '', items: []
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'اشتراك جديد' : 'New Subscription'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
                    <DialogHeader>
                      <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إنشاء اشتراك جديد' : 'Create New Subscription'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubscription} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم الاشتراك' : 'Subscription Name'}</Label>
                          <Input 
                            value={subscriptionForm.name}
                            onChange={(e) => setSubscriptionForm({...subscriptionForm, name: e.target.value})}
                            className="mt-1.5 border-[#E8DFD0]"
                            placeholder={language === 'ar' ? 'مثال: خبز أسبوعي' : 'e.g., Weekly Bread'}
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'العميل' : 'Customer'}</Label>
                          <Select value={subscriptionForm.customerId} onValueChange={(v) => setSubscriptionForm({...subscriptionForm, customerId: v})}>
                            <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                              <SelectValue placeholder={language === 'ar' ? 'اختر...' : 'Select...'} />
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'التكرار' : 'Frequency'}</Label>
                          <Select value={subscriptionForm.frequency} onValueChange={(v) => setSubscriptionForm({...subscriptionForm, frequency: v})}>
                            <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">{language === 'ar' ? 'يومي' : 'Daily'}</SelectItem>
                              <SelectItem value="weekly">{language === 'ar' ? 'أسبوعي' : 'Weekly'}</SelectItem>
                              <SelectItem value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</Label>
                          <Input 
                            type="date"
                            value={subscriptionForm.startDate}
                            onChange={(e) => setSubscriptionForm({...subscriptionForm, startDate: e.target.value})}
                            className="mt-1.5 border-[#E8DFD0]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'المنتجات' : 'Products'}</Label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg">
                              <span className="text-[#3D3229]">{getProductName(product)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[#D4A853]">€{product.price.toFixed(2)}</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="99"
                                  className="w-16 h-8 border-[#E8DFD0]"
                                  value={subscriptionForm.items.find(i => i.productId === product.id)?.quantity || 0}
                                  onChange={(e) => {
                                    const qty = parseInt(e.target.value) || 0;
                                    const items = subscriptionForm.items.filter(i => i.productId !== product.id);
                                    if (qty > 0) {
                                      items.push({ productId: product.id, quantity: qty });
                                    }
                                    setSubscriptionForm({...subscriptionForm, items});
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'الخصم %' : 'Discount %'}</Label>
                          <Input 
                            type="number"
                            value={subscriptionForm.discount}
                            onChange={(e) => setSubscriptionForm({...subscriptionForm, discount: e.target.value})}
                            className="mt-1.5 border-[#E8DFD0]"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-[#7A6F63]">{language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}</Label>
                          <Input 
                            type="time"
                            value={subscriptionForm.preferredTime}
                            onChange={(e) => setSubscriptionForm({...subscriptionForm, preferredTime: e.target.value})}
                            className="mt-1.5 border-[#E8DFD0]"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                        <Textarea 
                          value={subscriptionForm.notes}
                          onChange={(e) => setSubscriptionForm({...subscriptionForm, notes: e.target.value})}
                          className="mt-1.5 border-[#E8DFD0]"
                          placeholder={language === 'ar' ? 'ملاحظات خاصة بالتوصيل...' : 'Special delivery notes...'}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="gold-gradient text-white border-0" disabled={!subscriptionForm.customerId || !subscriptionForm.name || subscriptionForm.items.length === 0}>
                          {language === 'ar' ? 'إنشاء الاشتراك' : 'Create Subscription'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Subscriptions List */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {subscriptions.length === 0 ? (
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D4A853] opacity-50" />
                        <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد اشتراكات' : 'No subscriptions found'}</p>
                        <p className="text-sm text-[#7A6F63] mt-2">
                          {language === 'ar' ? 'أنشئ اشتراكاً للتوصيل المنتظم للخبز' : 'Create a subscription for regular bread delivery'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    subscriptions.map((subscription) => (
                      <Card key={subscription.id} className="border-0 shadow-md bg-white overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                          <div className="flex-1 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-lg font-bold text-[#3D3229]">{subscription.name}</span>
                                  <Badge className={getStatusColor(subscription.status)}>
                                    {subscription.status === 'active' && (language === 'ar' ? 'نشط' : 'Active')}
                                    {subscription.status === 'paused' && (language === 'ar' ? 'متوقف' : 'Paused')}
                                    {subscription.status === 'cancelled' && (language === 'ar' ? 'ملغي' : 'Cancelled')}
                                  </Badge>
                                  <Badge variant="outline" className="border-[#D4A853] text-[#D4A853]">
                                    {subscription.frequency === 'daily' && (language === 'ar' ? 'يومي' : 'Daily')}
                                    {subscription.frequency === 'weekly' && (language === 'ar' ? 'أسبوعي' : 'Weekly')}
                                    {subscription.frequency === 'monthly' && (language === 'ar' ? 'شهري' : 'Monthly')}
                                  </Badge>
                                </div>
                                <div className="text-sm text-[#7A6F63]">
                                  {subscription.customer.name} - {subscription.customer.phone}
                                </div>
                                <div className="text-xs text-[#7A6F63]">
                                  {subscription.customer.address}, {subscription.customer.city}
                                </div>
                              </div>
                              <div className="text-right">
                                {subscription.discount > 0 && (
                                  <div className="text-lg font-bold text-[#2D5A3D]">-{subscription.discount}%</div>
                                )}
                                <div className="text-sm text-[#7A6F63]">
                                  {subscription.totalDeliveries} {language === 'ar' ? 'توصيلات' : 'deliveries'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              {subscription.subscriptionItems.map((item) => (
                                <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                                  {language === 'ar' ? item.product.nameAr : item.product.nameEn} × {item.quantity}
                                </div>
                              ))}
                            </div>
                            
                            {subscription.nextDeliveryDate && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-[#2D5A3D]">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {language === 'ar' ? 'التوصيل القادم:' : 'Next Delivery:'} {' '}
                                  {new Date(subscription.nextDeliveryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                            {subscription.status === 'active' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                                  onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                                >
                                  <Pause className="h-4 w-4 mr-1" />
                                  {language === 'ar' ? 'إيقاف' : 'Pause'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="green-gradient text-white"
                                  onClick={() => handleSubscriptionAction(subscription.id, 'generateOrder')}
                                >
                                  <Package className="h-4 w-4 mr-1" />
                                  {language === 'ar' ? 'إنشاء طلب' : 'Create Order'}
                                </Button>
                              </>
                            )}
                            {subscription.status === 'paused' && (
              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white"
                                onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                {language === 'ar' ? 'استئناف' : 'Resume'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}
