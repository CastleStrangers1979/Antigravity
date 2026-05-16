'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MinusCircle, 
  PlusCircle, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  Timer,
  HeartHandshake,
  Trash2,
  Box,
  Users,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

interface ProductionItem {
  id: string;
  name: string;
  totalRequired: number;
  packed: number;
  remaining: number;
  category: 'standard' | 'family' | 'brown' | 'small';
}

export default function ProductionAutomationTab() {
  const { t, language, isRTL } = useLanguage();
  const [items, setItems] = useState<ProductionItem[]>([
    { id: '1', name: isRTL ? 'خبز الملكة ستاندر' : 'Queen Bread Standard', totalRequired: 2700, packed: 1200, remaining: 1500, category: 'standard' },
    { id: '2', name: isRTL ? 'خبز فاميلي عائلي' : 'Family Pack Bread', totalRequired: 800, packed: 300, remaining: 500, category: 'family' },
    { id: '3', name: isRTL ? 'خبز أسمر (صحّي)' : 'Brown Bread (Healthy)', totalRequired: 400, packed: 350, remaining: 50, category: 'brown' },
  ]);

  const [cutOffTime] = useState('22:00');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  const [vesselBreakdown, setVesselBreakdown] = useState({
    standard: [
      { id: 'z1', customer: 'Supermarkt Bilal', qty: 120 },
      { id: 'z2', customer: 'Bakkerij Al-Noor', qty: 300 },
      { id: 'z3', customer: 'Syrian Shop NL', qty: 150 }
    ],
    family: [
      { id: 'z4', customer: 'Euro Food', qty: 200 },
      { id: 'z5', customer: 'Halal Meat', qty: 100 }
    ]
  });

  const [liveOrders, setLiveOrders] = useState([
    { id: '1', customer: 'Supermarkt Bilal', product: isRTL ? 'ستاندر' : 'Standard', qty: 120, time: '21:45' },
    { id: '2', customer: 'Bakkerij Al-Noor', product: isRTL ? 'فاميلي' : 'Family', qty: 45, time: '21:48' },
    { id: '3', customer: 'Syrian Shop NL', product: isRTL ? 'أسمر' : 'Brown', qty: 80, time: '21:50' },
  ]);

  const [productionCapacity] = useState(105); // Boxes per hour
  const [currentVelocity, setCurrentVelocity] = useState(98); // Real-time boxes per hour
  const totalRemainingBoxes = items.reduce((acc, item) => acc + item.remaining, 0);
  const estimatedHours = (totalRemainingBoxes / currentVelocity).toFixed(1);

  const [activeShift, setActiveShift] = useState({
    name: isRTL ? 'الوردية الصباحية' : 'Morning Shift',
    supervisor: isRTL ? 'أحمد المحمد' : 'Ahmed Al-Mohamed',
    role: isRTL ? 'الجخماقي (مدير الصالة)' : 'Jakhmaqi (Floor Manager)',
    startTime: '06:00'
  });

  const [floorActivity, setFloorActivity] = useState([
    { id: 'a1', action: '-40', product: isRTL ? 'ستاندر' : 'Standard', time: '12:05', type: 'pallet' },
    { id: 'a2', action: '-40', product: isRTL ? 'فاميلي' : 'Family', time: '11:50', type: 'pallet' },
    { id: 'a3', action: '-10', product: isRTL ? 'أسمر' : 'Brown', time: '11:30', type: 'manual' },
  ]);

  const handlePack = (id: string, amount: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newPacked = Math.min(item.packed + amount, item.totalRequired);
        return { ...item, packed: newPacked, remaining: item.totalRequired - newPacked };
      }
      return item;
    }));
    toast.success(`${isRTL ? 'تم تحديث التعبئة:' : 'Packing updated:'} -${amount} ${isRTL ? 'صندوق' : 'Boxes'}`);
  };

  const handleLogNonSale = (id: string, type: 'donation' | 'waste') => {
    toast.info(`${isRTL ? 'تم تسجيل' : 'Logged'} ${type === 'donation' ? (isRTL ? 'تبرع' : 'donation') : (isRTL ? 'هدر' : 'waste')}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#FDFBF7] p-4 rounded-xl border border-[#D4A853]/20 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#2D5A3D] p-2 rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-[#D4A853] tracking-widest">{isRTL ? 'الوردية النشطة' : 'Active Shift'}</p>
            <h4 className="font-bold text-[#3D3229]">{activeShift.name} - {activeShift.supervisor}</h4>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{isRTL ? 'إغلاق الطلبات' : 'Order Cut-off'}</p>
            <h4 className="font-bold text-red-600">{cutOffTime}</h4>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {isRTL ? 'المزامنة المحاسبية' : 'Accounting Sync'}
            </p>
            <span className="text-[10px] text-slate-500 font-bold">{isRTL ? 'نشط: 1250 ربطة' : 'Live: 1250 Packs'}</span>
          </div>
          <Badge className={isAcceptingOrders ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
            {isAcceptingOrders ? (isRTL ? 'يستقبل الآن' : 'Receiving') : (isRTL ? 'مغلق' : 'Closed')}
          </Badge>
        </div>
      </div>

      {/* Loading Dock Buffer Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="lg:col-span-1 border-0 shadow-sm bg-blue-50 border-l-4 border-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{isRTL ? 'رصيد منطقة التحميل' : 'Loading Buffer'}</p>
              <h3 className="text-2xl font-black text-blue-900">420 <span className="text-xs font-normal opacity-60">{isRTL ? 'ربطة' : 'Packs'}</span></h3>
            </div>
            <Truck className="h-8 w-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-0 shadow-sm bg-slate-50 flex items-center px-4 overflow-hidden">
          <div className="flex gap-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`h-8 w-6 rounded-sm ${i < 8 ? 'bg-blue-400' : 'bg-slate-200'} transition-all`} />
            ))}
          </div>
          <p className="ml-auto text-[10px] font-bold text-slate-400 italic">{isRTL ? 'بانتظار السائقين...' : 'Waiting for drivers...'}</p>
        </Card>
      </div>

      {/* Summary Header - Production Time Planning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2D5A3D] text-white border-0 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold mb-1">{isRTL ? 'إجمالي الصناديق المتبقية' : 'Total Remaining Boxes'}</p>
              <h3 className="text-3xl font-black">{totalRemainingBoxes}</h3>
            </div>
            <Box className="h-10 w-10 text-emerald-300/30" />
          </CardContent>
        </Card>

        <Card className="bg-[#D4A853] text-white border-0 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-100 uppercase tracking-wider font-bold mb-1">{isRTL ? 'الوقت اللازم للإنجاز' : 'Time Required to Finish'}</p>
              <h3 className="text-3xl font-black">{estimatedHours} {isRTL ? 'ساعة' : 'Hrs'}</h3>
            </div>
            <Timer className="h-10 w-10 text-amber-100/30" />
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-emerald-100 shadow-sm overflow-hidden relative">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="z-10">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{isRTL ? 'سرعة الإنتاج الحالية' : 'Current Velocity'}</p>
              <h3 className="text-3xl font-black text-[#2D5A3D]">{currentVelocity} <span className="text-sm font-normal text-slate-400">{isRTL ? 'صندوق/ساعة' : 'Box/Hr'}</span></h3>
              <p className="text-[10px] text-red-500 font-bold mt-1">
                {currentVelocity < productionCapacity ? (isRTL ? '⚠ أقل من القدرة القصوى' : '⚠ Below Max Capacity') : ''}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-emerald-500/20" />
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(currentVelocity / productionCapacity) * 100}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Production & Packing Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Order Inflow - The "How it works" part */}
        <Card className="lg:col-span-3 border-0 shadow-lg bg-[#FDFBF7]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin-slow" />
              {isRTL ? 'تدفق الطلبيات المباشر' : 'Live Order Inflow'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveOrders.map(order => (
              <div key={order.id} className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 mb-1">{order.customer}</p>
                    <p className="text-xs font-bold">{order.qty} {isRTL ? 'صندوق' : 'Boxes'}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-500 text-[8px]">{order.time}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground">{isRTL ? 'التوجيه إلى:' : 'Routing to:'}</span>
                  <Badge variant="outline" className="text-[8px] bg-emerald-50 text-emerald-700 border-emerald-100 uppercase">{order.product}</Badge>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform" />
              </div>
            ))}
            <div className="p-3 border border-dashed border-emerald-200 rounded-lg text-center">
              <p className="text-[10px] text-emerald-600 italic">
                {isRTL ? 'يتم تجميع الطلبات آلياً...' : 'Orders are being aggregated...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Order Aggregation */}
        <Card className="lg:col-span-4 border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#2D5A3D]" />
                  {isRTL ? 'تجميع الطلبيات (الأوعية)' : 'Order Aggregation (Vessels)'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تجميع تلقائي لطلبات الزبائن حسب النوع' : 'Automatic grouping of orders by product type'}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3 py-1">
                {isRTL ? 'بث مباشر' : 'Live Stream'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {items.map(item => (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-[#3D3229]">{item.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase">{item.category}</Badge>
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                          {isRTL ? 'قيد الإنتاج' : 'In Production'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'المتبقي' : 'Remaining'}</p>
                      <p className="text-xl font-black text-red-600">{item.remaining}</p>
                    </div>
                  </div>
                  
                  {/* Vessel Breakdown details */}
                  <div className="mb-4 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRTL ? 'تفاصيل الوعاء (أمثلة)' : 'Vessel Breakdown (Examples)'}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-[10px] flex justify-between px-2 py-1 bg-white rounded border border-slate-100">
                        <span>Z-Bilal</span>
                        <span className="font-bold">120</span>
                      </div>
                      <div className="text-[10px] flex justify-between px-2 py-1 bg-white rounded border border-slate-100">
                        <span>Z-Noor</span>
                        <span className="font-bold">300</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{isRTL ? 'تمت التعبئة' : 'Packed'}: {item.packed}</span>
                      <span>{isRTL ? 'الهدف' : 'Target'}: {item.totalRequired}</span>
                    </div>
                    <Progress value={(item.packed / item.totalRequired) * 100} className="h-3 bg-slate-100 accent-[#2D5A3D]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Packing Terminal (Tablet-Friendly) */}
        <Card className="lg:col-span-5 border-0 shadow-xl bg-slate-900 text-white">
          <CardHeader className="border-b border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Timer className="h-5 w-5 text-[#D4A853]" />
                  {isRTL ? 'محطة مدير الصالة (تابلت)' : 'Floor Manager Terminal (Tablet)'}
                </CardTitle>
                <CardDescription className="text-white/60">
                  {isRTL ? 'وضع الإشراف النشط:' : 'Active Supervisor Mode:'} {activeShift.supervisor} ({activeShift.role})
                </CardDescription>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Quick Actions for Pallets */}
            {items.slice(0, 2).map(item => (
              <div key={item.id} className={`space-y-4 p-4 rounded-2xl transition-all duration-500 ${item.remaining === 0 ? 'bg-red-500/20 border-2 border-red-500' : 'bg-white/5'}`}>
                {item.remaining === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 animate-pulse">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
                    <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter">
                      {isRTL ? 'قِفْ عن الإنتاج فوراً' : 'STOP PRODUCTION NOW'}
                    </h2>
                    <p className="text-xs text-red-400">{isRTL ? 'تم اكتمال الكمية المطلوبة' : 'Target quantity reached'}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#D4A853] text-lg uppercase tracking-widest">{item.name}</span>
                        <span className="text-[10px] text-white/40">{isRTL ? 'مكتمل:' : 'Completed:'} {Math.floor(item.packed / 40)} {isRTL ? 'طبلية' : 'Pallets'}</span>
                      </div>
                      <Badge className="bg-white/10 text-white text-2xl px-4 py-2 font-black">{item.remaining}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => handlePack(item.id, 40)}
                        className="h-20 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-900 active:border-0"
                      >
                        -40 {isRTL ? '(طبلية)' : '(Pallet)'}
                      </Button>
                      <Button 
                        onClick={() => handlePack(item.id, 1)}
                        className="h-20 text-2xl font-black bg-slate-800 hover:bg-slate-700 text-white border-b-4 border-slate-950 active:border-0"
                      >
                        -1
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Floor Activity Log */}
            <div className="pt-6 border-t border-white/10">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{isRTL ? 'سجل العمليات الأخير' : 'Recent Floor Activity'}</h5>
              <div className="space-y-2">
                {floorActivity.map(log => (
                  <div key={log.id} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                    <div className="flex items-center gap-2">
                      <Badge className={log.type === 'pallet' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}>
                        {log.action}
                      </Badge>
                      <span className="text-xs font-bold">{log.product}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Sale Logging (Waste/Donations) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleLogNonSale('1', 'donation')}
                variant="outline" 
                className="h-12 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center gap-2"
              >
                <HeartHandshake className="h-5 w-5" />
                {isRTL ? 'تسجيل تبرعات' : 'Log Donation'}
              </Button>
              <Button 
                onClick={() => handleLogNonSale('1', 'waste')}
                variant="outline" 
                className="h-12 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                {isRTL ? 'تسجيل هدر' : 'Log Waste'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
