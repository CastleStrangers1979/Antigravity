'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  Printer, Receipt, Search, User, Package, X, Check, Clock,
  ArrowRight, Calculator, Percent, Tag, Save, RefreshCw
} from 'lucide-react';

// Types
interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
}

interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  customer?: Customer;
  createdAt: string;
}

export default function POSTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cashReceived, setCashReceived] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orderHistoryDialog, setOrderHistoryDialog] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Mock products for demo
      setProducts([
        { id: '1', nameAr: 'خبز صاج', nameEn: 'Saj Bread', nameNl: 'Saj Brood', price: 5.00, category: 'bread', stock: 100 },
        { id: '2', nameAr: 'خبز عربي', nameEn: 'Arabic Bread', nameNl: 'Arabisch Brood', price: 4.00, category: 'bread', stock: 150 },
        { id: '3', nameAr: 'خبز تنور', nameEn: 'Tandoor Bread', nameNl: 'Tandoor Brood', price: 4.50, category: 'bread', stock: 80 },
        { id: '4', nameAr: 'فطير بالجبنة', nameEn: 'Cheese Pastry', nameNl: 'Kaas Gebak', price: 10.00, category: 'pastry', stock: 50 },
        { id: '5', nameAr: 'فطير بالسبانخ', nameEn: 'Spinach Pastry', nameNl: 'Spinazie Gebak', price: 9.00, category: 'pastry', stock: 45 },
        { id: '6', nameAr: 'بقلاوة', nameEn: 'Baklava', nameNl: 'Baklava', price: 20.00, category: 'sweets', stock: 30 },
        { id: '7', nameAr: 'كنافة', nameEn: 'Kunafa', nameNl: 'Kunafa', price: 25.00, category: 'sweets', stock: 25 },
        { id: '8', nameAr: 'معمول', nameEn: "Ma'amoul", nameNl: "Ma'amoul", price: 15.00, category: 'sweets', stock: 40 },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const getProductName = (product: Product) => {
    if (language === 'ar') return product.nameAr;
    if (language === 'nl') return product.nameNl;
    return product.nameEn;
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, discount: 0 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty === 0) return null;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountPercent(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = (subtotal * discountPercent) / 100;
  const tax = ((subtotal - discount) * 0.21); // 21% BTW
  const total = subtotal - discount + tax;

  const filteredProducts = products.filter(p => {
    const matchesSearch = getProductName(p).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;

    const order: Order = {
      id: `POS-${Date.now()}`,
      items: cart,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: selectedPaymentMethod,
      customer: selectedCustomer || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch (error) {
      console.error('Error creating order:', error);
    }

    setRecentOrders([order, ...recentOrders.slice(0, 9)]);
    showNotification(language === 'ar' ? 'تم إتمام الطلب بنجاح' : 'Order completed successfully', 'success');
    clearCart();
    setPaymentDialog(false);
    setSelectedPaymentMethod('');
    setCashReceived('');
  };

  const printReceipt = (order: Order) => {
    // In a real app, this would connect to a receipt printer
    showNotification(language === 'ar' ? 'جاري طباعة الفاتورة...' : 'Printing receipt...', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    toast({
      title: type === 'success' ? (language === 'ar' ? 'نجاح' : 'Success') : (language === 'ar' ? 'خطأ' : 'Error'),
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        pos: 'نقطة البيع',
        searchProducts: 'بحث عن المنتجات...',
        allCategories: 'جميع الفئات',
        bread: 'خبز',
        pastry: 'معجنات',
        sweets: 'حلويات',
        cart: 'السلة',
        emptyCart: 'السلة فارغة',
        subtotal: 'المجموع الفرعي',
        discount: 'الخصم',
        tax: 'الضريبة (21%)',
        total: 'الإجمالي',
        addDiscount: 'إضافة خصم',
        selectCustomer: 'اختر عميل',
        noCustomer: 'بدون عميل',
        pay: 'دفع',
        clearCart: 'إفراغ السلة',
        paymentMethod: 'طريقة الدفع',
        cash: 'نقداً',
        card: 'بطاقة',
        ideal: 'iDEAL',
        cashReceived: 'المبلغ المستلم',
        change: 'الباقي',
        processPayment: 'معالجة الدفع',
        cancel: 'إلغاء',
        printReceipt: 'طباعة الفاتورة',
        orderHistory: 'سجل الطلبات',
        recentOrders: 'الطلبات الأخيرة',
        loyaltyPoints: 'نقاط الولاء',
        quantity: 'الكمية',
        price: 'السعر',
        item: 'الصنف',
        inStock: 'متوفر',
        lowStock: 'مخزون منخفض',
      },
      en: {
        pos: 'Point of Sale',
        searchProducts: 'Search products...',
        allCategories: 'All Categories',
        bread: 'Bread',
        pastry: 'Pastry',
        sweets: 'Sweets',
        cart: 'Cart',
        emptyCart: 'Cart is empty',
        subtotal: 'Subtotal',
        discount: 'Discount',
        tax: 'Tax (21%)',
        total: 'Total',
        addDiscount: 'Add Discount',
        selectCustomer: 'Select Customer',
        noCustomer: 'No Customer',
        pay: 'Pay',
        clearCart: 'Clear Cart',
        paymentMethod: 'Payment Method',
        cash: 'Cash',
        card: 'Card',
        ideal: 'iDEAL',
        cashReceived: 'Cash Received',
        change: 'Change',
        processPayment: 'Process Payment',
        cancel: 'Cancel',
        printReceipt: 'Print Receipt',
        orderHistory: 'Order History',
        recentOrders: 'Recent Orders',
        loyaltyPoints: 'Loyalty Points',
        quantity: 'Qty',
        price: 'Price',
        item: 'Item',
        inStock: 'In Stock',
        lowStock: 'Low Stock',
      },
    };
    return translations[language]?.[key] || key;
  };

  const categories = [
    { id: 'all', label: t('allCategories'), icon: Package },
    { id: 'bread', label: t('bread'), icon: Package },
    { id: 'pastry', label: t('pastry'), icon: Package },
    { id: 'sweets', label: t('sweets'), icon: Package },
  ];

  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
                <Calculator className="h-7 w-7 text-[#D4A853]" />
                {t('pos')}
              </h2>
            </div>
            <Button onClick={() => setOrderHistoryDialog(true)} variant="outline" className="border-[#D4A853] text-[#D4A853]">
              <Clock className="h-4 w-4 mr-2" />
              {t('orderHistory')}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7A6F63]" />
            <Input
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-[#E8DFD0] bg-white"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-4 w-full">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <ScrollArea className="h-[calc(100vh-380px)]">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="shimmer h-32 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="border-0 shadow-md cursor-pointer card-hover overflow-hidden"
                    onClick={() => addToCart(product)}
                  >
                    <div className={`h-1 ${product.category === 'bread' ? 'bg-amber-500' : product.category === 'pastry' ? 'bg-orange-500' : 'bg-rose-500'}`} />
                    <CardContent className="p-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F5EDE0] flex items-center justify-center mb-2">
                        <Package className="h-5 w-5 text-[#D4A853]" />
                      </div>
                      <p className="font-medium text-sm text-[#3D3229] truncate">{getProductName(product)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold text-[#D4A853]">€{product.price.toFixed(2)}</span>
                        <Badge variant={product.stock > 20 ? 'secondary' : 'destructive'} className="text-xs">
                          {product.stock}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-xl shadow-lg border border-[#E8DFD0] flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-4 border-b border-[#E8DFD0] bg-gradient-to-r from-[#D4A853] to-[#B8923F] rounded-t-xl">
            <div className="flex items-center justify-between text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('cart')}
              </h3>
              <Badge className="bg-white/20 text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {language === 'ar' ? 'صنف' : 'items'}
              </Badge>
            </div>
          </div>

          {/* Customer Selection */}
          <div className="p-3 border-b border-[#E8DFD0]">
            <Select onValueChange={(v) => setSelectedCustomer(customers.find(c => c.id === v) || null)}>
              <SelectTrigger className="border-[#E8DFD0]">
                <SelectValue placeholder={t('selectCustomer')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noCustomer')}</SelectItem>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} - {c.loyaltyPoints} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-[#F5EDE0] rounded-lg text-sm">
                <p className="font-medium text-[#3D3229]">{selectedCustomer.name}</p>
                <p className="text-[#7A6F63]">{t('loyaltyPoints')}: {selectedCustomer.loyaltyPoints}</p>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <ScrollArea className="flex-1 p-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-30" />
                <p className="text-[#7A6F63]">{t('emptyCart')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-3 bg-[#F5EDE0] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[#3D3229]">{getProductName(item.product)}</p>
                        <p className="text-xs text-[#7A6F63]">€{item.product.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#D4A853]">€{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="h-7 w-7 p-0 border-[#E8DFD0]"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="h-7 w-7 p-0 border-[#E8DFD0]"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Discount */}
          <div className="p-3 border-t border-[#E8DFD0]">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-20 border-[#E8DFD0]"
              />
              <Percent className="h-4 w-4 text-[#7A6F63]" />
              <span className="text-sm text-[#7A6F63]">{t('addDiscount')}</span>
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 border-t border-[#E8DFD0] bg-[#FFFEF7]">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#7A6F63]">
                <span>{t('subtotal')}</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#7A6F63]">
                <span>{t('tax')}</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-xl font-bold text-[#3D3229]">
                <span>{t('total')}</span>
                <span className="text-[#D4A853]">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[#E8DFD0] space-y-2">
            <Button
              onClick={() => setPaymentDialog(true)}
              disabled={cart.length === 0}
              className="w-full green-gradient text-white h-12 text-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {t('pay')} - €{total.toFixed(2)}
            </Button>
            <Button
              onClick={clearCart}
              variant="outline"
              disabled={cart.length === 0}
              className="w-full border-red-200 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('clearCart')}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('paymentMethod')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setSelectedPaymentMethod('cash')}
                className={`h-20 flex-col ${selectedPaymentMethod === 'cash' ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}`}
              >
                <Banknote className="h-8 w-8 mb-1" />
                {t('cash')}
              </Button>
              <Button
                variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setSelectedPaymentMethod('card')}
                className={`h-20 flex-col ${selectedPaymentMethod === 'card' ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}`}
              >
                <CreditCard className="h-8 w-8 mb-1" />
                {t('card')}
              </Button>
              <Button
                variant={selectedPaymentMethod === 'ideal' ? 'default' : 'outline'}
                onClick={() => setSelectedPaymentMethod('ideal')}
                className={`h-20 flex-col ${selectedPaymentMethod === 'ideal' ? 'bg-[#2D5A3D]' : 'border-[#E8DFD0]'}`}
              >
                <Smartphone className="h-8 w-8 mb-1" />
                {t('ideal')}
              </Button>
            </div>

            {selectedPaymentMethod === 'cash' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[#7A6F63]">{t('cashReceived')}</Label>
                  <Input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0.00"
                    className="mt-1.5 border-[#E8DFD0] text-lg"
                  />
                </div>
                {parseFloat(cashReceived) >= total && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-700">{t('change')}</p>
                    <p className="text-2xl font-bold text-green-600">
                      €{(parseFloat(cashReceived) - total).toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => setCashReceived(amount.toString())}
                      className="border-[#E8DFD0]"
                    >
                      €{amount}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-[#F5EDE0] rounded-xl">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span className="text-[#D4A853]">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setPaymentDialog(false)} className="flex-1 border-[#E8DFD0]">
              {t('cancel')}
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || (selectedPaymentMethod === 'cash' && parseFloat(cashReceived) < total)}
              className="flex-1 gold-gradient text-white border-0"
            >
              <Check className="h-4 w-4 mr-2" />
              {t('processPayment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog open={orderHistoryDialog} onOpenChange={setOrderHistoryDialog}>
        <DialogContent className="max-w-2xl bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('recentOrders')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-30" />
                <p className="text-[#7A6F63]">{language === 'ar' ? 'لا توجد طلبات سابقة' : 'No recent orders'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#3D3229]">{order.id}</p>
                          <p className="text-sm text-[#7A6F63]">
                            {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                          </p>
                          <p className="text-sm text-[#7A6F63] mt-1">
                            {order.items.length} {language === 'ar' ? 'أصناف' : 'items'} • {order.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#D4A853]">€{order.total.toFixed(2)}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printReceipt(order)}
                            className="mt-2 border-[#E8DFD0]"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            {t('printReceipt')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
