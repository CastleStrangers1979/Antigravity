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
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone, Settings, Bell, MapPin, Wifi, WifiOff, Key, Plus, Trash2, Eye, EyeOff,
  Copy, QrCode, Download, ExternalLink, Apple, Play, RefreshCw, Link2, Shield,
  Activity, Users, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingUp,
  Zap, Globe, Database, Lock, Unlock, Server, Cpu, HardDrive, Upload, Save, Layers
} from 'lucide-react';

// Types
interface PWAConfig {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  startUrl: string;
  scope: string;
}

interface AppFeature {
  id: string;
  name: string;
  nameAr: string;
  enabled: boolean;
  description: string;
  descriptionAr: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
  usageCount: number;
  isActive: boolean;
}

interface AppAnalytics {
  activeInstallations: number;
  totalDownloads: number;
  monthlyActiveUsers: number;
  dailyActiveUsers: number;
  avgSessionDuration: number;
  crashRate: number;
  versionDistribution: { version: string; count: number; percentage: number }[];
  recentCrashes: { id: string; version: string; device: string; error: string; timestamp: string }[];
}

interface DeepLink {
  id: string;
  scheme: string;
  path: string;
  action: string;
  isActive: boolean;
}

interface StoreLinks {
  appleAppStore: string;
  googlePlayStore: string;
  qrCodeUrl: string;
  totalDownloads: number;
  appleDownloads: number;
  googleDownloads: number;
}

// Initial data
const initialPWAConfig: PWAConfig = {
  appName: 'Al-Malika Bakery',
  shortName: 'Al-Malika',
  description: 'Order authentic Syrian bread and pastries from Al-Malika Bakery in the Netherlands',
  themeColor: '#2D5A3D',
  backgroundColor: '#FFFEF7',
  displayMode: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/',
};

const initialFeatures: AppFeature[] = [
  { id: '1', name: 'Push Notifications', nameAr: 'الإشعارات الفورية', enabled: true, description: 'Receive order updates and promotions', descriptionAr: 'تلقي تحديثات الطلبات والعروض' },
  { id: '2', name: 'Offline Mode', nameAr: 'الوضع بدون اتصال', enabled: true, description: 'Browse products and view orders offline', descriptionAr: 'تصفح المنتجات وعرض الطلبات بدون اتصال' },
  { id: '3', name: 'Location Services', nameAr: 'خدمات الموقع', enabled: true, description: 'Track deliveries and find nearby stores', descriptionAr: 'تتبع التوصيلات والعثور على المتاجر القريبة' },
  { id: '4', name: 'Camera Integration', nameAr: 'تكامل الكاميرا', enabled: false, description: 'Scan QR codes for quick ordering', descriptionAr: 'مسح رموز QR للطلب السريع' },
  { id: '5', name: 'Biometric Login', nameAr: 'تسجيل الدخول البيومتري', enabled: true, description: 'Secure login with fingerprint or face', descriptionAr: 'تسجيل دخول آمن بالبصمة أو الوجه' },
  { id: '6', name: 'Dark Mode', nameAr: 'الوضع الداكن', enabled: true, description: 'Switch between light and dark themes', descriptionAr: 'التبديل بين السمات الفاتحة والداكنة' },
];

const initialAnalytics: AppAnalytics = {
  activeInstallations: 1247,
  totalDownloads: 3421,
  monthlyActiveUsers: 892,
  dailyActiveUsers: 234,
  avgSessionDuration: 8.5,
  crashRate: 0.3,
  versionDistribution: [
    { version: '2.1.0', count: 856, percentage: 68.7 },
    { version: '2.0.5', count: 234, percentage: 18.8 },
    { version: '2.0.0', count: 98, percentage: 7.9 },
    { version: '1.9.5', count: 59, percentage: 4.6 },
  ],
  recentCrashes: [
    { id: '1', version: '2.1.0', device: 'iPhone 14 Pro', error: 'NullPointerException in OrderFragment', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', version: '2.0.5', device: 'Samsung Galaxy S23', error: 'Network timeout on checkout', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', version: '2.1.0', device: 'iPad Pro', error: 'Memory warning in ProductListActivity', timestamp: new Date(Date.now() - 14400000).toISOString() },
  ],
};

const initialDeepLinks: DeepLink[] = [
  { id: '1', scheme: 'almalika', path: '/product/:id', action: 'VIEW_PRODUCT', isActive: true },
  { id: '2', scheme: 'almalika', path: '/order/:id', action: 'VIEW_ORDER', isActive: true },
  { id: '3', scheme: 'almalika', path: '/category/:name', action: 'VIEW_CATEGORY', isActive: true },
  { id: '4', scheme: 'https', path: 'al-malika.nl/app/promo/:code', action: 'APPLY_PROMO', isActive: true },
];

const initialStoreLinks: StoreLinks = {
  appleAppStore: 'https://apps.apple.com/nl/app/al-malika-bakery/id1234567890',
  googlePlayStore: 'https://play.google.com/store/apps/details?id=nl.almalika.bakery',
  qrCodeUrl: '/qr-app-download.png',
  totalDownloads: 3421,
  appleDownloads: 1456,
  googleDownloads: 1965,
};

export default function MobileAppTab() {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();

  // State
  const [pwaConfig, setPWAConfig] = useState<PWAConfig>(initialPWAConfig);
  const [features, setFeatures] = useState<AppFeature[]>(initialFeatures);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [analytics, setAnalytics] = useState<AppAnalytics>(initialAnalytics);
  const [deepLinks, setDeepLinks] = useState<DeepLink[]>(initialDeepLinks);
  const [storeLinks, setStoreLinks] = useState<StoreLinks>(initialStoreLinks);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('pwa');

  // Dialog states
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isDeepLinkDialogOpen, setIsDeepLinkDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newKeyExpiry, setNewKeyExpiry] = useState('never');
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, keysRes] = await Promise.all([
        fetch('/api/mobile/config'),
        fetch('/api/mobile/api-keys'),
      ]);
      
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.pwaConfig) setPWAConfig(configData.pwaConfig);
        if (configData.features) setFeatures(configData.features);
        if (configData.deepLinks) setDeepLinks(configData.deepLinks);
        if (configData.storeLinks) setStoreLinks(configData.storeLinks);
      }
      
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setApiKeys(keysData);
      }
    } catch (error) {
      console.error('Error fetching mobile config:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Generate API Key
  const generateAPIKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'alm_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  // Handle create API key
  const handleCreateKey = async () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: generateAPIKey(),
      permissions: newKeyPermissions,
      createdAt: new Date().toISOString(),
      expiresAt: newKeyExpiry === 'never' ? null : new Date(Date.now() + parseInt(newKeyExpiry) * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: null,
      usageCount: 0,
      isActive: true,
    };

    try {
      await fetch('/api/mobile/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey),
      });
      setApiKeys([...apiKeys, newKey]);
      setIsKeyDialogOpen(false);
      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setNewKeyExpiry('never');
      showNotification(language === 'ar' ? 'تم إنشاء المفتاح بنجاح' : 'API key created successfully', 'success');
    } catch (error) {
      console.error('Error creating API key:', error);
      showNotification(language === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
    }
  };

  // Handle delete API key
  const handleDeleteKey = async (keyId: string) => {
    try {
      await fetch(`/api/mobile/api-keys?keyId=${keyId}`, { method: 'DELETE' });
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      showNotification(language === 'ar' ? 'تم حذف المفتاح' : 'API key deleted', 'success');
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  // Handle toggle feature
  const handleToggleFeature = async (featureId: string) => {
    const updatedFeatures = features.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    setFeatures(updatedFeatures);
    
    try {
      await fetch('/api/mobile/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: updatedFeatures }),
      });
    } catch (error) {
      console.error('Error updating feature:', error);
    }
  };

  // Handle save PWA config
  const handleSavePWAConfig = async () => {
    try {
      await fetch('/api/mobile/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pwaConfig }),
      });
      showNotification(language === 'ar' ? 'تم حفظ التكوين' : 'Configuration saved', 'success');
    } catch (error) {
      console.error('Error saving PWA config:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification(language === 'ar' ? 'تم النسخ' : 'Copied to clipboard', 'success');
  };

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error') => {
    toast({
      title: type === 'success' ? (language === 'ar' ? 'نجاح' : 'Success') : (language === 'ar' ? 'خطأ' : 'Error'),
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  // Section navigation items
  const sections = [
    { id: 'pwa', icon: Smartphone, label: language === 'ar' ? 'تكوين PWA' : 'PWA Config' },
    { id: 'features', icon: Zap, label: language === 'ar' ? 'ميزات التطبيق' : 'App Features' },
    { id: 'apikeys', icon: Key, label: language === 'ar' ? 'مفاتيح API' : 'API Keys' },
    { id: 'analytics', icon: BarChart3, label: language === 'ar' ? 'تحليلات' : 'Analytics' },
    { id: 'deeplinks', icon: Link2, label: language === 'ar' ? 'الروابط العميقة' : 'Deep Links' },
    { id: 'store', icon: Download, label: language === 'ar' ? 'روابط المتجر' : 'Store Links' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-[#D4A853]" />
            {language === 'ar' ? 'إدارة التطبيق المحمول' : 'Mobile App Management'}
          </h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'PWA وإعدادات التطبيق و API' : 'PWA, App Settings & API'}</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
          <RefreshCw className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id 
              ? 'bg-[#2D5A3D] text-white' 
              : 'border-[#E8DFD0] text-[#7A6F63] hover:border-[#D4A853]'
            }
          >
            <section.icon className="h-4 w-4 mr-2" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* PWA Configuration Section */}
      {activeSection === 'pwa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'معلومات التطبيق' : 'App Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم التطبيق' : 'App Name'}</Label>
                <Input
                  value={pwaConfig.appName}
                  onChange={(e) => setPWAConfig({ ...pwaConfig, appName: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]"
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاسم المختصر' : 'Short Name'}</Label>
                <Input
                  value={pwaConfig.shortName}
                  onChange={(e) => setPWAConfig({ ...pwaConfig, shortName: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]"
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  value={pwaConfig.description}
                  onChange={(e) => setPWAConfig({ ...pwaConfig, description: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إعدادات العرض' : 'Display Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'وضع العرض' : 'Display Mode'}</Label>
                <Select
                  value={pwaConfig.displayMode}
                  onValueChange={(v) => setPWAConfig({ ...pwaConfig, displayMode: v as PWAConfig['displayMode'] })}
                >
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">{language === 'ar' ? 'مستقل' : 'Standalone'}</SelectItem>
                    <SelectItem value="fullscreen">{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</SelectItem>
                    <SelectItem value="minimal-ui">{language === 'ar' ? 'واجهة مصغرة' : 'Minimal UI'}</SelectItem>
                    <SelectItem value="browser">{language === 'ar' ? 'المتصفح' : 'Browser'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاتجاه' : 'Orientation'}</Label>
                <Select
                  value={pwaConfig.orientation}
                  onValueChange={(v) => setPWAConfig({ ...pwaConfig, orientation: v as PWAConfig['orientation'] })}
                >
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{language === 'ar' ? 'أي' : 'Any'}</SelectItem>
                    <SelectItem value="portrait">{language === 'ar' ? 'عمودي' : 'Portrait'}</SelectItem>
                    <SelectItem value="landscape">{language === 'ar' ? 'أفقي' : 'Landscape'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'لون السمة' : 'Theme Color'}</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={pwaConfig.themeColor}
                      onChange={(e) => setPWAConfig({ ...pwaConfig, themeColor: e.target.value })}
                      className="w-12 h-10 p-1 border-[#E8DFD0]"
                    />
                    <Input
                      value={pwaConfig.themeColor}
                      onChange={(e) => setPWAConfig({ ...pwaConfig, themeColor: e.target.value })}
                      className="flex-1 border-[#E8DFD0]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'لون الخلفية' : 'Background'}</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="color"
                      value={pwaConfig.backgroundColor}
                      onChange={(e) => setPWAConfig({ ...pwaConfig, backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 border-[#E8DFD0]"
                    />
                    <Input
                      value={pwaConfig.backgroundColor}
                      onChange={(e) => setPWAConfig({ ...pwaConfig, backgroundColor: e.target.value })}
                      className="flex-1 border-[#E8DFD0]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Icons */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'أيقونات التطبيق' : 'App Icons'}
              </CardTitle>
              <CardDescription className="text-[#7A6F63]">
                {language === 'ar' ? 'أحجام مطلوبة: 192x192, 512x512' : 'Required sizes: 192x192, 512x512'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { size: '72x72', label: 'Small' },
                  { size: '192x192', label: 'Medium' },
                  { size: '512x512', label: 'Large' },
                ].map((icon) => (
                  <div key={icon.size} className="text-center p-4 bg-[#F5EDE0] rounded-xl">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4A853] to-[#B8923F] rounded-xl flex items-center justify-center text-white font-bold text-xs">
                      {icon.size}
                    </div>
                    <p className="text-xs text-[#7A6F63] mt-2">{icon.label}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-[#2D5A3D]">
                      <Upload className="h-3 w-3 mr-1" />
                      {language === 'ar' ? 'رفع' : 'Upload'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* URL Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Link2 className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إعدادات URL' : 'URL Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'رابط البداية' : 'Start URL'}</Label>
                <Input
                  value={pwaConfig.startUrl}
                  onChange={(e) => setPWAConfig({ ...pwaConfig, startUrl: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]"
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{language === 'ar' ? 'النطاق' : 'Scope'}</Label>
                <Input
                  value={pwaConfig.scope}
                  onChange={(e) => setPWAConfig({ ...pwaConfig, scope: e.target.value })}
                  className="mt-1.5 border-[#E8DFD0]"
                />
              </div>
              <Button onClick={handleSavePWAConfig} className="w-full gold-gradient text-white border-0">
                <Save className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حفظ التكوين' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* App Features Section */}
      {activeSection === 'features' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Toggles */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'ميزات التطبيق' : 'App Features'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-4 rounded-xl border transition-all ${
                      feature.enabled
                        ? 'bg-[#FFFEF7] border-[#D4A853] shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#3D3229]">
                          {language === 'ar' ? feature.nameAr : feature.name}
                        </p>
                        <p className="text-sm text-[#7A6F63]">
                          {language === 'ar' ? feature.descriptionAr : feature.description}
                        </p>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => handleToggleFeature(feature.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Offline Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إعدادات عدم الاتصال' : 'Offline Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'التخزين المؤقت' : 'Caching'}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'تخزين المنتجات محلياً' : 'Cache products locally'}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'الطلبات المحفوظة' : 'Saved Orders'}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'حفظ الطلبات للاتصال لاحقاً' : 'Queue orders when offline'}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700">
                  <HardDrive className="h-5 w-5" />
                  <span className="font-medium">{language === 'ar' ? 'حجم ذاكرة التخزين المؤقت' : 'Cache Size'}</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-2">24.5 MB</p>
                <Progress value={24.5} max={50} className="mt-2 h-2" />
                <p className="text-xs text-blue-600 mt-1">{language === 'ar' ? 'من 50 MB المتاحة' : 'of 50 MB available'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'تحديثات الطلبات' : 'Order Updates'}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'العروض الترويجية' : 'Promotions'}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                <div>
                  <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">{language === 'ar' ? 'الأجهزة المسجلة' : 'Registered Devices'}</p>
                    <p className="text-2xl font-bold text-green-600">892</p>
                  </div>
                  <Bell className="h-10 w-10 text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Keys Section */}
      {activeSection === 'apikeys' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مفاتيح نشطة' : 'Active Keys'}</p>
                    <p className="text-2xl font-bold text-[#2D5A3D]">{apiKeys.filter(k => k.isActive).length}</p>
                  </div>
                  <Key className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي الاستخدام' : 'Total Usage'}</p>
                    <p className="text-2xl font-bold text-[#D4A853]">{apiKeys.reduce((sum, k) => sum + k.usageCount, 0)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-amber-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مفاتيح منتهية' : 'Expired Keys'}</p>
                    <p className="text-2xl font-bold text-red-600">{apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Keys List */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'مفاتيح API' : 'API Keys'}
                </CardTitle>
                <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="green-gradient text-white border-0">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'إنشاء مفتاح' : 'Generate Key'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
                    <DialogHeader>
                      <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إنشاء مفتاح API جديد' : 'Generate New API Key'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم المفتاح' : 'Key Name'}</Label>
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder={language === 'ar' ? 'مثال: تطبيق الموبايل' : 'e.g., Mobile App'}
                          className="mt-1.5 border-[#E8DFD0]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</Label>
                        <div className="flex gap-2 mt-2">
                          {['read', 'write', 'admin'].map((perm) => (
                            <Badge
                              key={perm}
                              variant={newKeyPermissions.includes(perm) ? 'default' : 'outline'}
                              className={`cursor-pointer ${newKeyPermissions.includes(perm) ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}`}
                              onClick={() => {
                                if (newKeyPermissions.includes(perm)) {
                                  setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm));
                                } else {
                                  setNewKeyPermissions([...newKeyPermissions, perm]);
                                }
                              }}
                            >
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiration'}</Label>
                        <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                          <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">{language === 'ar' ? 'لا ينتهي' : 'Never'}</SelectItem>
                            <SelectItem value="30">{language === 'ar' ? '30 يوم' : '30 days'}</SelectItem>
                            <SelectItem value="90">{language === 'ar' ? '90 يوم' : '90 days'}</SelectItem>
                            <SelectItem value="365">{language === 'ar' ? 'سنة' : '1 year'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button onClick={handleCreateKey} className="gold-gradient text-white border-0">
                        {language === 'ar' ? 'إنشاء' : 'Generate'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-12 text-[#7A6F63]">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد مفاتيح API' : 'No API keys yet'}</p>
                  <p className="text-sm">{language === 'ar' ? 'أنشئ مفتاحاً للبدء' : 'Generate one to get started'}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                        <TableHead>{language === 'ar' ? 'المفتاح' : 'Key'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الاستخدام' : 'Usage'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {showKeyValues[key.id] ? key.key : `${key.key.slice(0, 12)}...`}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowKeyValues({ ...showKeyValues, [key.id]: !showKeyValues[key.id] })}
                              >
                                {showKeyValues[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {key.permissions.map((p) => (
                                <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{key.usageCount}</TableCell>
                          <TableCell>
                            <Badge className={key.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}>
                              {key.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(key.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'التثبيتات النشطة' : 'Active Installations'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{analytics.activeInstallations.toLocaleString()}</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-[#D4A853]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'المستخدمون النشطون شهرياً' : 'Monthly Active'}</p>
                    <p className="text-2xl font-bold text-[#2D5A3D]">{analytics.monthlyActiveUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوسط الجلسة' : 'Avg Session'}</p>
                    <p className="text-2xl font-bold text-[#D4A853]">{analytics.avgSessionDuration}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل الأعطال' : 'Crash Rate'}</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.crashRate}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version Distribution & Crashes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version Distribution */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'توزيع الإصدارات' : 'Version Distribution'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.versionDistribution.map((v) => (
                    <div key={v.version} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#3D3229]">v{v.version}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#7A6F63]">{v.count} {language === 'ar' ? 'جهاز' : 'devices'}</span>
                          <Badge variant="secondary">{v.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                      <Progress value={v.percentage} className="h-2 bg-[#F5EDE0]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Crashes */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {language === 'ar' ? 'الأعطال الأخيرة' : 'Recent Crashes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {analytics.recentCrashes.map((crash) => (
                      <div key={crash.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-800 text-sm">{crash.error}</p>
                            <p className="text-xs text-red-600 mt-1">{crash.device} - v{crash.version}</p>
                          </div>
                          <span className="text-xs text-red-500">
                            {new Date(crash.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* User Engagement */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'مقاييس تفاعل المستخدم' : 'User Engagement Metrics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#D4A853]">{analytics.dailyActiveUsers}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مستخدمون يوميون' : 'Daily Active'}</p>
                </div>
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#2D5A3D]">{analytics.monthlyActiveUsers}</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'مستخدمون شهريون' : 'Monthly Active'}</p>
                </div>
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-[#3D3229]">4.7</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'متوسط التقييم' : 'Avg Rating'}</p>
                </div>
                <div className="p-4 bg-[#F5EDE0] rounded-xl text-center">
                  <p className="text-3xl font-bold text-blue-600">72%</p>
                  <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'معدل الاحتفاظ' : 'Retention Rate'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deep Links Section */}
      {activeSection === 'deeplinks' && (
        <div className="space-y-6">
          {/* Deep Links Configuration */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'الروابط العميقة' : 'Deep Links'}
                </CardTitle>
                <Button className="green-gradient text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'المخطط' : 'Scheme'}</TableHead>
                      <TableHead>{language === 'ar' ? 'المسار' : 'Path'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deepLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{link.scheme}://</code>
                        </TableCell>
                        <TableCell>{link.path}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{link.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={link.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}>
                            {link.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Universal Links & App Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* iOS Universal Links */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Apple className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'روابط iOS العامة' : 'iOS Universal Links'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#F5EDE0] rounded-xl">
                  <Label className="text-[#7A6F63] text-xs">Associated Domains</Label>
                  <code className="block text-sm mt-1">applinks:al-malika.nl</code>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Label className="text-[#7A6F63] text-xs">apple-app-site-association</Label>
                  <pre className="text-xs mt-2 overflow-x-auto">
{`{
  "applinks": {
    "details": [{
      "appIDs": ["TEAMID.nl.almalika.bakery"],
      "components": [{
        "/": "/app/*",
        "comment": "All app routes"
      }]
    }]
  }
}`}
                  </pre>
                </div>
                <Button variant="outline" className="w-full border-[#D4A853] text-[#D4A853]">
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تنزيل الملف' : 'Download File'}
                </Button>
              </CardContent>
            </Card>

            {/* Android App Links */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Play className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'روابط تطبيق Android' : 'Android App Links'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-[#F5EDE0] rounded-xl">
                  <Label className="text-[#7A6F63] text-xs">Intent Filter</Label>
                  <code className="block text-sm mt-1">android:autoVerify="true"</code>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Label className="text-[#7A6F63] text-xs">assetlinks.json</Label>
                  <pre className="text-xs mt-2 overflow-x-auto">
{`[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "nl.almalika.bakery",
    "sha256_cert_fingerprints": ["..."]
  }
}]`}
                  </pre>
                </div>
                <Button variant="outline" className="w-full border-[#D4A853] text-[#D4A853]">
                  <Download className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تنزيل الملف' : 'Download File'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Store Links Section */}
      {activeSection === 'store' && (
        <div className="space-y-6">
          {/* Download Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إجمالي التنزيلات' : 'Total Downloads'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{storeLinks.totalDownloads.toLocaleString()}</p>
                  </div>
                  <Download className="h-8 w-8 text-[#D4A853]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'App Store' : 'App Store'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{storeLinks.appleDownloads}</p>
                  </div>
                  <Apple className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'Google Play' : 'Google Play'}</p>
                    <p className="text-2xl font-bold text-[#3D3229]">{storeLinks.googleDownloads}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Links Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store URLs */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'روابط المتجر' : 'Store Links'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">Apple App Store</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={storeLinks.appleAppStore}
                      onChange={(e) => setStoreLinks({ ...storeLinks, appleAppStore: e.target.value })}
                      className="border-[#E8DFD0]"
                    />
                    <Button variant="outline" size="icon" onClick={() => window.open(storeLinks.appleAppStore, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">Google Play Store</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={storeLinks.googlePlayStore}
                      onChange={(e) => setStoreLinks({ ...storeLinks, googlePlayStore: e.target.value })}
                      className="border-[#E8DFD0]"
                    />
                    <Button variant="outline" size="icon" onClick={() => window.open(storeLinks.googlePlayStore, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'رمز QR للتنزيل' : 'Download QR Code'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-white border-2 border-[#E8DFD0] rounded-xl flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-[#3D3229]" />
                  </div>
                  <p className="text-sm text-[#7A6F63] mt-3">{language === 'ar' ? 'امسح للتنزيل' : 'Scan to Download'}</p>
                  <Button variant="outline" className="mt-3 border-[#D4A853] text-[#D4A853]">
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تنزيل رمز QR' : 'Download QR Code'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Statistics Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#D4A853]" />
                {language === 'ar' ? 'إحصائيات التنزيل' : 'Download Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => {
                  const downloads = Math.floor(Math.random() * 500) + 200;
                  const maxDownloads = 700;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-[#D4A853] to-[#B8923F] rounded-t"
                        style={{ height: `${(downloads / maxDownloads) * 100}%` }}
                      />
                      <span className="text-xs text-[#7A6F63] mt-2">{month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
