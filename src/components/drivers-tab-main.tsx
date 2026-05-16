/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Plus, Edit, Trash2, RefreshCw, Phone, Mail, MapPin, Truck
} from 'lucide-react';
import { Driver, DeliveryLine } from '@/lib/types';

export default function DriversTab() {
  const { t, language } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveryLines, setDeliveryLines] = useState<DeliveryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', deliveryLineId: ''
  });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
    setLoading(false);
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
    void fetchDrivers();
    void fetchDeliveryLines();
  }, [fetchDrivers, fetchDeliveryLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingDriver ? 'PUT' : 'POST';
      const url = editingDriver ? `/api/drivers/${editingDriver.id}` : '/api/drivers';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setEditingDriver(null);
        setFormData({ name: '', phone: '', email: '', deliveryLineId: '' });
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      deliveryLineId: driver.deliveryLineId || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete'))) return;
    try {
      await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('nav.drivers')}</h2>
          <p className="text-sm text-[#7A6F63]">{drivers.length} {t('drivers.total')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white gap-2">
                <Plus className="h-4 w-4" />
                {t('drivers.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle>{editingDriver ? t('drivers.edit') : t('drivers.add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t('drivers.name')}</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    className="border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('drivers.phone')}</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    required 
                    className="border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('drivers.email')}</Label>
                  <Input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="border-[#E8DFD0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('drivers.deliveryLine')}</Label>
                  <Select 
                    value={formData.deliveryLineId} 
                    onValueChange={value => setFormData({...formData, deliveryLineId: value})}
                  >
                    <SelectTrigger className="border-[#E8DFD0]">
                      <SelectValue placeholder={t('drivers.deliveryLine')} />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryLines.map(line => (
                        <SelectItem key={line.id} value={line.id}>
                          {language === 'ar' ? line.nameAr : line.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    {t('actions.cancel')}
                  </Button>
                  <Button type="submit" className="bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white">
                    {t('actions.save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchDrivers} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="shimmer h-24 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drivers.map(driver => (
            <Card key={driver.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#F5EDE0] flex items-center justify-center text-[#D4A853]">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#3D3229]">{driver.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-[#7A6F63]">
                        <Badge variant="outline" className={driver.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}>
                          {driver.isActive ? t('actions.active') : t('actions.inactive')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                      <Phone className="h-3.5 w-3.5" />
                      {driver.phone}
                    </div>
                    {driver.email && (
                      <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{driver.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#2D5A3D] font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {driver.deliveryLine ? (language === 'ar' ? driver.deliveryLine.nameAr : driver.deliveryLine.nameEn) : t('drivers.noLine')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F5EDE0]">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(driver)} className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(driver.id)} className="text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-1 gold-gradient" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
