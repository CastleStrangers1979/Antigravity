/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  MapPin, Navigation, Truck, Clock, Phone, RefreshCw, Play, Pause,
  User, Package, CheckCircle, AlertTriangle, Route, Timer, Battery
} from 'lucide-react';

// Netherlands center coordinates
const NETHERLANDS_CENTER = { lat: 52.1326, lng: 5.2913 };

// Dutch cities for delivery lines
const CITY_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Rotterdam': { lat: 51.9225, lng: 4.47917 },
  'The Hague': { lat: 52.0705, lng: 4.3007 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Utrecht': { lat: 52.0907, lng: 5.1214 },
  'Alkmaar': { lat: 52.6324, lng: 4.7534 },
  'Zwolle': { lat: 52.5168, lng: 6.0830 },
};

// Types
interface DriverLocation {
  id: string;
  name: string;
  lineName: string;
  lat: number;
  lng: number;
  color: string;
  status: string;
  speed: number;
  heading: number;
  battery: number;
  lastUpdate: Date;
  ordersCount: number;
  completedCount: number;
  eta?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: string;
  driverId?: string;
  eta?: string;
  distance?: number;
}

const getDriverColor = (index: number): string => {
  const colors = ['#D4A853', '#2D5A3D', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#F39C12', '#E91E63'];
  return colors[index % colors.length];
};

export default function LiveTrackingTab() {
  const { language } = useLanguage();
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [filterStatus, setFilterStatus] = useState('all');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      
      const driverLocations: DriverLocation[] = data.map((driver: any, index: number) => {
        const region = driver.deliveryLine?.region || 'Amsterdam';
        const cityLoc = CITY_LOCATIONS[region] || CITY_LOCATIONS['Amsterdam'];
        return {
          id: driver.id,
          name: driver.name,
          lineName: driver.deliveryLine?.nameAr || region,
          lat: cityLoc.lat + (Math.random() - 0.5) * 0.2,
          lng: cityLoc.lng + (Math.random() - 0.5) * 0.2,
          color: getDriverColor(index),
          status: driver.isOnline ? 'active' : 'offline',
          speed: Math.floor(Math.random() * 40) + 20,
          heading: Math.floor(Math.random() * 360),
          battery: Math.floor(Math.random() * 40) + 60,
          lastUpdate: new Date(),
          ordersCount: Math.floor(Math.random() * 10) + 5,
          completedCount: Math.floor(Math.random() * 5) + 2,
          eta: `${Math.floor(Math.random() * 30) + 10} min`,
        };
      });
      
      setDrivers(driverLocations);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // Mock data
      setDrivers(mockDrivers);
    }
    setOrders(mockOrders);
  }, []);

  useEffect(() => {
    void fetchDrivers();
  }, [fetchDrivers]);

  const mockDrivers: DriverLocation[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      lineName: 'خط روتردام',
      lat: 51.92,
      lng: 4.48,
      color: '#D4A853',
      status: 'active',
      speed: 35,
      heading: 180,
      battery: 85,
      lastUpdate: new Date(),
      ordersCount: 8,
      completedCount: 5,
      eta: '15 min',
    },
    {
      id: '2',
      name: 'محمد علي',
      lineName: 'خط أمستردام',
      lat: 52.37,
      lng: 4.90,
      color: '#2D5A3D',
      status: 'active',
      speed: 28,
      heading: 90,
      battery: 72,
      lastUpdate: new Date(),
      ordersCount: 6,
      completedCount: 3,
      eta: '22 min',
    },
    {
      id: '3',
      name: 'خالد حسن',
      lineName: 'خط لاهاي',
      lat: 52.07,
      lng: 4.30,
      color: '#E74C3C',
      status: 'active',
      speed: 42,
      heading: 270,
      battery: 45,
      lastUpdate: new Date(),
      ordersCount: 10,
      completedCount: 7,
      eta: '8 min',
    },
  ];

  const mockOrders: Order[] = [
    { id: '1', orderNumber: 'ORD-001', customerName: 'سارة علي', address: 'Rotterdam 123', status: 'in_delivery', driverId: '1', eta: '15 min', distance: 3.5 },
    { id: '2', orderNumber: 'ORD-002', customerName: 'محمد خالد', address: 'Amsterdam 456', status: 'pending', driverId: '2', eta: '22 min', distance: 5.2 },
    { id: '3', orderNumber: 'ORD-003', customerName: 'فاطمة حسن', address: 'The Hague 789', status: 'delivered', driverId: '3', distance: 2.1 },
  ];

  const startSimulation = () => {
    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      setDrivers(prev => prev.map(driver => ({
        ...driver,
        lat: driver.lat + (Math.random() - 0.5) * 0.005,
        lng: driver.lng + (Math.random() - 0.5) * 0.005,
        heading: (driver.heading + (Math.random() - 0.5) * 20) % 360,
        speed: Math.max(0, driver.speed + (Math.random() - 0.5) * 10),
        lastUpdate: new Date(),
      })));
    }, 2000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'التتبع المباشر للسائقين',
        map: 'الخريطة',
        drivers: 'السائقين',
        orders: 'الطلبات',
        active: 'نشط',
        offline: 'غير متصل',
        delivering: 'قيد التوصيل',
        delivered: 'تم التوصيل',
        pending: 'معلق',
        speed: 'السرعة',
        battery: 'البطارية',
        ordersCount: 'عدد الطلبات',
        completed: 'مكتمل',
        eta: 'وقت الوصول المتوقع',
        lastUpdate: 'آخر تحديث',
        simulate: 'محاكاة',
        stop: 'إيقاف',
        refresh: 'تحديث',
        driverName: 'اسم السائق',
        line: 'الخط',
        status: 'الحالة',
        actions: 'الإجراءات',
        customer: 'العميل',
        address: 'العنوان',
        distance: 'المسافة',
        call: 'اتصال',
        trackOrder: 'تتبع الطلب',
        filterByStatus: 'تصفية حسب الحالة',
        all: 'الكل',
        liveTracking: 'تتبع مباشر',
        avgETA: 'متوسط وقت الوصول',
        activeDrivers: 'سائقين نشطين',
        totalOrders: 'إجمالي الطلبات',
      },
      en: {
        title: 'Live Driver Tracking',
        map: 'Map',
        drivers: 'Drivers',
        orders: 'Orders',
        active: 'Active',
        offline: 'Offline',
        delivering: 'Delivering',
        delivered: 'Delivered',
        pending: 'Pending',
        speed: 'Speed',
        battery: 'Battery',
        ordersCount: 'Orders',
        completed: 'Completed',
        eta: 'ETA',
        lastUpdate: 'Last Update',
        simulate: 'Simulate',
        stop: 'Stop',
        refresh: 'Refresh',
        driverName: 'Driver Name',
        line: 'Line',
        status: 'Status',
        actions: 'Actions',
        customer: 'Customer',
        address: 'Address',
        distance: 'Distance',
        call: 'Call',
        trackOrder: 'Track Order',
        filterByStatus: 'Filter by Status',
        all: 'All',
        liveTracking: 'Live Tracking',
        avgETA: 'Avg ETA',
        activeDrivers: 'Active Drivers',
        totalOrders: 'Total Orders',
      },
    };
    return translations[language]?.[key] || key;
  };

  const stats = {
    activeDrivers: drivers.filter(d => d.status === 'active').length,
    totalOrders: orders.length,
    avgETA: '18 min',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <MapPin className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDrivers} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
          <Button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={isSimulating ? 'bg-red-500 hover:bg-red-600' : 'green-gradient'}
          >
            {isSimulating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                {t('stop')}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t('simulate')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('activeDrivers')}</p>
                <p className="text-2xl font-bold text-[#2D5A3D]">{stats.activeDrivers}</p>
              </div>
              <Truck className="h-8 w-8 text-[#D4A853]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('totalOrders')}</p>
                <p className="text-2xl font-bold text-[#3D3229]">{stats.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-[#D4A853]" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7A6F63]">{t('avgETA')}</p>
                <p className="text-2xl font-bold text-[#D4A853]">{stats.avgETA}</p>
              </div>
              <Clock className="h-8 w-8 text-[#D4A853]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="map" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <MapPin className="h-4 w-4 mr-2" />
            {t('map')}
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Truck className="h-4 w-4 mr-2" />
            {t('drivers')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            {t('orders')}
          </TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 gold-gradient" />
            <CardContent className="p-0">
              <div 
                className="relative w-full h-[500px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(165, 214, 167, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(165, 214, 167, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              >
                {/* Netherlands outline shape */}
                <svg viewBox="0 0 200 250" className="absolute inset-0 w-full h-full opacity-20">
                  <path
                    d="M100,10 L150,30 L180,80 L170,150 L140,200 L100,240 L60,200 L30,150 L20,80 L50,30 Z"
                    fill="#2D5A3D"
                    stroke="#1B4332"
                    strokeWidth="2"
                  />
                </svg>

                {/* City markers */}
                {Object.entries(CITY_LOCATIONS).map(([city, coords]) => {
                  const x = ((coords.lng - 3.3) / 5) * 100;
                  const y = ((53.5 - coords.lat) / 2.5) * 100;
                  return (
                    <div
                      key={city}
                      className="absolute w-3 h-3 bg-[#2D5A3D] rounded-full opacity-40"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={city}
                    />
                  );
                })}

                {/* Driver markers */}
                {drivers.filter(d => d.status === 'active').map((driver) => {
                  const x = ((driver.lng - 3.3) / 5) * 100;
                  const y = ((53.5 - driver.lat) / 2.5) * 100;
                  const isSelected = selectedDriver?.id === driver.id;

                  return (
                    <div
                      key={driver.id}
                      className={`absolute cursor-pointer transition-all duration-500 ${isSelected ? 'z-20 scale-125' : 'z-10'}`}
                      style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                      onClick={() => setSelectedDriver(isSelected ? null : driver)}
                    >
                      <div
                        className={`absolute -inset-2 rounded-full opacity-30 ${isSimulating ? 'animate-ping' : ''}`}
                        style={{ backgroundColor: driver.color }}
                      />
                      <div
                        className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        style={{ backgroundColor: driver.color, transform: `rotate(${driver.heading}deg)` }}
                      >
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      {isSelected && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-4 min-w-[200px] z-30">
                          <p className="font-bold text-[#3D3229]">{driver.name}</p>
                          <p className="text-sm text-[#7A6F63]">{driver.lineName}</p>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-[#7A6F63]">{t('speed')}:</span>
                              <span className="font-medium">{driver.speed} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#7A6F63]">{t('battery')}:</span>
                              <span className="font-medium">{driver.battery}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#7A6F63]">{t('ordersCount')}:</span>
                              <span className="font-medium">{driver.completedCount}/{driver.ordersCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#7A6F63]">{t('eta')}:</span>
                              <span className="font-medium text-[#D4A853]">{driver.eta}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Simulation indicator */}
                {isSimulating && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    {t('liveTracking')}
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                  <p className="text-xs font-medium text-[#3D3229] mb-2">{t('activeDrivers')}</p>
                  <div className="space-y-1">
                    {drivers.slice(0, 4).map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[#3D3229]">{d.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead>{t('driverName')}</TableHead>
                    <TableHead>{t('line')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('ordersCount')}</TableHead>
                    <TableHead>{t('eta')}</TableHead>
                    <TableHead>{t('speed')}</TableHead>
                    <TableHead>{t('battery')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: driver.color }} />
                          <span className="font-medium">{driver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{driver.lineName}</TableCell>
                      <TableCell>
                        <Badge className={driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {t(driver.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{driver.completedCount}/{driver.ordersCount}</TableCell>
                      <TableCell className="text-[#D4A853] font-medium">{driver.eta}</TableCell>
                      <TableCell>{driver.speed} km/h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Battery className={`h-4 w-4 ${driver.battery < 30 ? 'text-red-500' : 'text-green-500'}`} />
                          {driver.battery}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] border-[#E8DFD0]">
                    <SelectValue placeholder={t('filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="in_delivery">{t('delivering')}</SelectItem>
                    <SelectItem value="delivered">{t('delivered')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead>#{language === 'ar' ? 'رقم' : 'Order'}</TableHead>
                    <TableHead>{t('customer')}</TableHead>
                    <TableHead>{t('address')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('eta')}</TableHead>
                    <TableHead>{t('distance')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'in_delivery' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {t(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.eta || '-'}</TableCell>
                      <TableCell>{order.distance ? `${order.distance} km` : '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
