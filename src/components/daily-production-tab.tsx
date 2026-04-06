/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
  Calendar, Clock, Plus, Edit, Trash2, CheckCircle, AlertTriangle,
  Package, Users, Truck, RefreshCw, ChefHat, Flame, Timer, Check, X
} from 'lucide-react';

// Types
interface ProductionSchedule {
  id: string;
  date: string;
  shift: string;
  status: string;
  items: ProductionItem[];
  totalQuantity: number;
  completedQuantity: number;
  assignedTo?: string;
  notes?: string;
}

interface ProductionItem {
  id: string;
  productId: string;
  productName: string;
  plannedQuantity: number;
  actualQuantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: string;
  endTime?: string;
  assignedTo?: string;
  notes?: string;
}

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  category: string;
}

export default function DailyProductionTab() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('today');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    productId: '',
    quantity: 100,
    shift: 'morning',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scheduleRes, productsRes] = await Promise.all([
        fetch(`/api/bakery/production?date=${selectedDate}`),
        fetch('/api/products'),
      ]);
      
      if (scheduleRes.ok) {
        const data = await scheduleRes.json();
        setSchedules(data.schedules || mockSchedules);
      } else {
        setSchedules(mockSchedules);
      }
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data || mockProducts);
      } else {
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSchedules(mockSchedules);
      setProducts(mockProducts);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const mockProducts: Product[] = [
    { id: '1', nameAr: 'خبز صاج', nameEn: 'Saj Bread', nameNl: 'Saj Brood', category: 'bread' },
    { id: '2', nameAr: 'خبز عربي', nameEn: 'Arabic Bread', nameNl: 'Arabisch Brood', category: 'bread' },
    { id: '3', nameAr: 'فطير بالجبنة', nameEn: 'Cheese Pastry', nameNl: 'Kaas Gebak', category: 'pastry' },
    { id: '4', nameAr: 'بقلاوة', nameEn: 'Baklava', nameNl: 'Baklava', category: 'sweets' },
  ];

  const mockSchedules: ProductionSchedule[] = [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      shift: 'morning',
      status: 'in_progress',
      totalQuantity: 500,
      completedQuantity: 250,
      items: [
        { id: '1', productId: '1', productName: 'خبز صاج', plannedQuantity: 200, actualQuantity: 100, status: 'in_progress' },
        { id: '2', productId: '2', productName: 'خبز عربي', plannedQuantity: 200, actualQuantity: 150, status: 'completed' },
        { id: '3', productId: '3', productName: 'فطير بالجبنة', plannedQuantity: 100, actualQuantity: 0, status: 'pending' },
      ],
    },
    {
      id: '2',
      date: new Date().toISOString().split('T')[0],
      shift: 'afternoon',
      status: 'pending',
      totalQuantity: 300,
      completedQuantity: 0,
      items: [
        { id: '4', productId: '1', productName: 'خبز صاج', plannedQuantity: 150, actualQuantity: 0, status: 'pending' },
        { id: '5', productId: '4', productName: 'بقلاوة', plannedQuantity: 150, actualQuantity: 0, status: 'pending' },
      ],
    },
  ];

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const updateItemStatus = async (scheduleId: string, itemId: string, newStatus: ProductionItem['status']) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        const updatedItems = schedule.items.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, status: newStatus };
            if (newStatus === 'completed') {
              updated.actualQuantity = item.plannedQuantity;
              updated.endTime = new Date().toISOString();
            }
            if (newStatus === 'in_progress') {
              updated.startTime = new Date().toISOString();
            }
            return updated;
          }
          return item;
        });
        
        const completedQty = updatedItems.reduce((sum, item) => sum + item.actualQuantity, 0);
        const allCompleted = updatedItems.every(item => item.status === 'completed');
        
        return {
          ...schedule,
          items: updatedItems,
          completedQuantity: completedQty,
          status: allCompleted ? 'completed' : schedule.status,
        };
      }
      return schedule;
    }));
  };

  const addProductionItem = async () => {
    const product = products.find(p => p.id === newItemForm.productId);
    if (!product) return;

    const newItem: ProductionItem = {
      id: Date.now().toString(),
      productId: newItemForm.productId,
      productName: getProductName(product),
      plannedQuantity: newItemForm.quantity,
      actualQuantity: 0,
      status: 'pending',
      notes: newItemForm.notes,
    };

    // Find or create schedule for the shift
    const existingSchedule = schedules.find(s => s.shift === newItemForm.shift && s.date === selectedDate);
    
    if (existingSchedule) {
      setSchedules(schedules.map(s => {
        if (s.id === existingSchedule.id) {
          return {
            ...s,
            items: [...s.items, newItem],
            totalQuantity: s.totalQuantity + newItemForm.quantity,
          };
        }
        return s;
      }));
    } else {
      const newSchedule: ProductionSchedule = {
        id: Date.now().toString(),
        date: selectedDate,
        shift: newItemForm.shift,
        status: 'pending',
        totalQuantity: newItemForm.quantity,
        completedQuantity: 0,
        items: [newItem],
      };
      setSchedules([...schedules, newSchedule]);
    }

    setNewItemForm({ productId: '', quantity: 100, shift: 'morning', notes: '' });
    setIsAddDialogOpen(false);
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'إدارة الإنتاج اليومي',
        today: 'اليوم',
        schedule: 'الجدولة',
        history: 'السجل',
        morningShift: 'وردية الصباح',
        afternoonShift: 'وردية المساء',
        eveningShift: 'وردية الليل',
        pending: 'معلق',
        inProgress: 'قيد التنفيذ',
        completed: 'مكتمل',
        addProduction: 'إضافة إنتاج',
        selectProduct: 'اختر المنتج',
        quantity: 'الكمية',
        shift: 'الوردية',
        notes: 'ملاحظات',
        add: 'إضافة',
        cancel: 'إلغاء',
        product: 'المنتج',
        planned: 'المخطط',
        actual: 'الفعلي',
        status: 'الحالة',
        actions: 'الإجراءات',
        startProduction: 'بدء الإنتاج',
        completeProduction: 'إتمام الإنتاج',
        refresh: 'تحديث',
        totalProduction: 'إجمالي الإنتاج',
        completedPercent: 'نسبة الإنجاز',
        noItems: 'لا توجد عناصر',
        selectDate: 'اختر التاريخ',
      },
      en: {
        title: 'Daily Production Management',
        today: 'Today',
        schedule: 'Schedule',
        history: 'History',
        morningShift: 'Morning Shift',
        afternoonShift: 'Afternoon Shift',
        eveningShift: 'Evening Shift',
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        addProduction: 'Add Production',
        selectProduct: 'Select Product',
        quantity: 'Quantity',
        shift: 'Shift',
        notes: 'Notes',
        add: 'Add',
        cancel: 'Cancel',
        product: 'Product',
        planned: 'Planned',
        actual: 'Actual',
        status: 'Status',
        actions: 'Actions',
        startProduction: 'Start Production',
        completeProduction: 'Complete Production',
        refresh: 'Refresh',
        totalProduction: 'Total Production',
        completedPercent: 'Completion',
        noItems: 'No items',
        selectDate: 'Select Date',
      },
    };
    return translations[language]?.[key] || key;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700', label: t('pending') },
      in_progress: { className: 'bg-blue-100 text-blue-700', label: t('inProgress') },
      completed: { className: 'bg-green-100 text-green-700', label: t('completed') },
    };
    const c = config[status] || { className: 'bg-gray-100 text-gray-700', label: status };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getShiftLabel = (shift: string) => {
    const labels: Record<string, string> = {
      morning: t('morningShift'),
      afternoon: t('afternoonShift'),
      evening: t('eveningShift'),
    };
    return labels[shift] || shift;
  };

  const todayStats = {
    total: schedules.reduce((sum, s) => sum + s.totalQuantity, 0),
    completed: schedules.reduce((sum, s) => sum + s.completedQuantity, 0),
  };
  const completionPercent = todayStats.total > 0 ? (todayStats.completed / todayStats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">{selectedDate}</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[180px] border-[#E8DFD0]"
          />
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                {t('addProduction')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{t('addProduction')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('selectProduct')}</Label>
                  <Select value={newItemForm.productId} onValueChange={(v) => setNewItemForm({ ...newItemForm, productId: v })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('selectProduct')} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{getProductName(p)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('quantity')}</Label>
                  <Input
                    type="number"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 border-[#E8DFD0]"
                  />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('shift')}</Label>
                  <Select value={newItemForm.shift} onValueChange={(v) => setNewItemForm({ ...newItemForm, shift: v })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">{t('morningShift')}</SelectItem>
                      <SelectItem value="afternoon">{t('afternoonShift')}</SelectItem>
                      <SelectItem value="evening">{t('eveningShift')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('notes')}</Label>
                  <Textarea
                    value={newItemForm.notes}
                    onChange={(e) => setNewItemForm({ ...newItemForm, notes: e.target.value })}
                    className="mt-1.5 border-[#E8DFD0]"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-[#E8DFD0]">
                  {t('cancel')}
                </Button>
                <Button onClick={addProductionItem} className="gold-gradient text-white border-0">
                  {t('add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('totalProduction')}</p>
                <p className="text-2xl font-bold text-[#3D3229]">{todayStats.total.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-[#D4A853]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('completed')}</p>
                <p className="text-2xl font-bold text-green-600">{todayStats.completed.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('completedPercent')}</p>
                <p className="text-2xl font-bold text-[#D4A853]">{completionPercent.toFixed(1)}%</p>
              </div>
              <Progress value={completionPercent} className="w-16 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Schedules */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Flame className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-30" />
              <p className="text-[#7A6F63]">{t('noItems')}</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="border-0 shadow-md overflow-hidden">
              <div className={`h-1 ${schedule.status === 'completed' ? 'bg-green-500' : schedule.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#D4A853]" />
                    {getShiftLabel(schedule.shift)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(schedule.status)}
                    <Badge className="bg-[#F5EDE0] text-[#3D3229]">
                      {schedule.completedQuantity}/{schedule.totalQuantity}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(schedule.completedQuantity / schedule.totalQuantity) * 100} 
                  className="h-2 mt-2"
                />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('product')}</TableHead>
                      <TableHead>{t('planned')}</TableHead>
                      <TableHead>{t('actual')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.plannedQuantity}</TableCell>
                        <TableCell>
                          <span className={item.actualQuantity === item.plannedQuantity ? 'text-green-600 font-bold' : ''}>
                            {item.actualQuantity}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemStatus(schedule.id, item.id, 'in_progress')}
                                className="border-blue-200 text-blue-500"
                              >
                                <Timer className="h-4 w-4 mr-1" />
                                {t('startProduction')}
                              </Button>
                            )}
                            {item.status === 'in_progress' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemStatus(schedule.id, item.id, 'completed')}
                                className="border-green-200 text-green-500"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {t('completeProduction')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
