'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp, 
  Truck, 
  Package, 
  Clock, 
  Thermometer, 
  Euro,
  ArrowDownToLine,
  Layers,
  Fuel,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface UnitCostData {
  id: string;
  productName: string;
  baseCost: number;
  rawMaterials: number;
  labor: number;
  overheads: number;
  variances: {
    time: number;
    quantity: number;
    price: number;
  };
  totalCost: number;
  sellingPrice: number;
}

export default function CostAnalysisTab() {
  const { t, language, isRTL, formatCurrency } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState('bread-standard');
  
  // Production Settings (Influencing Variances)
  const [productionSettings, setProductionSettings] = useState({
    season: 'summer', // summer vs winter
    downtimeMinutes: 45,
    flourPriceIndex: 1.15, // 15% increase
    waterFlowMeter: 450 // liters
  });

  // Dynamic Calculation Logic
  const calculateCosts = () => {
    const baseRawMaterial = 0.12;
    const baseLabor = 0.08;
    const baseOverhead = 0.05;

    // Time Variance: €0.001 per minute of downtime spread over average daily production
    const timeVar = (productionSettings.downtimeMinutes * 0.001);
    
    // Quantity Variance: Summer increases yeast/water costs by 20%
    const quantityVar = productionSettings.season === 'summer' ? 0.03 : 0.01;
    
    // Price Variance: Market fluctuation
    const priceVar = (productionSettings.flourPriceIndex - 1.0) * baseRawMaterial;

    const totalCost = baseRawMaterial + baseLabor + baseOverhead + timeVar + quantityVar + priceVar;
    
    return {
      rawMaterials: baseRawMaterial,
      labor: baseLabor,
      overheads: baseOverhead,
      timeVar,
      quantityVar,
      priceVar,
      totalCost,
      sellingPrice: 0.60
    };
  };

  const results = calculateCosts();

  return (
    <div className="space-y-6">
      {/* Control Panel for Simulation */}
      <Card className="border border-[#D4A853]/30 bg-[#FDFBF7]">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D3229] flex items-center gap-1">
                <Thermometer className="h-3 w-3" /> {isRTL ? 'الموسم الحالي' : 'Current Season'}
              </label>
              <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <Button 
                  variant={productionSettings.season === 'summer' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`flex-1 h-7 text-[10px] ${productionSettings.season === 'summer' ? 'bg-[#D4A853]' : ''}`}
                  onClick={() => setProductionSettings({...productionSettings, season: 'summer'})}
                >
                  {isRTL ? 'صيف' : 'Summer'}
                </Button>
                <Button 
                  variant={productionSettings.season === 'winter' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`flex-1 h-7 text-[10px] ${productionSettings.season === 'winter' ? 'bg-[#2D5A3D]' : ''}`}
                  onClick={() => setProductionSettings({...productionSettings, season: 'winter'})}
                >
                  {isRTL ? 'شتاء' : 'Winter'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D3229] flex items-center gap-1">
                <Clock className="h-3 w-3" /> {isRTL ? 'وقت التوقف (دقيقة)' : 'Downtime (min)'}
              </label>
              <input 
                type="range" min="0" max="180" 
                value={productionSettings.downtimeMinutes}
                onChange={(e) => setProductionSettings({...productionSettings, downtimeMinutes: parseInt(e.target.value)})}
                className="w-full accent-[#D4A853]"
              />
              <p className="text-[10px] text-right text-muted-foreground">{productionSettings.downtimeMinutes} min</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D3229] flex items-center gap-1">
                <Euro className="h-3 w-3" /> {isRTL ? 'مؤشر سعر الطحين' : 'Flour Price Index'}
              </label>
              <Select 
                value={productionSettings.flourPriceIndex.toString()} 
                onValueChange={(val) => setProductionSettings({...productionSettings, flourPriceIndex: parseFloat(val)})}
              >
                <SelectTrigger className="h-8 bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1.0">Standard (€)</SelectItem>
                  <SelectItem value="1.10">+10% Surge</SelectItem>
                  <SelectItem value="1.25">+25% Crisis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-[#2D5A3D] text-white flex-1 h-8 text-xs">
                <Calculator className="h-3 w-3 mr-1" /> {isRTL ? 'تحديث النتائج' : 'Update'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Cost Inverted Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-[#2D5A3D] text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5" />
              {isRTL ? 'تحليل تكلفة الربطة (الهرم المقلوب)' : 'Unit Cost Analysis (Inverted Pyramid)'}
            </CardTitle>
            <CardDescription className="text-white/80">
              {isRTL ? 'حساب التكلفة الفعلية بناءً على المدخلات والانحرافات' : 'Calculating actual cost based on inputs and variances'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative space-y-4">
              {/* Output Layer */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-emerald-800">{isRTL ? 'سعر المبيع' : 'Selling Price'}</span>
                  <span className="text-xl font-bold text-emerald-700">{formatCurrency(results.sellingPrice)}</span>
                </div>
                <Progress value={100} className="h-2 bg-emerald-200" />
              </div>

              {/* Cost Layers (Inverted) */}
              <div className="flex flex-col gap-2 items-center">
                <div className="w-[90%] bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between">
                  <span className="text-xs text-blue-800 flex items-center gap-1"><Package className="h-3 w-3" /> {isRTL ? 'مواد أولية' : 'Raw Materials'}</span>
                  <span className="text-sm font-bold">{formatCurrency(results.rawMaterials)}</span>
                </div>
                <div className="w-[80%] bg-amber-50 p-3 rounded-lg border border-amber-100 flex justify-between">
                  <span className="text-xs text-amber-800 flex items-center gap-1"><Layers className="h-3 w-3" /> {isRTL ? 'مصاريف تشغيل (Overheads)' : 'Overheads'}</span>
                  <span className="text-sm font-bold">{formatCurrency(results.overheads)}</span>
                </div>
                <div className="w-[70%] bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
                  <span className="text-xs text-slate-800 flex items-center gap-1"><Clock className="h-3 w-3" /> {isRTL ? 'أجور عمال' : 'Labor'}</span>
                  <span className="text-sm font-bold">{formatCurrency(results.labor)}</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="mt-6 pt-4 border-t border-dashed flex justify-between items-end">
                <div>
                  <p className="text-xs text-muted-foreground">{isRTL ? 'التكلفة الإجمالية للربطة' : 'Total Unit Cost'}</p>
                  <p className="text-3xl font-black text-red-600">{formatCurrency(results.totalCost)}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-600 text-white px-3 py-1 mb-1">
                    {isRTL ? 'هامش الربح:' : 'Profit Margin:'} {(((results.sellingPrice - results.totalCost) / results.sellingPrice) * 100).toFixed(1)}%
                  </Badge>
                  <p className="text-sm font-bold text-emerald-700">+{formatCurrency(results.sellingPrice - results.totalCost)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Variances */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#D4A853]" />
              {isRTL ? 'تتبع الانحرافات التشغيلية' : 'Operational Variances'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold">{isRTL ? 'انحراف زمني' : 'Time Variance'}</span>
                </div>
                <p className="text-lg font-bold text-red-600">{formatCurrency(results.timeVar)}</p>
                <p className="text-[10px] text-red-400 italic">{isRTL ? `توقف خط الإنتاج (${productionSettings.downtimeMinutes} د)` : `Production downtime (${productionSettings.downtimeMinutes}m)`}</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-xs font-bold">{isRTL ? 'انحراف كمي' : 'Quantity Var'}</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(results.quantityVar)}</p>
                <p className="text-[10px] text-blue-400 italic">{productionSettings.season === 'summer' ? (isRTL ? 'تأثير الصيف (رطوبة +١٠٪)' : 'Summer effect (+10% humidity)') : (isRTL ? 'ظروف الشتاء القياسية' : 'Standard Winter conditions')}</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Euro className="h-4 w-4" />
                  <span className="text-xs font-bold">{isRTL ? 'انحراف سعري' : 'Price Var'}</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(results.priceVar)}</p>
                <p className="text-[10px] text-purple-400 italic">{productionSettings.flourPriceIndex > 1.0 ? (isRTL ? 'زيادة أسعار المواد الأولية' : 'Raw material price surge') : (isRTL ? 'أسعار السوق مستقرة' : 'Stable market prices')}</p>
              </div>
            </div>

            {/* Cost Centers (Vehicles) */}
            <div className="space-y-3 pt-4 border-t border-dashed">
              <h4 className="text-sm font-bold text-[#3D3229] flex items-center gap-2">
                <Euro className="h-4 w-4 text-[#D4A853]" />
                {isRTL ? 'تحديث أسعار المواد الأولية (أسبوعي)' : 'Raw Material Prices (Weekly Update)'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-xs font-medium">{isRTL ? 'الطحين (كيس ٢٥كغ)' : 'Flour (25kg Bag)'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600">€14.50</span>
                      <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 bg-red-50">
                        <TrendingUp className="h-2 w-2 mr-1" /> +5%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-xs font-medium">{isRTL ? 'الخميرة (كرتون)' : 'Yeast (Box)'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600">€8.20</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-200 bg-emerald-50">
                        <TrendingDown className="h-2 w-2 mr-1" /> -2%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Price Trend Visualization */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isRTL ? 'اتجاه سعر الطحين (٤ أسابيع)' : 'Flour Price Trend (4 weeks)'}</span>
                  <div className="flex items-end justify-between h-12 gap-1 mt-2">
                    <div className="w-full bg-slate-200 rounded-t h-[60%]" title="Week 1: €13.20"></div>
                    <div className="w-full bg-slate-200 rounded-t h-[65%]" title="Week 2: €13.50"></div>
                    <div className="w-full bg-slate-300 rounded-t h-[80%]" title="Week 3: €13.80"></div>
                    <div className="w-full bg-red-400 rounded-t h-[100%]" title="Week 4: €14.50"></div>
                  </div>
                  <p className="text-[10px] text-red-600 font-bold mt-1">
                    {isRTL ? 'تحذير: السعر في أعلى مستوياته' : 'Warning: Price at peak'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-[#D4A853] text-[#3D3229] hover:bg-[#FDFBF7]">
                <Calculator className="h-3 w-3 mr-1" /> {isRTL ? 'إدارة الأسعار وتحديث الفواتير' : 'Manage Prices & Sync Invoices'}
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed">
              <h4 className="text-sm font-bold text-[#3D3229] flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#D4A853]" />
                {isRTL ? 'تحليل استهلاك المحروقات (مراكز التكلفة)' : 'Fuel Consumption Audit (Cost Centers)'}
              </h4>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs">{isRTL ? 'السيارة (المركز)' : 'Vehicle (Center)'}</TableHead>
                    <TableHead className="text-xs">{isRTL ? 'الاستهلاك (L/100km)' : 'Usage (L/100km)'}</TableHead>
                    <TableHead className="text-xs">{isRTL ? 'الديزل' : 'Diesel'}</TableHead>
                    <TableHead className="text-xs">{isRTL ? 'الصيانة' : 'Maint.'}</TableHead>
                    <TableHead className="text-xs text-right">{isRTL ? 'تكلفة التوصيل/ربطة' : 'Delivery Cost/Unit'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Alkmaar-Line-01</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">12.5L</span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-100">Optimal</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600">€140</TableCell>
                    <TableCell className="text-xs text-slate-500">€45</TableCell>
                    <TableCell className="text-xs text-right font-bold">€0.04</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Eindhoven-Line-04</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-red-600">18.2L</span>
                        <Badge variant="outline" className="text-[9px] bg-red-50 text-red-600 border-red-100">High</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-red-600">€265</TableCell>
                    <TableCell className="text-xs text-red-500 font-bold">€210</TableCell>
                    <TableCell className="text-xs text-right font-black text-red-600">€0.09</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#D4A853]/20">
                <p className="text-[10px] text-[#3D3229] font-bold mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  {isRTL ? 'ملاحظة التدقيق:' : 'Audit Note:'}
                </p>
                <p className="text-[10px] leading-relaxed text-[#3D3229]/80">
                  {isRTL 
                    ? 'سيارة آيندهوفن تستهلك ديزل بنسبة ٣٠٪ أعلى من المعدل الطبيعي. التكلفة المحملة على كل ربطة خبز في هذا الخط ارتفعت إلى ٩ سنتات (ضعف المعدل). ينصح بفحص المحرك فوراً.' 
                    : 'Eindhoven vehicle is consuming 30% more diesel than average. The delivery cost allocated per unit on this line surged to €0.09 (2x average). Immediate engine check recommended.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
