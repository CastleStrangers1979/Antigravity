'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Package, Plus, Edit, Trash2, RefreshCw, Box, Scale
} from 'lucide-react';
import { Product } from '@/lib/types';

export default function ProductsTab() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    nameAr: '', nameEn: '', nameNl: '', description: '', price: '', category: 'bread', stock: '',
    sku: '', weight: '', packSize: '5', boxSize: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          weight: formData.weight ? parseFloat(formData.weight) : null,
          packSize: parseInt(formData.packSize),
          boxSize: formData.boxSize ? parseInt(formData.boxSize) : null,
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          nameAr: '', nameEn: '', nameNl: '', description: '', price: '', category: 'bread', stock: '',
          sku: '', weight: '', packSize: '5', boxSize: ''
        });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      nameNl: product.nameNl,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      packSize: product.packSize.toString(),
      boxSize: product.boxSize?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.confirmDelete'))) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories = ['all', 'bread', 'pastry', 'sweets', 'other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('nav.products')}</h2>
          <p className="text-sm text-[#7A6F63]">{products.length} {t('products.total')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue placeholder={t('products.category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? t('actions.all') : t(`products.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2D5A3D] hover:bg-[#1E4A2D] text-white gap-2">
                <Plus className="h-4 w-4" />
                {t('products.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-[#E8DFD0] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? t('products.edit') : t('products.add')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('products.nameAr')}</Label>
                    <Input 
                      value={formData.nameAr} 
                      onChange={e => setFormData({...formData, nameAr: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('products.nameEn')}</Label>
                    <Input 
                      value={formData.nameEn} 
                      onChange={e => setFormData({...formData, nameEn: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('products.nameNl')}</Label>
                    <Input 
                      value={formData.nameNl} 
                      onChange={e => setFormData({...formData, nameNl: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('products.description')}</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="border-[#E8DFD0]"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t('products.price')}</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('products.stock')}</Label>
                    <Input 
                      type="number" 
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('products.weight')} (kg)</Label>
                    <Input 
                      type="number" 
                      step="0.001" 
                      value={formData.weight} 
                      onChange={e => setFormData({...formData, weight: e.target.value})} 
                      className="border-[#E8DFD0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('products.packSize')}</Label>
                    <Input 
                      type="number" 
                      value={formData.packSize} 
                      onChange={e => setFormData({...formData, packSize: e.target.value})} 
                      required 
                      className="border-[#E8DFD0]"
                    />
                  </div>
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
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="border-0 shadow-sm overflow-hidden">
              <div className="shimmer h-48" />
              <CardContent className="p-4 space-y-2">
                <div className="shimmer h-4 w-2/3" />
                <div className="shimmer h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="card-hover border-0 shadow-md bg-white overflow-hidden group">
              <div className="relative h-48 bg-[#F5EDE0] flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.nameAr} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Package className="h-16 w-16 text-[#D4A853] opacity-30" />
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#2D5A3D] text-white border-0">{t(`products.${product.category}`)}</Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#3D3229] line-clamp-1">
                    {language === 'ar' ? product.nameAr : product.nameEn}
                  </h3>
                  <div className="text-lg font-bold text-[#D4A853]">€{product.price.toFixed(2)}</div>
                </div>
                <p className="text-sm text-[#7A6F63] line-clamp-2 mb-4 h-10">
                  {product.description || t('messages.noDescription')}
                </p>
                <div className="flex items-center justify-between text-xs text-[#7A6F63] mb-4">
                  <span className="flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    {t('products.stock')}: {product.stock}
                  </span>
                  <span className="flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    {product.weight} kg
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F5EDE0]">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-500 hover:text-white">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
