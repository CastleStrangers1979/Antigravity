'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Sparkles, Brain, Lightbulb, Timer
} from 'lucide-react';

export default function AIPredictionsTab() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 2000);
  };

  const predictions = [
    { id: 1, product: language === 'ar' ? 'خبز صمون' : 'Samoon Bread', demand: 850, change: '+12%', confidence: 94, suggestion: language === 'ar' ? 'زيادة الإنتاج بنسبة 10%' : 'Increase production by 10%' },
    { id: 2, product: language === 'ar' ? 'خبز سياحي' : 'Tourist Bread', demand: 1200, change: '-5%', confidence: 88, suggestion: language === 'ar' ? 'الحفاظ على المستوى الحالي' : 'Maintain current levels' },
    { id: 3, product: language === 'ar' ? 'فطائر جبنة' : 'Cheese Pastry', demand: 450, change: '+25%', confidence: 91, suggestion: language === 'ar' ? 'تجهيز دفعة إضافية للساعة 10 صباحاً' : 'Prepare extra batch for 10 AM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#D4A853]" />
            {language === 'ar' ? 'توقعات الذكاء الاصطناعي' : 'AI Demand Predictions'}
          </h2>
          <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'تحليل ذكي لبيانات المبيعات والطلب المستقبلي' : 'Smart analysis of sales data and future demand'}</p>
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={loading}
          className="bg-gradient-to-r from-[#2D5A3D] to-[#D4A853] hover:from-[#1E4A2D] hover:to-[#B8923F] text-white gap-2 shadow-lg transition-all hover:scale-105"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {language === 'ar' ? 'تحديث التحليل' : 'Refresh Analysis'}
        </Button>
      </div>

      {!analyzed && !loading ? (
        <Card className="border-2 border-dashed border-[#E8DFD0] bg-[#FFFEF7] p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-[#D4A853] opacity-50" />
          <h3 className="text-xl font-bold text-[#3D3229] mb-2">{language === 'ar' ? 'جاهز لتحليل البيانات' : 'Ready to Analyze Data'}</h3>
          <p className="text-[#7A6F63] mb-6 max-w-md mx-auto">
            {language === 'ar' ? 'قم بتشغيل التحليل للحصول على توقعات دقيقة للطلب بناءً على أداء المبيعات السابق والظروف الجوية والمواسم.' : 'Run analysis to get accurate demand forecasts based on past sales performance, weather conditions, and seasons.'}
          </p>
          <Button onClick={runAnalysis} className="bg-[#2D5A3D] text-white">{language === 'ar' ? 'ابدأ التحليل الآن' : 'Start Analysis Now'}</Button>
        </Card>
      ) : loading ? (
        <Card className="border-0 shadow-xl bg-white p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-[#F5EDE0] border-t-[#D4A853] animate-spin" />
            <Bot className="absolute inset-0 m-auto h-10 w-10 text-[#D4A853]" />
          </div>
          <h3 className="text-xl font-bold text-[#3D3229] mb-4">{language === 'ar' ? 'جاري تحليل الأنماط...' : 'Analyzing Patterns...'}</h3>
          <div className="max-w-xs mx-auto space-y-2">
            <Progress value={65} className="h-2 bg-[#F5EDE0]" />
            <p className="text-xs text-[#7A6F63] italic">{language === 'ar' ? 'معالجة 12,450 معاملة مبيعات' : 'Processing 12,450 sales transactions'}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map(p => (
                <Card key={p.id} className="border-0 shadow-md bg-white overflow-hidden group hover:shadow-xl transition-all">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-[#3D3229]">{p.product}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={p.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {p.change}
                          </Badge>
                          <span className="text-xs text-[#7A6F63]">{language === 'ar' ? 'توقع الطلب' : 'Predicted Demand'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#2D5A3D]">{p.demand}</div>
                        <div className="text-[10px] text-[#7A6F63] uppercase font-bold">{language === 'ar' ? 'وحدة' : 'Units'}</div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#7A6F63]">{language === 'ar' ? 'مستوى الثقة' : 'Confidence Level'}</span>
                        <span className="font-bold text-[#D4A853]">{p.confidence}%</span>
                      </div>
                      <Progress value={p.confidence} className="h-1.5 bg-[#F5EDE0]" />
                    </div>
                    <div className="p-3 bg-[#FFFEF7] rounded-xl border border-[#E8DFD0] flex items-start gap-3">
                      <Lightbulb className="h-4 w-4 text-[#D4A853] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#5C4033] font-medium leading-relaxed">{p.suggestion}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="border-0 shadow-md bg-[#2D5A3D] text-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-10 w-10 text-[#D4A853]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{language === 'ar' ? 'ملخص الأداء المتوقع' : 'Predicted Performance Summary'}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {language === 'ar' ? 'من المتوقع زيادة إجمالية في المبيعات بنسبة 8% خلال الأسبوع القادم. نوصي بتأمين مخزون إضافي من الطحين عالي الجودة والتركيز على منتجات المعجنات الصباحية.' : 'An overall 8% increase in sales is expected over the next week. We recommend securing extra high-quality flour stock and focusing on morning pastry products.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[#3D3229] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#D4A853]" />
                  {language === 'ar' ? 'تنبيهات الإنتاج' : 'Production Alerts'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                    <Timer className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-orange-900">{language === 'ar' ? 'ضغط متوقع غداً' : 'Expected Pressure Tomorrow'}</div>
                    <div className="text-[10px] text-orange-700 mt-0.5">{language === 'ar' ? 'زيادة الطلب بين 7-9 صباحاً' : 'Demand spike between 7-9 AM'}</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900">{language === 'ar' ? 'تحسين المخزون' : 'Stock Optimization'}</div>
                    <div className="text-[10px] text-blue-700 mt-0.5">{language === 'ar' ? 'تم تقليل الهدر بنسبة 15%' : 'Waste reduced by 15%'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white overflow-hidden">
              <div className="h-2 bg-[#D4A853]" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[#3D3229]">{language === 'ar' ? 'العوامل المؤثرة' : 'Influencing Factors'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: language === 'ar' ? 'حالة الطقس' : 'Weather', value: 85, color: 'bg-blue-500' },
                  { label: language === 'ar' ? 'عطلة نهاية الأسبوع' : 'Weekend', value: 92, color: 'bg-purple-500' },
                  { label: language === 'ar' ? 'العروض الترويجية' : 'Promotions', value: 45, color: 'bg-green-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-[#7A6F63]">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <Progress value={item.value} className={`h-1 bg-[#F5EDE0] ${item.color}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
