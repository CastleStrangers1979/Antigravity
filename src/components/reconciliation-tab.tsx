'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scale, 
  HeartHandshake, 
  Trash2, 
  ShoppingCart, 
  Factory, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  RefreshCw,
  Clock,
  FileSignature
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function ReconciliationTab() {
  const { t, language, isRTL, formatCurrency } = useLanguage();

  const reconciliationData = [
    {
      product: isRTL ? 'خبز الملكة ستاندر' : 'Queen Bread Standard',
      produced: 2700,
      sold: 2450,
      donated: 150,
      waste: 95,
      variance: 5, // 2700 - (2450+150+95) = 5
      status: 'success'
    },
    {
      product: isRTL ? 'خبز فاميلي عائلي' : 'Family Pack Bread',
      produced: 800,
      sold: 680,
      donated: 40,
      waste: 70,
      variance: 10,
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#D4A853]" />
            {isRTL ? 'مطابقة الإنتاج والمخرجات (تخريج رسمي)' : 'Production & Output Reconciliation'}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isRTL ? 'تبرير مسار كل ربطة خبز تخرج من الفرن لضمان الدقة المحاسبية' : 'Justifying every loaf of bread to ensure accounting accuracy'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{isRTL ? 'الصنف' : 'Product'}</TableHead>
                <TableHead className="text-center">{isRTL ? 'الإنتاج' : 'Produced'}</TableHead>
                <TableHead className="text-center">{isRTL ? 'المبيعات' : 'Sold'}</TableHead>
                <TableHead className="text-center text-emerald-600">{isRTL ? 'التبرعات' : 'Donated'}</TableHead>
                <TableHead className="text-center text-red-500">{isRTL ? 'الهدر' : 'Waste'}</TableHead>
                <TableHead className="text-center">{isRTL ? 'الفارق (نقص)' : 'Variance'}</TableHead>
                <TableHead className="text-right">{isRTL ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliationData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-bold">{row.product}</TableCell>
                  <TableCell className="text-center font-medium bg-slate-50/50">{row.produced}</TableCell>
                  <TableCell className="text-center">{row.sold}</TableCell>
                  <TableCell className="text-center text-emerald-600 font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <HeartHandshake className="h-3 w-3" /> {row.donated}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-red-500 font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <Trash2 className="h-3 w-3" /> {row.waste}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={row.variance === 0 ? 'outline' : 'destructive'} className="text-[10px]">
                      {row.variance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.variance <= 5 ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {isRTL ? 'مطابق' : 'Balanced'}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                        <AlertCircle className="h-3 w-3 mr-1" /> {isRTL ? 'فارق يحتاج تدقيق' : 'Review Needed'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donation Details */}
        <Card className="border-0 shadow-sm bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800">
              <HeartHandshake className="h-4 w-4" />
              {isRTL ? 'سجل التبرعات الأخير' : 'Recent Donation Logs'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-emerald-100">
              <div>
                <p className="text-xs font-bold text-slate-900">{isRTL ? 'توزيع لفقراء المنطقة' : 'Local Poor Distribution'}</p>
                <p className="text-[10px] text-slate-500">14/05/2026 - 150 {isRTL ? 'ربطة' : 'Packs'}</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">تخريج رسمي</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Waste Details */}
        <Card className="border-0 shadow-sm bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-800">
              <Trash2 className="h-4 w-4" />
              {isRTL ? 'سجل الهدر المبرر' : 'Justified Waste Logs'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
              <div>
                <p className="text-xs font-bold text-slate-900">{isRTL ? 'عطل في خط الإنتاج' : 'Production Line Fault'}</p>
                <p className="text-[10px] text-slate-500">14/05/2026 - 95 {isRTL ? 'ربطة' : 'Packs'}</p>
              </div>
              <Badge variant="outline" className="text-red-600 border-red-200">إتلاف موثق</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Departmental Handshake Logs */}
        <Card className="border-0 shadow-sm bg-slate-900 text-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#D4A853]">
              <RefreshCw className="h-4 w-4 animate-spin-slow" />
              {isRTL ? 'سجل المصافحة بين الأقسام (تزامن لحظي)' : 'Departmental Handshake Logs (Live Sync)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase">{isRTL ? 'الإنتاج -> التحميل' : 'Prod -> Loading'}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-emerald-400">{isRTL ? 'مطابق' : 'Matched'}</span>
                  <span className="text-[10px] opacity-60">12:05</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase">{isRTL ? 'التحميل -> السائقين' : 'Loading -> Drivers'}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-emerald-400">{isRTL ? 'مطابق' : 'Matched'}</span>
                  <span className="text-[10px] opacity-60">12:10</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 border-amber-500/50 bg-amber-500/5">
                <p className="text-[10px] text-amber-500 uppercase">{isRTL ? 'السائقين -> التحصيل' : 'Drivers -> Accounting'}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-amber-500">{isRTL ? 'قيد التحقق' : 'Verifying'}</span>
                  <span className="text-[10px] opacity-60">--:--</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Discharge Status (Official Clearance) */}
        <Card className="border-0 shadow-lg md:col-span-2 overflow-hidden">
          <CardHeader className="bg-emerald-950 text-white border-b border-emerald-900">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {isRTL ? 'سجل إخلاء طرف السائقين (تبرئة الذمة الرقمية)' : 'Driver Discharge Status (Digital Clearance)'}
                </CardTitle>
                <CardDescription className="text-emerald-500/60 text-[10px]">
                  {isRTL ? 'لا تكتمل تبرئة الذمة إلا بتوقيع المحاسب (للمال) ومدير الصالة (للمرتجعات)' : 'Clearance is only valid with signatures from Accounting (Cash) and Hall Manager (Returns)'}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500 text-white border-0 animate-pulse">
                {isRTL ? 'نظام الأمان مفعل' : 'Security Mode Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-black">{isRTL ? 'السائق' : 'Driver'}</TableHead>
                  <TableHead className="text-center text-[10px] uppercase font-black">{isRTL ? 'مطابقة الكاش' : 'Cash Match'}</TableHead>
                  <TableHead className="text-center text-[10px] uppercase font-black">{isRTL ? 'مطابقة المرتجعات' : 'Returns Match'}</TableHead>
                  <TableHead className="text-center text-[10px] uppercase font-black">{isRTL ? 'توقيع المستلم' : 'Recipient Sign'}</TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-black">{isRTL ? 'الحالة النهائية' : 'Final Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Ahmed Al-Mohamed', cash: 'matched', returns: 'matched', signed: true, status: 'discharged' },
                  { name: 'Sami Yassin', cash: 'matched', returns: 'pending', signed: false, status: 'pending' },
                  { name: 'Yousef Mansour', cash: 'pending', returns: 'pending', signed: false, status: 'pending' },
                ].map((driver, idx) => (
                  <TableRow key={idx} className="border-b border-slate-50">
                    <TableCell className="font-bold text-slate-700">{driver.name}</TableCell>
                    <TableCell className="text-center">
                      {driver.cash === 'matched' ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-[8px] text-emerald-600 font-bold uppercase">{isRTL ? 'مطابق' : 'Matched'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center opacity-30">
                          <Clock className="h-4 w-4" />
                          <span className="text-[8px] uppercase">{isRTL ? 'قيد الانتظار' : 'Pending'}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.returns === 'matched' ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-[8px] text-emerald-600 font-bold uppercase">{isRTL ? 'مطابق' : 'Matched'}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-amber-500">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-[8px] uppercase">{isRTL ? 'بانتظار الجرد' : 'Awaiting Inventory'}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.signed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[9px] gap-1">
                          <FileSignature className="h-3 w-3" />
                          {isRTL ? 'موثق رقمياً' : 'Digitally Signed'}
                        </Badge>
                      ) : (
                        <span className="text-[9px] text-slate-300 italic">{isRTL ? 'لا يوجد توقيع' : 'No signature'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {driver.status === 'discharged' ? (
                        <Badge className="bg-emerald-500 text-white border-0 font-black px-3">
                          {isRTL ? 'تم إخلاء الطرف' : 'DISCHARGED'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold">
                          {isRTL ? 'عهدة معلقة' : 'ON CUSTODY'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          {isRTL ? 'تصدير تقرير المطابقة' : 'Export Reconciliation'}
        </Button>
      </div>
    </div>
  );
}
