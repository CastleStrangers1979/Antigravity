 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  MapPinned, Plus, Edit, Trash2, RefreshCw, Truck, Users, Navigation
} from 'lucide-react';
import { DeliveryLine } from '@/lib/types';

export default function DeliveryLinesTab() {
  const { t, language } = useLanguage();
  const [lines, setLines] = useState<DeliveryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<DeliveryLine | null>(null);
  const [formData, setFormData] = useState({
    nameAr: '', nameEn: '', nameNl: '', region: ''
  });

  const fetchLines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-lines');
      const data = await res.json();
      setLines(data);
    } catch (error) {
      console.error('Error fetching delivery lines:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchLines();
  }, [fetchLines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingLine ? 'PUT' : 'POST';
      const url = editingLine ? `/api/delivery-lines/${editingLine.id}` : '/api/delivery-lines';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setEditingLine(null);
        setFormData({ nameAr: '', nameEn: '', nameNl: '', region: '' });
        fetchLines();
      }
    } catch (error) {
      console.error('Error saving line:', error);
    }
  };

  const handleEdit = (line: DeliveryLine) => {
    setEditingLine(line);
    setFormData({
      nameAr: line.nameAr,
      nameEn: line.nameEn,
      nameNl: line.nameNl,
      region: line.region,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete'))) return;
    try {
      await fetch(`/api/delivery-lines/${id}`, { method: 'DELETE' });
      fetchLines();
    } catch (error) {
      console.error('Error deleting line:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('nav.deliveryLines')}</h2>
          <p className="text-sm text-[#7A6F63]">{lines.length} {t('deliveryLines.total')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white gap-2">
                <Plus className="h-4 w-4" />
                {t('deliveryLines.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle>{editingLine ? t('deliveryLines.edit') : t('deliveryLines.add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('deliveryLines.nameAr')}</Label>
                    <Input 
                      value={formData.nameAr} 
                      onChange={e => setFormData({...formData, nameAr: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('deliveryLines.nameEn')}</Label>
                    <Input 
                      value={formData.nameEn} 
                      onChange={e => setFormData({...formData, nameEn: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('deliveryLines.nameNl')}</Label>
                    <Input 
                      value={formData.nameNl} 
                      onChange={e => setFormData({...formData, nameNl: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('deliveryLines.region')}</Label>
                  <Input 
                    value={formData.region} 
                    onChange={e => setFormData({...formData, region: e.target.value})} 
                    required 
                    className="border-[#E8DFD0]"
                    placeholder="e.g. Amsterdam North"
                  />
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
          <Button onClick={fetchLines} variant="outline" className="border-[#D4A853] text-[#D4A853]">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="shimmer h-32 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lines.map(line => (
            <Card key={line.id} className="card-hover border-0 shadow-md bg-white overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center text-[#2D5A3D]">
                      <MapPinned className="h-6 w-6" />
                    </div>
                    <Badge className="bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20">
                      {line.region}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#3D3229] mb-4">
                    {language === 'ar' ? line.nameAr : line.nameEn}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#FFFEF7] rounded-lg border border-[#E8DFD0] flex flex-col items-center">
                      <Truck className="h-4 w-4 text-[#2D5A3D] mb-1" />
                      <span className="text-xl font-bold text-[#3D3229]">{line.drivers?.length || 0}</span>
                      <span className="text-[10px] uppercase text-[#7A6F63]">{t('nav.drivers')}</span>
                    </div>
                    <div className="p-3 bg-[#FFFEF7] rounded-lg border border-[#E8DFD0] flex flex-col items-center">
                      <Navigation className="h-4 w-4 text-[#D4A853] mb-1" />
                      <span className="text-xl font-bold text-[#3D3229]">{line._count?.orders || 0}</span>
                      <span className="text-[10px] uppercase text-[#7A6F63]">{t('nav.orders')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#F5EDE0]">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(line)} className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(line.id)} className="text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-1.5 gold-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
