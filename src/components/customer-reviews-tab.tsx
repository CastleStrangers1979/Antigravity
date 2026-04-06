'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown,
  Users, Truck, Package, RefreshCw, Filter, Calendar, Eye, Send, BarChart3
} from 'lucide-react';

// Types
interface Review {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  productRating: number;
  deliveryRating: number;
  driverId?: string;
  driverName?: string;
  comment: string;
  createdAt: string;
  isResolved: boolean;
  response?: string;
}

interface DriverRating {
  id: string;
  name: string;
  totalDeliveries: number;
  avgRating: number;
  reviews: number;
  trend: number;
}

interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  positiveTrend: boolean;
}

export default function CustomerReviewsTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [driverRatings, setDriverRatings] = useState<DriverRating[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [filterRating, setFilterRating] = useState('all');
  const [responseDialog, setResponseDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews || mockReviews);
      setDriverRatings(data.driverRatings || mockDriverRatings);
      setStats(data.stats || mockStats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(mockReviews);
      setDriverRatings(mockDriverRatings);
      setStats(mockStats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const mockReviews: Review[] = [
    {
      id: '1',
      orderId: 'ORD-2024-001',
      customerName: 'أحمد محمد',
      customerPhone: '+31 6 12345678',
      productRating: 5,
      deliveryRating: 5,
      driverId: '1',
      driverName: 'محمد علي',
      comment: 'خبز طازج ولذيذ، التوصيل كان سريع جداً. شكراً لكم!',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isResolved: true,
    },
    {
      id: '2',
      orderId: 'ORD-2024-002',
      customerName: 'سارة علي',
      customerPhone: '+31 6 23456789',
      productRating: 4,
      deliveryRating: 3,
      driverId: '2',
      driverName: 'خالد حسن',
      comment: 'المنتجات جيدة لكن التوصيل تأخر قليلاً',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isResolved: false,
    },
    {
      id: '3',
      orderId: 'ORD-2024-003',
      customerName: 'محمد خالد',
      customerPhone: '+31 6 34567890',
      productRating: 2,
      deliveryRating: 2,
      comment: 'الخبز كان بارداً والموظف لم يكن لطيفاً',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      isResolved: false,
    },
    {
      id: '4',
      orderId: 'ORD-2024-004',
      customerName: 'فاطمة حسن',
      customerPhone: '+31 6 45678901',
      productRating: 5,
      deliveryRating: 5,
      driverId: '1',
      driverName: 'محمد علي',
      comment: 'أفضل مخبز سوري في هولندا! 👍',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isResolved: true,
      response: 'شكراً لك على تقييمك الرائع! نتطلع لخدمتك دائماً',
    },
  ];

  const mockDriverRatings: DriverRating[] = [
    { id: '1', name: 'محمد علي', totalDeliveries: 150, avgRating: 4.8, reviews: 45, trend: 5 },
    { id: '2', name: 'خالد حسن', totalDeliveries: 120, avgRating: 4.5, reviews: 38, trend: 2 },
    { id: '3', name: 'عمر يوسف', totalDeliveries: 95, avgRating: 4.6, reviews: 30, trend: -1 },
    { id: '4', name: 'سمير كمال', totalDeliveries: 80, avgRating: 4.3, reviews: 25, trend: 3 },
  ];

  const mockStats: ReviewStats = {
    totalReviews: 138,
    avgRating: 4.5,
    fiveStars: 85,
    fourStars: 32,
    threeStars: 12,
    twoStars: 6,
    oneStar: 3,
    positiveTrend: true,
  };

  const sendResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    const updatedReviews = reviews.map(r =>
      r.id === selectedReview.id
        ? { ...r, response: responseText, isResolved: true }
        : r
    );
    setReviews(updatedReviews);
    setResponseDialog(false);
    setResponseText('');
    setSelectedReview(null);
    
    toast({
      title: language === 'ar' ? 'تم الإرسال' : 'Sent',
      description: language === 'ar' ? 'تم إرسال الرد بنجاح' : 'Response sent successfully',
    });
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'تقييمات العملاء',
        reviews: 'التقييمات',
        driverRatings: 'تقييمات السائقين',
        statistics: 'الإحصائيات',
        totalReviews: 'إجمالي التقييمات',
        avgRating: 'متوسط التقييم',
        productRating: 'تقييم المنتج',
        deliveryRating: 'تقييم التوصيل',
        customer: 'العميل',
        driver: 'السائق',
        comment: 'التعليق',
        date: 'التاريخ',
        status: 'الحالة',
        actions: 'الإجراءات',
        respond: 'الرد',
        responded: 'تم الرد',
        pending: 'معلق',
        filterByRating: 'تصفية حسب التقييم',
        all: 'الكل',
        stars: 'نجوم',
        deliveries: 'التوصيلات',
        trend: 'الاتجاه',
        rating: 'التقييم',
        reviewsCount: 'التقييمات',
        writeResponse: 'كتابة رد',
        send: 'إرسال',
        cancel: 'إلغاء',
        noReviews: 'لا توجد تقييمات',
        refresh: 'تحديث',
      },
      en: {
        title: 'Customer Reviews',
        reviews: 'Reviews',
        driverRatings: 'Driver Ratings',
        statistics: 'Statistics',
        totalReviews: 'Total Reviews',
        avgRating: 'Average Rating',
        productRating: 'Product Rating',
        deliveryRating: 'Delivery Rating',
        customer: 'Customer',
        driver: 'Driver',
        comment: 'Comment',
        date: 'Date',
        status: 'Status',
        actions: 'Actions',
        respond: 'Respond',
        responded: 'Responded',
        pending: 'Pending',
        filterByRating: 'Filter by Rating',
        all: 'All',
        stars: 'stars',
        deliveries: 'Deliveries',
        trend: 'Trend',
        rating: 'Rating',
        reviewsCount: 'Reviews',
        writeResponse: 'Write Response',
        send: 'Send',
        cancel: 'Cancel',
        noReviews: 'No reviews',
        refresh: 'Refresh',
      },
    };
    return translations[language]?.[key] || key;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-[#D4A853] fill-[#D4A853]' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter(r => r.productRating === parseInt(filterRating) || r.deliveryRating === parseInt(filterRating));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Star className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">{stats?.totalReviews} {t('reviews')}</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-[#D4A853] text-[#D4A853]">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7A6F63]">{t('totalReviews')}</p>
                  <p className="text-xl font-bold text-[#3D3229]">{stats.totalReviews}</p>
                </div>
                <MessageSquare className="h-6 w-6 text-[#D4A853]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7A6F63]">{t('avgRating')}</p>
                  <p className="text-xl font-bold text-[#D4A853]">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-6 w-6 text-[#D4A853] fill-[#D4A853]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#7A6F63]">5 ⭐</span>
                <Progress value={(stats.fiveStars / stats.totalReviews) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium text-[#3D3229]">{stats.fiveStars}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#7A6F63]">4 ⭐</span>
                <Progress value={(stats.fourStars / stats.totalReviews) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium text-[#3D3229]">{stats.fourStars}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#7A6F63]">≤3 ⭐</span>
                <Progress value={((stats.threeStars + stats.twoStars + stats.oneStar) / stats.totalReviews) * 100} className="flex-1 h-2" />
                <span className="text-sm font-medium text-[#3D3229]">{stats.threeStars + stats.twoStars + stats.oneStar}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="reviews" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('reviews')}
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Truck className="h-4 w-4 mr-2" />
            {t('driverRatings')}
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Filter */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-[#7A6F63]" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-[180px] border-[#E8DFD0]">
                    <SelectValue placeholder={t('filterByRating')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="5">5 {t('stars')}</SelectItem>
                    <SelectItem value="4">4 {t('stars')}</SelectItem>
                    <SelectItem value="3">3 {t('stars')}</SelectItem>
                    <SelectItem value="2">2 {t('stars')}</SelectItem>
                    <SelectItem value="1">1 {t('stars')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <ScrollArea className="h-[500px]">
            {filteredReviews.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-30" />
                  <p className="text-[#7A6F63]">{t('noReviews')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className={`border-0 shadow-md ${!review.isResolved && review.productRating <= 3 ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-[#F5EDE0] flex items-center justify-center">
                              <span className="text-[#D4A853] font-bold">{review.customerName.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-[#3D3229]">{review.customerName}</p>
                              <p className="text-xs text-[#7A6F63]">{review.orderId}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-[#7A6F63] mb-1">{t('productRating')}</p>
                              {renderStars(review.productRating)}
                            </div>
                            <div>
                              <p className="text-xs text-[#7A6F63] mb-1">{t('deliveryRating')}</p>
                              {renderStars(review.deliveryRating)}
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-sm text-[#3D3229] bg-[#F5EDE0] p-3 rounded-lg mb-2">
                              "{review.comment}"
                            </p>
                          )}

                          {review.driverName && (
                            <p className="text-xs text-[#7A6F63]">
                              {t('driver')}: {review.driverName}
                            </p>
                          )}

                          {review.response && (
                            <div className="mt-3 p-3 bg-[#2D5A3D]/10 rounded-lg">
                              <p className="text-xs text-[#2D5A3D] font-medium mb-1">{language === 'ar' ? 'الرد:' : 'Response:'}</p>
                              <p className="text-sm text-[#3D3229]">{review.response}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={review.isResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {review.isResolved ? t('responded') : t('pending')}
                          </Badge>
                          <p className="text-xs text-[#7A6F63]">
                            {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                          </p>
                          {!review.isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReview(review);
                                setResponseDialog(true);
                              }}
                              className="border-[#D4A853] text-[#D4A853]"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {t('respond')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Driver Ratings Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{t('driverRatings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('driver')}</TableHead>
                    <TableHead>{t('deliveries')}</TableHead>
                    <TableHead>{t('rating')}</TableHead>
                    <TableHead>{t('reviewsCount')}</TableHead>
                    <TableHead>{t('trend')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverRatings.map((driver, index) => (
                    <TableRow key={driver.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.totalDeliveries}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#D4A853] fill-[#D4A853]" />
                          <span className="font-bold">{driver.avgRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{driver.reviews}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${driver.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {driver.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{driver.trend >= 0 ? '+' : ''}{driver.trend}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('writeResponse')}</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="mb-4 p-3 bg-[#F5EDE0] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {renderStars(selectedReview.productRating)}
              </div>
              <p className="text-sm text-[#3D3229]">{selectedReview.comment}</p>
            </div>
          )}
          <div>
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب ردك هنا...' : 'Write your response here...'}
              rows={4}
              className="border-[#E8DFD0]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialog(false)} className="border-[#E8DFD0]">
              {t('cancel')}
            </Button>
            <Button onClick={sendResponse} className="gold-gradient text-white border-0">
              <Send className="h-4 w-4 mr-2" />
              {t('send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
