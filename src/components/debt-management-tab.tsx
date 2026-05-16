/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Send, 
  PhoneCall, 
  ShieldAlert, 
  Search, 
  RefreshCcw, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserX,
  CreditCard,
  Truck,
  Bot,
  UserCheck,
  ShieldCheck,
  FileDown,
  Eye,
  BellOff
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';
import { SignaturePad } from '@/components/ui/signature-pad';

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  status: string;
  remindersCount: number;
  lastReminderAt: string | null;
  escalationStage: string;
  paymentLink: string | null;
  isFormal: boolean;
  snelStartId: string | null;
  pdfUrl: string | null;
  notes?: string;
  order: {
    customer: {
      name: string;
      phone: string;
      notificationsEnabled: boolean;
    }
  }
}

export default function DebtManagementTab() {
  const { t, language, isRTL, formatCurrency, formatDate } = useLanguage();
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OverdueInvoice | null>(null);
  const [managerId, setManagerId] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/accounting/debt?stage=${filterStage}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filterStage, isRTL]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAction = async (invoiceId: string, action: string) => {
    try {
      const res = await fetch('/api/accounting/debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, action })
      });
      
      if (!res.ok) throw new Error('Action failed');
      
      toast.success(isRTL ? 'تم تنفيذ الإجراء بنجاح' : 'Action completed successfully');
      fetchInvoices();
    } catch (error: any) {
      if (error.requireFormalization) {
        toast.error(isRTL ? 'يجب تحويل الدين إلى فاتورة رسمية أولاً' : 'Debt must be formalized first');
      } else {
        toast.error(isRTL ? 'حدث خطأ أثناء التنفيذ' : 'Error performing action');
      }
    }
  };

  const handleFormalize = async (invoiceId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/accounting/debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, action: 'formalize' })
      });
      
      if (!res.ok) throw new Error('Formalization failed');
      
      toast.success(isRTL ? 'تم تحويل الدين إلى فاتورة رسمية بنجاح' : 'Debt formalized successfully');
      fetchInvoices();
    } catch (error) {
      toast.error(isRTL ? 'فشل تحويل الدين' : 'Formalization failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkFormalize = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setSubmitting(true);
      await Promise.all(selectedIds.map(id => 
        fetch('/api/accounting/debt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: id, action: 'formalize' })
        })
      ));
      
      toast.success(isRTL ? `تم تحويل ${selectedIds.length} فواتير بنجاح` : `Successfully formalized ${selectedIds.length} invoices`);
      setSelectedIds([]);
      fetchInvoices();
    } catch (error) {
      toast.error(isRTL ? 'فشل تحويل بعض الفواتير' : 'Failed to formalize some invoices');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) setSelectedIds([]);
    else setSelectedIds(filteredInvoices.map(i => i.id));
  };

  const handleManagerApproval = async () => {
    if (!selectedInvoice || !managerId) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/accounting/debt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: selectedInvoice.id, 
          managerId, 
          action: 'markPaidCash',
          notes: approvalNotes,
          signatureUrl
        })
      });
      
      if (!res.ok) throw new Error('Approval failed');
      
      toast.success(isRTL ? 'تم تأكيد الدفع النقدي بنجاح' : 'Cash payment confirmed successfully');
      setApprovalDialogOpen(false);
      setSelectedInvoice(null);
      setManagerId('');
      setApprovalNotes('');
      setSignatureUrl(null);
      fetchInvoices();
    } catch (error) {
      toast.error(isRTL ? 'فشل تأكيد الدفع' : 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'robot': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'incasso': return 'bg-slate-800 text-white border-slate-900';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, any> = {
      none: { ar: 'جديد', en: 'New' },
      green: { ar: 'تذكير ودود', en: 'Friendly' },
      yellow: { ar: 'تنبيه أول', en: 'Notice' },
      orange: { ar: 'تنبيه عاجل', en: 'Urgent' },
      red: { ar: 'تحذير نهائي', en: 'Final Warning' },
      robot: { ar: 'اتصال آلي', en: 'Robot Call' },
      incasso: { ar: 'تحصيل قانوني', en: 'Incasso' }
    };
    return isRTL ? labels[stage]?.ar || stage : labels[stage]?.en || stage;
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalOverdue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    count: invoices.length,
    criticalCount: invoices.filter(inv => ['red', 'robot', 'incasso'].includes(inv.escalationStage)).length,
    adjustedCount: invoices.filter(inv => inv.notes?.includes('[Adjusted')).length,
    formalizedTotal: invoices.filter(inv => inv.isFormal).reduce((sum, inv) => sum + inv.totalAmount, 0),
    nonFormalTotal: invoices.filter(inv => !inv.isFormal).reduce((sum, inv) => sum + inv.totalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="h-2 bg-red-500" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'إجمالي الديون المتأخرة' : 'Total Overdue Debt'}</p>
                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</h3>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="h-2 bg-[#D4A853]" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'عدد الفواتير المعلقة' : 'Pending Invoices'}</p>
                <h3 className="text-2xl font-bold text-[#3D3229]">{stats.count}</h3>
              </div>
              <div className="p-3 rounded-xl bg-[#F5EDE0]">
                <FileText className="h-6 w-6 text-[#D4A853]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="h-2 bg-slate-800" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'حالات حرجة (أحمر+)' : 'Critical Cases (Red+)'}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stats.criticalCount}</h3>
              </div>
              <div className="p-3 rounded-xl bg-slate-100">
                <ShieldAlert className="h-6 w-6 text-slate-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => toast.info(isRTL ? 'فتح واجهة تصفية العهدة' : 'Opening Settlement Interface')}>
          <div className="h-2 bg-blue-600" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'تصفية عهدة السائقين' : 'Driver Settlement'}</p>
                <h3 className="text-2xl font-bold text-blue-600">{isRTL ? 'ابدأ التصفية' : 'Start Settlement'}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="h-2 bg-emerald-600" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'إجمالي المبيعات الرسمية' : 'Formalized Sales (SnelStart)'}</p>
                <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.formalizedTotal)}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {isRTL ? `غير المصرح به: ${formatCurrency(stats.nonFormalTotal)}` : `Non-Formal: ${formatCurrency(stats.nonFormalTotal)}`}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[250px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={isRTL ? 'بحث عن زبون أو فاتورة...' : 'Search customer or invoice...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-[#F5EDE0]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            {selectedIds.length > 0 && (
              <Button size="sm" onClick={handleBulkFormalize} className="blue-gradient text-white border-0">
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? `فوترة المحدد (${selectedIds.length})` : `Formalize Selected (${selectedIds.length})`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debt List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-[#2D5A3D] text-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isRTL ? 'إدارة التحصيل المتدرج' : 'Graduated Collection Management'}
          </CardTitle>
          <CardDescription className="text-white/80">
            {isRTL ? 'تتبع الديون المتأخرة وإرسال الروابط والتصعيد الآلي' : 'Track overdue debt, send links, and automated escalation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="bg-[#F5EDE0]">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الزبون / الفاتورة' : 'Customer / Invoice'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'مرحلة التصعيد' : 'Stage'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التذكيرات' : 'Reminders'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-right'}>{isRTL ? 'إجراءات التحصيل' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
                        <p>{isRTL ? 'لا توجد فواتير متأخرة حالياً' : 'No overdue invoices at the moment'}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(inv.id) ? 'bg-blue-50/50' : ''}`}>
                      <TableCell>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(inv.id)}
                          onChange={() => toggleSelect(inv.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-[#3D3229] flex items-center gap-2">
                          {inv.order.customer.name}
                          {!inv.order.customer.notificationsEnabled && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[9px] flex items-center gap-1">
                              <BellOff className="h-2.5 w-2.5" />
                              {isRTL ? 'تنبيه: الإشعارات مغلقة' : 'Alert: Notifications OFF'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          #{inv.invoiceNumber}
                        </div>
                        {inv.isFormal && (
                          <Badge variant="secondary" className="mt-1 text-[10px] bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {isRTL ? 'فاتورة رسمية' : 'Formal Invoice'}
                          </Badge>
                        )}
                        {inv.snelStartId && (
                          <Badge variant="outline" className="mt-1 text-[10px] border-purple-200 text-purple-600 flex items-center gap-1 w-fit">
                            <RefreshCcw className="h-2.5 w-2.5" />
                            SnelStart: {inv.snelStartId}
                          </Badge>
                        )}
                        {inv.notes?.includes('[Adjusted') && (
                          <Badge variant="outline" className="mt-1 text-[10px] border-amber-200 text-amber-600 flex items-center gap-1 w-fit">
                            <AlertCircle className="h-2.5 w-2.5" />
                            {isRTL ? 'تم تعديل الكميات' : 'Adjusted'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-[#2D5A3D]">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(inv.dueDate)}</div>
                        <div className="text-xs text-red-500 font-medium">
                          {isRTL ? 'متأخرة منذ:' : 'Late by:'} {Math.ceil((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 3600 * 24))} {isRTL ? 'يوم' : 'days'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize font-medium px-2 py-0.5 ${getStageColor(inv.escalationStage)}`}>
                          {getStageLabel(inv.escalationStage)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{inv.remindersCount}</span>
                        </div>
                        {inv.lastReminderAt && (
                          <div className="text-[10px] text-muted-foreground italic">
                            {formatDate(inv.lastReminderAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white"
                            onClick={() => handleAction(inv.id, 'sendReminder')}
                            title={isRTL ? 'إرسال رابط دفع (WhatsApp)' : 'Send Payment Link'}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                          
                          {inv.escalationStage === 'red' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 border-purple-500 text-purple-600 hover:bg-purple-50"
                              onClick={() => handleAction(inv.id, 'escalateToRobot')}
                              title={isRTL ? 'تصعيد للاتصال الآلي' : 'Escalate to Robot Call'}
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {['robot', 'red'].includes(inv.escalationStage) && (
                            inv.isFormal ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-slate-800 text-slate-800 hover:bg-slate-100"
                                onClick={() => handleAction(inv.id, 'transferToIncasso')}
                                title={isRTL ? 'تحويل للإنكاسو' : 'Transfer to Incasso'}
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-blue-500 text-blue-600 hover:bg-blue-50"
                                onClick={() => handleFormalize(inv.id)}
                                title={isRTL ? 'فوترة وتصدير لـ سنل ستارت' : 'Formalize & Export to SnelStart'}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            )
                          )}

                          {inv.isFormal && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-blue-600 px-2"
                              onClick={() => {
                                // Simulate PDF download
                                toast.info(isRTL ? 'جاري استخراج الفاتورة بصيغة PDF...' : 'Generating PDF Invoice...');
                                setTimeout(() => {
                                  toast.success(isRTL ? 'تم تحميل الفاتورة بنجاح' : 'Invoice downloaded successfully');
                                }, 1500);
                              }}
                              title={isRTL ? 'تحميل فاتورة PDF' : 'Download PDF Invoice'}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <div className="flex gap-1">
                            {inv.escalationStage === 'red' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => toast.success(isRTL ? 'بدء الاتصال الآلي (الروبوت)...' : 'Starting Robot Call...')}
                              >
                                <Bot className="h-4 w-4" />
                              </Button>
                            )}
                            {inv.escalationStage === 'robot' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50"
                                onClick={() => toast.info(isRTL ? 'تنبيه المحاسب للمتابعة اليدوية' : 'Alerting Accountant for Manual Follow-up')}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {(inv.escalationStage === 'robot' || inv.escalationStage === 'red') && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-slate-800 text-slate-800 hover:bg-slate-100"
                                onClick={() => toast.warning(isRTL ? 'تحويل لشركة التحصيل (Incasso)' : 'Transferring to Incasso Agency')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            {!inv.isFormal ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => toast.success(isRTL ? 'تم تحويل الفاتورة إلى رسمية وإرسالها لـ SnelStart' : 'Invoice formalized and sent to SnelStart')}
                              >
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                {isRTL ? 'فوترة رسمية' : 'Formalize'}
                              </Button>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-700 h-8 flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                SnelStart OK
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="h-8">
                              <FileDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-green-600 hover:bg-green-50"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setApprovalDialogOpen(true);
                            }}
                            title={isRTL ? 'دفع نقدي (موافقة المدير)' : 'Cash Payment (Manager Approval)'}
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </Button>
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

      {/* Manager Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#D4A853]" />
              {isRTL ? 'موافقة المدير على الدفع النقدي' : 'Manager Cash Payment Approval'}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm">
                <p className="font-bold text-amber-800">{isRTL ? 'تحذير أمان:' : 'Security Warning:'}</p>
                <p className="text-amber-700">
                  {isRTL ? 'أنت على وشك تأكيد استلام مبلغ نقدي يدوياً. سيتم تسجيل رقم هويتك كموافِق على هذه العملية لمنع التلاعب.' : 'You are about to manually confirm a cash payment. Your Manager ID will be logged as the approver for fraud prevention.'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>{isRTL ? 'الفاتورة' : 'Invoice'}</Label>
                <div className="p-2 bg-gray-50 rounded font-mono text-sm">
                  #{selectedInvoice.invoiceNumber} - {formatCurrency(selectedInvoice.totalAmount)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">{isRTL ? 'رقم هوية المدير / المحاسب' : 'Manager / Accountant ID'}</Label>
                <Input 
                  id="managerId" 
                  value={managerId} 
                  onChange={(e) => setManagerId(e.target.value)}
                  placeholder="MGR-XXXX"
                  className="border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</Label>
                <Textarea 
                  id="notes" 
                  value={approvalNotes} 
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder={isRTL ? 'سبب الدفع النقدي أو أي تفاصيل أخرى...' : 'Reason for cash payment or other details...'}
                  className="border-[#E8DFD0]"
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'توقيع المستلم (المحاسب/المدير)' : 'Recipient Signature (Accountant/Manager)'}</Label>
                <SignaturePad 
                  isRTL={isRTL} 
                  onSave={(data) => setSignatureUrl(data)} 
                  onClear={() => setSignatureUrl(null)}
                />
                {signatureUrl && (
                  <p className="text-[10px] text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {isRTL ? 'تم التقاط التوقيع بنجاح' : 'Signature captured successfully'}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)} disabled={submitting}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              className="gold-gradient text-white border-0" 
              onClick={handleManagerApproval}
              disabled={!managerId || !signatureUrl || submitting}
            >
              {submitting ? <RefreshCcw className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isRTL ? 'تأكيد العملية' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fraud Prevention Section */}
      <Card className="border-[#D4A853]/30 bg-[#F5EDE0]/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-white shadow-sm">
            <ShieldAlert className="h-6 w-6 text-[#D4A853]" />
          </div>
          <div>
            <h4 className="font-bold text-[#3D3229]">{isRTL ? 'نظام الحماية من التلاعب' : 'Fraud Prevention System'}</h4>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'يُمنع أي تعديل يدوي على المبالغ أو المرتجعات إلا بموافقة إلكترونية موثقة من المحاسب.' : 'Manual adjustments to amounts or returns are restricted to verified accountant approvals.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
