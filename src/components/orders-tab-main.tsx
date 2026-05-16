 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Package, Truck, Users, Plus, Edit, Trash2, Eye, Phone,
  ShoppingBag, RefreshCw, User
} from 'lucide-react';
import { Order, Product, Driver, DeliveryLine } from '@/lib/types';

// Status Badge Component (Extracted for local use or could be shared)
function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    pending: { className: 'status-pending', label: t('orders.pending') },
    confirmed: { className: 'status-confirmed', label: t('orders.confirmed') },
    in_delivery: { className: 'status-in_delivery', label: t('orders.inDelivery') },
    delivered: { className: 'status-delivered', label: t('orders.delivered') },
    cancelled: { className: 'status-cancelled', label: t('orders.cancelled') },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function OrdersTab() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  const fetchDeliveryLines = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery-lines');
      const data = await res.json();
      setDeliveryLines(data);
    } catch (error) {
      console.error('Error fetching delivery lines:', error);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    void fetchDrivers();
    void fetchDeliveryLines();
  }, [fetchOrders, fetchDrivers, fetchDeliveryLines]);

  const updateOrderStatus = async (orderId: string, status: string, driverId?: string) => {
    try {
      const updateData: { status: string; driverId?: string } = { status };
      if (driverId) updateData.driverId = driverId;
      
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    if (language === 'ku') return product.nameAr;
    return product.nameEn;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_delivery: orders.filter(o => o.status === 'in_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('orders.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{orders.length} {t('orders.total')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] border-[#E8DFD0] bg-white">
              <SelectValue placeholder={t('actions.filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('orders.title')} ({statusCounts.all})</SelectItem>
              <SelectItem value="pending">{t('orders.pending')} ({statusCounts.pending})</SelectItem>
              <SelectItem value="confirmed">{t('orders.confirmed')} ({statusCounts.confirmed})</SelectItem>
              <SelectItem value="in_delivery">{t('orders.inDelivery')} ({statusCounts.in_delivery})</SelectItem>
              <SelectItem value="delivered">{t('orders.delivered')} ({statusCounts.delivered})</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#2D5A3D]">{order.orderNumber}</span>
                          <StatusBadge status={order.status} t={t} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#7A6F63]">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {order.customer.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer.phone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-[#7A6F63]">{order.deliveryTime || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-sm text-[#5C4033]">
                          {getProductName(item.product)} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    
                    {order.driver && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-[#2D5A3D]">
                        <Truck className="h-4 w-4" />
                        <span>{order.driver.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
                          <Eye className="h-4 w-4 mr-1" />
                          {t('actions.view')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
                        <DialogHeader>
                          <DialogTitle className="text-[#3D3229]">{t('orders.orderNumber')}: {order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.status')}</Label>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('orders.confirmed')}</SelectItem>
                                <SelectItem value="in_delivery">{t('orders.inDelivery')}</SelectItem>
                                <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                                <SelectItem value="cancelled">{t('orders.cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.driver')}</Label>
                            <Select 
                              value={order.driverId || ''} 
                              onValueChange={(value) => updateOrderStatus(order.id, order.status, value)}
                            >
                              <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                                <SelectValue placeholder={t('orders.driver')} />
                              </SelectTrigger>
                              <SelectContent>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="p-4 bg-[#F5EDE0] rounded-xl">
                            <div className="font-medium text-[#3D3229]">{order.customer.name}</div>
                            <div className="text-sm text-[#7A6F63] mt-1">{order.customer.phone}</div>
                            <div className="text-sm text-[#7A6F63]">{order.customer.address}, {order.customer.city}</div>
                          </div>
                          <div>
                            <Label className="text-[#7A6F63]">{t('orders.items')}</Label>
                            <div className="mt-2 space-y-2">
                              {order.orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-[#FFFEF7] rounded-lg border border-[#E8DFD0]">
                                  <span className="text-[#3D3229]">{getProductName(item.product)} × {item.quantity}</span>
                                  <span className="font-medium text-[#D4A853]">€{item.total.toFixed(2)}</span>
                                </div>
                              ))}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-bold text-[#3D3229]">
                                <span>{t('orders.total')}</span>
                                <span className="text-[#D4A853]">€{order.totalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
