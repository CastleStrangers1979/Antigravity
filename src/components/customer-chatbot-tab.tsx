'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare, Send, Bot, User, Settings, Database, Clock,
  Plus, Edit, Trash2, RefreshCw, HelpCircle, Phone, Mail,
  Sparkles, Zap, FileText, Check, X, ChevronRight, Eye
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  usageCount: number;
}

interface ChatSession {
  id: string;
  customerName: string;
  startedAt: Date;
  messages: Message[];
  status: 'active' | 'resolved' | 'escalated';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load FAQs
    setFaqs(mockFaqs);
    setSessions(mockSessions);
    
    // Initial bot message
    setMessages([
      {
        id: '1',
        role: 'bot',
        content: language === 'ar' 
          ? 'مرحباً! 👋 أنا مساعد مخبز الملكة. كيف يمكنني مساعدتك اليوم؟'
          : "Hello! 👋 I'm Al-Malika Bakery assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, [language]);

  const mockFaqs: FAQ[] = [
    {
      id: '1',
      question: language === 'ar' ? 'ما هي ساعات العمل؟' : 'What are your opening hours?',
      answer: language === 'ar' 
        ? 'نفتح من الساعة 7 صباحاً حتى 7 مساءً جميع أيام الأسبوع ما عدا الأحد.'
        : 'We are open from 7 AM to 7 PM, all days except Sunday.',
      category: 'general',
      keywords: ['ساعات', 'وقت', 'مفتوح', 'hours', 'open', 'time'],
      usageCount: 125,
    },
    {
      id: '2',
      question: language === 'ar' ? 'كيف يمكنني الطلب؟' : 'How can I place an order?',
      answer: language === 'ar'
        ? 'يمكنك الطلب عبر موقعنا الإلكتروني أو التطبيق أو الاتصال على 020-1234567'
        : 'You can order through our website, mobile app, or call us at 020-1234567',
      category: 'ordering',
      keywords: ['طلب', 'أطلب', 'order', 'طلب'],
      usageCount: 98,
    },
    {
      id: '3',
      question: language === 'ar' ? 'هل لديكم توصيل؟' : 'Do you offer delivery?',
      answer: language === 'ar'
        ? 'نعم! نوصل لجميع مناطق هولندا. التوصيل مجاني للطلبات فوق 50€'
        : 'Yes! We deliver to all areas in the Netherlands. Free delivery for orders over €50',
      category: 'delivery',
      keywords: ['توصيل', 'deliv', 'توصيل'],
      usageCount: 156,
    },
    {
      id: '4',
      question: language === 'ar' ? 'ما هي طرق الدفع المتاحة؟' : 'What payment methods do you accept?',
      answer: language === 'ar'
        ? 'نقبل iDEAL، بطاقات الائتمان، والدفع النقدي عند الاستلام'
        : 'We accept iDEAL, credit cards, and cash on delivery',
      category: 'payment',
      keywords: ['دفع', 'payment', 'ideal', 'بطاقة'],
      usageCount: 87,
    },
  ];

  const mockSessions: ChatSession[] = [
    {
      id: '1',
      customerName: 'أحمد محمد',
      startedAt: new Date(Date.now() - 3600000),
      messages: [],
      status: 'resolved',
    },
    {
      id: '2',
      customerName: 'سارة علي',
      startedAt: new Date(Date.now() - 7200000),
      messages: [],
      status: 'active',
    },
  ];

  const findBestAnswer = (input: string): string | null => {
    const inputLower = input.toLowerCase();
    for (const faq of faqs) {
      if (faq.keywords.some(keyword => inputLower.includes(keyword.toLowerCase()))) {
        return faq.answer;
      }
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      const answer = findBestAnswer(inputMessage);
      
      let botContent: string;
      if (answer) {
        botContent = answer;
      } else {
        // Use AI API for general questions
        try {
          const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: inputMessage, language }),
          });
          const data = await response.json();
          botContent = data.response || (language === 'ar' 
            ? 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟ أو تواصل معنا على 020-1234567'
            : "Sorry, I didn't understand your question. Could you rephrase? Or contact us at 020-1234567");
        } catch {
          botContent = language === 'ar'
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو الاتصال بنا على 020-1234567'
            : 'Sorry, an error occurred. Please try again or call us at 020-1234567';
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        title: 'الدرشة الآلية للعملاء',
        chat: 'المحادثة',
        faq: 'الأسئلة الشائعة',
        history: 'سجل المحادثات',
        settings: 'الإعدادات',
        typeMessage: 'اكتب رسالتك...',
        send: 'إرسال',
        suggestedQuestions: 'أسئلة مقترحة',
        workingHours: 'ساعات العمل',
        ordering: 'كيف أطلب؟',
        delivery: 'التوصيل',
        payment: 'الدفع',
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
      },
      en: {
        title: 'Customer Chatbot',
        chat: 'Chat',
        faq: 'FAQs',
        history: 'Chat History',
        settings: 'Settings',
        typeMessage: 'Type your message...',
        send: 'Send',
        suggestedQuestions: 'Suggested Questions',
        workingHours: 'Working Hours',
        ordering: 'How to Order',
        delivery: 'Delivery',
        payment: 'Payment',
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
      },
    };
    return translations[language]?.[key] || key;
  };

  const quickQuestions = [
    t('workingHours'),
    t('ordering'),
    t('delivery'),
    t('payment'),
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
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
        </div>
        <Badge className="bg-green-100 text-green-700">
          <Zap className="h-3 w-3 mr-1" />
          {t('aiEnabled')}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="chat" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('chat')}
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <HelpCircle className="h-4 w-4 mr-2" />
            {t('faq')}
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            {t('history')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#2D5A3D] data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            {t('settings')}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Chat Window */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-md h-[500px] flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-[#D4A853] flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 rounded-xl ${
                            message.role === 'user'
                              ? 'bg-[#2D5A3D] text-white'
                              : 'bg-[#F5EDE0] text-[#3D3229]'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-[#7A6F63]'}`}>
                            {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-[#2D5A3D] flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4A853] flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-[#F5EDE0] p-3 rounded-xl">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-[#E8DFD0]">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={t('typeMessage')}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="border-[#E8DFD0]"
                    />
                    <Button onClick={handleSend} className="gold-gradient text-white border-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Questions */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#7A6F63]">{t('suggestedQuestions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full justify-start border-[#E8DFD0] text-[#3D3229] hover:border-[#D4A853]"
                    >
                      <ChevronRight className="h-4 w-4 mr-1 text-[#D4A853]" />
                      {question}
                    </Button>
                  ))}
                  <div className="pt-4 border-t border-[#E8DFD0]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#2D5A3D] text-[#2D5A3D]"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t('connectToHuman')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
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
                    <TableHead>{t('answer')}</TableHead>
                    <TableHead>{t('usage')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{faq.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{faq.question}</TableCell>
                      <TableCell className="max-w-xs truncate">{faq.answer}</TableCell>
                      <TableCell>{faq.usageCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedFaq(faq); setEditFaqDialog(true); }}
                          >
                            <Edit className="h-4 w-4" />
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
                      <TableHead>{t('startedAt')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.customerName}</TableCell>
                        <TableCell>
                          {session.startedAt.toLocaleString(language === 'ar' ? 'ar-SA' : 'nl-NL')}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            session.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            session.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {t(session.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="border-[#E8DFD0]">
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-[#3D3229]">{t('settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#D4A853]" />
                  <div>
                    <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'تفعيل الذكاء الاصطناعي' : 'Enable AI'}</p>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'استخدام AI للرد على الأسئلة' : 'Use AI for responses'}</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#2D5A3D]" />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F5EDE0] rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#D4A853]" />
                  <div>
                    <p className="font-medium text-[#3D3229]">{language === 'ar' ? 'إرسال المحادثة بالبريد' : 'Email Transcript'}</p>
                    <p className="text-sm text-[#7A6F63]">{language === 'ar' ? 'بعد انتهاء المحادثة' : 'After chat ends'}</p>
                  </div>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-[#2D5A3D]" />
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
                  <SelectItem value="general">{language === 'ar' ? 'عام' : 'General'}</SelectItem>
                  <SelectItem value="ordering">{language === 'ar' ? 'الطلبات' : 'Ordering'}</SelectItem>
                  <SelectItem value="delivery">{language === 'ar' ? 'التوصيل' : 'Delivery'}</SelectItem>
                  <SelectItem value="payment">{language === 'ar' ? 'الدفع' : 'Payment'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('question')}</Label>
              <Input defaultValue={selectedFaq?.question || ''} className="mt-1.5 border-[#E8DFD0]" />
            </div>
            <div>
              <Label className="text-[#7A6F63]">{t('answer')}</Label>
              <Textarea defaultValue={selectedFaq?.answer || ''} rows={3} className="mt-1.5 border-[#E8DFD0]" />
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
            <Button onClick={() => setEditFaqDialog(false)} className="gold-gradient text-white border-0">
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
