'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare, Send, Bot, User, Settings, Database, Clock,
  Plus, Edit, Trash2, RefreshCw, HelpCircle, Phone, Mail,
  Sparkles, Zap, FileText, Check, X, ChevronRight, Eye,
  TrendingUp, BarChart3, PieChart, Activity, AlertCircle,
  ThumbsUp, ThumbsDown, Copy, Volume2, Share2, Download,
  Search, Filter, Calendar, Globe, MessageCircle
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  intent?: string;
  rating?: 'up' | 'down';
  escalated?: boolean;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  usageCount: number;
  isActive: boolean;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerPhone?: string;
  startedAt: Date;
  endedAt?: Date;
  messages: Message[];
  status: 'active' | 'resolved' | 'escalated';
  satisfaction?: number;
}

interface Analytics {
  totalSessions: number;
  activeSessions: number;
  avgResponseTime: number;
  satisfactionRate: number;
  topIntents: { intent: string; count: number }[];
  dailySessions: { date: string; count: number }[];
}

export default function CustomerChatbotTab() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [editFaqDialog, setEditFaqDialog] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [viewSessionDialog, setViewSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Settings
  const [settings, setSettings] = useState({
    aiEnabled: true,
    emailTranscript: false,
    autoGreeting: true,
    soundEnabled: true,
    language: language,
    escalationEnabled: true,
    collectFeedback: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const t = useCallback((key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'المحادثة الذكية للعملاء',
        subtitle: 'نظام دردشة ذكي مدعوم بالذكاء الاصطناعي',
        chat: 'المحادثة',
        faq: 'الأسئلة الشائعة',
        history: 'سجل المحادثات',
        analytics: 'التحليلات',
        settings: 'الإعدادات',
        typeMessage: 'اكتب رسالتك...',
        send: 'إرسال',
        suggestedQuestions: 'أسئلة مقترحة',
        workingHours: 'ما هي ساعات العمل؟',
        ordering: 'كيف أطلب؟',
        delivery: 'هل لديكم توصيل؟',
        payment: 'طرق الدفع المتاحة',
        products: 'المنتجات المتاحة',
        category: 'الفئة',
        question: 'السؤال',
        answer: 'الجواب',
        usage: 'الاستخدام',
        actions: 'الإجراءات',
        addFaq: 'إضافة سؤال',
        editFaq: 'تعديل السؤال',
        deleteFaq: 'حذف السؤال',
        save: 'حفظ',
        cancel: 'إلغاء',
        keywords: 'الكلمات المفتاحية',
        customer: 'العميل',
        startedAt: 'بدأت في',
        status: 'الحالة',
        resolved: 'تم الحل',
        active: 'نشط',
        escalated: 'محول للدعم',
        viewChat: 'عرض المحادثة',
        noSessions: 'لا توجد جلسات',
        aiEnabled: 'الذكاء الاصطناعي مفعّل',
        aiDisabled: 'الذكاء الاصطناعي معطّل',
        connectToHuman: 'تحويل لموظف',
        thankYou: 'شكراً لتواصلك معنا!',
        totalSessions: 'إجمالي الجلسات',
        activeNow: 'نشط الآن',
        avgResponse: 'متوسط الرد',
        satisfaction: 'نسبة الرضا',
        topQuestions: 'الأسئلة الأكثر شيوعاً',
        dailyStats: 'إحصائيات يومية',
        searchFaqs: 'ابحث في الأسئلة...',
        filterCategory: 'تصفية حسب الفئة',
        all: 'الكل',
        general: 'عام',
        ordering_cat: 'الطلبات',
        delivery_cat: 'التوصيل',
        payment_cat: 'الدفع',
        products_cat: 'المنتجات',
        rateResponse: 'قيم الرد',
        copyResponse: 'نسخ الرد',
        shareChat: 'مشاركة المحادثة',
        exportChat: 'تصدير المحادثة',
        clearChat: 'مسح المحادثة',
        aiSettings: 'إعدادات الذكاء الاصطناعي',
        enableAI: 'تفعيل الذكاء الاصطناعي',
        enableAIDesc: 'استخدام AI للرد على الأسئلة',
        autoGreeting: 'رسالة ترحيب تلقائية',
        autoGreetingDesc: 'إرسال رسالة ترحيب عند بدء المحادثة',
        soundNotifications: 'إشعارات صوتية',
        soundDesc: 'تشغيل صوت عند وصول رسالة جديدة',
        emailTranscript: 'إرسال المحادثة بالبريد',
        emailDesc: 'بعد انتهاء المحادثة',
        collectFeedback: 'جمع التقييمات',
        feedbackDesc: 'السماح للعملاء بتقييم الردود',
        escalation: 'التصعيد التلقائي',
        escalationDesc: 'تحويل المحادثة لموظف عند الحاجة',
        newSession: 'جلسة جديدة',
        sessionDetails: 'تفاصيل الجلسة',
        messages: 'الرسائل',
        duration: 'المدة',
        minutes: 'دقيقة',
        loading: 'جاري التحميل...',
        typing: 'يكتب...',
        error: 'حدث خطأ',
        success: 'تم بنجاح',
        confirmDelete: 'هل أنت متأكد من الحذف؟',
        noMessages: 'لا توجد رسائل',
        quickActions: 'إجراءات سريعة',
        endSession: 'إنهاء الجلسة',
        transferToSupport: 'تحويل للدعم',
        sessionInfo: 'معلومات الجلسة',
        satisfactionScore: 'نقاط الرضا',
      },
      en: {
        title: 'Smart Customer Chatbot',
        subtitle: 'AI-powered intelligent chat system',
        chat: 'Chat',
        faq: 'FAQs',
        history: 'History',
        analytics: 'Analytics',
        settings: 'Settings',
        typeMessage: 'Type your message...',
        send: 'Send',
        suggestedQuestions: 'Suggested Questions',
        workingHours: 'What are your opening hours?',
        ordering: 'How can I order?',
        delivery: 'Do you offer delivery?',
        payment: 'Available payment methods',
        products: 'Available products',
        category: 'Category',
        question: 'Question',
        answer: 'Answer',
        usage: 'Usage',
        actions: 'Actions',
        addFaq: 'Add FAQ',
        editFaq: 'Edit FAQ',
        deleteFaq: 'Delete FAQ',
        save: 'Save',
        cancel: 'Cancel',
        keywords: 'Keywords',
        customer: 'Customer',
        startedAt: 'Started At',
        status: 'Status',
        resolved: 'Resolved',
        active: 'Active',
        escalated: 'Escalated',
        viewChat: 'View Chat',
        noSessions: 'No sessions',
        aiEnabled: 'AI Enabled',
        aiDisabled: 'AI Disabled',
        connectToHuman: 'Connect to Human',
        thankYou: 'Thank you for contacting us!',
        totalSessions: 'Total Sessions',
        activeNow: 'Active Now',
        avgResponse: 'Avg Response',
        satisfaction: 'Satisfaction',
        topQuestions: 'Top Questions',
        dailyStats: 'Daily Statistics',
        searchFaqs: 'Search FAQs...',
        filterCategory: 'Filter by Category',
        all: 'All',
        general: 'General',
        ordering_cat: 'Orders',
        delivery_cat: 'Delivery',
        payment_cat: 'Payment',
        products_cat: 'Products',
        rateResponse: 'Rate Response',
        copyResponse: 'Copy Response',
        shareChat: 'Share Chat',
        exportChat: 'Export Chat',
        clearChat: 'Clear Chat',
        aiSettings: 'AI Settings',
        enableAI: 'Enable AI',
        enableAIDesc: 'Use AI for responses',
        autoGreeting: 'Auto Greeting',
        autoGreetingDesc: 'Send welcome message on chat start',
        soundNotifications: 'Sound Notifications',
        soundDesc: 'Play sound on new message',
        emailTranscript: 'Email Transcript',
        emailDesc: 'After chat ends',
        collectFeedback: 'Collect Feedback',
        feedbackDesc: 'Allow customers to rate responses',
        escalation: 'Auto Escalation',
        escalationDesc: 'Transfer to human when needed',
        newSession: 'New Session',
        sessionDetails: 'Session Details',
        messages: 'Messages',
        duration: 'Duration',
        minutes: 'minutes',
        loading: 'Loading...',
        typing: 'Typing...',
        error: 'An error occurred',
        success: 'Success',
        confirmDelete: 'Are you sure you want to delete?',
        noMessages: 'No messages',
        quickActions: 'Quick Actions',
        endSession: 'End Session',
        transferToSupport: 'Transfer to Support',
        sessionInfo: 'Session Info',
        satisfactionScore: 'Satisfaction Score',
      },
    };
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  // Initialize
  useEffect(() => {
    // Load FAQs
    const faqData: FAQ[] = [
      {
        id: '1',
        question: language === 'ar' ? 'ما هي ساعات العمل؟' : 'What are your opening hours?',
        answer: language === 'ar'
          ? 'نفتح من الساعة 7 صباحاً حتى 7 مساءً جميع أيام الأسبوع ما عدا الأحد. 🕐'
          : 'We are open from 7 AM to 7 PM, all days except Sunday. 🕐',
        category: 'general',
        keywords: ['ساعات', 'وقت', 'مفتوح', 'hours', 'open', 'time'],
        usageCount: 125,
        isActive: true
      },
      {
        id: '2',
        question: language === 'ar' ? 'كيف يمكنني الطلب؟' : 'How can I place an order?',
        answer: language === 'ar'
          ? 'يمكنك الطلب بعدة طرق:\n• عبر موقعنا الإلكتروني\n• تطبيق الهاتف\n• الاتصال على 020-1234567\n• زيارة المخبز مباشرة 📱'
          : 'You can order through:\n• Our website\n• Mobile app\n• Call us at 020-1234567\n• Visit the bakery directly 📱',
        category: 'ordering',
        keywords: ['طلب', 'أطلب', 'order', 'buy'],
        usageCount: 98,
        isActive: true
      },
      {
        id: '3',
        question: language === 'ar' ? 'هل لديكم توصيل؟' : 'Do you offer delivery?',
        answer: language === 'ar'
          ? 'نعم! نوصل لجميع مناطق هولندا. 🚚\n• التوصيل مجاني للطلبات فوق 50€\n• مدة التوصيل: 30-60 دقيقة\n• يمكنك متابعة طلبك مباشرة'
          : 'Yes! We deliver to all areas in the Netherlands. 🚚\n• Free delivery for orders over €50\n• Delivery time: 30-60 minutes\n• Track your order in real-time',
        category: 'delivery',
        keywords: ['توصيل', 'deliv', 'توصيل'],
        usageCount: 156,
        isActive: true
      },
      {
        id: '4',
        question: language === 'ar' ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods do you accept?',
        answer: language === 'ar'
          ? 'نقبل عدة طرق للدفع:\n• iDEAL (الأكثر شيوعاً في هولندا)\n• بطاقات الائتمان (Visa, Mastercard)\n• الدفع النقدي عند الاستلام\n• التحويل البنكي 💳'
          : 'We accept multiple payment methods:\n• iDEAL (Most popular in Netherlands)\n• Credit cards (Visa, Mastercard)\n• Cash on delivery\n• Bank transfer 💳',
        category: 'payment',
        keywords: ['دفع', 'payment', 'ideal', 'بطاقة'],
        usageCount: 87,
        isActive: true
      },
      {
        id: '5',
        question: language === 'ar' ? 'ما هي المنتجات المتاحة؟' : 'What products do you have?',
        answer: language === 'ar'
          ? 'لدينا تشكيلة واسعة:\n\n🍞 الخبز العربي:\n• خبز الصاج\n• خبز التنور\n• الخبز السمولي\n\n🥐 المعجنات:\n• فطائر بالجبنة والسبانخ\n• كعك بالسمسم\n\n🍯 الحلويات:\n• بقلاوة\n• كنافة\n• معمول'
          : 'We have a wide variety:\n\n🍞 Arabic Bread:\n• Saj bread\n• Tannour bread\n• Samoli bread\n\n🥐 Pastries:\n• Cheese & spinach pies\n• Sesame cakes\n\n🍯 Sweets:\n• Baklava\n• Kunafa\n• Maamoul',
        category: 'products',
        keywords: ['خبز', 'منتجات', 'معجنات', 'حلويات', 'bread', 'products'],
        usageCount: 203,
        isActive: true
      },
    ];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFaqs(faqData);

    // Load sessions
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions([
      { id: '1', customerName: 'أحمد محمد', customerPhone: '06-12345678', startedAt: new Date(Date.now() - 3600000), endedAt: new Date(Date.now() - 3000000), messages: [], status: 'resolved', satisfaction: 5 },
      { id: '2', customerName: 'سارة علي', customerPhone: '06-98765432', startedAt: new Date(Date.now() - 7200000), messages: [], status: 'active' },
      { id: '3', customerName: 'محمد خالد', startedAt: new Date(Date.now() - 1800000), endedAt: new Date(Date.now() - 900000), messages: [], status: 'escalated' },
    ]);

    // Load analytics
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalytics({
      totalSessions: 1256,
      activeSessions: 12,
      avgResponseTime: 1.2,
      satisfactionRate: 94,
      topIntents: [
        { intent: language === 'ar' ? 'استفسار عن منتجات' : 'Product Inquiry', count: 345 },
        { intent: language === 'ar' ? 'استفسار عن توصيل' : 'Delivery Inquiry', count: 289 },
        { intent: language === 'ar' ? 'طلب جديد' : 'New Order', count: 234 },
        { intent: language === 'ar' ? 'استفسار عن الدفع' : 'Payment Inquiry', count: 178 },
        { intent: language === 'ar' ? 'ساعات العمل' : 'Working Hours', count: 156 },
      ],
      dailySessions: [
        { date: '2024-01-15', count: 45 },
        { date: '2024-01-16', count: 52 },
        { date: '2024-01-17', count: 38 },
        { date: '2024-01-18', count: 65 },
        { date: '2024-01-19', count: 71 },
        { date: '2024-01-20', count: 58 },
        { date: '2024-01-21', count: 42 },
      ]
    });

    // Load suggestions from API
    fetch(`/api/chatbot?language=${language}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(err => console.error('Error loading suggestions:', err));

    // Auto greeting
    if (settings.autoGreeting) {
      setMessages([
        {
          id: '1',
          role: 'bot',
          content: language === 'ar'
            ? 'مرحباً! 👋 أنا مساعد مخبز الملكة الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن منتجاتنا، ساعات العمل، التوصيل، أو أي شيء آخر!'
            : "Hello! 👋 I'm Al-Malika Bakery's smart assistant. How can I help you today? You can ask me about our products, opening hours, delivery, or anything else!",
          timestamp: new Date(),
          intent: 'greeting'
        }
      ]);
    }
  }, [language, settings.autoGreeting]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history for context
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          language,
          history
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.response || (language === 'ar'
          ? 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟ أو تواصل معنا على 020-1234567'
          : "Sorry, I didn't understand your question. Could you rephrase? Or contact us at 020-1234567"),
        timestamp: new Date(),
        intent: data.intent,
        escalated: data.needsEscalation
      };

      setMessages(prev => [...prev, botMessage]);

      if (data.needsEscalation) {
        toast({
          title: language === 'ar' ? 'تحويل للدعم' : 'Escalation Needed',
          description: language === 'ar' ? 'سيتم تحويل المحادثة لموظف' : 'Transferring to human support',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: language === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بنا على 020-1234567'
          : 'Sorry, an error occurred. Please try again or call us at 020-1234567',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, rating } : m
    ));
    toast({
      title: language === 'ar' ? 'شكراً للتقييم!' : 'Thanks for feedback!',
      duration: 2000
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: language === 'ar' ? 'تم النسخ!' : 'Copied!',
      duration: 2000
    });
  };

  const handleClearChat = () => {
    if (settings.autoGreeting) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'bot',
          content: language === 'ar'
            ? 'مرحباً! 👋 كيف يمكنني مساعدتك؟'
            : "Hello! 👋 How can I help you?",
          timestamp: new Date(),
          intent: 'greeting'
        }
      ]);
    } else {
      setMessages([]);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      resolved: 'bg-green-100 text-green-700',
      active: 'bg-blue-100 text-blue-700',
      escalated: 'bg-amber-100 text-amber-700'
    };
    return (
      <Badge className={styles[status] || ''}>
        {t(status)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D3229] flex items-center gap-2">
            <Bot className="h-7 w-7 text-[#D4A853]" />
            {t('title')}
          </h2>
          <p className="text-sm text-[#7A6F63]">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${settings.aiEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            <Zap className="h-3 w-3 mr-1" />
            {settings.aiEnabled ? t('aiEnabled') : t('aiDisabled')}
          </Badge>
          <Badge className="bg-blue-100 text-blue-700">
            <Activity className="h-3 w-3 mr-1" />
            {sessions.filter(s => s.status === 'active').length} {t('active')}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="chat" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('chat')}</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <HelpCircle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('faq')}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('history')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Chat Window */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-md h-[550px] flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'bot' && (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8923F] flex items-center justify-center flex-shrink-0 shadow-md">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="max-w-[80%]">
                          <div
                            className={`p-3 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-[#2D5A3D] text-white rounded-br-sm'
                                : 'bg-[#F5EDE0] text-[#3D3229] rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs ${message.role === 'user' ? 'text-white/70' : 'text-[#7A6F63]'}`}>
                                {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'nl-NL', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {message.escalated && (
                                <Badge className="bg-amber-500 text-white text-xs ml-2">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {language === 'ar' ? 'محول' : 'Escalated'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Message Actions */}
                          {message.role === 'bot' && settings.collectFeedback && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRating(message.id, 'up')}
                                className={`h-7 px-2 ${message.rating === 'up' ? 'text-green-600 bg-green-50' : 'text-gray-400'}`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRating(message.id, 'down')}
                                className={`h-7 px-2 ${message.rating === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-400'}`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(message.content)}
                                className="h-7 px-2 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {message.role === 'user' && (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D] flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8923F] flex items-center justify-center shadow-md">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="bg-[#F5EDE0] p-4 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 bg-[#D4A853] rounded-full animate-bounce" />
                            <span className="w-2.5 h-2.5 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2.5 h-2.5 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-[#E8DFD0] bg-[#FFFEF7]">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={t('typeMessage')}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="border-[#E8DFD0] focus:border-[#D4A853] focus:ring-[#D4A853]"
                      disabled={isTyping}
                    />
                    <Button onClick={handleSend} className="gold-gradient text-white border-0 px-6" disabled={isTyping || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-[#7A6F63]">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {t('clearChat')}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#2D5A3D] text-[#2D5A3D]">
                      <Phone className="h-3 w-3 mr-1" />
                      {t('connectToHuman')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions & Suggestions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Suggested Questions */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#7A6F63] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#D4A853]" />
                    {t('suggestedQuestions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestions.slice(0, 5).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full justify-start border-[#E8DFD0] text-[#3D3229] hover:border-[#D4A853] hover:bg-[#FFFEF7] text-left h-auto py-2"
                    >
                      <ChevronRight className="h-4 w-4 mr-1 text-[#D4A853] flex-shrink-0" />
                      <span className="text-xs line-clamp-2">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-[#2D5A3D] to-[#1E4A2D] text-white">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics?.activeSessions || 0}</p>
                      <p className="text-xs text-white/70">{t('activeNow')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{analytics?.satisfactionRate || 0}%</p>
                      <p className="text-xs text-white/70">{t('satisfaction')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6F63]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchFaqs')}
                  className="pl-9 border-[#E8DFD0]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 border-[#E8DFD0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="general">{t('general')}</SelectItem>
                  <SelectItem value="ordering">{t('ordering_cat')}</SelectItem>
                  <SelectItem value="delivery">{t('delivery_cat')}</SelectItem>
                  <SelectItem value="payment">{t('payment_cat')}</SelectItem>
                  <SelectItem value="products">{t('products_cat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { setSelectedFaq(null); setEditFaqDialog(true); }} className="green-gradient text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              {t('addFaq')}
            </Button>
          </div>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5EDE0]">
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('question')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('answer')}</TableHead>
                    <TableHead>{t('usage')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.map((faq) => (
                    <TableRow key={faq.id} className={!faq.isActive ? 'opacity-50' : ''}>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{faq.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{faq.question}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{faq.answer}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#D4A853]/10 text-[#D4A853]">
                          {faq.usageCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedFaq(faq); setEditFaqDialog(true); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              {sessions.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-[#D4A853] opacity-30" />
                  <p className="text-[#7A6F63]">{t('noSessions')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5EDE0]">
                      <TableHead>{t('customer')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('startedAt')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('satisfaction')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.customerName}</p>
                            {session.customerPhone && (
                              <p className="text-xs text-[#7A6F63]">{session.customerPhone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {session.startedAt.toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {session.satisfaction ? (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < session.satisfaction! ? 'text-[#D4A853]' : 'text-gray-300'}>★</span>
                              ))}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[#E8DFD0]"
                            onClick={() => { setSelectedSession(session); setViewSessionDialog(true); }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('viewChat')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#3D3229]">{analytics.totalSessions}</p>
                        <p className="text-xs text-[#7A6F63]">{t('totalSessions')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#3D3229]">{analytics.activeSessions}</p>
                        <p className="text-xs text-[#7A6F63]">{t('activeNow')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#3D3229]">{analytics.avgResponseTime}s</p>
                        <p className="text-xs text-[#7A6F63]">{t('avgResponse')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#D4A853]/20">
                        <ThumbsUp className="h-5 w-5 text-[#D4A853]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#3D3229]">{analytics.satisfactionRate}%</p>
                        <p className="text-xs text-[#7A6F63]">{t('satisfaction')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Questions */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229] flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#D4A853]" />
                      {t('topQuestions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topIntents.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#F5EDE0] flex items-center justify-center text-xs font-bold text-[#D4A853]">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-[#3D3229]">{item.intent}</span>
                              <span className="text-xs text-[#7A6F63]">{item.count}</span>
                            </div>
                            <div className="h-2 bg-[#F5EDE0] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D4A853] to-[#B8923F] rounded-full"
                                style={{ width: `${(item.count / analytics.topIntents[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Stats */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-[#3D3229] flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#D4A853]" />
                      {t('dailyStats')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-40">
                      {analytics.dailySessions.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-[#2D5A3D] to-[#4A7A5C] rounded-t-sm min-h-[20px]"
                            style={{ height: `${(day.count / Math.max(...analytics.dailySessions.map(d => d.count))) * 100}%` }}
                          />
                          <span className="text-xs text-[#7A6F63] transform -rotate-45 origin-left">
                            {new Date(day.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'nl-NL', { weekday: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#D4A853]" />
                {t('aiSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Zap className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('enableAI')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('enableAIDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <MessageSquare className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('autoGreeting')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('autoGreetingDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.autoGreeting}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoGreeting: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Volume2 className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('soundNotifications')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('soundDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Mail className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('emailTranscript')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('emailDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailTranscript}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailTranscript: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <ThumbsUp className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('collectFeedback')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('feedbackDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.collectFeedback}
                  onCheckedChange={(checked) => setSettings({ ...settings, collectFeedback: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Phone className="h-5 w-5 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3D3229]">{t('escalation')}</p>
                    <p className="text-sm text-[#7A6F63]">{t('escalationDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.escalationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, escalationEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit FAQ Dialog */}
      <Dialog open={editFaqDialog} onOpenChange={setEditFaqDialog}>
        <DialogContent className="max-w-md bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{selectedFaq ? t('editFaq') : t('addFaq')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#7A6F63]">{t('category')}</Label>
              <Select defaultValue={selectedFaq?.category || 'general'}>
                <SelectTrigger className="mt-1.5 border-[#E8DFD0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('general')}</SelectItem>
                  <SelectItem value="ordering">{t('ordering_cat')}</SelectItem>
                  <SelectItem value="delivery">{t('delivery_cat')}</SelectItem>
                  <SelectItem value="payment">{t('payment_cat')}</SelectItem>
                  <SelectItem value="products">{t('products_cat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('question')}</Label>
              <Input defaultValue={selectedFaq?.question || ''} className="mt-1.5 border-[#E8DFD0]" />
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('answer')}</Label>
              <Textarea defaultValue={selectedFaq?.answer || ''} rows={4} className="mt-1.5 border-[#E8DFD0]" />
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('keywords')}</Label>
              <Input defaultValue={selectedFaq?.keywords.join(', ') || ''} className="mt-1.5 border-[#E8DFD0]" placeholder="keyword1, keyword2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFaqDialog(false)} className="border-[#E8DFD0]">
              {t('cancel')}
            </Button>
            <Button onClick={() => { setEditFaqDialog(false); toast({ title: t('success') }); }} className="gold-gradient text-white border-0">
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Session Dialog */}
      <Dialog open={viewSessionDialog} onOpenChange={setViewSessionDialog}>
        <DialogContent className="max-w-lg bg-white border-[#E8DFD0]">
          <DialogHeader>
            <DialogTitle className="text-[#3D3229]">{t('sessionDetails')}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-xs text-[#7A6F63]">{t('customer')}</p>
                  <p className="font-medium text-[#3D3229]">{selectedSession.customerName}</p>
                </div>
                <div className="p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-xs text-[#7A6F63]">{t('status')}</p>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <div className="p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-xs text-[#7A6F63]">{t('startedAt')}</p>
                  <p className="font-medium text-[#3D3229]">
                    {selectedSession.startedAt.toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                  </p>
                </div>
                <div className="p-3 bg-[#F5EDE0] rounded-lg">
                  <p className="text-xs text-[#7A6F63]">{t('satisfactionScore')}</p>
                  <p className="font-medium text-[#3D3229]">
                    {selectedSession.satisfaction ? `${selectedSession.satisfaction}/5` : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSessionDialog(false)} className="border-[#E8DFD0]">
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
