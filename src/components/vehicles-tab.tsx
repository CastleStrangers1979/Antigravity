/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Car, Fuel, Wrench, Shield, DollarSign, Plus, Edit, Trash2, Eye, 
  Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp, Gauge,
  Truck, RefreshCw, AlertCircle, Settings, Bell, FileCheck
} from 'lucide-react';

// Types
interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  fuelType: string | null;
  mileage: number;
  capacity: number | null;
  isActive: boolean;
  purchaseDate: string | null;
  currentValue: number | null;
  notes: string | null;
  drivers?: { id: string; name: string }[];
  _count?: {
    maintenances: number;
    fuelRecords: number;
    insurances: number;
    expenses: number;
  };
}

interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  type: string;
  description: string;
  garage: string | null;
  cost: number;
  mileage: number | null;
  startDate: string;
  endDate: string | null;
  status: string;
  nextMaintenanceDate: string | null;
  nextMaintenanceMileage: number | null;
  notes: string | null;
}

interface FuelRecord {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  driverId: string | null;
  date: string;
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  station: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

interface VehicleInsurance {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  provider: string;
  policyNumber: string;
  type: string;
  startDate: string;
  endDate: string;
  premium: number;
  coverage: string | null;
  documentUrl: string | null;
  status: string;
  notes: string | null;
}

interface VehicleStats {
  total: number;
  active: number;
  inactive: number;
  totalMileage: number;
}

interface MaintenanceStats {
  total: number;
  totalCost: number;
  byType: Record<string, number>;
  upcomingCount: number;
}

interface FuelStats {
  total: number;
  totalQuantity: number;
  totalCost: number;
  avgPricePerLiter: number;
  vehicleStats: Array<{
    vehicleId: string;
    totalFuel: number;
    totalCost: number;
    avgConsumption: number;
    costPerKm: number;
  }>;
}

interface InsuranceStats {
  total: number;
  active: number;
  expiringSoon: number;
  totalPremium: number;
}

// Stats Card Component
function VehicleStatsCard({ title, value, icon: Icon, trend, colorClass }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  colorClass?: string;
}) {
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-3xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className="text-xs text-[#2D5A3D] flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl shadow-md ${colorClass || 'bg-gradient-to-br from-[#D4A853] to-[#B8923F]'}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      <div className="h-1 gold-gradient" />
    </Card>
  );
}

// Vehicle Dashboard Sub-Tab
function VehicleDashboardTab() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<VehicleStats>({ total: 0, active: 0, inactive: 0, totalMileage: 0 });
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<VehicleMaintenance[]>([]);
  const [insuranceAlerts, setInsuranceAlerts] = useState<VehicleInsurance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      setStats(data.stats || { total: 0, active: 0, inactive: 0, totalMileage: 0 });
      setMaintenanceAlerts(data.maintenanceAlerts || []);
      setInsuranceAlerts(data.insuranceAlerts || []);
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      car: t('vehicleType.car'),
      van: t('vehicleType.van'),
      truck: t('vehicleType.truck'),
      motorcycle: t('vehicleType.motorcycle'),
      bicycle: t('vehicleType.bicycle'),
    };
    return types[type] || type;
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const types: Record<string, string> = {
      petrol: t('fuelType.petrol'),
      diesel: t('fuelType.diesel'),
      electric: t('fuelType.electric'),
      hybrid: t('fuelType.hybrid'),
    };
    return types[fuelType] || fuelType;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <VehicleStatsCard title={t('vehicles.totalFleet')} value={stats.total} icon={Car} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <VehicleStatsCard title={t('vehicles.activeVehicles')} value={stats.active} icon={CheckCircle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <VehicleStatsCard title={t('vehicles.needMaintenance')} value={maintenanceAlerts.length} icon={Wrench} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
        <VehicleStatsCard title={t('vehicles.totalMileage')} value={`${stats.totalMileage.toLocaleString()} km`} icon={Gauge} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Maintenance Alerts */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              {t('maintenance.upcoming')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {maintenanceAlerts.length === 0 ? (
              <p className="text-sm text-[#7A6F63]">{t('messages.noData')}</p>
            ) : (
              <div className="space-y-3">
                {maintenanceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 bg-[#F5EDE0] rounded-lg">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#3D3229]">{alert.vehicle?.plateNumber}</p>
                      <p className="text-xs text-[#7A6F63]">{alert.description}</p>
                    </div>
                    {alert.nextMaintenanceDate && (
                      <div className="text-left text-sm">
                        <p className="font-medium text-[#D4A853]">
                          {new Date(alert.nextMaintenanceDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Alerts */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {t('insurance.expiringSoon')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insuranceAlerts.length === 0 ? (
              <p className="text-sm text-[#7A6F63]">{t('messages.noData')}</p>
            ) : (
              <div className="space-y-3">
                {insuranceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 bg-[#F5EDE0] rounded-lg">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Bell className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#3D3229]">{alert.vehicle?.plateNumber}</p>
                      <p className="text-xs text-[#7A6F63]">{alert.provider}</p>
                    </div>
                    <div className="text-left text-sm">
                      <p className="font-medium text-red-500">
                        {new Date(alert.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fleet Overview */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 green-gradient" />
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#2D5A3D]" />
            {t('vehicles.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.slice(0, 6).map((vehicle) => (
                <div key={vehicle.id} className="p-4 bg-[#F5EDE0] rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${vehicle.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'} text-white`}>
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#3D3229]">{vehicle.plateNumber}</p>
                      <Badge variant="outline" className="text-xs">
                        {getVehicleTypeLabel(vehicle.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#7A6F63]">
                    <div>{vehicle.brand} {vehicle.model}</div>
                    <div>{vehicle.mileage.toLocaleString()} km</div>
                    {vehicle.fuelType && <div>{getFuelTypeLabel(vehicle.fuelType)}</div>}
                    <div>{vehicle.year || '-'}</div>
                  </div>
                  {vehicle.drivers && vehicle.drivers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#E8DFD0] text-xs text-[#7A6F63]">
                      {t('vehicles.assignedDriver')}: {vehicle.drivers.map(d => d.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Vehicle Registry Sub-Tab
function VehicleRegistryTab() {
  const { t, language } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'van',
    brand: '',
    model: '',
    year: '',
    color: '',
    fuelType: 'diesel',
    mileage: '',
    capacity: '',
    purchaseDate: '',
    currentValue: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await fetch('/api/vehicles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingVehicle.id, ...formData }),
        });
      } else {
        await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsDialogOpen(false);
      setEditingVehicle(null);
      setFormData({ plateNumber: '', type: 'van', brand: '', model: '', year: '', color: '', fuelType: 'diesel', mileage: '', capacity: '', purchaseDate: '', currentValue: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || 'diesel',
      mileage: vehicle.mileage.toString(),
      capacity: vehicle.capacity?.toString() || '',
      purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : '',
      currentValue: vehicle.currentValue?.toString() || '',
      notes: vehicle.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await fetch(`/api/vehicles?id=${vehicleId}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      car: t('vehicleType.car'),
      van: t('vehicleType.van'),
      truck: t('vehicleType.truck'),
      motorcycle: t('vehicleType.motorcycle'),
      bicycle: t('vehicleType.bicycle'),
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('vehicles.registry')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => { setEditingVehicle(null); setFormData({ plateNumber: '', type: 'van', brand: '', model: '', year: '', color: '', fuelType: 'diesel', mileage: '', capacity: '', purchaseDate: '', currentValue: '', notes: '' }); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('vehicles.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{editingVehicle ? t('vehicles.edit') : t('vehicles.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.plateNumber')} *</Label>
                  <Input value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required placeholder="AB-123-CD" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.type')} *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">{t('vehicleType.car')}</SelectItem>
                      <SelectItem value="van">{t('vehicleType.van')}</SelectItem>
                      <SelectItem value="truck">{t('vehicleType.truck')}</SelectItem>
                      <SelectItem value="motorcycle">{t('vehicleType.motorcycle')}</SelectItem>
                      <SelectItem value="bicycle">{t('vehicleType.bicycle')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.brand')}</Label>
                  <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="Mercedes" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.model')}</Label>
                  <Input value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="Sprinter" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.year')}</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="2020" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.color')}</Label>
                  <Input value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder={language === 'ar' ? 'أبيض' : 'White'} />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.fuelType')}</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">{t('fuelType.petrol')}</SelectItem>
                      <SelectItem value="diesel">{t('fuelType.diesel')}</SelectItem>
                      <SelectItem value="electric">{t('fuelType.electric')}</SelectItem>
                      <SelectItem value="hybrid">{t('fuelType.hybrid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.mileage')} (km)</Label>
                  <Input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="50000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.capacity')} (kg)</Label>
                  <Input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="1000" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.currentValue')} (€)</Label>
                  <Input type="number" value={formData.currentValue} onChange={(e) => setFormData({...formData, currentValue: e.target.value})} className="mt-1.5 border-[#E8DFD0]" placeholder="25000" />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('maintenance.startDate')}</Label>
                <Input type="date" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicles List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-40 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className={`card-hover border-0 shadow-md overflow-hidden ${!vehicle.isActive ? 'opacity-60' : ''}`}>
              <div className={`h-2 ${vehicle.isActive ? 'green-gradient' : 'bg-gray-400'}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${vehicle.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'} text-white`}>
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#3D3229]">{vehicle.plateNumber}</p>
                      <Badge variant="outline" className="text-xs">
                        {getVehicleTypeLabel(vehicle.type)}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={vehicle.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}>
                    {vehicle.isActive ? t('vehicles.active') : t('vehicles.inactive')}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-[#7A6F63]">
                  <div className="flex justify-between">
                    <span>{vehicle.brand} {vehicle.model}</span>
                    <span>{vehicle.year || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('vehicles.mileage')}</span>
                    <span className="font-medium text-[#3D3229]">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('vehicles.capacity')}</span>
                    <span className="font-medium text-[#3D3229]">{vehicle.capacity ? `${vehicle.capacity} kg` : '-'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 border-[#E8DFD0] text-[#7A6F63] hover:bg-[#F5EDE0]" onClick={() => handleEdit(vehicle)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t('actions.edit')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => handleDelete(vehicle.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {vehicles.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#7A6F63]">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('messages.noData')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Maintenance Sub-Tab
function MaintenanceTab() {
  const { t, language } = useLanguage();
  const [maintenances, setMaintenances] = useState<VehicleMaintenance[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({ total: 0, totalCost: 0, byType: {}, upcomingCount: 0 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'routine',
    description: '',
    garage: '',
    cost: '',
    mileage: '',
    startDate: '',
    endDate: '',
    status: 'scheduled',
    nextMaintenanceDate: '',
    nextMaintenanceMileage: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [maintRes, vehiclesRes] = await Promise.all([
        fetch('/api/vehicles/maintenance'),
        fetch('/api/vehicles'),
      ]);
      const maintData = await maintRes.json();
      const vehiclesData = await vehiclesRes.json();
      setMaintenances(maintData.maintenances || []);
      setStats(maintData.stats || { total: 0, totalCost: 0, byType: {}, upcomingCount: 0 });
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/vehicles/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ vehicleId: '', type: 'routine', description: '', garage: '', cost: '', mileage: '', startDate: '', endDate: '', status: 'scheduled', nextMaintenanceDate: '', nextMaintenanceMileage: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving maintenance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return t('maintenance.scheduled');
      case 'in_progress': return t('maintenance.inProgress');
      case 'completed': return t('maintenance.completed');
      case 'cancelled': return t('orders.cancelled');
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'routine': return t('maintenance.routine');
      case 'repair': return t('maintenance.repair');
      case 'emergency': return t('maintenance.emergency');
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <VehicleStatsCard title={t('maintenance.title')} value={stats.total} icon={Wrench} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <VehicleStatsCard title={t('maintenance.totalCost')} value={`€${stats.totalCost.toFixed(2)}`} icon={DollarSign} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <VehicleStatsCard title={t('maintenance.upcoming')} value={stats.upcomingCount} icon={Calendar} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
        <VehicleStatsCard title={t('maintenance.repair')} value={stats.byType['repair'] || 0} icon={Settings} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('maintenance.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => setFormData({ vehicleId: '', type: 'routine', description: '', garage: '', cost: '', mileage: '', startDate: '', endDate: '', status: 'scheduled', nextMaintenanceDate: '', nextMaintenanceMileage: '', notes: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              {t('maintenance.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('maintenance.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.plateNumber')} *</Label>
                  <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('vehicles.plateNumber')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.type')} *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">{t('maintenance.routine')}</SelectItem>
                      <SelectItem value="repair">{t('maintenance.repair')}</SelectItem>
                      <SelectItem value="emergency">{t('maintenance.emergency')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('maintenance.description')} *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.garage')}</Label>
                  <Input value={formData.garage} onChange={(e) => setFormData({...formData, garage: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.cost')} (€)</Label>
                  <Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.mileage')}</Label>
                  <Input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.status')}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">{t('maintenance.scheduled')}</SelectItem>
                      <SelectItem value="in_progress">{t('maintenance.inProgress')}</SelectItem>
                      <SelectItem value="completed">{t('maintenance.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.startDate')}</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('maintenance.endDate')}</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ الصيانة القادمة' : 'Next Maintenance Date'}</Label>
                  <Input type="date" value={formData.nextMaintenanceDate} onChange={(e) => setFormData({...formData, nextMaintenanceDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'عدد الكيلومترات القادمة' : 'Next Mileage'}</Label>
                  <Input type="number" value={formData.nextMaintenanceMileage} onChange={(e) => setFormData({...formData, nextMaintenanceMileage: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Maintenance List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {maintenances.map((maint) => (
              <Card key={maint.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex items-center p-4">
                  <div className={`p-3 rounded-xl ${getStatusColor(maint.status)}`}>
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 mr-4 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3D3229]">{maint.vehicle?.plateNumber}</span>
                      <Badge className={getStatusColor(maint.status)}>{getStatusLabel(maint.status)}</Badge>
                      <Badge variant="outline">{getTypeLabel(maint.type)}</Badge>
                    </div>
                    <p className="text-sm text-[#7A6F63]">{maint.description}</p>
                    {maint.garage && <p className="text-xs text-[#7A6F63]">{t('maintenance.garage')}: {maint.garage}</p>}
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-[#D4A853]">€{maint.cost.toFixed(2)}</div>
                    <div className="text-xs text-[#7A6F63]">{new Date(maint.startDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}</div>
                  </div>
                </div>
              </Card>
            ))}
            {maintenances.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Fuel Tracking Sub-Tab
function FuelTab() {
  const { t, language } = useLanguage();
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [stats, setStats] = useState<FuelStats>({ total: 0, totalQuantity: 0, totalCost: 0, avgPricePerLiter: 0, vehicleStats: [] });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: '',
    quantity: '',
    pricePerLiter: '',
    mileage: '',
    station: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fuelRes, vehiclesRes] = await Promise.all([
        fetch('/api/vehicles/fuel'),
        fetch('/api/vehicles'),
      ]);
      const fuelData = await fuelRes.json();
      const vehiclesData = await vehiclesRes.json();
      setFuelRecords(fuelData.fuelRecords || []);
      setStats(fuelData.stats || { total: 0, totalQuantity: 0, totalCost: 0, avgPricePerLiter: 0, vehicleStats: [] });
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Error fetching fuel data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalCost = formData.quantity && formData.pricePerLiter 
        ? (parseFloat(formData.quantity) * parseFloat(formData.pricePerLiter)).toFixed(2)
        : '0';
      
      await fetch('/api/vehicles/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, totalCost }),
      });
      setIsDialogOpen(false);
      setFormData({ vehicleId: '', date: '', quantity: '', pricePerLiter: '', mileage: '', station: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving fuel record:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <VehicleStatsCard title={t('fuel.title')} value={stats.total} icon={Fuel} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <VehicleStatsCard title={t('fuel.totalFuel')} value={`${stats.totalQuantity.toFixed(0)} L`} icon={Fuel} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
        <VehicleStatsCard title={t('fuel.totalCost')} value={`€${stats.totalCost.toFixed(2)}`} icon={DollarSign} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <VehicleStatsCard title={t('fuel.avgConsumption')} value={`€${stats.avgPricePerLiter.toFixed(2)}/L`} icon={TrendingUp} colorClass="bg-gradient-to-br from-purple-500 to-purple-600" />
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('fuel.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => setFormData({ vehicleId: '', date: '', quantity: '', pricePerLiter: '', mileage: '', station: '', notes: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              {t('fuel.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('fuel.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('vehicles.plateNumber')} *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('vehicles.plateNumber')} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('fuel.date')}</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('vehicles.mileage')}</Label>
                  <Input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('fuel.quantity')} *</Label>
                  <Input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('fuel.pricePerLiter')} *</Label>
                  <Input type="number" step="0.001" value={formData.pricePerLiter} onChange={(e) => setFormData({...formData, pricePerLiter: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('fuel.station')}</Label>
                <Input value={formData.station} onChange={(e) => setFormData({...formData, station: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              {formData.quantity && formData.pricePerLiter && (
                <div className="p-3 bg-[#F5EDE0] rounded-lg">
                  <span className="text-[#7A6F63]">{t('fuel.totalCost')}: </span>
                  <span className="font-bold text-[#D4A853]">
                    €{(parseFloat(formData.quantity) * parseFloat(formData.pricePerLiter)).toFixed(2)}
                  </span>
                </div>
              )}
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fuel Records List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {fuelRecords.map((record) => (
              <Card key={record.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex items-center p-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                    <Fuel className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 mr-4 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3D3229]">{record.vehicle?.plateNumber}</span>
                      <Badge variant="outline">{record.quantity.toFixed(1)} L</Badge>
                    </div>
                    <p className="text-sm text-[#7A6F63]">
                      {t('fuel.station')}: {record.station || '-'} | {t('vehicles.mileage')}: {record.mileage?.toLocaleString() || '-'} km
                    </p>
                    <p className="text-xs text-[#7A6F63]">{new Date(record.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}</p>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-[#D4A853]">€{record.totalCost.toFixed(2)}</div>
                    <div className="text-xs text-[#7A6F63]">€{record.pricePerLiter.toFixed(3)}/L</div>
                  </div>
                </div>
              </Card>
            ))}
            {fuelRecords.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('messages.noData')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Insurance Sub-Tab
function InsuranceTab() {
  const { t, language } = useLanguage();
  const [insurances, setInsurances] = useState<VehicleInsurance[]>([]);
  const [stats, setStats] = useState<InsuranceStats>({ total: 0, active: 0, expiringSoon: 0, totalPremium: 0 });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    provider: '',
    policyNumber: '',
    type: 'comprehensive',
    startDate: '',
    endDate: '',
    premium: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [insRes, vehiclesRes] = await Promise.all([
        fetch('/api/vehicles/insurance'),
        fetch('/api/vehicles'),
      ]);
      const insData = await insRes.json();
      const vehiclesData = await vehiclesRes.json();
      setInsurances(insData.insurances || []);
      setStats(insData.stats || { total: 0, active: 0, expiringSoon: 0, totalPremium: 0 });
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Error fetching insurance data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/vehicles/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ vehicleId: '', provider: '', policyNumber: '', type: 'comprehensive', startDate: '', endDate: '', premium: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving insurance:', error);
    }
  };

  const getStatusColor = (status: string, endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (status !== 'active') return 'bg-gray-500';
    if (daysUntilExpiry < 0) return 'bg-red-500';
    if (daysUntilExpiry < 30) return 'bg-orange-500';
    return 'bg-[#2D5A3D]';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'liability': return t('insurance.liability');
      case 'comprehensive': return t('insurance.comprehensive');
      case 'third_party': return t('insurance.thirdParty');
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <VehicleStatsCard title={t('insurance.title')} value={stats.total} icon={Shield} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <VehicleStatsCard title={t('insurance.active')} value={stats.active} icon={CheckCircle} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <VehicleStatsCard title={t('insurance.expiringSoon')} value={stats.expiringSoon} icon={AlertTriangle} colorClass="bg-gradient-to-br from-orange-500 to-orange-600" />
        <VehicleStatsCard title={t('insurance.premium')} value={`€${stats.totalPremium.toFixed(2)}`} icon={DollarSign} colorClass="bg-gradient-to-br from-purple-500 to-purple-600" />
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('insurance.title')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => setFormData({ vehicleId: '', provider: '', policyNumber: '', type: 'comprehensive', startDate: '', endDate: '', premium: '', notes: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              {t('insurance.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('insurance.add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('vehicles.plateNumber')} *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('vehicles.plateNumber')} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.plateNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.provider')} *</Label>
                  <Input value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.policyNumber')} *</Label>
                  <Input value={formData.policyNumber} onChange={(e) => setFormData({...formData, policyNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.type')} *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liability">{t('insurance.liability')}</SelectItem>
                      <SelectItem value="comprehensive">{t('insurance.comprehensive')}</SelectItem>
                      <SelectItem value="third_party">{t('insurance.thirdParty')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.premium')} (€)</Label>
                  <Input type="number" step="0.01" value={formData.premium} onChange={(e) => setFormData({...formData, premium: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.startDate')} *</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('insurance.endDate')} *</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Insurance List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insurances.map((ins) => (
            <Card key={ins.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
              <div className={`h-2 ${getStatusColor(ins.status, ins.endDate)}`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#3D3229]">{ins.vehicle?.plateNumber}</p>
                    <p className="text-sm text-[#7A6F63]">{ins.provider}</p>
                  </div>
                  <Badge className={getStatusColor(ins.status, ins.endDate)}>
                    {ins.status === 'active' ? t('insurance.active') : t('insurance.expired')}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#7A6F63]">
                    <span>{t('insurance.policyNumber')}</span>
                    <span className="font-medium text-[#3D3229]">{ins.policyNumber}</span>
                  </div>
                  <div className="flex justify-between text-[#7A6F63]">
                    <span>{t('insurance.type')}</span>
                    <span className="font-medium text-[#3D3229]">{getTypeLabel(ins.type)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A6F63]">
                    <span>{t('insurance.premium')}</span>
                    <span className="font-bold text-[#D4A853]">€{ins.premium.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#7A6F63]">
                    <span>{t('insurance.endDate')}</span>
                    <span className="font-medium text-[#3D3229]">
                      {new Date(ins.endDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {insurances.length === 0 && (
            <div className="col-span-2 text-center py-12 text-[#7A6F63]">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('messages.noData')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main VehiclesTab Component
export default function VehiclesTab() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'registry' | 'maintenance' | 'fuel' | 'insurance'>('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('vehicles.title')}</h2>
          <p className="text-sm text-[#7A6F63]">
            {language === 'ar' ? 'إدارة شاملة لأسطول المركبات' : 'Complete fleet management system'}
          </p>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex bg-[#F5EDE0] rounded-xl p-1.5 overflow-x-auto">
        {(['dashboard', 'registry', 'maintenance', 'fuel', 'insurance'] as const).map((section) => (
          <Button
            key={section}
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(section)}
            className={`${activeSection === section ? 'bg-white shadow-sm text-[#2D5A3D]' : 'text-[#7A6F63]'} rounded-lg flex-shrink-0`}
          >
            {section === 'dashboard' && <Gauge className="h-4 w-4 mr-2" />}
            {section === 'registry' && <Car className="h-4 w-4 mr-2" />}
            {section === 'maintenance' && <Wrench className="h-4 w-4 mr-2" />}
            {section === 'fuel' && <Fuel className="h-4 w-4 mr-2" />}
            {section === 'insurance' && <Shield className="h-4 w-4 mr-2" />}
            {section === 'dashboard' && t('vehicles.dashboard')}
            {section === 'registry' && t('vehicles.registry')}
            {section === 'maintenance' && t('vehicles.maintenance')}
            {section === 'fuel' && t('vehicles.fuel')}
            {section === 'insurance' && t('vehicles.insurance')}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'dashboard' && <VehicleDashboardTab />}
      {activeSection === 'registry' && <VehicleRegistryTab />}
      {activeSection === 'maintenance' && <MaintenanceTab />}
      {activeSection === 'fuel' && <FuelTab />}
      {activeSection === 'insurance' && <InsuranceTab />}
    </div>
  );
}
