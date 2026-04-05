'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import {
  MapPin, Truck, Navigation, Clock, CheckCircle, AlertCircle, Phone, User,
  Package, Route, Zap, Timer, Star, TrendingUp, BarChart3, PieChart,
  Plus, Edit, Trash2, Eye, RefreshCw, Send, Play, Pause, Settings,
  MapPinned, Target, AlertTriangle, DollarSign, Users, Box, ChevronRight,
  Camera, FileSignature, Bell, Activity, Layers, CircleDot, Award
} from 'lucide-react';

// Types
interface DriverLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  lineName: string;
  isOnline: boolean;
  lastUpdate: Date | null;
  activeOrders: number;
  orders: DeliveryOrder[];
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  driver?: {
    id: string;
    name: string;
  } | null;
  totalAmount: number;
  estimatedArrival?: number;
  distance?: string;
  createdAt: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string | null;
  deliveryFee: number;
  minOrderAmount: number | null;
  estimatedTime: string | null;
  isActive: boolean;
  ordersCount?: number;
  avgDeliveryTime?: number;
  satisfactionRate?: string;
}

interface TrafficCondition {
  area: string;
  status: 'light' | 'moderate' | 'heavy';
  delay: number;
}

interface TrackingSummary {
  totalActiveDrivers: number;
  totalActiveDeliveries: number;
  averageETA: number;
  onlineDrivers: number;
}

// Netherlands city locations for simulation
const CITY_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Rotterdam': { lat: 51.9225, lng: 4.47917 },
  'The Hague': { lat: 52.0705, lng: 4.3007 },
  'Alkmaar': { lat: 52.6324, lng: 4.7534 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Utrecht': { lat: 52.0907, lng: 5.1214 },
  'Zwolle': { lat: 52.5168, lng: 6.0830 },
  'Enschede': { lat: 52.2215, lng: 6.8937 },
  'Arnhem': { lat: 51.9851, lng: 5.8987 },
};

const getDriverColor = (index: number): string => {
  const colors = ['#D4A853', '#2D5A3D', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#F39C12', '#E91E63'];
  return colors[index % colors.length];
};

// Stats Card Component
function StatsCard({ title, value, icon: Icon, trend, color = 'gold' }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: 'gold' | 'green' | 'amber' | 'red' | 'blue';
}) {
  const colorClasses = {
    gold: 'from-[#D4A853] to-[#B8923F]',
    green: 'from-[#2D5A3D] to-[#1E4A2D]',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-2xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className="text-xs text-[#2D5A3D] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="h-1 gold-gradient" />
    </Card>
  );
}

// GPS Map Component
function GPSMap({ drivers, isSimulating, onToggleSimulation, language }: {
  drivers: DriverLocation[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  language: string;
}) {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#D4A853]" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#2D5A3D]" />
            {language === 'ar' ? 'تتبع GPS المباشر' : 'Live GPS Tracking'}
          </CardTitle>
          <Button
            size="sm"
            onClick={onToggleSimulation}
            className={isSimulating ? 'bg-red-500 hover:bg-red-600 text-white' : 'green-gradient text-white'}
          >
            {isSimulating ? <><Pause className="h-4 w-4 mr-1" />{language === 'ar' ? 'إيقاف' : 'Stop'}</> : <><Play className="h-4 w-4 mr-1" />{language === 'ar' ? 'محاكاة' : 'Simulate'}</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="relative w-full h-[350px] rounded-xl overflow-hidden bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#A5D6A7]"
          style={{
            backgroundImage: `linear-gradient(rgba(165, 214, 167, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(165, 214, 167, 0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Netherlands outline */}
          <svg viewBox="0 0 200 250" className="absolute inset-0 w-full h-full opacity-20">
            <path d="M100,10 L150,30 L180,80 L170,150 L140,200 L100,240 L60,200 L30,150 L20,80 L50,30 Z" fill="#2D5A3D" stroke="#1B4332" strokeWidth="2" />
          </svg>

          {/* Driver markers */}
          {drivers.map((driver) => {
            const x = ((driver.lng - 3.3) / 5) * 100;
            const y = ((53.5 - driver.lat) / 2.5) * 100;
            const isSelected = selectedDriver === driver.id;

            return (
              <div
                key={driver.id}
                className={`absolute cursor-pointer transition-all duration-500 ${isSelected ? 'z-20 scale-125' : 'z-10'}`}
                style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                onClick={() => setSelectedDriver(isSelected ? null : driver.id)}
              >
                <div className={`absolute -inset-2 rounded-full opacity-30 ${isSimulating ? 'animate-ping' : ''}`} style={{ backgroundColor: driver.color }} />
                <div className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style={{ backgroundColor: driver.color }}>
                  <Truck className="w-4 h-4 text-white" />
                </div>
                {isSelected && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[180px] z-30">
                    <div className="font-bold text-[#3D3229]">{driver.name}</div>
                    <div className="text-sm text-[#7A6F63]">{driver.lineName}</div>
                    <div className="text-xs text-[#2D5A3D] mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                    </div>
                    <div className="text-xs text-[#D4A853] mt-1">
                      {driver.activeOrders} {language === 'ar' ? 'طلبات نشطة' : 'active orders'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
            <div className="text-xs font-medium text-[#3D3229] mb-1">
              {language === 'ar' ? 'السائقين النشطين' : 'Active Drivers'}
            </div>
            <div className="flex flex-wrap gap-1">
              {drivers.slice(0, 4).map(d => (
                <Badge key={d.id} className="text-xs" style={{ backgroundColor: d.color }}>{d.name.split(' ')[0]}</Badge>
              ))}
              {drivers.length > 4 && <Badge className="text-xs bg-gray-400">+{drivers.length - 4}</Badge>}
            </div>
          </div>

          {isSimulating && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              {language === 'ar' ? 'محاكاة نشطة' : 'Live Simulation'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Delivery Tab Component
export default function DeliveryTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'tracking' | 'routes' | 'status' | 'dispatch' | 'analytics' | 'zones'>('tracking');

  // State
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [trafficConditions, setTrafficConditions] = useState<TrafficCondition[]>([]);
  const [trackingSummary, setTrackingSummary] = useState<TrackingSummary | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Dialog states
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [zoneForm, setZoneForm] = useState({ name: '', deliveryFee: '', minOrderAmount: '', estimatedTime: '' });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [trackingRes, zonesRes, ordersRes] = await Promise.all([
        fetch('/api/delivery/tracking'),
        fetch('/api/delivery/zones'),
        fetch('/api/orders'),
      ]);

      const trackingData = await trackingRes.json();
      const zonesData = await zonesRes.json();
      const ordersData = await ordersRes.json();

      // Map drivers with positions
      const mappedDrivers: DriverLocation[] = (trackingData.activeDrivers || []).map((d: any, index: number) => ({
        id: d.id,
        name: d.name,
        lat: d.latitude || 52.3676 + (Math.random() - 0.5) * 0.5,
        lng: d.longitude || 4.9041 + (Math.random() - 0.5) * 1,
        color: getDriverColor(index),
        lineName: d.deliveryLine?.nameAr || d.deliveryLine?.nameEn || 'Unknown',
        isOnline: d.isOnline,
        lastUpdate: d.lastLocationUpdate ? new Date(d.lastLocationUpdate) : null,
        activeOrders: d.orders?.length || 0,
        orders: d.orders || []
      }));

      setDrivers(mappedDrivers);
      setTrafficConditions(trackingData.trafficConditions || []);
      setTrackingSummary(trackingData.summary);
      setZones(zonesData.zones || []);
      setOrders(ordersData.filter((o: DeliveryOrder) => ['confirmed', 'in_delivery'].includes(o.status)));
    } catch (error) {
      console.error('Error fetching delivery data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  // Simulation
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      setIsSimulating(false);
    } else {
      simulationRef.current = setInterval(() => {
        setDrivers(prev => prev.map(d => ({
          ...d,
          lat: d.lat + (Math.random() - 0.5) * 0.005,
          lng: d.lng + (Math.random() - 0.5) * 0.005
        })));
      }, 2000);
      setIsSimulating(true);
    }
  };

  // Handle zone creation
  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/delivery/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: zoneForm.name,
          deliveryFee: parseFloat(zoneForm.deliveryFee) || 0,
          minOrderAmount: parseFloat(zoneForm.minOrderAmount) || null,
          estimatedTime: zoneForm.estimatedTime || null
        })
      });
      setIsZoneDialogOpen(false);
      setZoneForm({ name: '', deliveryFee: '', minOrderAmount: '', estimatedTime: '' });
      fetchData();
      toast({ title: language === 'ar' ? 'تم إنشاء المنطقة' : 'Zone created successfully' });
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  // Handle dispatch
  const handleDispatch = async () => {
    if (!selectedOrder || !selectedDriverId) return;
    try {
      await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, status: 'confirmed' })
      });
      setIsDispatchDialogOpen(false);
      setSelectedOrder(null);
      setSelectedDriverId('');
      fetchData();
      toast({ title: language === 'ar' ? 'تم تعيين السائق' : 'Driver assigned successfully' });
    } catch (error) {
      console.error('Error dispatching:', error);
    }
  };

  // Calculate analytics
  const analytics = {
    avgDeliveryTime: 25,
    onTimeRate: 92.5,
    driverEfficiency: drivers.length > 0 ? Math.round(drivers.reduce((sum, d) => sum + d.activeOrders, 0) / drivers.length) : 0,
    customerSatisfaction: 4.7,
    totalDeliveries: orders.filter(o => o.status === 'delivered').length || 156,
    pendingOrders: orders.filter(o => o.status === 'confirmed').length,
    inTransit: orders.filter(o => o.status === 'in_delivery').length
  };

  const sectionLabels = {
    tracking: language === 'ar' ? 'تتبع GPS' : 'GPS Tracking',
    routes: language === 'ar' ? 'تحسين المسار' : 'Route Optimization',
    status: language === 'ar' ? 'تتبع الحالة' : 'Status Tracking',
    dispatch: language === 'ar' ? 'توزيع السائقين' : 'Driver Dispatch',
    analytics: language === 'ar' ? 'تحليلات التوصيل' : 'Delivery Analytics',
    zones: language === 'ar' ? 'مناطق التوصيل' : 'Delivery Zones'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Truck className="h-7 w-7 text-[#D4A853]" />
            {language === 'ar' ? 'نظام تتبع التوصيل' : 'Delivery Tracking System'}
          </h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'إدارة وتتبع عمليات التوصيل' : 'Manage and track delivery operations'}</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="border-[#D4A853] text-[#D4A853]">
          <RefreshCw className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E8DFD0]">
        {(['tracking', 'routes', 'status', 'dispatch', 'analytics', 'zones'] as const).map((section) => (
          <Button
            key={section}
            variant={activeSection === section ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section)}
            className={activeSection === section ? 'bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white' : 'border-[#E8DFD0] text-[#7A6F63] hover:bg-[#F5EDE0]'}
          >
            {section === 'tracking' && <MapPin className="h-4 w-4 mr-1" />}
            {section === 'routes' && <Route className="h-4 w-4 mr-1" />}
            {section === 'status' && <Package className="h-4 w-4 mr-1" />}
            {section === 'dispatch' && <Users className="h-4 w-4 mr-1" />}
            {section === 'analytics' && <BarChart3 className="h-4 w-4 mr-1" />}
            {section === 'zones' && <Layers className="h-4 w-4 mr-1" />}
            {sectionLabels[section]}
          </Button>
        ))}
      </div>

      {/* GPS TRACKING SECTION */}
      {activeSection === 'tracking' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={language === 'ar' ? 'السائقين النشطين' : 'Active Drivers'} value={trackingSummary?.totalActiveDrivers || drivers.length} icon={Truck} color="green" />
            <StatsCard title={language === 'ar' ? 'التوصيلات النشطة' : 'Active Deliveries'} value={trackingSummary?.totalActiveDeliveries || orders.length} icon={Package} color="gold" />
            <StatsCard title={language === 'ar' ? 'متوسط ETA' : 'Average ETA'} value={`${trackingSummary?.averageETA || 22} ${language === 'ar' ? 'د' : 'min'}`} icon={Clock} color="blue" />
            <StatsCard title={language === 'ar' ? 'سائقين أونلاين' : 'Online Drivers'} value={trackingSummary?.onlineDrivers || drivers.filter(d => d.isOnline).length} icon={Activity} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GPSMap drivers={drivers} isSimulating={isSimulating} onToggleSimulation={toggleSimulation} language={language} />
            </div>

            {/* Traffic & Driver List */}
            <div className="space-y-4">
              {/* Traffic Conditions */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#3D3229] text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    {language === 'ar' ? 'حالة المرور' : 'Traffic Conditions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trafficConditions.map((traffic, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#F5EDE0] rounded-lg">
                        <span className="text-sm font-medium text-[#3D3229]">{traffic.area}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={traffic.status === 'heavy' ? 'bg-red-500' : traffic.status === 'moderate' ? 'bg-amber-500' : 'bg-green-500'}>
                            {traffic.status}
                          </Badge>
                          <span className="text-xs text-[#7A6F63]">+{traffic.delay}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Driver List */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#3D3229] text-base">{language === 'ar' ? 'قائمة السائقين' : 'Driver List'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {drivers.map(driver => (
                        <div key={driver.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: driver.color }}>
                            {driver.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#3D3229]">{driver.name}</p>
                            <p className="text-xs text-[#7A6F63]">{driver.activeOrders} {language === 'ar' ? 'طلبات' : 'orders'}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ROUTE OPTIMIZATION SECTION */}
      {activeSection === 'routes' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Preview */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Route className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'معاينة المسار' : 'Route Preview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={order.id} className="flex items-start gap-3 p-3 bg-[#F5EDE0] rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2D5A3D] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#3D3229]">{order.customer.name}</p>
                        <p className="text-sm text-[#7A6F63]">{order.customer.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{order.orderNumber}</Badge>
                          <span className="text-xs text-[#D4A853]">{order.distance || '2.5 km'}</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#7A6F63]">{order.estimatedArrival || 15} {language === 'ar' ? 'د' : 'min'}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 green-gradient text-white">
                    <Zap className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تحسين المسار' : 'Optimize Route'}
                  </Button>
                  <Button variant="outline" className="border-[#E8DFD0]">
                    <Edit className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Routes */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#2D5A3D]" />
                  {language === 'ar' ? 'المسارات المحفوظة' : 'Saved Routes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Central Route', 'North District', 'South Loop'].map((routeName, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2D5A3D] to-[#4A7A5C] flex items-center justify-center text-white">
                          <Route className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#3D3229]">{routeName}</p>
                          <p className="text-xs text-[#7A6F63]">{Math.floor(Math.random() * 10) + 5} {language === 'ar' ? 'محطات' : 'stops'}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-dashed border-[#D4A853] text-[#D4A853]">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'حفظ مسار جديد' : 'Save New Route'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* STATUS TRACKING SECTION */}
      {activeSection === 'status' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard title={language === 'ar' ? 'في الانتظار' : 'Pending'} value={analytics.pendingOrders} icon={Clock} color="amber" />
            <StatsCard title={language === 'ar' ? 'قيد التوصيل' : 'In Transit'} value={analytics.inTransit} icon={Truck} color="blue" />
            <StatsCard title={language === 'ar' ? 'تم التوصيل' : 'Delivered'} value={analytics.totalDeliveries} icon={CheckCircle} color="green" />
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'تتبع حالة الطلبات' : 'Order Status Tracking'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-[#7A6F63]">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{language === 'ar' ? 'لا توجد طلبات نشطة' : 'No active orders'}</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 bg-[#F5EDE0] rounded-xl">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#2D5A3D] text-white">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#3D3229]">{order.orderNumber}</p>
                              <p className="text-sm text-[#7A6F63]">{order.customer.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={order.status === 'in_delivery' ? 'bg-blue-500' : 'bg-amber-500'}>
                              {order.status === 'in_delivery' ? (language === 'ar' ? 'قيد التوصيل' : 'In Transit') : (language === 'ar' ? 'مؤكد' : 'Confirmed')}
                            </Badge>
                            {order.estimatedArrival && (
                              <span className="text-sm text-[#D4A853]">{order.estimatedArrival} {language === 'ar' ? 'د' : 'min'}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 text-[#7A6F63]">
                              <MapPin className="h-4 w-4" />
                              {order.customer.address}, {order.customer.city}
                            </p>
                            <p className="flex items-center gap-2 text-[#7A6F63]">
                              <Phone className="h-4 w-4" />
                              {order.customer.phone}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="border-[#D4A853] text-[#D4A853]">
                              <Camera className="h-4 w-4 mr-1" />
                              {language === 'ar' ? 'صورة' : 'Photo'}
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#2D5A3D] text-[#2D5A3D]">
                              <FileSignature className="h-4 w-4 mr-1" />
                              {language === 'ar' ? 'توقيع' : 'Signature'}
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-500">
                              <Bell className="h-4 w-4 mr-1" />
                              {language === 'ar' ? 'إشعار' : 'Notify'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* DRIVER DISPATCH SECTION */}
      {activeSection === 'dispatch' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unassigned Orders */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  {language === 'ar' ? 'طلبات بدون سائق' : 'Unassigned Orders'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {orders.filter(o => !o.driver).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div>
                          <p className="font-medium text-[#3D3229]">{order.orderNumber}</p>
                          <p className="text-sm text-[#7A6F63]">{order.customer.name} - {order.customer.city}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="green-gradient text-white"
                          onClick={() => { setSelectedOrder(order); setIsDispatchDialogOpen(true); }}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {language === 'ar' ? 'تعيين' : 'Assign'}
                        </Button>
                      </div>
                    ))}
                    {orders.filter(o => !o.driver).length === 0 && (
                      <div className="text-center py-8 text-[#7A6F63]">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>{language === 'ar' ? 'جميع الطلبات معينة' : 'All orders assigned'}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Driver Workload */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#2D5A3D]" />
                  {language === 'ar' ? 'حمل عمل السائقين' : 'Driver Workload'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: driver.color }}>
                            {driver.name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#3D3229]">{driver.name}</span>
                        </div>
                        <Badge className={driver.activeOrders > 5 ? 'bg-red-500' : driver.activeOrders > 3 ? 'bg-amber-500' : 'bg-green-500'}>
                          {driver.activeOrders} {language === 'ar' ? 'طلبات' : 'orders'}
                        </Badge>
                      </div>
                      <Progress value={(driver.activeOrders / 10) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 border-[#D4A853] text-[#D4A853]">
                    <Zap className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'موازنة تلقائية' : 'Auto Balance'}
                  </Button>
                  <Button variant="outline" className="border-[#E8DFD0]">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* DELIVERY ANALYTICS SECTION */}
      {activeSection === 'analytics' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={language === 'ar' ? 'متوسط وقت التوصيل' : 'Avg Delivery Time'} value={`${analytics.avgDeliveryTime} ${language === 'ar' ? 'د' : 'min'}`} icon={Timer} color="gold" />
            <StatsCard title={language === 'ar' ? 'معدل في الموعد' : 'On-Time Rate'} value={`${analytics.onTimeRate}%`} icon={Target} color="green" />
            <StatsCard title={language === 'ar' ? 'كفاءة السائقين' : 'Driver Efficiency'} value={`${analytics.driverEfficiency} ${language === 'ar' ? 'طلب/سائق' : 'orders/driver'}`} icon={TrendingUp} color="blue" />
            <StatsCard title={language === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction'} value={`${analytics.customerSatisfaction}/5`} icon={Star} color="gold" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Performance */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229]">{language === 'ar' ? 'أداء التوصيل' : 'Delivery Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: language === 'ar' ? 'في الموعد' : 'On Time', value: 85, color: 'bg-green-500' },
                    { label: language === 'ar' ? 'متأخر قليلاً' : 'Slightly Late', value: 10, color: 'bg-amber-500' },
                    { label: language === 'ar' ? 'متأخر' : 'Late', value: 5, color: 'bg-red-500' }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-[#7A6F63]">{item.label}</span>
                        <span className="text-sm font-medium text-[#3D3229]">{item.value}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Drivers */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-[#3D3229] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4A853]" />
                  {language === 'ar' ? 'أفضل السائقين' : 'Top Drivers'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drivers.slice(0, 5).map((driver, index) => (
                    <div key={driver.id} className="flex items-center gap-3 p-2 bg-[#F5EDE0] rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#3D3229]">{driver.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-[#7A6F63]">{(4.5 + Math.random() * 0.5).toFixed(1)}</span>
                        </div>
                      </div>
                      <Badge className="bg-[#2D5A3D]">{driver.activeOrders + Math.floor(Math.random() * 10)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* DELIVERY ZONES SECTION */}
      {activeSection === 'zones' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#3D3229]">{language === 'ar' ? 'مناطق التوصيل' : 'Delivery Zones'}</h3>
            <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
              <DialogTrigger asChild>
                <Button className="green-gradient text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إضافة منطقة' : 'Add Zone'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-[#E8DFD0]">
                <DialogHeader>
                  <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إضافة منطقة توصيل' : 'Add Delivery Zone'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateZone} className="space-y-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'اسم المنطقة' : 'Zone Name'}</Label>
                    <Input value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#7A6F63]">{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee (€)'}</Label>
                      <Input type="number" value={zoneForm.deliveryFee} onChange={(e) => setZoneForm({ ...zoneForm, deliveryFee: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                    </div>
                    <div>
                      <Label className="text-[#7A6F63]">{language === 'ar' ? 'الحد الأدنى' : 'Min Order (€)'}</Label>
                      <Input type="number" value={zoneForm.minOrderAmount} onChange={(e) => setZoneForm({ ...zoneForm, minOrderAmount: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الوقت المتوقع' : 'Estimated Time'}</Label>
                    <Input value={zoneForm.estimatedTime} onChange={(e) => setZoneForm({ ...zoneForm, estimatedTime: e.target.value })} className="mt-1.5 border-[#E8DFD0]" placeholder="e.g., 30-45 min" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="gold-gradient text-white">{language === 'ar' ? 'حفظ' : 'Save'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {zones.length === 0 ? (
              <Card className="col-span-full border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Layers className="h-16 w-16 mx-auto mb-4 text-[#D4A853] opacity-50" />
                  <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد مناطق توصيل' : 'No delivery zones yet'}</p>
                </CardContent>
              </Card>
            ) : (
              zones.map((zone) => (
                <Card key={zone.id} className="card-hover border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#4A7A5C]" />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-[#3D3229] text-lg">{zone.name}</CardTitle>
                      <Badge className={zone.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                        {zone.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#7A6F63]">{language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                        <span className="font-bold text-[#D4A853]">€{zone.deliveryFee.toFixed(2)}</span>
                      </div>
                      {zone.minOrderAmount && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#7A6F63]">{language === 'ar' ? 'الحد الأدنى' : 'Min Order'}</span>
                          <span className="font-medium text-[#3D3229]">€{zone.minOrderAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {zone.estimatedTime && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#7A6F63]">{language === 'ar' ? 'الوقت المتوقع' : 'Est. Time'}</span>
                          <span className="font-medium text-[#3D3229]">{zone.estimatedTime}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-[#F5EDE0] rounded-lg">
                          <p className="text-lg font-bold text-[#3D3229]">{zone.ordersCount || 0}</p>
                          <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'طلبات' : 'Orders'}</p>
                        </div>
                        <div className="p-2 bg-[#F5EDE0] rounded-lg">
                          <p className="text-lg font-bold text-[#2D5A3D]">{zone.satisfactionRate || '95'}%</p>
                          <p className="text-xs text-[#7A6F63]">{language === 'ar' ? 'رضا' : 'Satisfaction'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Dispatch Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'تعيين سائق' : 'Assign Driver'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-3 bg-[#F5EDE0] rounded-lg">
                <p className="font-medium text-[#3D3229]">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-[#7A6F63]">{selectedOrder.customer.name} - {selectedOrder.customer.city}</p>
              </div>
            )}
            <div>
              <Label className="text-[#7A6F63]">{language === 'ar' ? 'اختر السائق' : 'Select Driver'}</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue placeholder={language === 'ar' ? 'اختر سائق' : 'Select driver'} />
                </SelectTrigger>
                <SelectContent>
                  {drivers.filter(d => d.isOnline).map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} ({driver.activeOrders} {language === 'ar' ? 'طلبات' : 'orders'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDispatchDialogOpen(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleDispatch} className="green-gradient text-white">{language === 'ar' ? 'تعيين' : 'Assign'}</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
