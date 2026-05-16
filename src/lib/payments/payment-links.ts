/**
 * Payment Link Generation Utility
 * This utility generates payment links for customers to pay their invoices.
 * In a production environment, this would integrate with Mollie, Stripe, or Betaalnu.
 */

interface PaymentDetails {
  invoiceId: string;
  amount: number;
  customerName: string;
  invoiceNumber: string;
}

export async function generatePaymentLink(details: PaymentDetails): Promise<string> {
  // In a real implementation, you would call Mollie API here:
  // const payment = await mollieClient.payments.create({
  //   amount: { value: details.amount.toFixed(2), currency: 'EUR' },
  //   description: `Invoice ${details.invoiceNumber}`,
  //   redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?id=${details.invoiceId}`,
  //   webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payments`,
  //   metadata: { invoiceId: details.invoiceId }
  // });
  // return payment.getCheckoutUrl();

  // For now, we'll return a localized mockup link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // This simulates a Betaalnu/iDEAL pre-filled link
  // Real Betaalnu links often look like: https://betaalnu.nl/p/xxxxxx
  const mockId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  return `${baseUrl}/pay/${details.invoiceId}?ref=${details.invoiceNumber}&m=${mockId}`;
}

/**
 * Sends a reminder via the configured channel (SMS/WhatsApp/Email)
 */
export async function sendDebtReminder(
  channel: 'sms' | 'whatsapp' | 'email',
  customerPhone: string,
  customerName: string,
  amount: number,
  invoiceNumber: string,
  paymentLink: string,
  stage: 'green' | 'yellow' | 'orange' | 'red'
): Promise<boolean> {
  const templates = {
    green: {
      ar: `عزيزي ${customerName}، تذكير لطيف بالفاتورة رقم ${invoiceNumber} بمبلغ ${amount}€. يمكنك الدفع هنا: ${paymentLink}`,
      nl: `Beste ${customerName}, een vriendelijke herinnering voor factuur ${invoiceNumber} van €${amount}. Betaal hier: ${paymentLink}`,
      en: `Dear ${customerName}, a friendly reminder for invoice ${invoiceNumber} of €${amount}. Pay here: ${paymentLink}`
    },
    yellow: {
      ar: `تنبيه: الفاتورة رقم ${invoiceNumber} متأخرة. يرجى سداد ${amount}€ لتجنب أي تأخير إضافي. الرابط: ${paymentLink}`,
      nl: `Let op: Factuur ${invoiceNumber} is te laat. Betaal a.u.b. €${amount} om verdere vertraging te voorkomen. Link: ${paymentLink}`,
      en: `Notice: Invoice ${invoiceNumber} is overdue. Please settle €${amount} to avoid further delays. Link: ${paymentLink}`
    },
    orange: {
      ar: `هام جداً: الفاتورة ${invoiceNumber} متأخرة جداً. نرجو السداد الفوري لمبلغ ${amount}€. الرابط: ${paymentLink}`,
      nl: `DRINGEND: Factuur ${invoiceNumber} is ruim over tijd. Betaal a.u.b. direct €${amount}. Link: ${paymentLink}`,
      en: `URGENT: Invoice ${invoiceNumber} is significantly overdue. Please pay €${amount} immediately. Link: ${paymentLink}`
    },
    red: {
      ar: `تحذير نهائي: الفاتورة ${invoiceNumber} سيتم تحويلها للتحصيل القانوني ما لم يتم سداد ${amount}€ خلال 24 ساعة. الرابط: ${paymentLink}`,
      nl: `LAATSTE WAARSCHUWING: Factuur ${invoiceNumber} wordt overgedragen aan incasso tenzij €${amount} binnen 24 uur is betaald. Link: ${paymentLink}`,
      en: `FINAL WARNING: Invoice ${invoiceNumber} will be transferred to collection unless €${amount} is paid within 24h. Link: ${paymentLink}`
    }
  };

  const message = templates[stage].nl; // Default to NL or detect from customer
  
  console.log(`[REMINDER] Sending ${channel} to ${customerPhone} (Stage: ${stage}): ${message}`);
  
  // Real integration would go here (Twilio, Mollie, etc.)
  return true;
}
