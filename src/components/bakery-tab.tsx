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
  Cookie, ChefHat, Thermometer, Timer, Plus, Edit, Trash2, Eye,
  Play, CheckCircle, Clock, AlertTriangle, Package, RefreshCw,
  TrendingUp, Settings, Oven
} from 'lucide-react';

// Types
interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number | null;
  notes: string | null;
}

interface Recipe {
  id: string;
  name: string;
  productId: string | null;
  description: string | null;
  yieldQty: number;
  yieldUnit: string;
  prepTime: number | null;
  bakeTime: number | null;
  bakeTemp: number | null;
  instructions: string | null;
  isActive: boolean;
  recipeIngredients: RecipeIngredient[];
  _count?: { productionBatches: number };
}

interface ProductionBatch {
  id: string;
  batchNumber: string;
  recipeId: string | null;
  recipe: Recipe | null;
  plannedQty: number;
  actualQty: number | null;
  status: string;
  startTime: string | null;
  endTime: string | null;
  mixerId: string | null;
  mixer: Mixer | null;
  ovenId: string | null;
  oven: OvenType | null;
  ovenTemp: number | null;
  qualityScore: number | null;
  notes: string | null;
  createdAt: string;
}

interface Mixer {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  currentBatchId: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  notes: string | null;
  productionBatches?: ProductionBatch[];
}

interface OvenType {
  id: string;
  name: string;
  type: string;
  capacity: number;
  minTemp: number;
  maxTemp: number;
  currentTemp: number | null;
  targetTemp: number | null;
  isActive: boolean;
  isHeating: boolean;
  currentBatchId: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  notes: string | null;
  productionBatches?: ProductionBatch[];
}

interface ProductionStats {
  todayBatches: number;
  activeBatches: number;
  completedToday: number;
  avgQualityScore: number;
}

interface EquipmentStats {
  totalMixers: number;
  activeMixers: number;
  totalOvens: number;
  activeOvens: number;
  inUseMixers: number;
  inUseOvens: number;
}

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  nameNl: string;
}

// Stats Card Component
function BakeryStatsCard({ title, value, icon: Icon, trend, colorClass }: { 
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

// Production Dashboard Sub-Tab
function ProductionDashboardTab() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ProductionStats>({ todayBatches: 0, activeBatches: 0, completedToday: 0, avgQualityScore: 0 });
  const [todayBatches, setTodayBatches] = useState<ProductionBatch[]>([]);
  const [equipmentStats, setEquipmentStats] = useState<EquipmentStats>({ totalMixers: 0, activeMixers: 0, totalOvens: 0, activeOvens: 0, inUseMixers: 0, inUseOvens: 0 });
  const [mixers, setMixers] = useState<Mixer[]>([]);
  const [ovens, setOvens] = useState<OvenType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productionRes, equipmentRes] = await Promise.all([
        fetch('/api/bakery/production?today=true'),
        fetch('/api/bakery/equipment'),
      ]);
      const productionData = await productionRes.json();
      const equipmentData = await equipmentRes.json();
      
      setTodayBatches(productionData || []);
      setStats({
        todayBatches: productionData?.length || 0,
        activeBatches: productionData?.filter((b: ProductionBatch) => !['completed', 'cancelled'].includes(b.status)).length || 0,
        completedToday: productionData?.filter((b: ProductionBatch) => b.status === 'completed').length || 0,
        avgQualityScore: productionData?.filter((b: ProductionBatch) => b.qualityScore).reduce((acc: number, b: ProductionBatch) => acc + (b.qualityScore || 0), 0) / (productionData?.filter((b: ProductionBatch) => b.qualityScore).length || 1) || 0,
      });
      
      setMixers(equipmentData.mixers || []);
      setOvens(equipmentData.ovens || []);
      setEquipmentStats({
        totalMixers: equipmentData.mixers?.length || 0,
        activeMixers: equipmentData.mixers?.filter((m: Mixer) => m.isActive).length || 0,
        totalOvens: equipmentData.ovens?.length || 0,
        activeOvens: equipmentData.ovens?.filter((o: OvenType) => o.isActive).length || 0,
        inUseMixers: equipmentData.mixers?.filter((m: Mixer) => m.currentBatchId).length || 0,
        inUseOvens: equipmentData.ovens?.filter((o: OvenType) => o.currentBatchId).length || 0,
      });
    } catch (error) {
      console.error('Error fetching production data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-500';
      case 'mixing': return 'bg-blue-500';
      case 'proofing': return 'bg-purple-500';
      case 'baking': return 'bg-[#D4A853]';
      case 'cooling': return 'bg-cyan-500';
      case 'completed': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusKey = `bakery.${status}`;
    return t(statusKey);
  };

  return (
    <div className="space-y-6">
      {/* Production Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <BakeryStatsCard title={t('bakery.todayBatches')} value={stats.todayBatches} icon={Package} colorClass="bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D]" />
        <BakeryStatsCard title={t('bakery.activeBatches')} value={stats.activeBatches} icon={Timer} colorClass="bg-gradient-to-br from-[#D4A853] to-[#B8923F]" />
        <BakeryStatsCard title={t('bakery.completed')} value={stats.completedToday} icon={CheckCircle} colorClass="bg-gradient-to-br from-green-500 to-green-600" />
        <BakeryStatsCard title={t('bakery.qualityScore')} value={stats.avgQualityScore ? `${stats.avgQualityScore.toFixed(1)}%` : '-'} icon={TrendingUp} colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      {/* Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mixers Status */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 green-gradient" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#2D5A3D]" />
              {t('bakery.mixers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Badge className="bg-[#2D5A3D]">{equipmentStats.activeMixers} {t('bakery.available')}</Badge>
              <Badge className="bg-[#D4A853]">{equipmentStats.inUseMixers} {t('bakery.inUse')}</Badge>
            </div>
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-3">
                {mixers.map((mixer) => (
                  <div key={mixer.id} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                    <div>
                      <p className="font-medium text-[#3D3229]">{mixer.name}</p>
                      <p className="text-sm text-[#7A6F63]">{mixer.capacity} {t('bakery.kg')}</p>
                    </div>
                    <Badge className={mixer.currentBatchId ? 'bg-[#D4A853]' : mixer.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}>
                      {mixer.currentBatchId ? t('bakery.inUse') : mixer.isActive ? t('bakery.available') : t('vehicles.inactive')}
                    </Badge>
                  </div>
                ))}
                {mixers.length === 0 && (
                  <p className="text-center text-[#7A6F63] py-4">{t('bakery.noEquipment')}</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ovens Status */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-2 gold-gradient" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-[#D4A853]" />
              {t('bakery.ovens')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Badge className="bg-[#2D5A3D]">{equipmentStats.activeOvens} {t('bakery.available')}</Badge>
              <Badge className="bg-[#D4A853]">{equipmentStats.inUseOvens} {t('bakery.inUse')}</Badge>
            </div>
            <ScrollArea className="h-[200px] pr-2">
              <div className="space-y-3">
                {ovens.map((oven) => (
                  <div key={oven.id} className="flex items-center justify-between p-3 bg-[#F5EDE0] rounded-lg">
                    <div>
                      <p className="font-medium text-[#3D3229]">{oven.name}</p>
                      <p className="text-sm text-[#7A6F63]">
                        {oven.currentTemp ? `${oven.currentTemp}${t('bakery.celsius')}` : '-'} / {oven.targetTemp ? `${oven.targetTemp}${t('bakery.celsius')}` : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={oven.currentBatchId ? 'bg-[#D4A853]' : oven.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}>
                        {oven.currentBatchId ? t('bakery.inUse') : oven.isActive ? t('bakery.available') : t('vehicles.inactive')}
                      </Badge>
                      {oven.isHeating && (
                        <p className="text-xs text-[#D4A853] mt-1">{t('bakery.baking')}</p>
                      )}
                    </div>
                  </div>
                ))}
                {ovens.length === 0 && (
                  <p className="text-center text-[#7A6F63] py-4">{t('bakery.noEquipment')}</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Today's Batches */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#2D5A3D] to-[#D4A853]" />
        <CardHeader>
          <CardTitle className="text-lg text-[#3D3229]">{t('bakery.todayBatches')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[250px] pr-2">
              <div className="space-y-3">
                {todayBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg text-white ${getStatusColor(batch.status)}`}>
                        <Cookie className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#3D3229]">{batch.batchNumber}</p>
                        <p className="text-sm text-[#7A6F63]">
                          {batch.recipe?.name || '-'} | {batch.plannedQty} {t('bakery.pieces')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(batch.status)}>
                        {getStatusLabel(batch.status)}
                      </Badge>
                      {batch.qualityScore && (
                        <p className="text-sm text-[#2D5A3D] mt-1">{batch.qualityScore}%</p>
                      )}
                    </div>
                  </div>
                ))}
                {todayBatches.length === 0 && (
                  <p className="text-center text-[#7A6F63] py-8">{t('bakery.noBatches')}</p>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Recipe Management Sub-Tab
function RecipeManagementTab() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    description: '',
    yieldQty: '1',
    yieldUnit: 'piece',
    prepTime: '',
    bakeTime: '',
    bakeTemp: '',
    instructions: '',
    ingredients: [{ name: '', quantity: '', unit: 'g', cost: '', notes: '' }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipesRes, productsRes] = await Promise.all([
        fetch('/api/bakery/recipes'),
        fetch('/api/products'),
      ]);
      const recipesData = await recipesRes.json();
      const productsData = await productsRes.json();
      setRecipes(recipesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/bakery/recipes';
      const method = editingRecipe ? 'PUT' : 'POST';
      const body = editingRecipe ? { ...formData, id: editingRecipe.id } : formData;
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      setIsDialogOpen(false);
      setEditingRecipe(null);
      setFormData({
        name: '',
        productId: '',
        description: '',
        yieldQty: '1',
        yieldUnit: 'piece',
        prepTime: '',
        bakeTime: '',
        bakeTemp: '',
        instructions: '',
        ingredients: [{ name: '', quantity: '', unit: 'g', cost: '', notes: '' }],
      });
      fetchData();
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      productId: recipe.productId || '',
      description: recipe.description || '',
      yieldQty: recipe.yieldQty.toString(),
      yieldUnit: recipe.yieldUnit,
      prepTime: recipe.prepTime?.toString() || '',
      bakeTime: recipe.bakeTime?.toString() || '',
      bakeTemp: recipe.bakeTemp?.toString() || '',
      instructions: recipe.instructions || '',
      ingredients: recipe.recipeIngredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity.toString(),
        unit: ing.unit,
        cost: ing.cost?.toString() || '',
        notes: ing.notes || '',
      })),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (recipeId: string) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await fetch(`/api/bakery/recipes?id=${recipeId}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: 'g', cost: '', notes: '' }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#3D3229]">{t('bakery.recipes')}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0" onClick={() => { setEditingRecipe(null); setFormData({ name: '', productId: '', description: '', yieldQty: '1', yieldUnit: 'piece', prepTime: '', bakeTime: '', bakeTemp: '', instructions: '', ingredients: [{ name: '', quantity: '', unit: 'g', cost: '', notes: '' }] }); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t('bakery.addRecipe')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{editingRecipe ? t('bakery.editRecipe') : t('bakery.addRecipe')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.recipeName')}</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('nav.products')}</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('nav.products')} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>{product.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-[#7A6F63]">{t('products.description')}</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.yield')}</Label>
                  <Input type="number" value={formData.yieldQty} onChange={(e) => setFormData({ ...formData, yieldQty: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.unit')}</Label>
                  <Select value={formData.yieldUnit} onValueChange={(value) => setFormData({ ...formData, yieldUnit: value })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">{t('bakery.pieces')}</SelectItem>
                      <SelectItem value="kg">{t('bakery.kg')}</SelectItem>
                      <SelectItem value="loaf">loaf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.prepTime')} ({t('bakery.minutes')})</Label>
                  <Input type="number" value={formData.prepTime} onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.bakeTime')} ({t('bakery.minutes')})</Label>
                  <Input type="number" value={formData.bakeTime} onChange={(e) => setFormData({ ...formData, bakeTime: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                </div>
              </div>

              <div>
                <Label className="text-[#7A6F63]">{t('bakery.bakeTemp')} ({t('bakery.celsius')})</Label>
                <Input type="number" value={formData.bakeTemp} onChange={(e) => setFormData({ ...formData, bakeTemp: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
              </div>

              <div>
                <Label className="text-[#7A6F63]">{t('bakery.instructions')}</Label>
                <Textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="mt-1.5 border-[#E8DFD0]" rows={3} />
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-[#7A6F63] font-bold">{t('bakery.ingredients')}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="border-[#D4A853] text-[#D4A853]">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('bakery.addIngredient')}
                  </Button>
                </div>
                <ScrollArea className="h-[200px] pr-2">
                  <div className="space-y-3">
                    {formData.ingredients.map((ing, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input value={ing.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} placeholder={t('bakery.ingredientName')} className="border-[#E8DFD0]" />
                        </div>
                        <div className="w-20">
                          <Input value={ing.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} placeholder={t('bakery.quantity')} className="border-[#E8DFD0]" />
                        </div>
                        <div className="w-20">
                          <Select value={ing.unit} onValueChange={(value) => updateIngredient(index, 'unit', value)}>
                            <SelectTrigger className="border-[#E8DFD0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">{t('bakery.grams')}</SelectItem>
                              <SelectItem value="kg">{t('bakery.kg')}</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="L">{t('bakery.liters')}</SelectItem>
                              <SelectItem value="piece">{t('bakery.pieces')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.ingredients.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeIngredient(index)} className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0">
              <CardContent className="p-4">
                <div className="shimmer h-40 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className={`card-hover border-0 shadow-md overflow-hidden ${!recipe.isActive ? 'opacity-60' : ''}`}>
              <div className="h-2 gold-gradient" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-[#3D3229]">{recipe.name}</CardTitle>
                <CardDescription className="text-[#7A6F63]">
                  {recipe.yieldQty} {recipe.yieldUnit}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(recipe)} className="text-[#7A6F63] hover:bg-[#F5EDE0]">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(recipe.id)} className="text-red-500 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-[#7A6F63] mb-3">
              {recipe.prepTime && (
                <span className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {recipe.prepTime}{t('bakery.minutes')}
                </span>
              )}
              {recipe.bakeTime && (
                <span className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  {recipe.bakeTime}{t('bakery.minutes')}
                </span>
              )}
              {recipe.bakeTemp && (
                <span>{recipe.bakeTemp}{t('bakery.celsius')}</span>
              )}
            </div>
            <Separator className="my-3" />
            <div>
              <p className="text-xs text-[#7A6F63] mb-2">{t('bakery.ingredients')}:</p>
              <div className="flex flex-wrap gap-1">
                {recipe.recipeIngredients.slice(0, 4).map((ing) => (
                  <Badge key={ing.id} variant="outline" className="border-[#E8DFD0] text-[#5C4033]">
                    {ing.name} ({ing.quantity}{ing.unit})
                  </Badge>
                ))}
                {recipe.recipeIngredients.length > 4 && (
                  <Badge variant="outline" className="border-[#D4A853] text-[#D4A853]">
                    +{recipe.recipeIngredients.length - 4}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-3 text-xs text-[#7A6F63]">
              {recipe._count?.productionBatches || 0} batches
            </div>
          </CardContent>
        </Card>
          ))}
          {recipes.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#7A6F63]">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('bakery.noRecipes')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Production Batches Sub-Tab
function ProductionBatchesTab() {
  const { t } = useLanguage();
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mixers, setMixers] = useState<Mixer[]>([]);
  const [ovens, setOvens] = useState<OvenType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    recipeId: '',
    plannedQty: '',
    mixerId: '',
    ovenId: '',
    ovenTemp: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchesRes, recipesRes, equipmentRes] = await Promise.all([
        fetch('/api/bakery/production'),
        fetch('/api/bakery/recipes?activeOnly=true'),
        fetch('/api/bakery/equipment'),
      ]);
      const batchesData = await batchesRes.json();
      const recipesData = await recipesRes.json();
      const equipmentData = await equipmentRes.json();
      
      setBatches(batchesData);
      setRecipes(recipesData);
      setMixers(equipmentData.mixers || []);
      setOvens(equipmentData.ovens || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bakery/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setIsDialogOpen(false);
      setFormData({ recipeId: '', plannedQty: '', mixerId: '', ovenId: '', ovenTemp: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const updateBatchStatus = async (batchId: string, newStatus: string) => {
    try {
      await fetch('/api/bakery/production', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: batchId, status: newStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusOrder = ['planned', 'mixing', 'proofing', 'baking', 'cooling', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-500';
      case 'mixing': return 'bg-blue-500';
      case 'proofing': return 'bg-purple-500';
      case 'baking': return 'bg-[#D4A853]';
      case 'cooling': return 'bg-cyan-500';
      case 'completed': return 'bg-[#2D5A3D]';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredBatches = filterStatus === 'all' ? batches : batches.filter(b => b.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-[#3D3229]">{t('bakery.production')}</h3>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] border-[#E8DFD0] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('bakery.status')}</SelectItem>
              <SelectItem value="planned">{t('bakery.planned')}</SelectItem>
              <SelectItem value="mixing">{t('bakery.mixing')}</SelectItem>
              <SelectItem value="proofing">{t('bakery.proofing')}</SelectItem>
              <SelectItem value="baking">{t('bakery.baking')}</SelectItem>
              <SelectItem value="cooling">{t('bakery.cooling')}</SelectItem>
              <SelectItem value="completed">{t('bakery.completed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('bakery.addBatch')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
            <DialogHeader>
              <DialogTitle className="text-[#3D3229]">{t('bakery.addBatch')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#7A6F63]">{t('bakery.selectRecipe')}</Label>
                <Select value={formData.recipeId} onValueChange={(value) => setFormData({ ...formData, recipeId: value })}>
                  <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                    <SelectValue placeholder={t('bakery.selectRecipe')} />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('bakery.plannedQty')}</Label>
                <Input type="number" value={formData.plannedQty} onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.selectMixer')}</Label>
                  <Select value={formData.mixerId} onValueChange={(value) => setFormData({ ...formData, mixerId: value })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('bakery.selectMixer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {mixers.filter(m => m.isActive && !m.currentBatchId).map((mixer) => (
                        <SelectItem key={mixer.id} value={mixer.id}>{mixer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#7A6F63]">{t('bakery.selectOven')}</Label>
                  <Select value={formData.ovenId} onValueChange={(value) => setFormData({ ...formData, ovenId: value })}>
                    <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                      <SelectValue placeholder={t('bakery.selectOven')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ovens.filter(o => o.isActive && !o.currentBatchId).map((oven) => (
                        <SelectItem key={oven.id} value={oven.id}>{oven.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[#7A6F63]">{t('bakery.bakeTemp')} ({t('bakery.celsius')})</Label>
                <Input type="number" value={formData.ovenTemp} onChange={(e) => setFormData({ ...formData, ovenTemp: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
              </div>
              <DialogFooter>
                <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {filteredBatches.map((batch) => {
              const nextStatus = getNextStatus(batch.status);
              return (
                <Card key={batch.id} className="card-hover border-0 shadow-md bg-white overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className={`p-3 rounded-xl text-white ${getStatusColor(batch.status)}`}>
                      <Cookie className="h-6 w-6" />
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#3D3229]">{batch.batchNumber}</span>
                        <Badge className={getStatusColor(batch.status)}>
                          {t(`bakery.${batch.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#7A6F63]">
                        {batch.recipe?.name || '-'} | {t('bakery.plannedQty')}: {batch.plannedQty}
                        {batch.actualQty && ` | ${t('bakery.actualQty')}: ${batch.actualQty}`}
                      </p>
                      <div className="flex gap-4 text-xs text-[#7A6F63] mt-1">
                        {batch.mixer && <span>{t('bakery.mixers')}: {batch.mixer.name}</span>}
                        {batch.oven && <span>{t('bakery.ovens')}: {batch.oven.name}</span>}
                        {batch.ovenTemp && <span>{batch.ovenTemp}{t('bakery.celsius')}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!['completed', 'cancelled'].includes(batch.status) && nextStatus && (
                        <Button size="sm" onClick={() => updateBatchStatus(batch.id, nextStatus)} className="green-gradient text-white border-0">
                          <Play className="h-4 w-4 mr-1" />
                          {t('bakery.advanceStage')}
                        </Button>
                      )}
                      {batch.status === 'cooling' && (
                        <Button size="sm" onClick={() => updateBatchStatus(batch.id, 'completed')} className="gold-gradient text-white border-0">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('bakery.completeBatch')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {filteredBatches.length === 0 && (
              <div className="text-center py-12 text-[#7A6F63]">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('bakery.noBatches')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Equipment Management Sub-Tab
function EquipmentManagementTab() {
  const { t } = useLanguage();
  const [mixers, setMixers] = useState<Mixer[]>([]);
  const [ovens, setOvens] = useState<OvenType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMixerDialogOpen, setIsMixerDialogOpen] = useState(false);
  const [isOvenDialogOpen, setIsOvenDialogOpen] = useState(false);
  const [mixerFormData, setMixerFormData] = useState({ name: '', capacity: '', notes: '' });
  const [ovenFormData, setOvenFormData] = useState({ name: '', type: 'electric', capacity: '', minTemp: '50', maxTemp: '300', notes: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bakery/equipment');
      const data = await res.json();
      setMixers(data.mixers || []);
      setOvens(data.ovens || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleMixerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bakery/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'mixer', ...mixerFormData }),
      });
      setIsMixerDialogOpen(false);
      setMixerFormData({ name: '', capacity: '', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating mixer:', error);
    }
  };

  const handleOvenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/bakery/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'oven', ...ovenFormData, ovenType: ovenFormData.type }),
      });
      setIsOvenDialogOpen(false);
      setOvenFormData({ name: '', type: 'electric', capacity: '', minTemp: '50', maxTemp: '300', notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating oven:', error);
    }
  };

  const toggleEquipmentStatus = async (type: 'mixer' | 'oven', id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/bakery/equipment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, isActive: !currentStatus }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const deleteEquipment = async (type: 'mixer' | 'oven', id: string) => {
    if (confirm(t('messages.confirmDelete'))) {
      try {
        await fetch(`/api/bakery/equipment?id=${id}&type=${type}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Error deleting equipment:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Mixers Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 green-gradient" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#2D5A3D]" />
              {t('bakery.mixers')}
            </CardTitle>
            <Dialog open={isMixerDialogOpen} onOpenChange={setIsMixerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="green-gradient text-white border-0">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('bakery.addMixer')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
                <DialogHeader>
                  <DialogTitle className="text-[#3D3229]">{t('bakery.addMixer')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMixerSubmit} className="space-y-4">
                  <div>
                    <Label className="text-[#7A6F63]">{t('bakery.mixerName')}</Label>
                    <Input value={mixerFormData.name} onChange={(e) => setMixerFormData({ ...mixerFormData, name: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('bakery.capacity')} ({t('bakery.kg')})</Label>
                    <Input type="number" value={mixerFormData.capacity} onChange={(e) => setMixerFormData({ ...mixerFormData, capacity: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('orders.notes')}</Label>
                    <Textarea value={mixerFormData.notes} onChange={(e) => setMixerFormData({ ...mixerFormData, notes: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mixers.map((mixer) => (
              <div key={mixer.id} className={`p-4 rounded-xl border ${mixer.isActive ? 'bg-[#F5EDE0] border-[#E8DFD0]' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#3D3229]">{mixer.name}</p>
                    <p className="text-sm text-[#7A6F63]">{mixer.capacity} {t('bakery.kg')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleEquipmentStatus('mixer', mixer.id, mixer.isActive)} className={mixer.isActive ? 'text-[#2D5A3D]' : 'text-gray-400'}>
                      {mixer.isActive ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteEquipment('mixer', mixer.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className={`mt-2 ${mixer.currentBatchId ? 'bg-[#D4A853]' : mixer.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}`}>
                  {mixer.currentBatchId ? t('bakery.inUse') : mixer.isActive ? t('bakery.available') : t('vehicles.inactive')}
                </Badge>
              </div>
            ))}
            {mixers.length === 0 && (
              <p className="col-span-full text-center text-[#7A6F63] py-8">{t('bakery.noEquipment')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ovens Section */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-2 gold-gradient" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-[#3D3229] flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-[#D4A853]" />
              {t('bakery.ovens')}
            </CardTitle>
            <Dialog open={isOvenDialogOpen} onOpenChange={setIsOvenDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gold-gradient text-white border-0">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('bakery.addOven')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
                <DialogHeader>
                  <DialogTitle className="text-[#3D3229]">{t('bakery.addOven')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOvenSubmit} className="space-y-4">
                  <div>
                    <Label className="text-[#7A6F63]">{t('bakery.ovenName')}</Label>
                    <Input value={ovenFormData.name} onChange={(e) => setOvenFormData({ ...ovenFormData, name: e.target.value })} className="mt-1.5 border-[#E8DFD0]" required />
                  </div>
                  <div>
                    <Label className="text-[#7A6F63]">{t('bakery.ovenType')}</Label>
                    <Select value={ovenFormData.type} onValueChange={(value) => setOvenFormData({ ...ovenFormData, type: value })}>
                      <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electric">{t('bakery.electric')}</SelectItem>
                        <SelectItem value="gas">{t('bakery.gas')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-[#7A6F63]">{t('bakery.capacity')} ({t('bakery.trays')})</Label>
                      <Input type="number" value={ovenFormData.capacity} onChange={(e) => setOvenFormData({ ...ovenFormData, capacity: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                    </div>
                    <div>
                      <Label className="text-[#7A6F63]">{t('bakery.minTemp')}</Label>
                      <Input type="number" value={ovenFormData.minTemp} onChange={(e) => setOvenFormData({ ...ovenFormData, minTemp: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                    </div>
                    <div>
                      <Label className="text-[#7A6F63]">{t('bakery.maxTemp')}</Label>
                      <Input type="number" value={ovenFormData.maxTemp} onChange={(e) => setOvenFormData({ ...ovenFormData, maxTemp: e.target.value })} className="mt-1.5 border-[#E8DFD0]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="gold-gradient text-white border-0">{t('actions.save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ovens.map((oven) => (
              <div key={oven.id} className={`p-4 rounded-xl border ${oven.isActive ? 'bg-[#F5EDE0] border-[#E8DFD0]' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#3D3229]">{oven.name}</p>
                    <p className="text-sm text-[#7A6F63]">{oven.type === 'electric' ? t('bakery.electric') : t('bakery.gas')} | {oven.capacity} {t('bakery.trays')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleEquipmentStatus('oven', oven.id, oven.isActive)} className={oven.isActive ? 'text-[#2D5A3D]' : 'text-gray-400'}>
                      {oven.isActive ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteEquipment('oven', oven.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-[#D4A853]" />
                  <span className="text-sm text-[#5C4033]">
                    {oven.currentTemp ? `${oven.currentTemp}°C` : '-'} / {oven.targetTemp ? `${oven.targetTemp}°C` : '-'}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={`text-xs ${oven.currentBatchId ? 'bg-[#D4A853]' : oven.isActive ? 'bg-[#2D5A3D]' : 'bg-gray-400'}`}>
                    {oven.currentBatchId ? t('bakery.inUse') : oven.isActive ? t('bakery.available') : t('vehicles.inactive')}
                  </Badge>
                  {oven.isHeating && (
                    <Badge className="text-xs bg-orange-500">{t('bakery.baking')}</Badge>
                  )}
                </div>
              </div>
            ))}
            {ovens.length === 0 && (
              <p className="col-span-full text-center text-[#7A6F63] py-8">{t('bakery.noEquipment')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Bakery Tab Component
export default function BakeryTab() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229]">{t('bakery.title')}</h2>
          <p className="text-sm text-[#7A6F63]">{t('bakery.description')}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-[#D4A853] text-[#D4A853] hover:bg-[#D4A853] hover:text-white">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="bg-[#F5EDE0] p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <ChefHat className="h-4 w-4 mr-2" />
            {t('bakery.dashboard')}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <Cookie className="h-4 w-4 mr-2" />
            {t('bakery.recipes')}
          </TabsTrigger>
          <TabsTrigger value="production" className="data-[state=active]:bg-[#D4A853] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <Package className="h-4 w-4 mr-2" />
            {t('bakery.production')}
          </TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white text-[#7A6F63] px-4 py-2">
            <Settings className="h-4 w-4 mr-2" />
            {t('bakery.equipment')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <ProductionDashboardTab />
        </TabsContent>
        <TabsContent value="recipes" className="mt-6">
          <RecipeManagementTab />
        </TabsContent>
        <TabsContent value="production" className="mt-6">
          <ProductionBatchesTab />
        </TabsContent>
        <TabsContent value="equipment" className="mt-6">
          <EquipmentManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
