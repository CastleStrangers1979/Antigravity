'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Truck, Phone, MapPin, CheckCircle, Clock, Navigation, Smartphone, User, ShoppingBag, 
  FileSignature, Edit2, AlertTriangle, X, Check, Scale, FileText, Wallet, AlertCircle, Banknote
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SignaturePad } from '@/components/ui/signature-pad';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Order, Driver } from '@/lib/types';

// Local Status Badge
function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'bg-yellow-100 text-yellow-700', label: t('orders.pending') },
    confirmed: { className: 'bg-blue-100 text-blue-700', label: t('orders.confirmed') },
    in_delivery: { className: 'bg-orange-100 text-orange-700', label: t('orders.inDelivery') },
    delivered: { className: 'bg-green-100 text-green-700', label: t('orders.delivered') },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.className}`}>{config.label}</span>;
}

export default function DriverApp() {
  const { t, language, isRTL } = useLanguage();
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [driverOrders, setDriverOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [managerId, setManagerId] = useState('');
  const [adjustItems, setAdjustItems] = useState<any[]>([]);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isLoadingVerified, setIsLoadingVerified] = useState(false);
  const [showLoadingVerification, setShowLoadingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadTotals = [
    { name: language === 'ar' ? 'خبز ستاندر' : 'Standard Bread', expected: 600, actual: 600 },
    { name: language === 'ar' ? 'خبز فاميلي' : 'Family Bread', expected: 200, actual: 200 },
  ];

  const fetchDriverData = useCallback(async () => {
    setLoading(true);
    try {
      // For demo, we'll pick the first driver
      const res = await fetch('/api/drivers');
      const drivers = await res.json();
      if (drivers.length > 0) {
        const driver = drivers[0];
        setCurrentDriver(driver);
        
        const ordersRes = await fetch(`/api/orders?driverId=${driver.id}`);
        const orders = await ordersRes.json();
        setDriverOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchDriverData();

    // Heartbeat mechanism to track "Live" status
    const heartbeatInterval = setInterval(() => {
      if (currentDriver && isOnline) {
        fetch('/api/drivers/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            driverId: currentDriver.id, 
            status: 'online',
            lat: 52.3676 + (Math.random() - 0.5) * 0.1, // Simulated GPS
            lng: 4.9041 + (Math.random() - 0.5) * 0.1
          }),
        }).catch(err => console.error('Heartbeat failed', err));
      }
    }, 10000); // Every 10 seconds

    // Detect app closing
    const handleUnload = () => {
      if (currentDriver) {
        // Send a synchronous request or use sendBeacon to notify closure
        navigator.sendBeacon('/api/drivers/heartbeat', JSON.stringify({ 
          driverId: currentDriver.id, 
          status: 'app_closed',
          timestamp: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [fetchDriverData, currentDriver, isOnline]);

  const updateStatus = async (orderId: string, status: string, additionalData = {}) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData }),
      });
      if (!res.ok) throw new Error('Update failed');
      fetchDriverData();
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
      return false;
    }
  };

  const handleDeliver = async () => {
    if (!selectedOrder || !signatureUrl) return;
    const success = await updateStatus(selectedOrder.id, 'delivered', { 
      signatureImage: signatureUrl,
      signedByName: selectedOrder.customer.name
    });
    if (success) {
      setIsSignOpen(false);
      setSignatureUrl(null);
      setSelectedOrder(null);
      toast.success(language === 'ar' ? 'تم التوصيل بنجاح' : 'Delivered successfully');
    }
  };

  const handleSaveAdjustment = async () => {
    if (!selectedOrder || !managerId) return;
    const success = await updateStatus(selectedOrder.id, selectedOrder.status, {
      items: adjustItems,
      managerId
    });
    if (success) {
      setIsAdjustOpen(false);
      setManagerId('');
      setSelectedOrder(null);
      toast.success(language === 'ar' ? 'تم تعديل الكميات بنجاح' : 'Quantities adjusted successfully');
    }
  };

  if (loading) return <div className="p-8 text-center">{t('messages.loading')}</div>;
  if (!currentDriver) return <div className="p-8 text-center">{t('messages.noData')}</div>;

  return (
    <div className="max-w-md mx-auto bg-white min-h-[600px] shadow-2xl rounded-[3rem] border-[8px] border-[#3D3229] overflow-hidden relative">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#3D3229] rounded-b-2xl z-20" />
      
      {/* App Content */}
      <div className="pt-8 flex flex-col h-full">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D] text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs opacity-80">{t('nav.drivers')}</div>
              <div className="font-bold flex items-center gap-2">
                {currentDriver.name}
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              variant="outline" 
              className={`h-6 text-[10px] bg-white/10 border-white/20 text-white ${!isOnline && 'bg-red-500/50'}`}
              onClick={() => {
                setIsOnline(!isOnline);
                toast.info(isOnline ? 'GPS Offline - Alert Sent' : 'GPS Online');
              }}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              {isOnline ? 'Phone GPS: ON' : 'Phone GPS: OFF (ALERT)'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 text-[10px] bg-white/10 border-white/20 text-white cursor-default"
            >
              <Truck className="h-3 w-3 mr-1" />
              Vehicle GPS: Active
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 p-3 rounded-2xl">
              <div className="text-[10px] opacity-70 uppercase">{t('orders.total')}</div>
              <div className="text-lg font-bold">{driverOrders.length}</div>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl">
              <div className="text-[10px] opacity-70 uppercase">{t('orders.delivered')}</div>
              <div className="text-lg font-bold">{driverOrders.filter(o => o.status === 'delivered').length}</div>
            </div>
          </div>
        </div>
        
        {!isLoadingVerified ? (
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-6 bg-[#FFFEF7]">
            <div className="w-24 h-24 bg-[#D4A853]/10 rounded-full flex items-center justify-center">
              <Scale className="h-12 w-12 text-[#D4A853]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3D3229]">{language === 'ar' ? 'بانتظار مطابقة التحميل' : 'Awaiting Loading Match'}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {language === 'ar' ? 'يرجى مطابقة الكميات المجهزة مع موظف التحميل قبل الانطلاق' : 'Please match prepared quantities with loading staff before departure'}
              </p>
            </div>
            <Button 
              className="w-full h-14 text-lg font-bold bg-[#D4A853] hover:bg-[#B8923F] text-white rounded-2xl shadow-lg"
              onClick={() => setIsLoadingVerified(true)}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {language === 'ar' ? 'تأكيد المطابقة (تم التحميل)' : 'Confirm Match (Loaded)'}
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'dashboard' && (
              <ScrollArea className="flex-1 p-4 bg-[#FFFEF7]">
                <h3 className="font-bold text-[#3D3229] mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  {t('orders.title')}
                </h3>
                
                <div className="space-y-4 pb-20">
                  {driverOrders.filter(o => o.status !== 'delivered').map(order => (
                    <Card key={order.id} className="border-0 shadow-md bg-white">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm font-bold text-[#2D5A3D]">{order.orderNumber}</div>
                            <div className="text-[10px] text-[#7A6F63]">{order.createdAt}</div>
                          </div>
                          <StatusBadge status={order.status} t={t} />
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                          <User className="h-3.5 w-3.5 text-[#D4A853]" />
                          <span className="text-xs font-bold">{order.customer.name}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateStatus(order.id, 'in_delivery')}
                              className="bg-[#D4A853] hover:bg-[#B8923F] text-white text-xs h-8"
                            >
                              {t('orders.inDelivery')}
                            </Button>
                          )}
                          {order.status === 'in_delivery' && (
                            <div className="flex flex-col gap-2 col-span-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setAdjustItems(order.orderItems || []);
                                  setIsAdjustOpen(true);
                                }}
                                variant="outline"
                                className="border-[#D4A853] text-[#D4A853] text-xs h-8"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                {language === 'ar' ? 'تعديل / مرتجع' : 'Adjust / Return'}
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsSignOpen(true);
                                }}
                                className="bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white text-xs h-8"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('orders.delivered')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === 'cash' && (
              <ScrollArea className="flex-1 p-6 bg-[#FDFBF7]">
                <div className="space-y-6 pb-20">
                  <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wallet className="h-20 w-20" />
                    </div>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">{language === 'ar' ? 'نقدية بانتظار التسليم' : 'Cash Pending Handover'}</p>
                    <h2 className="text-4xl font-black mb-4">€1,450.50</h2>
                    <div className="flex items-center gap-2 text-[10px] bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                      <Clock className="h-3 w-3" />
                      {language === 'ar' ? 'آخر جولة: منذ ساعتين' : 'Last Tour: 2h ago'}
                    </div>
                  </div>

                  {/* Official Discharge Indicator */}
                  <Card className="border-0 shadow-md bg-white overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{isRTL ? 'حالة إبراء الذمة' : 'Discharge Status'}</p>
                          <p className="text-[10px] text-slate-500">{isRTL ? 'بانتظار توقيع المحاسب' : 'Awaiting Accountant Sign'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 animate-pulse">
                        {isRTL ? 'عهدة معلقة' : 'On Custody'}
                      </Badge>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'سجل التسليمات الأخيرة' : 'Recent Handover History'}</h4>
                    {[
                      { id: 1, date: '14/05/2026', amount: 980.00, accountant: 'Fatima H.', time: '18:30' },
                      { id: 2, date: '13/05/2026', amount: 1200.50, accountant: 'Fatima H.', time: '17:45' }
                    ].map(log => (
                      <Card key={log.id} className="border-0 shadow-sm bg-white overflow-hidden border-l-4 border-emerald-500">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-slate-900">€{log.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">{log.date} - {log.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-end gap-1">
                              <FileSignature className="h-3 w-3" />
                              {log.accountant}
                            </p>
                            <p className="text-[8px] text-slate-400">{language === 'ar' ? 'توقيع إلكتروني مؤكد' : 'Verified Signature'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}

            {activeTab === 'lines' && (
              <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400 italic">
                {language === 'ar' ? 'خريطة مسارات التوصيل قيد التحميل...' : 'Delivery route maps loading...'}
              </div>
            )}
          </div>
        )}
        
        {/* Navigation Bar */}
        <div className="h-16 bg-white border-t border-[#E8DFD0] flex items-center justify-around px-4">
          <Button 
            variant="ghost" 
            className={`flex flex-col gap-0.5 ${activeTab === 'dashboard' ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Smartphone className="h-5 w-5" />
            <span className="text-[10px]">{t('app.dashboard')}</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col gap-0.5 ${activeTab === 'lines' ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}`}
            onClick={() => setActiveTab('lines')}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-[10px]">{t('nav.deliveryLines')}</span>
          </Button>
          <Button 
            variant="ghost" 
            className={`flex flex-col gap-0.5 ${activeTab === 'cash' ? 'text-[#2D5A3D]' : 'text-[#7A6F63]'}`}
            onClick={() => setActiveTab('cash')}
          >
            <Banknote className="h-5 w-5" />
            <span className="text-[10px]">{isRTL ? 'تسوية الكاش' : 'Cash'}</span>
          </Button>
          <Button variant="ghost" className="flex flex-col gap-0.5 text-[#7A6F63]">
            <User className="h-5 w-5" />
            <span className="text-[10px]">{language === 'ar' ? 'حسابي' : 'Profile'}</span>
          </Button>
        </div>
      </div>

      {/* Signature Dialog */}
      <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'توقيع المستلم' : 'Customer Signature'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SignaturePad 
              isRTL={language === 'ar'} 
              onSave={(data) => setSignatureUrl(data)}
              onClear={() => setSignatureUrl(null)}
            />
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-[#2D5A3D] text-white" 
              onClick={handleDeliver}
              disabled={!signatureUrl}
            >
              {language === 'ar' ? 'تأكيد التوصيل' : 'Confirm Delivery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="max-w-[90vw] rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {language === 'ar' ? 'تعديل الكميات / مرتجعات' : 'Adjust Quantities / Returns'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {adjustItems.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="text-xs font-bold">{item.product.nameAr || item.product.nameEn}</div>
                  <div className="text-[10px] text-gray-500">{item.unitPrice}€ / {language === 'ar' ? 'قطعة' : 'pc'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full bg-red-50 text-red-500"
                    onClick={() => {
                      const newItems = [...adjustItems];
                      if (newItems[idx].quantity > 0) newItems[idx].quantity -= 1;
                      setAdjustItems(newItems);
                    }}
                  >
                    -
                  </Button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full bg-green-50 text-green-500"
                    onClick={() => {
                      const newItems = [...adjustItems];
                      newItems[idx].quantity += 1;
                      setAdjustItems(newItems);
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-amber-600 font-bold flex justify-between">
                <span>{language === 'ar' ? 'توقيع مدير الصالة (إلزامي)' : 'Hall Manager Signature (Required)'}</span>
                {signatureUrl && <Badge className="bg-emerald-500">{isRTL ? 'تم التوقيع' : 'Signed'}</Badge>}
              </Label>
              <div className="border-2 border-amber-100 rounded-2xl overflow-hidden bg-amber-50/50 h-40 relative">
                <SignaturePad 
                  onSave={(data) => setSignatureUrl(data)}
                  onClear={() => setSignatureUrl(null)}
                />
                {!signatureUrl && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 flex-col gap-1">
                    <FileSignature className="h-8 w-8" />
                    <p className="text-[10px] font-bold">{isRTL ? 'توقيع المستلم للمرتجعات' : 'Sign to verify returns'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-[#D4A853] text-white h-12 font-bold" 
              onClick={handleSaveAdjustment}
              disabled={!signatureUrl}
            >
              {language === 'ar' ? 'حفظ وإخلاء طرف للمرتجعات' : 'Save & Discharge Returns'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
