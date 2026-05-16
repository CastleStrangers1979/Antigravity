 
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
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, BellRing, Send, MessageSquare, Smartphone, Mail, Settings, 
  Plus, Edit, Trash2, Eye, Check, X, Clock, Filter, RefreshCw,
  Megaphone, Users, Package, Truck, DollarSign, Star, AlertTriangle,
  Calendar, Globe, Zap, Search, ChevronDown, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, Copy, FileText, Sparkles
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  customerId?: string;
  driverId?: string;
  orderId?: string;
  customer?: { id: string; name: string; phone: string; email?: string };
  driver?: { id: string; name: string; phone: string };
  order?: { id: string; orderNumber: string; status: string };
  channels?: string;
  smsSent: boolean;
  emailSent: boolean;
  whatsappSent: boolean;
  pushSent: boolean;
  isRead: boolean;
  isSent: boolean;
  sentAt?: string;
  readAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  title: string;
  message: string;
  channels: string[];
  variables: string[];
  category: string;
  isActive: boolean;
  translations?: {
    en: { name: string; title: string; message: string };
    ar: { name: string; title: string; message: string };
  };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  customerType: string;
  segment?: string;
}

interface CustomerSegment {
  id: string;
  name: string;
  memberCount: number;
}

// Notification Settings interface
interface NotificationSettings {
  channels: {
    sms: { enabled: boolean; provider?: string };
    email: { enabled: boolean; provider?: string };
    whatsapp: { enabled: boolean; provider?: string };
    push: { enabled: boolean; provider?: string };
  };
  events: {
    order_confirmed: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
    order_delivered: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
    order_cancelled: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
    points_earned: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
    low_stock: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
    marketing: { sms: boolean; email: boolean; whatsapp: boolean; push: boolean };
  };
  whatsappConfig: {
    businessAccountId: string;
    phoneNumberId: string;
    apiKey: string;
  };
  smsConfig: {
    provider: string;
    apiKey: string;
    senderId: string;
  };
}

// Sub-components
function ChannelBadge({ channel, sent }: { channel: string; sent: boolean }) {
  const channelConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    sms: { icon: <Smartphone className="h-3 w-3" />, color: 'bg-blue-500' },
    email: { icon: <Mail className="h-3 w-3" />, color: 'bg-purple-500' },
    whatsapp: { icon: <MessageSquare className="h-3 w-3" />, color: 'bg-green-500' },
    push: { icon: <Bell className="h-3 w-3" />, color: 'bg-orange-500' },
  };

  const config = channelConfig[channel] || { icon: <Bell className="h-3 w-3" />, color: 'bg-gray-500' };

  return (
    <Badge 
      variant="secondary" 
      className={`${sent ? config.color : 'bg-gray-300'} text-white text-xs flex items-center gap-1`}
    >
      {config.icon}
      {channel}
    </Badge>
  );
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ReactNode; color: string }> = {
    order_status: { icon: <Package className="h-4 w-4" />, color: 'text-blue-500' },
    new_order: { icon: <Package className="h-4 w-4" />, color: 'text-green-500' },
    driver_assigned: { icon: <Truck className="h-4 w-4" />, color: 'text-purple-500' },
    low_stock: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-500' },
    points_earned: { icon: <Star className="h-4 w-4" />, color: 'text-yellow-500' },
    payment: { icon: <DollarSign className="h-4 w-4" />, color: 'text-emerald-500' },
    marketing: { icon: <Megaphone className="h-4 w-4" />, color: 'text-pink-500' },
    delivery: { icon: <Truck className="h-4 w-4" />, color: 'text-cyan-500' },
  };

  const config = icons[type] || { icon: <Bell className="h-4 w-4" />, color: 'text-gray-500' };
  return <span className={config.color}>{config.icon}</span>;
}

// Notification Dashboard Sub-component
function NotificationDashboard() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus === 'unread') params.append('isSent', 'true');
      
      const res = await fetch(`/api/notifications?${params}`);
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  }, [filterType, filterStatus]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}`, { method: 'PUT' })));
      showNotification(toast, language === 'ar' ? 'تم تحديد الكل كمقروء' : 'All marked as read', '', 'success');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      showNotification(toast, language === 'ar' ? 'تم الحذف' : 'Deleted', '', 'success');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter by date
  const filteredNotifications = notifications.filter(n => {
    if (filterDate) {
      const notifDate = new Date(n.createdAt).toISOString().split('T')[0];
      return notifDate === filterDate;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A853]/10">
                <Bell className="h-5 w-5 text-[#D4A853]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3D3229]">{notifications.length}</p>
                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'الكل' : 'Total'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BellRing className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3D3229]">{unreadCount}</p>
                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'غير مقروء' : 'Unread'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3D3229]">{notifications.filter(n => n.isSent).length}</p>
                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مُرسلة' : 'Sent'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3D3229]">{notifications.filter(n => n.scheduledAt).length}</p>
                <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'مجدولة' : 'Scheduled'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-[#7A6F63]" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px] border-[#E8DFD0]">
                <SelectValue placeholder={language === 'ar' ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                <SelectItem value="order_status">{language === 'ar' ? 'حالة الطلب' : 'Order Status'}</SelectItem>
                <SelectItem value="new_order">{language === 'ar' ? 'طلب جديد' : 'New Order'}</SelectItem>
                <SelectItem value="payment">{language === 'ar' ? 'الدفع' : 'Payment'}</SelectItem>
                <SelectItem value="delivery">{language === 'ar' ? 'التوصيل' : 'Delivery'}</SelectItem>
                <SelectItem value="marketing">{language === 'ar' ? 'تسويقي' : 'Marketing'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] border-[#E8DFD0]">
                <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="unread">{language === 'ar' ? 'غير مقروء' : 'Unread'}</SelectItem>
                <SelectItem value="read">{language === 'ar' ? 'مقروء' : 'Read'}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[160px] border-[#E8DFD0]"
            />
            <Button variant="outline" size="sm" onClick={() => { setFilterType('all'); setFilterStatus('all'); setFilterDate(''); }} className="border-[#E8DFD0]">
              {language === 'ar' ? 'مسح' : 'Clear'}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="border-[#D4A853] text-[#D4A853]">
                <Check className="h-4 w-4 mr-1" />
                {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark All Read'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-[#D4A853]" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-50" />
                <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد إشعارات' : 'No notifications found'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                    <TableHead>{language === 'ar' ? 'القنوات' : 'Channels'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className="w-24">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} className={!notification.isRead ? 'bg-[#FFFEF7]' : ''}>
                      <TableCell>
                        <TypeIcon type={notification.type} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{notification.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#3D3229]">{notification.title}</p>
                          <p className="text-xs text-[#7A6F63] truncate max-w-[200px]">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {notification.channels && JSON.parse(notification.channels || '[]').map((ch: string) => (
                            <ChannelBadge key={ch} channel={ch} sent={notification[`${ch}Sent` as keyof Notification] as boolean} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.isRead ? (
                          <Badge className="bg-gray-100 text-gray-600">{language === 'ar' ? 'مقروء' : 'Read'}</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-600">{language === 'ar' ? 'جديد' : 'New'}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-[#7A6F63]">
                        {new Date(notification.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
    </div>
  );
}

// Notification Templates Sub-component
function NotificationTemplates() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{ title: string; message: string } | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'ar' | 'en' | 'nl' | 'ku'>('ar');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/templates');
      const data = await res.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const previewTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          variables: previewVariables,
          language: previewLanguage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewResult({ title: data.data.title, message: data.data.message });
      }
    } catch (error) {
      console.error('Error previewing template:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      orders: 'bg-blue-100 text-blue-700',
      delivery: 'bg-purple-100 text-purple-700',
      payment: 'bg-green-100 text-green-700',
      loyalty: 'bg-yellow-100 text-yellow-700',
      inventory: 'bg-amber-100 text-amber-700',
      marketing: 'bg-pink-100 text-pink-700',
      driver: 'bg-cyan-100 text-cyan-700',
      subscription: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="border-0 shadow-md overflow-hidden card-hover">
              <div className={`h-1 ${template.isActive ? 'bg-gradient-to-r from-[#D4A853] to-[#B8923F]' : 'bg-gray-300'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base text-[#3D3229]">{template.name}</CardTitle>
                    <Badge className={`mt-1 ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </Badge>
                  </div>
                  <Badge variant={template.isActive ? 'default' : 'secondary'} className={template.isActive ? 'bg-[#2D5A3D]' : ''}>
                    {template.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'العنوان:' : 'Title:'}</p>
                  <p className="text-sm font-medium text-[#3D3229]">{template.title}</p>
                </div>
                <div>
                  <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'المحتوى:' : 'Message:'}</p>
                  <p className="text-sm text-[#3D3229] line-clamp-2">{template.message}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.channels.map((ch) => (
                    <ChannelBadge key={ch} channel={ch} sent={true} />
                  ))}
                </div>
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-[#D4A853] text-[#D4A853]"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewVariables({});
                      setPreviewResult(null);
                      setPreviewDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {language === 'ar' ? 'معاينة' : 'Preview'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-2xl bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229] flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'معاينة القالب' : 'Template Preview'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#7A6F63]" />
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'اللغة:' : 'Language:'}</Label>
                <div className="flex gap-1">
                  {(['ar', 'en', 'nl', 'ku'] as const).map((lang) => (
                    <Button
                      key={lang}
                      variant={previewLanguage === lang ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewLanguage(lang)}
                      className={previewLanguage === lang ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}
                    >
                      {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : lang === 'nl' ? 'Nederlands' : 'کوردی'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <div>
                  <Label className="text-[#7A6F63] mb-2 block">{language === 'ar' ? 'المتغيرات:' : 'Variables:'}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.variables.map((v) => (
                      <div key={v}>
                        <Label className="text-xs text-[#7A6F63]">{`{{${v}}}`}</Label>
                        <Input
                          value={previewVariables[v] || ''}
                          onChange={(e) => setPreviewVariables({ ...previewVariables, [v]: e.target.value })}
                          placeholder={v}
                          className="border-[#E8DFD0]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={previewTemplate} className="gold-gradient text-white border-0">
                <Sparkles className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </Button>

              {/* Preview Result */}
              {previewResult && (
                <div className="space-y-3">
                  <Card className="border-[#D4A853] bg-[#FFFEF7]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-[#7A6F63]">{language === 'ar' ? 'العنوان' : 'Title'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-[#3D3229]">{previewResult.title}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E8DFD0]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المحتوى' : 'Message'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#3D3229]">{previewResult.message}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Send Notifications Sub-component
function SendNotifications() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  
  const [sendForm, setSendForm] = useState({
    targetType: 'individual', // individual, segment, all
    customerId: '',
    segmentId: '',
    title: '',
    message: '',
    channels: ['push'] as string[],
    schedule: false,
    scheduledDate: '',
    scheduledTime: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersRes, templatesRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/notifications/templates'),
        ]);
        const customersData = await customersRes.json();
        const templatesData = await templatesRes.json();
        setCustomers(customersData || []);
        setTemplates(templatesData.data || []);
        // Mock segments
        setSegments([
          { id: 'vip', name: language === 'ar' ? 'عملاء VIP' : 'VIP Customers', memberCount: 15 },
          { id: 'wholesale', name: language === 'ar' ? 'عملاء الجملة' : 'Wholesale', memberCount: 32 },
          { id: 'inactive', name: language === 'ar' ? 'عملاء غير نشطين' : 'Inactive', memberCount: 48 },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    void fetchData();
  }, [language]);

  const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) {
      showNotification(toast, language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', '', 'error');
      return;
    }

    setSending(true);
    try {
      let targetCustomers: string[] = [];
      
      if (sendForm.targetType === 'individual') {
        targetCustomers = [sendForm.customerId];
      } else if (sendForm.targetType === 'segment') {
        // Get customers from segment (mock)
        targetCustomers = customers.slice(0, 5).map(c => c.id);
      } else {
        // All customers
        targetCustomers = customers.map(c => c.id);
      }

      // Send to each customer
      for (const customerId of targetCustomers) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'marketing',
            title: sendForm.title,
            message: sendForm.message,
            customerId,
            channels: sendForm.channels,
          }),
        });
      }

      showNotification(toast, language === 'ar' ? 'تم إرسال الإشعار بنجاح' : 'Notification sent successfully', '', 'success');
      setSendForm({
        targetType: 'individual',
        customerId: '',
        segmentId: '',
        title: '',
        message: '',
        channels: ['push'],
        schedule: false,
        scheduledDate: '',
        scheduledTime: '',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      showNotification(toast, language === 'ar' ? 'حدث خطأ' : 'An error occurred', '', 'error');
    }
    setSending(false);
  };

  const toggleChannel = (channel: string) => {
    if (sendForm.channels.includes(channel)) {
      setSendForm({ ...sendForm, channels: sendForm.channels.filter(c => c !== channel) });
    } else {
      setSendForm({ ...sendForm, channels: [...sendForm.channels, channel] });
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSendForm({
        ...sendForm,
        title: template.title,
        message: template.message,
        channels: template.channels,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Send className="h-5 w-5 text-[#D4A853]" />
              {language === 'ar' ? 'إرسال إشعار جديد' : 'Send New Notification'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Selection */}
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'إرسال إلى:' : 'Send to:'}</Label>
              <Select value={sendForm.targetType} onValueChange={(v) => setSendForm({ ...sendForm, targetType: v, customerId: '', segmentId: '' })}>
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{language === 'ar' ? 'عميل محدد' : 'Individual Customer'}</SelectItem>
                  <SelectItem value="segment">{language === 'ar' ? 'شريحة عملاء' : 'Customer Segment'}</SelectItem>
                  <SelectItem value="all">{language === 'ar' ? 'جميع العملاء' : 'All Customers'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sendForm.targetType === 'individual' && (
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'اختر العميل:' : 'Select Customer:'}</Label>
                <Select value={sendForm.customerId} onValueChange={(v) => setSendForm({ ...sendForm, customerId: v })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={language === 'ar' ? 'اختر عميل' : 'Select customer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {sendForm.targetType === 'segment' && (
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'اختر الشريحة:' : 'Select Segment:'}</Label>
                <Select value={sendForm.segmentId} onValueChange={(v) => setSendForm({ ...sendForm, segmentId: v })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={language === 'ar' ? 'اختر شريحة' : 'Select segment'} />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.memberCount})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Template Quick Select */}
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'استخدام قالب:' : 'Use Template:'}</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue placeholder={language === 'ar' ? 'اختر قالب (اختياري)' : 'Select template (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان:' : 'Title:'}</Label>
              <Input
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder={language === 'ar' ? 'عنوان الإشعار' : 'Notification title'}
              />
            </div>

            {/* Message */}
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'المحتوى:' : 'Message:'}</Label>
              <Textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                className="mt-1.5 border-[#E8DFD0]"
                rows={4}
                placeholder={language === 'ar' ? 'محتوى الإشعار' : 'Notification message'}
              />
            </div>

            {/* Channels */}
            <div>
              <Label className="text-[#7A6F63] mb-2 block">{language === 'ar' ? 'القنوات:' : 'Channels:'}</Label>
              <div className="flex flex-wrap gap-2">
                {['sms', 'email', 'whatsapp', 'push'].map((ch) => (
                  <Button
                    key={ch}
                    variant={sendForm.channels.includes(ch) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleChannel(ch)}
                    className={sendForm.channels.includes(ch) ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}
                  >
                    <ChannelBadge channel={ch} sent={sendForm.channels.includes(ch)} />
                  </Button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-3">
              <Switch
                checked={sendForm.schedule}
                onCheckedChange={(v) => setSendForm({ ...sendForm, schedule: v })}
              />
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'جدولة الإرسال' : 'Schedule Send'}</Label>
            </div>

            {sendForm.schedule && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'التاريخ:' : 'Date:'}</Label>
                  <Input
                    type="date"
                    value={sendForm.scheduledDate}
                    onChange={(e) => setSendForm({ ...sendForm, scheduledDate: e.target.value })}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوقت:' : 'Time:'}</Label>
                  <Input
                    type="time"
                    value={sendForm.scheduledTime}
                    onChange={(e) => setSendForm({ ...sendForm, scheduledTime: e.target.value })}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleSend} 
              disabled={sending || !sendForm.title || !sendForm.message}
              className="w-full gold-gradient text-white border-0"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إرسال' : 'Send'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Users className="h-5 w-5 text-[#2D5A3D]" />
                {language === 'ar' ? 'جمهور الإرسال' : 'Target Audience'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#D4A853]">{customers.length}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                </div>
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#2D5A3D]">{segments.length}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'الشرائح' : 'Segments'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'قوالب سريعة' : 'Quick Templates'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {templates.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#F5EDE0] rounded-lg cursor-pointer hover:bg-[#E8DFD0] transition-colors"
                      onClick={() => applyTemplate(t.id)}
                    >
                      <p className="font-medium text-[#3D3229] text-sm">{t.name}</p>
                      <p className="text-xs text-[#7A6F63] truncate">{t.title}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Notification Settings Sub-component
function NotificationSettingsTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    channels: {
      sms: { enabled: true, provider: 'twilio' },
      email: { enabled: true, provider: 'sendgrid' },
      whatsapp: { enabled: false, provider: 'whatsapp_business' },
      push: { enabled: true, provider: 'fcm' },
    },
    events: {
      order_confirmed: { sms: true, email: true, whatsapp: false, push: true },
      order_delivered: { sms: false, email: true, whatsapp: false, push: true },
      order_cancelled: { sms: true, email: true, whatsapp: false, push: true },
      points_earned: { sms: false, email: false, whatsapp: false, push: true },
      low_stock: { sms: false, email: true, whatsapp: false, push: true },
      marketing: { sms: false, email: true, whatsapp: false, push: false },
    },
    whatsappConfig: {
      businessAccountId: '',
      phoneNumberId: '',
      apiKey: '',
    },
    smsConfig: {
      provider: 'twilio',
      apiKey: '',
      senderId: 'ALMALIKA',
    },
  });

  const handleSave = async () => {
    showNotification(toast, language === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved', '', 'success');
  };

  const toggleChannel = (channel: 'sms' | 'email' | 'whatsapp' | 'push') => {
    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: { ...settings.channels[channel], enabled: !settings.channels[channel].enabled },
      },
    });
  };

  const toggleEventChannel = (event: keyof typeof settings.events, channel: 'sms' | 'email' | 'whatsapp' | 'push') => {
    setSettings({
      ...settings,
      events: {
        ...settings.events,
        [event]: {
          ...settings.events[event],
          [channel]: !settings.events[event][channel],
        },
      },
    });
  };

  const eventLabels: Record<string, string> = {
    order_confirmed: language === 'ar' ? 'تأكيد الطلب' : 'Order Confirmed',
    order_delivered: language === 'ar' ? 'تم التوصيل' : 'Order Delivered',
    order_cancelled: language === 'ar' ? 'إلغاء الطلب' : 'Order Cancelled',
    points_earned: language === 'ar' ? 'نقاط مكتسبة' : 'Points Earned',
    low_stock: language === 'ar' ? 'نقص المخزون' : 'Low Stock',
    marketing: language === 'ar' ? 'تسويقي' : 'Marketing',
  };

  return (
    <div className="space-y-6">
      {/* Channel Toggles */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#D4A853]" />
            {language === 'ar' ? 'تفعيل القنوات' : 'Channel Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['sms', 'email', 'whatsapp', 'push'] as const).map((channel) => (
              <div key={channel} className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <ChannelBadge channel={channel} sent={settings.channels[channel].enabled} />
                  <span className="font-medium text-[#3D3229] capitalize">{channel}</span>
                </div>
                {settings.channels[channel].enabled ? (
                  <ToggleRight className="h-6 w-6 text-[#2D5A3D] cursor-pointer" onClick={() => toggleChannel(channel)} />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400 cursor-pointer" onClick={() => toggleChannel(channel)} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Preferences */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#D4A853]" />
            {language === 'ar' ? 'تفضيلات الأحداث' : 'Event Preferences'}
          </CardTitle>
          <CardDescription>{language === 'ar' ? 'حدد قنوات الإرسال لكل نوع حدث' : 'Select channels for each event type'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5EDE0]">
                <TableHead>{language === 'ar' ? 'الحدث' : 'Event'}</TableHead>
                <TableHead className="text-center">SMS</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">WhatsApp</TableHead>
                <TableHead className="text-center">Push</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(settings.events).map(([event, channels]) => (
                <TableRow key={event}>
                  <TableCell className="font-medium text-[#3D3229]">{eventLabels[event]}</TableCell>
                  {(['sms', 'email', 'whatsapp', 'push'] as const).map((ch) => (
                    <TableCell key={ch} className="text-center">
                      <Switch
                        checked={channels[ch]}
                        onCheckedChange={() => toggleEventChannel(event as keyof typeof settings.events, ch)}
                        disabled={!settings.channels[ch].enabled}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Business API */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              WhatsApp Business API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#7A6F63]">Business Account ID</Label>
              <Input
                value={settings.whatsappConfig.businessAccountId}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsappConfig: { ...settings.whatsappConfig, businessAccountId: e.target.value },
                })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder="xxxxxxxxx"
              />
            </div>
            <div>
              <Label className="text-[#7A6F63]">Phone Number ID</Label>
              <Input
                value={settings.whatsappConfig.phoneNumberId}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsappConfig: { ...settings.whatsappConfig, phoneNumberId: e.target.value },
                })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder="xxxxxxxxx"
              />
            </div>
            <div>
              <Label className="text-[#7A6F63]">API Key</Label>
              <Input
                type="password"
                value={settings.whatsappConfig.apiKey}
                onChange={(e) => setSettings({
                  ...settings,
                  whatsappConfig: { ...settings.whatsappConfig, apiKey: e.target.value },
                })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Provider */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#3D3229] flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" />
              SMS Provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'المزود' : 'Provider'}</Label>
              <Select
                value={settings.smsConfig.provider}
                onValueChange={(v) => setSettings({
                  ...settings,
                  smsConfig: { ...settings.smsConfig, provider: v },
                })}
              >
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                  <SelectItem value="messagebird">MessageBird</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#7A6F63]">API Key</Label>
              <Input
                type="password"
                value={settings.smsConfig.apiKey}
                onChange={(e) => setSettings({
                  ...settings,
                  smsConfig: { ...settings.smsConfig, apiKey: e.target.value },
                })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-[#7A6F63]">Sender ID</Label>
              <Input
                value={settings.smsConfig.senderId}
                onChange={(e) => setSettings({
                  ...settings,
                  smsConfig: { ...settings.smsConfig, senderId: e.target.value },
                })}
                className="mt-1.5 border-[#E8DFD0]"
                placeholder="ALMALIKA"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gold-gradient text-white border-0">
          <Settings className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

// Notification History Sub-component
function NotificationHistory() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/send');
      const data = await res.json();
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const getStatusBadge = (notification: Notification) => {
    if (notification.isSent) {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />{language === 'ar' ? 'تم الإرسال' : 'Sent'}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />{language === 'ar' ? 'فشل' : 'Failed'}</Badge>;
  };

  // Calculate stats
  const totalSent = notifications.filter(n => n.isSent).length;
  const smsCount = notifications.filter(n => n.smsSent).length;
  const emailCount = notifications.filter(n => n.emailSent).length;
  const whatsappCount = notifications.filter(n => n.whatsappSent).length;
  const pushCount = notifications.filter(n => n.pushSent).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#D4A853]">{totalSent}</p>
            <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'إجمالي مُرسلة' : 'Total Sent'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{smsCount}</p>
            <p className="text-xs text-[#7A6F63]">SMS</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{emailCount}</p>
            <p className="text-xs text-[#7A6F63]">Email</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{whatsappCount}</p>
            <p className="text-xs text-[#7A6F63]">WhatsApp</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{pushCount}</p>
            <p className="text-xs text-[#7A6F63]">Push</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-[#D4A853]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-50" />
                <p className="text-[#7A6F63]">{language === 'ar' ? 'لا يوجد سجل' : 'No history'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المحتوى' : 'Content'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المستلم' : 'Recipient'}</TableHead>
                    <TableHead>{language === 'ar' ? 'القنوات' : 'Channels'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="text-sm text-[#7A6F63]">
                        {new Date(notification.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{notification.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#3D3229] text-sm">{notification.title}</p>
                          <p className="text-xs text-[#7A6F63] truncate max-w-[200px]">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.customer?.name || notification.driver?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {notification.channels && JSON.parse(notification.channels || '[]').map((ch: string) => (
                            <ChannelBadge key={ch} channel={ch} sent={notification[`${ch}Sent` as keyof Notification] as boolean} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function
function showNotification(toast: ReturnType<typeof useToast>['toast'], title: string, description: string, type: 'success' | 'error' | 'info' = 'info') {
  toast({
    title,
    description,
    variant: type === 'error' ? 'destructive' : 'default',
  });
}

// Main Notifications Tab Component
export default function NotificationsTab() {
  const { t, language, isRTL } = useLanguage();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'templates' | 'send' | 'settings' | 'history'>('dashboard');

  const sectionLabels = {
    dashboard: language === 'ar' ? 'لوحة الإشعارات' : 'Dashboard',
    templates: language === 'ar' ? 'القوالب' : 'Templates',
    send: language === 'ar' ? 'إرسال' : 'Send',
    settings: language === 'ar' ? 'الإعدادات' : 'Settings',
    history: language === 'ar' ? 'السجل' : 'History',
  };

  const sectionIcons = {
    dashboard: <Bell className="h-4 w-4" />,
    templates: <FileText className="h-4 w-4" />,
    send: <Send className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />,
    history: <Clock className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <BellRing className="h-6 w-6 text-[#D4A853]" />
            {language === 'ar' ? 'نظام الإشعارات المتقدم' : 'Advanced Notification System'}
          </h2>
          <p className="text-sm text-[#7A6F63]">{sectionLabels[activeSection]}</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E8DFD0]">
        {(['dashboard', 'templates', 'send', 'settings', 'history'] as const).map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section)}
            className={activeSection === section 
              ? 'bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white' 
              : 'border-[#E8DFD0] text-[#7A6F63] hover:bg-[#F5EDE0]'
            }
          >
            {sectionIcons[section]}
            <span className="ml-2">{sectionLabels[section]}</span>
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'dashboard' && <NotificationDashboard />}
      {activeSection === 'templates' && <NotificationTemplates />}
      {activeSection === 'send' && <SendNotifications />}
      {activeSection === 'settings' && <NotificationSettingsTab />}
      {activeSection === 'history' && <NotificationHistory />}
    </div>
  );
}
