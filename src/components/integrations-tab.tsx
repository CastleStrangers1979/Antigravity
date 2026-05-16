 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Link2, Building2, CreditCard, Truck, FileSpreadsheet, FileText, FileDown,
  Settings, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink,
  Key, Calendar, Download, Upload, Activity, Zap, Globe, Shield, Database,
  ChevronRight, Info, Trash2, Edit, Plus, Copy, Eye, EyeOff
} from 'lucide-react';

// Types
interface Integration {
  id: string;
  name: string;
  type: 'accounting' | 'pos' | 'delivery' | 'export';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  companyId?: string;
  lastSync?: string;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  syncLogs?: SyncLog[];
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'sync' | 'export' | 'import';
  status: 'success' | 'failed' | 'partial' | 'in_progress';
  recordsProcessed: number;
  recordsFailed: number;
  message: string;
  details?: string;
}

interface ScheduledExport {
  id: string;
  name: string;
  format: 'excel' | 'pdf' | 'csv';
  type: 'orders' | 'products' | 'customers' | 'financial' | 'inventory';
  schedule: 'daily' | 'weekly' | 'monthly';
  time: string;
  email: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
}

// Integration Card Component
function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onSync,
  onConfigure 
}: { 
  integration: { 
    id: string;
    name: string;
    provider: string;
    description: string;
    icon: React.ReactNode;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    features: string[];
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onConfigure: () => void;
}) {
  const { t } = useLanguage();
  
  const statusConfig = {
    connected: { color: 'bg-green-500', label: t('accounting.connected'), textColor: 'text-green-600' },
    disconnected: { color: 'bg-gray-400', label: t('accounting.disconnected'), textColor: 'text-gray-500' },
    error: { color: 'bg-red-500', label: t('quality.failed'), textColor: 'text-red-600' },
    pending: { color: 'bg-amber-500', label: t('orders.pending'), textColor: 'text-amber-600' },
  };
  
  const config = statusConfig[integration.status];
  
  return (
    <Card className="card-hover border-0 shadow-md bg-white overflow-hidden">
      <div className={`h-1.5 ${integration.status === 'connected' ? 'green-gradient' : 'bg-gray-300'}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${integration.status === 'connected' ? 'bg-[#2D5A3D]/10' : 'bg-gray-100'}`}>
              {integration.icon}
            </div>
            <div>
              <h3 className="font-bold text-[#3D3229]">{integration.name}</h3>
              <p className="text-sm text-[#7A6F63]">{integration.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
            <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
          </div>
        </div>
        
        <p className="text-sm text-[#7A6F63] mb-4">{integration.description}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {integration.features.map((feature, idx) => (
            <Badge key={idx} variant="outline" className="text-xs border-[#E8DFD0] text-[#7A6F63]">
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          {integration.status === 'connected' ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white"
                onClick={onSync}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                {t('accounting.sync')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#E8DFD0] text-[#7A6F63]"
                onClick={onConfigure}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 text-red-500 hover:bg-red-50"
                onClick={onDisconnect}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button 
              className="w-full green-gradient text-white border-0"
              onClick={onConnect}
            >
              <Link2 className="h-4 w-4 mr-2" />
              {t('accounting.connect')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Sync Logs Component
function SyncLogsPanel({ logs }: { logs: SyncLog[] }) {
  const { t } = useLanguage();
  
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#D4A853]" />
          {t('integrations.syncLogs')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`p-3 rounded-lg border ${
                  log.status === 'success' 
                    ? 'border-green-200 bg-green-50' 
                    : log.status === 'failed' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : log.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="font-medium text-[#3D3229]">
                      {log.type === 'sync' ? t('integrations.sync') : log.type === 'export' ? t('accounting.exportData') : t('integrations.import')}
                    </span>
                  </div>
                  <span className="text-xs text-[#7A6F63]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#7A6F63] mb-1">{log.message}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">{t('integrations.recordsProcessed')}: {log.recordsProcessed}</span>
                  {log.recordsFailed > 0 && (
                    <span className="text-red-600">{t('integrations.recordsFailed')}: {log.recordsFailed}</span>
                  )}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-8 text-[#7A6F63]">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Export Panel Component
function ExportPanel() {
  const { t } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [exportType, setExportType] = useState<'orders' | 'products' | 'customers' | 'financial' | 'inventory'>('orders');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: exportFormat,
          type: exportType,
          dateRange,
        }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setExporting(false);
  };
  
  const formatIcons = {
    excel: <FileSpreadsheet className="h-5 w-5" />,
    pdf: <FileText className="h-5 w-5" />,
    csv: <FileDown className="h-5 w-5" />,
  };
  
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
          <Download className="h-5 w-5 text-[#D4A853]" />
          {t('accounting.exportData')}
        </CardTitle>
        <CardDescription className="text-[#7A6F63]">
          {t('integrations.exportDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-[#7A6F63] mb-2 block">{t('integrations.dataType')}</Label>
          <Select value={exportType} onValueChange={(v: typeof exportType) => setExportType(v)}>
            <SelectTrigger className="border-[#E8DFD0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="orders">{t('nav.orders')}</SelectItem>
              <SelectItem value="products">{t('nav.products')}</SelectItem>
              <SelectItem value="customers">{t('orders.customer')}</SelectItem>
              <SelectItem value="financial">{t('accounting.title')}</SelectItem>
              <SelectItem value="inventory">{t('nav.inventory')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-[#7A6F63] mb-2 block">{t('integrations.format')}</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['excel', 'pdf', 'csv'] as const).map((format) => (
              <Button
                key={format}
                variant={exportFormat === format ? 'default' : 'outline'}
                className={`h-16 flex-col gap-1 ${
                  exportFormat === format 
                    ? 'bg-[#2D5A3D] text-white' 
                    : 'border-[#E8DFD0] text-[#7A6F63] hover:border-[#D4A853]'
                }`}
                onClick={() => setExportFormat(format)}
              >
                {formatIcons[format]}
                <span className="text-xs uppercase">{format}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[#7A6F63] mb-2 block">{t('integrations.startDate')}</Label>
            <Input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="border-[#E8DFD0]" 
            />
          </div>
          <div>
            <Label className="text-[#7A6F63] mb-2 block">{t('integrations.endDate')}</Label>
            <Input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="border-[#E8DFD0]" 
            />
          </div>
        </div>
        
        <Button 
          className="w-full gold-gradient text-white border-0"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {t('integrations.exporting')}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {t('integrations.downloadExport')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Scheduled Exports Component
function ScheduledExportsPanel() {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    format: 'excel' as const,
    type: 'orders' as const,
    schedule: 'daily' as const,
    time: '08:00',
    email: '',
  });
  
  useEffect(() => {
    // Load mock scheduled exports
    setSchedules([
      {
        id: '1',
        name: 'Daily Orders Report',
        format: 'excel',
        type: 'orders',
        schedule: 'daily',
        time: '08:00',
        email: 'admin@almalika.nl',
        isActive: true,
        lastRun: new Date(Date.now() - 86400000).toISOString(),
        nextRun: new Date(Date.now() + 3600000).toISOString(),
      },
      {
        id: '2',
        name: 'Weekly Financial Summary',
        format: 'pdf',
        type: 'financial',
        schedule: 'weekly',
        time: '09:00',
        email: 'finance@almalika.nl',
        isActive: true,
        lastRun: new Date(Date.now() - 604800000).toISOString(),
        nextRun: new Date(Date.now() + 259200000).toISOString(),
      },
    ]);
  }, []);
  
  const handleAddSchedule = async () => {
    const newSchedule: ScheduledExport = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      nextRun: new Date(Date.now() + 86400000).toISOString(),
    };
    setSchedules([...schedules, newSchedule]);
    setIsDialogOpen(false);
    setFormData({ name: '', format: 'excel', type: 'orders', schedule: 'daily', time: '08:00', email: '' });
  };
  
  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? {...s, isActive: !s.isActive} : s));
  };
  
  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };
  
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4A853]" />
            {t('integrations.scheduledExports')}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="green-gradient text-white border-0">
                <Plus className="h-4 w-4 mr-1" />
                {t('integrations.addSchedule')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('integrations.addSchedule')}</DialogTitle>
                <DialogDescription className="text-[#7A6F63]">
                  {t('integrations.scheduleDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('integrations.scheduleName')}</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                    placeholder="Daily Orders Report"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#7A6F63]">{t('integrations.dataType')}</Label>
                    <Select value={formData.type} onValueChange={(v: typeof formData.type) => setFormData({...formData, type: v})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orders">{t('nav.orders')}</SelectItem>
                        <SelectItem value="products">{t('nav.products')}</SelectItem>
                        <SelectItem value="customers">{t('orders.customer')}</SelectItem>
                        <SelectItem value="financial">{t('accounting.title')}</SelectItem>
                        <SelectItem value="inventory">{t('nav.inventory')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('integrations.format')}</Label>
                    <Select value={formData.format} onValueChange={(v: typeof formData.format) => setFormData({...formData, format: v})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#7A6F63]">{t('integrations.frequency')}</Label>
                    <Select value={formData.schedule} onValueChange={(v: typeof formData.schedule) => setFormData({...formData, schedule: v})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t('integrations.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('integrations.weekly')}</SelectItem>
                        <SelectItem value="monthly">{t('integrations.monthly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('orders.time')}</Label>
                    <Input 
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="mt-1.5 border-[#E8DFD0]" 
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('drivers.email')}</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1.5 border-[#E8DFD0]" 
                    placeholder="admin@almalika.nl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#E8DFD0]">
                  {t('actions.cancel')}
                </Button>
                <Button onClick={handleAddSchedule} className="gold-gradient text-white border-0">
                  {t('actions.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className={`p-3 rounded-lg border ${schedule.isActive ? 'border-[#E8DFD0] bg-[#FFFEF7]' : 'border-gray-200 bg-gray-50 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${schedule.isActive ? 'bg-[#D4A853]/10' : 'bg-gray-100'}`}>
                      {schedule.format === 'excel' ? (
                        <FileSpreadsheet className="h-4 w-4 text-[#D4A853]" />
                      ) : schedule.format === 'pdf' ? (
                        <FileText className="h-4 w-4 text-[#D4A853]" />
                      ) : (
                        <FileDown className="h-4 w-4 text-[#D4A853]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#3D3229]">{schedule.name}</h4>
                      <p className="text-xs text-[#7A6F63]">
                        {schedule.schedule === 'daily' ? t('integrations.daily') : schedule.schedule === 'weekly' ? t('integrations.weekly') : t('integrations.monthly')} at {schedule.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={schedule.isActive} 
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => deleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-[#7A6F63]">
                  <span>{t('integrations.nextRun')}: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : '-'}</span>
                </div>
              </div>
            ))}
            {schedules.length === 0 && (
              <div className="text-center py-8 text-[#7A6F63]">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// API Key Management Component
function APIKeyManagement() {
  const { t } = useLanguage();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'pk_live_1234567890abcdef', createdAt: new Date().toISOString(), lastUsed: new Date().toISOString() },
    { id: '2', name: 'Test API Key', key: 'pk_test_0987654321fedcba', createdAt: new Date(Date.now() - 86400000).toISOString(), lastUsed: new Date(Date.now() - 3600000).toISOString() },
  ]);
  
  const generateNewKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: `API Key ${apiKeys.length + 1}`,
      key: `pk_live_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
    setApiKeys([...apiKeys, newKey]);
  };
  
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
  };
  
  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };
  
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
            <Key className="h-5 w-5 text-[#D4A853]" />
            {t('integrations.apiKeys')}
          </CardTitle>
          <Button size="sm" className="green-gradient text-white border-0" onClick={generateNewKey}>
            <Plus className="h-4 w-4 mr-1" />
            {t('integrations.generateKey')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-3 rounded-lg border border-[#E8DFD0] bg-[#FFFEF7]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#3D3229]">{apiKey.name}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="text-[#7A6F63] hover:text-[#D4A853]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowKeys({...showKeys, [apiKey.id]: !showKeys[apiKey.id]})}
                    className="text-[#7A6F63] hover:text-[#D4A853]"
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteKey(apiKey.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <code className="text-sm font-mono text-[#2D5A3D] bg-[#F5EDE0] px-2 py-1 rounded block overflow-x-auto">
                {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(apiKey.key.length)}
              </code>
              <div className="flex gap-4 mt-2 text-xs text-[#7A6F63]">
                <span>{t('integrations.created')}: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                <span>{t('integrations.lastUsed')}: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Setup Wizard Dialog
function SetupWizardDialog({ 
  open, 
  onOpenChange, 
  integration,
  onComplete 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: { name: string; provider: string } | null;
  onComplete: (config: { apiKey: string; apiSecret: string; endpoint: string; companyId: string }) => void;
}) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    companyId: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
  
  const handleTest = async () => {
    setTesting(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult('success');
    setTesting(false);
  };
  
  const handleComplete = () => {
    onComplete(formData);
    onOpenChange(false);
    setStep(1);
    setFormData({ apiKey: '', apiSecret: '', endpoint: '', companyId: '' });
    setTestResult(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
        <DialogHeader>
          <DialogTitle className="text-[#3D3229] flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#D4A853]" />
            {t('integrations.setup')} - {integration?.name}
          </DialogTitle>
          <DialogDescription className="text-[#7A6F63]">
            {t('integrations.setupDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-1.5 rounded-full ${s <= step ? 'green-gradient' : 'bg-gray-200'}`} 
              />
            ))}
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#3D3229]">{t('integrations.apiCredentials')}</h3>
              <div>
                <Label className="text-[#7A6F63]">API Key</Label>
                <Input 
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                  placeholder="Enter your API key"
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">API Secret</Label>
                <Input 
                  type="password"
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                  placeholder="Enter your API secret"
                />
              </div>
              <div className="p-3 rounded-lg bg-[#F5EDE0] flex gap-2">
                <Info className="h-5 w-5 text-[#D4A853] flex-shrink-0" />
                <p className="text-sm text-[#7A6F63]">
                  {t('integrations.apiHelp')}
                </p>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#3D3229]">{t('integrations.connectionSettings')}</h3>
              <div>
                <Label className="text-[#7A6F63]">{t('integrations.endpoint')}</Label>
                <Input 
                  value={formData.endpoint}
                  onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                  placeholder="https://api.example.com"
                />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('integrations.companyId')}</Label>
                <Input 
                  value={formData.companyId}
                  onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                  className="mt-1.5 border-[#E8DFD0]" 
                  placeholder="123456"
                />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[#3D3229]">{t('integrations.testConnection')}</h3>
              <Button 
                onClick={handleTest}
                disabled={testing}
                className="w-full green-gradient text-white border-0"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('integrations.testing')}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t('integrations.testConnection')}
                  </>
                )}
              </Button>
              
              {testResult === 'success' && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">{t('integrations.testSuccess')}</p>
                </div>
              )}
              
              {testResult === 'failed' && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{t('integrations.testFailed')}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-[#E8DFD0]">
              {t('integrations.previous')}
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              className="gold-gradient text-white border-0"
              disabled={step === 1 && (!formData.apiKey || !formData.apiSecret)}
            >
              {t('integrations.next')}
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={!testResult}
              className="green-gradient text-white border-0"
            >
              {t('accounting.connect')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Integrations Tab Component
export default function IntegrationsTab() {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState('accounting');
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<{ name: string; provider: string } | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  
  useEffect(() => {
    // Load mock sync logs
    setSyncLogs([
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'sync',
        status: 'success',
        recordsProcessed: 156,
        recordsFailed: 0,
        message: 'Successfully synced orders and invoices',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'export',
        status: 'success',
        recordsProcessed: 45,
        recordsFailed: 0,
        message: 'Daily orders report exported',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'sync',
        status: 'partial',
        recordsProcessed: 89,
        recordsFailed: 3,
        message: 'Product sync completed with some errors',
        details: '3 products missing required fields',
      },
    ]);
  }, []);
  
  // Integration definitions
  const accountingIntegrations = [
    {
      id: 'exact',
      name: 'Exact Online',
      provider: 'Exact',
      description: t('integrations.exactDesc'),
      icon: <Building2 className="h-6 w-6 text-[#2D5A3D]" />,
      status: 'connected' as const,
      features: [t('integrations.invoices'), t('integrations.payments'), t('accounting.reports')],
    },
    {
      id: 'afas',
      name: 'AFAS',
      provider: 'AFAS Software',
      description: t('integrations.afasDesc'),
      icon: <Database className="h-6 w-6 text-[#D4A853]" />,
      status: 'disconnected' as const,
      features: [t('integrations.invoices'), t('integrations.payroll'), t('accounting.reports')],
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      provider: 'Intuit',
      description: t('integrations.quickbooksDesc'),
      icon: <CreditCard className="h-6 w-6 text-[#2D5A3D]" />,
      status: 'disconnected' as const,
      features: [t('integrations.invoices'), t('integrations.expenses'), t('accounting.taxReports')],
    },
  ];
  
  const posIntegrations = [
    {
      id: 'lightspeed',
      name: 'Lightspeed',
      provider: 'Lightspeed HQ',
      description: t('integrations.lightspeedDesc'),
      icon: <Truck className="h-6 w-6 text-[#D4A853]" />,
      status: 'connected' as const,
      features: [t('nav.orders'), t('nav.inventory'), t('integrations.customers')],
    },
    {
      id: 'square',
      name: 'Square',
      provider: 'Square Inc.',
      description: t('integrations.squareDesc'),
      icon: <CreditCard className="h-6 w-6 text-[#2D5A3D]" />,
      status: 'disconnected' as const,
      features: [t('integrations.payments'), t('nav.inventory'), t('accounting.reports')],
    },
  ];
  
  const deliveryIntegrations = [
    {
      id: 'ubereats',
      name: 'Uber Eats',
      provider: 'Uber Technologies',
      description: t('integrations.ubereatsDesc'),
      icon: <Truck className="h-6 w-6 text-[#2D5A3D]" />,
      status: 'connected' as const,
      features: [t('nav.orders'), t('integrations.menuSync'), t('integrations.realtime')],
    },
    {
      id: 'thuisbezorgd',
      name: 'Thuisbezorgd.nl',
      provider: 'Takeaway.com',
      description: t('integrations.thuisbezorgdDesc'),
      icon: <Globe className="h-6 w-6 text-[#D4A853]" />,
      status: 'error' as const,
      features: [t('nav.orders'), t('integrations.menuSync'), t('integrations.realtime')],
    },
    {
      id: 'deliveroo',
      name: 'Deliveroo',
      provider: 'Deliveroo plc',
      description: t('integrations.deliverooDesc'),
      icon: <Truck className="h-6 w-6 text-[#2D5A3D]" />,
      status: 'disconnected' as const,
      features: [t('nav.orders'), t('integrations.menuSync'), t('integrations.realtime')],
    },
  ];
  
  const handleConnect = (integration: { name: string; provider: string }) => {
    setSelectedIntegration(integration);
    setSetupWizardOpen(true);
  };
  
  const handleSetupComplete = (config: { apiKey: string; apiSecret: string; endpoint: string; companyId: string }) => {
    console.log('Setup complete:', selectedIntegration, config);
    // In a real app, this would save the configuration to the database
  };
  
  const handleSync = (integrationId: string) => {
    console.log('Syncing:', integrationId);
    // Add new sync log
    const newLog: SyncLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'sync',
      status: 'in_progress',
      recordsProcessed: 0,
      recordsFailed: 0,
      message: `Syncing ${integrationId}...`,
    };
    setSyncLogs([newLog, ...syncLogs]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('integrations.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{t('integrations.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#2D5A3D]">
            <CheckCircle className="h-3 w-3 mr-1" />
            3 {t('integrations.connected')}
          </Badge>
          <Badge variant="outline" className="border-amber-400 text-amber-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            1 {t('integrations.issues')}
          </Badge>
        </div>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-[#F5EDE0] h-11">
          <TabsTrigger 
            value="accounting" 
            className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4"
          >
            <Building2 className="h-4 w-4 mr-2" />
            {t('integrations.accounting')}
          </TabsTrigger>
          <TabsTrigger 
            value="pos" 
            className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {t('integrations.pos')}
          </TabsTrigger>
          <TabsTrigger 
            value="delivery" 
            className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4"
          >
            <Truck className="h-4 w-4 mr-2" />
            {t('integrations.delivery')}
          </TabsTrigger>
          <TabsTrigger 
            value="export" 
            className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-4"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('accounting.exportData')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounting" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accountingIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onDisconnect={() => console.log('Disconnect:', integration.id)}
                onSync={() => handleSync(integration.id)}
                onConfigure={() => console.log('Configure:', integration.id)}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SyncLogsPanel logs={syncLogs} />
            <APIKeyManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="pos" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onDisconnect={() => console.log('Disconnect:', integration.id)}
                onSync={() => handleSync(integration.id)}
                onConfigure={() => console.log('Configure:', integration.id)}
              />
            ))}
          </div>
          
          <SyncLogsPanel logs={syncLogs.filter(l => l.type === 'sync' || l.type === 'import')} />
        </TabsContent>
        
        <TabsContent value="delivery" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deliveryIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration)}
                onDisconnect={() => console.log('Disconnect:', integration.id)}
                onSync={() => handleSync(integration.id)}
                onConfigure={() => console.log('Configure:', integration.id)}
              />
            ))}
          </div>
          
          <SyncLogsPanel logs={syncLogs} />
        </TabsContent>
        
        <TabsContent value="export" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExportPanel />
            <ScheduledExportsPanel />
          </div>
          
          <SyncLogsPanel logs={syncLogs.filter(l => l.type === 'export')} />
        </TabsContent>
      </Tabs>
      
      <SetupWizardDialog 
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        integration={selectedIntegration}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
