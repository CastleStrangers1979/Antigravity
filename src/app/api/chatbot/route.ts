import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// System prompts for different languages
const systemPrompts: Record<string, string> = {
  ar: `أنت مساعد ذكي لمخبز "الملكة" السوري في هولندا. مهمتك مساعدة العملاء بالإجابة على استفساراتهم.

معلومات عن المخبز:
- اسم المخبز: مخبز الملكة (Al-Malika Bakery)
- التخصص: الخبز السوري الأصيل والمعجنات العربية
- الموقع: هولندا
- ساعات العمل: 7 صباحاً - 7 مساءً (جميع الأيام ما عدا الأحد)
- رقم الهاتف: 020-1234567
- البريد الإلكتروني: info@al-malika.nl

خدماتنا:
- خبز عربي طازج (صاج، تنور، سمولي)
- معجنات (فطائر، كعك، بسكويت)
- حلويات عربية (بقلاوة، كنافة، معمول)
- توصيل لجميع مناطق هولندا
- طلبات مسبقة للمناسبات

طرق الدفع:
- iDEAL
- بطاقات الائتمان
- الدفع النقدي عند الاستلام

قواعد الرد:
1. كن ودوداً ومهذباً دائماً
2. أجب بالعربية إذا كان السؤال بالعربية
3. قدم معلومات دقيقة عن المنتجات والخدمات
4. إذا لم تعرف الإجابة، اقترح التواصل مع خدمة العملاء
5. استخدم الرموز التعبيرية لجعل المحادثة ودية`,
  
  en: `You are a smart assistant for Al-Malika Syrian Bakery in the Netherlands. Your task is to help customers with their inquiries.

Bakery Information:
- Name: Al-Malika Bakery
- Specialty: Authentic Syrian bread and Arabic pastries
- Location: Netherlands
- Opening Hours: 7 AM - 7 PM (All days except Sunday)
- Phone: 020-1234567
- Email: info@al-malika.nl

Our Services:
- Fresh Arabic bread (Saj, Tannour, Samoli)
- Pastries (Pies, Cakes, Biscuits)
- Arabic sweets (Baklava, Kunafa, Maamoul)
- Delivery to all Netherlands
- Pre-orders for events

Payment Methods:
- iDEAL
- Credit cards
- Cash on delivery

Response Rules:
1. Always be friendly and polite
2. Answer in the same language as the question
3. Provide accurate information about products and services
4. If you don't know the answer, suggest contacting customer service
5. Use emojis to make the conversation friendly`,

  nl: `Je bent een slimme assistent voor Al-Malika Syrische Bakkerij in Nederland. Jouw taak is om klanten te helpen met hun vragen.

Bakkerij Informatie:
- Naam: Al-Malika Bakkerij
- Specialiteit: Authentiek Syrisch brood en Arabische gebakjes
- Locatie: Nederland
- Openingstijden: 7:00 - 19:00 (Alle dagen behalve zondag)
- Telefoon: 020-1234567
- Email: info@al-malika.nl

Onze Diensten:
- Vers Arabisch brood (Saj, Tannour, Samoli)
- Gebakjes (Taarten, Cakes, Koekjes)
- Arabische zoetigheden (Baklava, Kunafa, Maamoul)
- Bezorging in heel Nederland
- Vooraf bestellen voor evenementen

Betaalmethoden:
- iDEAL
- Creditcards
- Contant bij aflevering

Reactie Regels:
1. Wees altijd vriendelijk en beleefd
2. Antwoord in dezelfde taal als de vraag
3. Geef nauwkeurige informatie over producten en diensten
4. Als je het antwoord niet weet, stel voor om contact op te nemen met de klantenservice
5. Gebruik emoji's om het gesprek vriendelijk te maken`,

  ku: `تۆ یاریدەدەری زیرەکی نانەواخانەی "مالیکا"ی سوری لە هۆڵەندا. ئەرکت یارمەتیدان بە کڕیارانە.

زانیاری نانەواخانە:
- ناو: نانەواخانەی مالیکا
- شێوەکاری: نانی سوری و شیرینی عەرەبی
- شوێن: هۆڵەندا
- کاتەکانی کارکردن: ٧ بەیانی - ٧ ئێوارە (هەموو ڕۆژەکان جگە لە یەکشەممە)
- ژمارە تەلەفۆن: 020-1234567

خزمەتگوزارییەکانمان:
- نانی عەرەبی تازە
- شیرینی عەرەبی
- گەیاندن بۆ هەموو ناوچەکانی هۆڵەندا

ڕێنماییەکانی وەڵامدانەوە:
1. هەمیشە دۆستایەتی و بەڕێز بن
2. وەڵام بە هەمان زمانی پرسیار بدە
3. زانیاری دروست بەرهەم و خزمەتگوزاری بدە
4. ئەگەر وەڵام نازانی، پێشنیار بکە پەیوەندی بە خزمەتگوزاری کڕیاران بکات`
};

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language = 'en', history = [], context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    const zai = await getZAI();
    const systemPrompt = systemPrompts[language] || systemPrompts.en;

    // Build messages array with context
    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: systemPrompt }
    ];

    // Add conversation history (limit to last 10 messages to avoid token limits)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current message with context if provided
    let userMessage = message;
    if (context) {
      userMessage = `[Context: ${context}]\n\nUser message: ${message}`;
    }
    messages.push({ role: 'user', content: userMessage });

    // Get AI response
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('Empty response from AI');
    }

    // Detect intent from message
    const intent = detectIntent(message, language);

    // Check if needs human escalation
    const needsEscalation = shouldEscalate(message, language);

    return NextResponse.json({
      success: true,
      response,
      intent,
      needsEscalation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: 'Sorry, an error occurred. Please try again or contact us at 020-1234567'
    }, { status: 500 });
  }
}

function detectIntent(message: string, language: string): string {
  const lowerMessage = message.toLowerCase();
  
  const intents: Record<string, string[]> = {
    order: language === 'ar' 
      ? ['طلب', 'أطلب', 'أريد', 'أحتاج', 'اشتري']
      : ['order', 'buy', 'want', 'need', 'purchase'],
    delivery: language === 'ar'
      ? ['توصيل', 'تسليم', 'بيوصله', 'متى يوصل']
      : ['delivery', 'deliver', 'shipping', 'when arrive'],
    payment: language === 'ar'
      ? ['دفع', 'فلوس', 'سعر', 'كم', 'ideal', 'بطاقة']
      : ['payment', 'pay', 'price', 'cost', 'how much', 'ideal'],
    hours: language === 'ar'
      ? ['ساعات', 'متى تفتحون', 'متى تقفلون', 'وقت']
      : ['hours', 'open', 'close', 'when', 'time'],
    products: language === 'ar'
      ? ['خبز', 'معجنات', 'حلويات', 'منتجات', 'عندكم']
      : ['bread', 'pastry', 'sweets', 'products', 'menu', 'have'],
    complaint: language === 'ar'
      ? ['شكوى', 'مشكلة', 'غلط', 'سيء']
      : ['complaint', 'problem', 'wrong', 'bad', 'issue'],
    feedback: language === 'ar'
      ? ['رأي', 'تقييم', 'ممتاز', 'رائع']
      : ['feedback', 'review', 'great', 'excellent', 'good'],
    greeting: language === 'ar'
      ? ['مرحبا', 'السلام', 'أهلا', 'صباح', 'مساء']
      : ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    thanks: language === 'ar'
      ? ['شكرا', 'مشكور', 'ممنون']
      : ['thank', 'thanks', 'appreciate']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

function shouldEscalate(message: string, language: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  const escalationKeywords = language === 'ar'
    ? ['تحدث مع موظف', 'موظف', 'مدير', 'شكوى رسمية', 'مستعجل', 'طوارئ']
    : ['speak to human', 'manager', 'official complaint', 'urgent', 'emergency'];

  return escalationKeywords.some(keyword => lowerMessage.includes(keyword));
}

// GET endpoint for quick suggestions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'en';

  const suggestions = {
    ar: [
      'ما هي ساعات العمل؟',
      'كيف يمكنني الطلب؟',
      'هل لديكم توصيل؟',
      'ما هي طرق الدفع المتاحة؟',
      'ما هي المنتجات المتاحة؟',
      'أريد التحدث مع موظف'
    ],
    en: [
      'What are your opening hours?',
      'How can I place an order?',
      'Do you offer delivery?',
      'What payment methods do you accept?',
      'What products do you have?',
      'I want to speak to a human'
    ],
    nl: [
      'Wat zijn jullie openingstijden?',
      'Hoe kan ik bestellen?',
      'Bieden jullie bezorging aan?',
      'Welke betaalmethoden accepteren jullie?',
      'Welke producten hebben jullie?',
      'Ik wil met een mens praten'
    ],
    ku: [
      'کاتەکانی کارکردن چییە؟',
      'چۆن دەتوانم داوا بکەم؟',
      'ئایا گەیاندن هەیە؟',
      'شێوازەکانی پارەدان چییە؟',
      'بەرهەمەکان چییە؟',
      'دەمەوێت لەگەڵ کەسێک قسە بکەم'
    ]
  };

  return NextResponse.json({
    success: true,
    suggestions: suggestions[language as keyof typeof suggestions] || suggestions.en
  });
}
