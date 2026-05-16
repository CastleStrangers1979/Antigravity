/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Trash2, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  RefreshCcw,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

interface ProductionItem {
  id: string;
  productId: string;
  product: {
    nameAr: string;
    nameEn: string;
    nameNl: string;
    image?: string;
  };
  plannedQty: number;
  packedQty: number;
  donationQty: number;
  wasteQty: number;
  status: string;
}

interface ProductionSchedule {
  id: string;
  scheduleDate: string;
  shift: string;
  status: string;
  scheduleItems: ProductionItem[];
}

const FURNACE_CAPACITY_PER_HOUR = 105; // ربطة في الساعة

export default function PackingDashboard() {
  const { t, language, isRTL } = useLanguage();
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bakery/schedule?today=true');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    fetchSchedules();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchSchedules, 30000);
    return () => clearInterval(interval);
  }, [fetchSchedules]);

  const updateItem = async (itemId: string, data: any) => {
    try {
      setUpdating(itemId);
      const response = await fetch('/api/bakery/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, ...data }),
      });

      if (!response.ok) throw new Error('Update failed');
      
      const updatedItem = await response.json();
      
      // Update local state
      setSchedules(prev => prev.map(sched => ({
        ...sched,
        scheduleItems: sched.scheduleItems.map(item => 
          item.id === itemId ? { ...item, ...updatedItem } : item
        )
      })));

      toast.success(isRTL ? 'تم التحديث بنجاح' : 'Updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(isRTL ? 'فشل التحديث' : 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const handleQuickPack = (itemId: string, currentPacked: number) => {
    updateItem(itemId, { incrementPacked: 40 });
  };

  const handleLogWaste = (item: ProductionItem) => {
    const qty = prompt(isRTL ? 'أدخل كمية التالف:' : 'Enter waste quantity:', '0');
    if (qty !== null) {
      updateItem(item.id, { wasteQty: item.wasteQty + parseInt(qty || '0') });
    }
  };

  const handleLogDonation = (item: ProductionItem) => {
    const qty = prompt(isRTL ? 'أدخل كمية التبرع:' : 'Enter donation quantity:', '0');
    if (qty !== null) {
      updateItem(item.id, { donationQty: item.donationQty + parseInt(qty || '0') });
    }
  };

  // Calculations
  const allItems = schedules.flatMap(s => s.scheduleItems);
  const totalPlanned = allItems.reduce((acc, item) => acc + item.plannedQty, 0);
  const totalPacked = allItems.reduce((acc, item) => acc + item.packedQty, 0);
  const totalWaste = allItems.reduce((acc, item) => acc + item.wasteQty, 0);
  const totalDonation = allItems.reduce((acc, item) => acc + item.donationQty, 0);
  
  const remainingToPack = Math.max(0, totalPlanned - totalPacked - totalWaste - totalDonation);
  const estimatedHours = remainingToPack / FURNACE_CAPACITY_PER_HOUR;
  const estimatedMinutes = Math.round(estimatedHours * 60);

  if (loading && schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#D4A853]" />
        <p className="text-muted-foreground">{isRTL ? 'جاري تحميل لوحة التغليف...' : 'Loading Packing Dashboard...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#F5EDE0]/30 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-[#D4A853]/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'المتبقي للتغليف' : 'Remaining to Pack'}</p>
                <h3 className="text-2xl font-bold text-[#2D5A3D]">{remainingToPack} <span className="text-sm font-normal text-muted-foreground">{isRTL ? 'ربطة' : 'packs'}</span></h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#2D5A3D]/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-[#2D5A3D]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#D4A853]/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'الوقت المتوقع' : 'Estimated Time'}</p>
                <h3 className="text-2xl font-bold text-[#D4A853]">{Math.floor(estimatedMinutes / 60)}h {estimatedMinutes % 60}m</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#D4A853]/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#D4A853]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#D4A853]/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'إجمالي التالف' : 'Total Waste'}</p>
                <h3 className="text-2xl font-bold text-red-600">{totalWaste}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#D4A853]/20 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{isRTL ? 'إجمالي التبرعات' : 'Total Donations'}</p>
                <h3 className="text-2xl font-bold text-blue-600">{totalDonation}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <HeartHandshake className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2D5A3D]">{isRTL ? 'خطوط الإنتاج الحالية' : 'Current Production Lines'}</h2>
          <Button variant="outline" size="sm" onClick={fetchSchedules} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {allItems.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">{isRTL ? 'لا توجد خطط إنتاج لليوم' : 'No production plans for today'}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'قم بإنشاء جدول إنتاج من لوحة التحكم الرئيسية' : 'Create a production schedule from the main dashboard'}</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {allItems.map((item) => {
              const progress = Math.min(100, (item.packedQty / (item.plannedQty || 1)) * 100);
              const remaining = Math.max(0, item.plannedQty - item.packedQty - item.wasteQty - item.donationQty);
              const isUpdating = updating === item.id;

              return (
                <Card key={item.id} className="overflow-hidden border-[#D4A853]/30 hover:shadow-md transition-shadow">
                  <div className="p-4 bg-gradient-to-r from-[#2D5A3D]/5 to-[#D4A853]/5 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-[#2D5A3D] text-white flex items-center justify-center font-bold">
                        {item.product.nameAr?.[0] || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2D5A3D]">{language === 'ar' ? item.product.nameAr : item.product.nameEn}</h4>
                        <p className="text-xs text-muted-foreground">{isRTL ? 'الهدف:' : 'Target:'} {item.plannedQty}</p>
                      </div>
                    </div>
                    <Badge variant={remaining === 0 ? 'success' : 'secondary'} className={remaining === 0 ? 'bg-green-100 text-green-700' : ''}>
                      {remaining === 0 ? (isRTL ? 'مكتمل' : 'Completed') : (isRTL ? 'قيد التغليف' : 'Packing')}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{isRTL ? 'تقدم التغليف' : 'Packing Progress'}</span>
                        <span className="font-bold text-[#2D5A3D]">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-[#F5EDE0]" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{isRTL ? 'تم تغليف:' : 'Packed:'} {item.packedQty}</span>
                        <span>{isRTL ? 'المتبقي:' : 'Remaining:'} {remaining}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Optimized for Tablet */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        size="lg" 
                        className="col-span-2 h-16 text-lg font-bold bg-[#2D5A3D] hover:bg-[#1e3d29] shadow-lg text-white"
                        onClick={() => handleQuickPack(item.id, item.packedQty)}
                        disabled={isUpdating || remaining === 0}
                      >
                        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <Package className={isRTL ? 'ml-2' : 'mr-2'} />}
                        {isRTL ? 'تغليف 40 ربطة' : 'Pack 40 Boxes'}
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-12 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleLogWaste(item)}
                        disabled={isUpdating}
                      >
                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تالف' : 'Waste'}
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-12 border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleLogDonation(item)}
                        disabled={isUpdating}
                      >
                        <HeartHandshake className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'تبرع' : 'Donation'}
                      </Button>
                    </div>

                    {/* Stats Footer */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t text-center text-xs">
                      <div className="p-2 rounded bg-gray-50">
                        <p className="text-muted-foreground mb-1">{isRTL ? 'تغليف' : 'Packed'}</p>
                        <p className="font-bold">{item.packedQty}</p>
                      </div>
                      <div className="p-2 rounded bg-red-50">
                        <p className="text-red-600 mb-1">{isRTL ? 'تالف' : 'Waste'}</p>
                        <p className="font-bold text-red-700">{item.wasteQty}</p>
                      </div>
                      <div className="p-2 rounded bg-blue-50">
                        <p className="text-blue-600 mb-1">{isRTL ? 'تبرع' : 'Donation'}</p>
                        <p className="font-bold text-blue-700">{item.donationQty}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
