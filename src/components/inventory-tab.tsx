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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Package, AlertTriangle, Calendar, TrendingUp, TrendingDown, Truck, DollarSign,
  Plus, Edit, Trash2, Eye, RefreshCw, Clock, CheckCircle, XCircle,
  Warehouse, FileText, ShoppingCart, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Building2, Phone, Mail, MapPin, Globe, CreditCard
} from 'lucide-react';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string | null;
  lowStock: boolean;
  margin: number;
  profit: number;
  sellingPrice: number;
}

interface Supplier {
  id: string;
  name: string;
  nameAr: string | null;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  postalCode: string | null;
  website: string | null;
  taxNumber: string | null;
  paymentTerms: string | null;
  currency: string;
  rating: number;
  leadTime: number;
  minOrderAmount: number | null;
  isActive: boolean;
  notes: string | null;
  _count?: { purchaseOrders: number; supplierProducts: number };
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  receivedQty: number;
  unitPrice: number;
  totalPrice: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: Supplier;
  status: string;
  orderDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  paymentDueDate: string | null;
  notes: string | null;
  orderItems: PurchaseOrderItem[];
}

interface ExpiryTracking {
  id: string;
  productId: string;
  product: Product;
  batchNumber: string | null;
  productionDate: string;
  expiryDate: string;
  quantity: number;
  remainingQty: number;
  status: string;
  daysToExpiry: number;
  calculatedStatus: string;
}

interface InventoryMovement {
  id: string;
  productId: string;
  product: Product;
  type: string;
  quantity: number;
  previousStock: number | null;
  newStock: number | null;
  reason: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

interface InventorySummary {
  totalProducts: number;
  lowStockCount: number;
  totalInventoryValue: number;
  totalPotentialProfit: number;
  totalCostValue: number;
  averageMargin: number;
}

// Stats Card Component
function InventoryStatsCard({ title, value, icon: Icon, trend, trendUp, colorClass }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}) {
  return (
    <Card className="card-hover border-0 shadow-lg bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#7A6F63]">{title}</p>
            <p className="text-2xl font-bold text-[#3D3229]">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 ${trendUp ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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

// Expiry Tracking Sub-Tab
function ExpiryTrackingTab() {
  const { language } = useLanguage();
  const [expiryData, setExpiryData] = useState<ExpiryTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    productId: '',
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    quantity: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expiryRes, productsRes] = await Promise.all([
        fetch('/api/inventory/costs?type=expiry'),
        fetch('/api/products'),
      ]);
      const expiryData = await expiryRes.json();
      const productsData = await productsRes.json();
      setExpiryData(expiryData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching expiry data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/inventory/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addExpiry',
          ...formData,
          quantity: parseInt(formData.quantity),
        }),
      });
      setIsDialogOpen(false);
      setFormData({ productId: '', batchNumber: '', productionDate: '', expiryDate: '', quantity: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding expiry tracking:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-[#2D5A3D]';
      case 'approaching': return 'bg-[#D4A853]';
      case 'critical': return 'bg-orange-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fresh': return language === 'ar' ? 'طازج' : 'Fresh';
      case 'approaching': return language === 'ar' ? 'يقترب' : 'Approaching';
      case 'critical': return language === 'ar' ? 'حرج' : 'Critical';
      case 'expired': return language === 'ar' ? 'منتهي' : 'Expired';
      default: return status;
    }
  };

  const filteredData = filter === 'all' ? expiryData : expiryData.filter(e => e.calculatedStatus === filter);

  // Calendar view data
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const getExpiryForDate = (dateStr: string) => {
    return filteredData.filter(e => e.expiryDate.split('T')[0] === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">
            {language === 'ar' ? 'تتبع الصلاحية' : 'Expiry Tracking'}
          </h3>
          <p className="text-sm text-[#7A6F63]">{filteredData.length} {language === 'ar' ? 'سجل' : 'records'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="fresh">{getStatusLabel('fresh')}</SelectItem>
              <SelectItem value="approaching">{getStatusLabel('approaching')}</SelectItem>
              <SelectItem value="critical">{getStatusLabel('critical')}</SelectItem>
              <SelectItem value="expired">{getStatusLabel('expired')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إضافة' : 'Add Batch'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إضافة دفعة جديدة' : 'Add New Batch'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'المنتج' : 'Product'}</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={language === 'ar' ? 'اختر المنتج' : 'Select product'} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{getProductName(product)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'رقم الدفعة' : 'Batch Number'}</Label>
                  <Input value={formData.batchNumber} onChange={(e) => setFormData({...formData, batchNumber: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ الإنتاج' : 'Production Date'}</Label>
                    <Input type="date" value={formData.productionDate} onChange={(e) => setFormData({...formData, productionDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</Label>
                    <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'الكمية' : 'Quantity'}</Label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <DialogFooter>
                  <Button type="submit" className="gold-gradient text-white border-0">{language === 'ar' ? 'حفظ' : 'Save'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 gold-gradient" />
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#D4A853]" />
            {language === 'ar' ? 'عرض التقويم' : 'Calendar View'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {calendarDays.map((date) => {
                const dayExpiries = getExpiryForDate(date);
                const hasExpiry = dayExpiries.length > 0;
                const isPast = new Date(date) < today;
                
                return (
                  <div key={date} className={`flex-shrink-0 w-20 p-2 rounded-lg border ${hasExpiry ? (isPast ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200') : 'bg-[#F5EDE0] border-[#E8DFD0]'}`}>
                    <div className="text-xs text-center text-[#7A6F63]">
                      {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-center text-[#3D3229]">
                      {new Date(date).getDate()}
                    </div>
                    {hasExpiry && (
                      <div className="text-xs text-center text-red-500 font-medium">
                        {dayExpiries.length} {language === 'ar' ? 'منتج' : 'items'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Expiry List */}
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
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredData.map((item) => (
              <Card key={item.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#3D3229]">{getProductName(item.product)}</span>
                          <Badge className={getStatusColor(item.calculatedStatus)}>{getStatusLabel(item.calculatedStatus)}</Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {item.batchNumber && `${language === 'ar' ? 'دفعة' : 'Batch'}: ${item.batchNumber} | `}
                          {language === 'ar' ? 'ينتهي في' : 'Expires'}: {new Date(item.expiryDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#D4A853]">{item.daysToExpiry} {language === 'ar' ? 'يوم' : 'days'}</div>
                        <div className="text-sm text-[#7A6F63]">{item.remainingQty} / {item.quantity}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'لا توجد بيانات' : 'No data available'}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Low Stock & Auto Order Sub-Tab
function LowStockTab() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/inventory/costs?type=products'),
        fetch('/api/inventory/suppliers'),
      ]);
      const productsData = await productsRes.json();
      const suppliersData = await suppliersRes.json();
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const lowStockProducts = products.filter(p => p.lowStock);

  const handleGenerateOrder = async () => {
    try {
      await fetch('/api/inventory/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateOrder' }),
      });
      fetchData();
    } catch (error) {
      console.error('Error generating order:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getStockPercentage = (product: Product) => {
    const maxStock = product.minStock * 3;
    return Math.min(100, (product.stock / maxStock) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <InventoryStatsCard 
          title={language === 'ar' ? 'منتجات منخفضة' : 'Low Stock Items'} 
          value={lowStockProducts.length} 
          icon={AlertTriangle}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
        />
        <InventoryStatsCard 
          title={language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'} 
          value={products.length} 
          icon={Package}
          colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]"
        />
        <InventoryStatsCard 
          title={language === 'ar' ? 'الموردين النشطين' : 'Active Suppliers'} 
          value={suppliers.filter(s => s.isActive).length} 
          icon={Building2}
          colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">
            {language === 'ar' ? 'تنبيهات المخزون المنخفض' : 'Low Stock Alerts'}
          </h3>
          <p className="text-sm text-[#7A6F63]">{lowStockProducts.length} {language === 'ar' ? 'منتج يحتاج إعادة طلب' : 'items need reorder'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {lowStockProducts.length > 0 && (
            <Button onClick={handleGenerateOrder} className="green-gradient text-white border-0">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إنشاء طلب شراء' : 'Generate Purchase Order'}
            </Button>
          )}
        </div>
      </div>

      {/* Low Stock List */}
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
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <Card key={product.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#3D3229]">{getProductName(product)}</span>
                        <Badge className="bg-red-500">{language === 'ar' ? 'منخفض' : 'Low'}</Badge>
                        {product.sku && <span className="text-xs text-[#7A6F63]">SKU: {product.sku}</span>}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#7A6F63]">{language === 'ar' ? 'المخزون الحالي' : 'Current Stock'}</span>
                          <span className="font-medium text-[#3D3229]">{product.stock} / {product.minStock} {language === 'ar' ? 'الحد الأدنى' : 'min'}</span>
                        </div>
                        <Progress value={getStockPercentage(product)} className="h-2" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#D4A853]">€{product.price.toFixed(2)}</div>
                      <div className="text-sm text-[#7A6F63]">{language === 'ar' ? 'سعر البيع' : 'Selling Price'}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                      {language === 'ar' ? 'تكلفة الإنتاج' : 'Cost'}: €{(product.costPrice || 0).toFixed(2)}
                    </div>
                    <div className="px-3 py-1.5 bg-green-100 rounded-full text-xs text-green-700">
                      {language === 'ar' ? 'الهامش' : 'Margin'}: {product.margin}%
                    </div>
                    <div className="px-3 py-1.5 bg-blue-100 rounded-full text-xs text-blue-700">
                      {language === 'ar' ? 'اقتراح الطلب' : 'Suggested Order'}: {(product.minStock * 2) - product.stock} {language === 'ar' ? 'وحدة' : 'units'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-[#2D5A3D]" />
                <p>{language === 'ar' ? 'جميع المنتجات في مستوى مخزون جيد' : 'All products are at good stock levels'}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Supplier Management Sub-Tab
function SupplierManagementTab() {
  const { language } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    website: '',
    taxNumber: '',
    paymentTerms: 'net_30',
    leadTime: '7',
    rating: '5',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/suppliers');
      const data = await res.json();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await fetch('/api/inventory/suppliers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSupplier.id, ...formData }),
        });
      } else {
        await fetch('/api/inventory/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsDialogOpen(false);
      setEditingSupplier(null);
      setFormData({ name: '', nameAr: '', contactPerson: '', email: '', phone: '', address: '', city: '', postalCode: '', website: '', taxNumber: '', paymentTerms: 'net_30', leadTime: '7', rating: '5', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      nameAr: supplier.nameAr || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      postalCode: supplier.postalCode || '',
      website: supplier.website || '',
      taxNumber: supplier.taxNumber || '',
      paymentTerms: supplier.paymentTerms || 'net_30',
      leadTime: supplier.leadTime.toString(),
      rating: supplier.rating.toString(),
      notes: supplier.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Are you sure you want to delete this supplier?')) {
      try {
        await fetch(`/api/inventory/suppliers?id=${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const getPaymentTermsLabel = (terms: string) => {
    switch (terms) {
      case 'net_30': return language === 'ar' ? 'صافي 30 يوم' : 'Net 30';
      case 'net_60': return language === 'ar' ? 'صافي 60 يوم' : 'Net 60';
      case 'cod': return language === 'ar' ? 'الدفع عند الاستلام' : 'COD';
      case 'prepaid': return language === 'ar' ? 'دفع مسبق' : 'Prepaid';
      default: return terms;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{language === 'ar' ? 'إدارة الموردين' : 'Supplier Management'}</h3>
          <p className="text-sm text-[#7A6F63]">{suppliers.length} {language === 'ar' ? 'مورد' : 'suppliers'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => { setEditingSupplier(null); setFormData({ name: '', nameAr: '', contactPerson: '', email: '', phone: '', address: '', city: '', postalCode: '', website: '', taxNumber: '', paymentTerms: 'net_30', leadTime: '7', rating: '5', notes: '' }); }}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إضافة مورد' : 'Add Supplier'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{editingSupplier ? (language === 'ar' ? 'تعديل المورد' : 'Edit Supplier') : (language === 'ar' ? 'إضافة مورد' : 'Add Supplier')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الاسم (AR)' : 'Name (AR)'}</Label>
                    <Input value={formData.nameAr} onChange={(e) => setFormData({...formData, nameAr: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'المدينة' : 'City'}</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}</Label>
                    <Input value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'شروط الدفع' : 'Payment Terms'}</Label>
                    <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({...formData, paymentTerms: value})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="net_30">{getPaymentTermsLabel('net_30')}</SelectItem>
                        <SelectItem value="net_60">{getPaymentTermsLabel('net_60')}</SelectItem>
                        <SelectItem value="cod">{getPaymentTermsLabel('cod')}</SelectItem>
                        <SelectItem value="prepaid">{getPaymentTermsLabel('prepaid')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'وقت التسليم (أيام)' : 'Lead Time (days)'}</Label>
                    <Input type="number" value={formData.leadTime} onChange={(e) => setFormData({...formData, leadTime: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="gold-gradient text-white border-0">{language === 'ar' ? 'حفظ' : 'Save'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-40 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className={`card-hover border-0 shadow-md bg-white overflow-hidden ${!supplier.isActive ? 'opacity-60' : ''}`}>
              <div className="h-2 green-gradient" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-[#3D3229]">{supplier.name}</CardTitle>
                    {supplier.nameAr && <CardDescription className="text-[#7A6F63]">{supplier.nameAr}</CardDescription>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white h-8 w-8 p-0" onClick={() => handleEdit(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contactPerson && (
                  <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                    <Building2 className="h-4 w-4 text-[#D4A853]" />
                    {supplier.contactPerson}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                    <Phone className="h-4 w-4 text-[#D4A853]" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                    <Mail className="h-4 w-4 text-[#D4A853]" />
                    {supplier.email}
                  </div>
                )}
                {supplier.city && (
                  <div className="flex items-center gap-2 text-sm text-[#7A6F63]">
                    <MapPin className="h-4 w-4 text-[#D4A853]" />
                    {supplier.city}, {supplier.country}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="border-[#D4A853] text-[#D4A853]">
                    {getPaymentTermsLabel(supplier.paymentTerms || '')}
                  </Badge>
                  <Badge variant="outline" className="border-[#2D5A3D] text-[#2D5A3D]">
                    {supplier.leadTime} {language === 'ar' ? 'يوم' : 'days'}
                  </Badge>
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    ★ {supplier.rating.toFixed(1)}
                  </Badge>
                </div>
                {(supplier._count?.purchaseOrders || 0) > 0 && (
                  <div className="text-xs text-[#7A6F63]">
                    {supplier._count?.purchaseOrders} {language === 'ar' ? 'طلب شراء' : 'orders'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {suppliers.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#7A6F63]">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد موردين' : 'No suppliers found'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Purchase Orders Sub-Tab
function PurchaseOrdersTab() {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: '',
    shippingCost: '0',
    notes: '',
    items: [] as Array<{ productId: string; quantity: string; unitPrice: string }>,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        fetch(`/api/inventory/purchase-orders?status=${filterStatus}`),
        fetch('/api/inventory/suppliers'),
        fetch('/api/products'),
      ]);
      const ordersData = await ordersRes.json();
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();
      setOrders(ordersData || []);
      setSuppliers(suppliersData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ supplierId: '', expectedDate: '', shippingCost: '0', notes: '', items: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/inventory/purchase-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '1', unitPrice: '0' }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-blue-500';
      case 'confirmed': return 'bg-[#D4A853]';
      case 'partial': return 'bg-orange-500';
      case 'received': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return language === 'ar' ? 'مسودة' : 'Draft';
      case 'submitted': return language === 'ar' ? 'تم الإرسال' : 'Submitted';
      case 'confirmed': return language === 'ar' ? 'مؤكد' : 'Confirmed';
      case 'partial': return language === 'ar' ? 'جزئي' : 'Partial';
      case 'received': return language === 'ar' ? 'مستلم' : 'Received';
      case 'cancelled': return language === 'ar' ? 'ملغي' : 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{language === 'ar' ? 'أوامر الشراء' : 'Purchase Orders'}</h3>
          <p className="text-sm text-[#7A6F63]">{orders.length} {language === 'ar' ? 'طلب' : 'orders'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="draft">{getStatusLabel('draft')}</SelectItem>
              <SelectItem value="submitted">{getStatusLabel('submitted')}</SelectItem>
              <SelectItem value="confirmed">{getStatusLabel('confirmed')}</SelectItem>
              <SelectItem value="received">{getStatusLabel('received')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="green-gradient text-white border-0" onClick={() => setFormData({ supplierId: '', expectedDate: '', shippingCost: '0', notes: '', items: [] })}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'طلب جديد' : 'New Order'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-[#E8DFD0]">
              <DialogHeader>
                <DialogTitle className="text-[#3D3229]">{language === 'ar' ? 'إنشاء طلب شراء' : 'Create Purchase Order'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'المورد' : 'Supplier'}</Label>
                    <Select value={formData.supplierId} onValueChange={(value) => setFormData({...formData, supplierId: value})}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue placeholder={language === 'ar' ? 'اختر المورد' : 'Select supplier'} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'تاريخ التسليم المتوقع' : 'Expected Date'}</Label>
                    <Input type="date" value={formData.expectedDate} onChange={(e) => setFormData({...formData, expectedDate: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-[#7A6F63]">{language === 'ar' ? 'المنتجات' : 'Items'}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-[#D4A853] text-[#D4A853]">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                              <SelectTrigger className="border-[#E8DFD0]">
                                <SelectValue placeholder={language === 'ar' ? 'المنتج' : 'Product'} />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>{getProductName(product)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-20 border-[#E8DFD0]" />
                          <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} className="w-24 border-[#E8DFD0]" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <Label className="text-[#7A6F63]">{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <DialogFooter>
                  <Button type="submit" className="gold-gradient text-white border-0">{language === 'ar' ? 'إنشاء' : 'Create'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Orders List */}
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
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#2D5A3D]">{order.orderNumber}</span>
                          <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                        </div>
                        <div className="text-sm text-[#7A6F63]">
                          {order.supplier.name} | {new Date(order.orderDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4A853]">€{order.totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-[#7A6F63]">{order.orderItems.length} {language === 'ar' ? 'منتج' : 'items'}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="px-3 py-1.5 bg-[#F5EDE0] rounded-full text-xs text-[#5C4033]">
                          {getProductName(item.product)} × {item.quantity}
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="px-3 py-1.5 bg-[#E8DFD0] rounded-full text-xs text-[#7A6F63]">
                          +{order.orderItems.length - 3} {language === 'ar' ? 'أخرى' : 'more'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="lg:w-auto border-t lg:border-t-0 lg:border-l border-[#E8DFD0] bg-[#FFFEF7] p-4 flex lg:flex-col items-center justify-center gap-2">
                    {order.status === 'draft' && (
                      <Button onClick={() => handleUpdateStatus(order.id, 'submitted')} size="sm" className="blue-gradient text-white border-0">
                        <Send className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'إرسال' : 'Submit'}
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button onClick={() => handleUpdateStatus(order.id, 'received')} size="sm" className="green-gradient text-white border-0">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {language === 'ar' ? 'استلام' : 'Receive'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'لا توجد طلبات' : 'No purchase orders'}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Cost Analysis Sub-Tab
function CostAnalysisTab() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalProducts: 0, lowStockCount: 0, totalInventoryValue: 0,
    totalPotentialProfit: 0, totalCostValue: 0, averageMargin: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [costInput, setCostInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, summaryRes] = await Promise.all([
        fetch('/api/inventory/costs?type=products'),
        fetch('/api/inventory/costs?type=summary'),
      ]);
      const productsData = await productsRes.json();
      const summaryData = await summaryRes.json();
      setProducts(productsData || []);
      setSummary(summaryData || {
        totalProducts: 0, lowStockCount: 0, totalInventoryValue: 0,
        totalPotentialProfit: 0, totalCostValue: 0, averageMargin: 0
      });
    } catch (error) {
      console.error('Error fetching cost data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleUpdateCost = async () => {
    if (!editingProduct) return;
    try {
      await fetch('/api/inventory/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCost',
          productId: editingProduct.id,
          costPrice: costInput,
        }),
      });
      setEditingProduct(null);
      setCostInput('');
      fetchData();
    } catch (error) {
      console.error('Error updating cost:', error);
    }
  };

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <InventoryStatsCard 
          title={language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'} 
          value={summary.totalProducts} 
          icon={Package}
          colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]"
        />
        <InventoryStatsCard 
          title={language === 'ar' ? 'قيمة المخزون' : 'Inventory Value'} 
          value={`€${summary.totalInventoryValue.toFixed(2)}`} 
          icon={DollarSign}
          colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]"
        />
        <InventoryStatsCard 
          title={language === 'ar' ? 'الربح المحتمل' : 'Potential Profit'} 
          value={`€${summary.totalPotentialProfit.toFixed(2)}`} 
          icon={TrendingUp}
          trend={`${summary.averageMargin}% ${language === 'ar' ? 'هامش' : 'margin'}`}
          trendUp={summary.averageMargin > 0}
          colorClass="bg-gradient-to-br from-green-500 to-green-600"
        />
        <InventoryStatsCard 
          title={language === 'ar' ? 'منخفض المخزون' : 'Low Stock'} 
          value={summary.lowStockCount} 
          icon={AlertTriangle}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 gold-gradient" />
        <CardHeader>
          <CardTitle className="text-[#3D3229] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#D4A853]" />
            {language === 'ar' ? 'تحليل التكاليف' : 'Cost Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="shimmer h-64 rounded-lg" />
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#F5EDE0]">
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'تكلفة الإنتاج' : 'Cost Price'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'سعر البيع' : 'Selling Price'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'الربح' : 'Profit'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'الهامش' : 'Margin'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'المخزون' : 'Stock'}</TableHead>
                    <TableHead className="text-[#7A6F63]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-[#F5EDE0]">
                      <TableCell className="font-medium text-[#3D3229]">{getProductName(product)}</TableCell>
                      <TableCell>
                        {editingProduct?.id === product.id ? (
                          <Input type="number" step="0.01" value={costInput} onChange={(e) => setCostInput(e.target.value)} className="w-24 border-[#E8DFD0]" />
                        ) : (
                          <span className="text-[#3D3229]">€{(product.costPrice || 0).toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#D4A853] font-bold">€{product.price.toFixed(2)}</TableCell>
                      <TableCell className={product.profit >= 0 ? 'text-[#2D5A3D]' : 'text-red-500'}>
                        €{product.profit.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={product.margin >= 30 ? 'bg-[#2D5A3D]' : product.margin >= 15 ? 'bg-[#D4A853]' : 'bg-red-500'}>
                          {product.margin}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.lowStock ? 'destructive' : 'secondary'} className={product.lowStock ? '' : 'bg-[#2D5A3D] text-white'}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingProduct?.id === product.id ? (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdateCost} className="green-gradient text-white h-8">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingProduct(null); setCostInput(''); }} className="h-8">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => { setEditingProduct(product); setCostInput((product.costPrice || 0).toString()); }} className="text-[#D4A853]">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Stock Movement Sub-Tab
function StockMovementTab() {
  const { language } = useLanguage();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/costs?type=movements');
      const data = await res.json();
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-[#2D5A3D]';
      case 'out': return 'bg-red-500';
      case 'adjustment': return 'bg-[#D4A853]';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return language === 'ar' ? 'وارد' : 'In';
      case 'out': return language === 'ar' ? 'صادر' : 'Out';
      case 'adjustment': return language === 'ar' ? 'تعديل' : 'Adjustment';
      default: return type;
    }
  };

  const filteredMovements = filterType === 'all' ? movements : movements.filter(m => m.type === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#3D3229]">{language === 'ar' ? 'سجل حركة المخزون' : 'Stock Movement History'}</h3>
          <p className="text-sm text-[#7A6F63]">{filteredMovements.length} {language === 'ar' ? 'سجل' : 'records'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="in">{getTypeLabel('in')}</SelectItem>
              <SelectItem value="out">{getTypeLabel('out')}</SelectItem>
              <SelectItem value="adjustment">{getTypeLabel('adjustment')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Movements Table */}
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
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 gold-gradient" />
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#F5EDE0]">
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'الكمية' : 'Quantity'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'قبل' : 'Before'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'بعد' : 'After'}</TableHead>
                    <TableHead className="text-[#7A6F63]">{language === 'ar' ? 'السبب' : 'Reason'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id} className="hover:bg-[#F5EDE0]">
                      <TableCell className="text-[#7A6F63]">
                        {new Date(movement.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                      </TableCell>
                      <TableCell className="font-medium text-[#3D3229]">{getProductName(movement.product)}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(movement.type)}>{getTypeLabel(movement.type)}</Badge>
                      </TableCell>
                      <TableCell className={movement.type === 'in' ? 'text-[#2D5A3D] font-bold' : movement.type === 'out' ? 'text-red-500 font-bold' : 'text-[#D4A853] font-bold'}>
                        {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-[#7A6F63]">{movement.previousStock ?? '-'}</TableCell>
                      <TableCell className="text-[#3D3229] font-medium">{movement.newStock ?? '-'}</TableCell>
                      <TableCell className="text-[#7A6F63]">{movement.reason || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMovements.length === 0 && (
                <div className="text-center py-12 text-[#7A6F63]">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد حركات' : 'No movements found'}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Import Send icon
const Send = (props: React.ComponentProps<typeof TrendingUp>) => <TrendingUp {...props} />;

// Main Inventory Tab Component
export default function InventoryTab() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1 bg-[#F5EDE0] p-1 rounded-xl">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <PieChart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
          </TabsTrigger>
          <TabsTrigger value="expiry" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'الصلاحية' : 'Expiry'}</span>
          </TabsTrigger>
          <TabsTrigger value="lowstock" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'التنبيهات' : 'Alerts'}</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'الموردين' : 'Suppliers'}</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'الطلبات' : 'Orders'}</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-white data-[state=active]:text-[#2D5A3D] rounded-lg">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{language === 'ar' ? 'التكاليف' : 'Costs'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <CostAnalysisTab />
        </TabsContent>
        <TabsContent value="expiry" className="mt-6">
          <ExpiryTrackingTab />
        </TabsContent>
        <TabsContent value="lowstock" className="mt-6">
          <LowStockTab />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          <SupplierManagementTab />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <PurchaseOrdersTab />
        </TabsContent>
        <TabsContent value="costs" className="mt-6">
          <StockMovementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
