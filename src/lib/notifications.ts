import { db } from './db';
import { translations } from './i18n';

type Language = 'ar' | 'en' | 'nl' | 'ku' | 'tr';

export async function sendLocalizedNotification(
  customerId: string, 
  messageKey: string, 
  variables: Record<string, string> = {}
) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: { preferredLanguage: true, phone: true, name: true }
    });

    if (!customer) return;

    const lang = (customer.preferredLanguage as Language) || 'nl';
    
    // Get translated template
    let message = (translations[messageKey] as any)?.[lang] || (translations[messageKey] as any)?.['en'] || messageKey;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });

    // Save to database
    await db.notification.create({
      data: {
        customerId,
        type: 'APP_NOTIFICATION',
        title: (translations[`${messageKey}.title`] as any)?.[lang] || 'Notification',
        message: message,
        isSent: true,
        sentAt: new Date(),
        channels: 'SMS,PUSH'
      }
    });

    // Here you would trigger actual SMS/WhatsApp/Push via external provider
    console.log(`[SMS Sent to ${customer.phone} in ${lang}]: ${message}`);

  } catch (error) {
    console.error('Error sending localized notification:', error);
  }
}

/**
 * Escalation Phase 1: Robot Call
 */
export async function triggerRobotCall(customerId: string, invoiceId: string) {
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  if (!customer) return;

  const lang = (customer.preferredLanguage as Language) || 'nl';
  
  // Simulate AI/Robot Call integration
  console.log(`[ROBOT CALL] Calling ${customer.phone} in ${lang}... "Dear ${customer.name}, you have an overdue payment..."`);

  await db.activityLog.create({
    data: {
      userId: customerId,
      userType: 'customer',
      action: 'ROBOT_CALL_TRIGGERED',
      entity: 'Invoice',
      entityId: invoiceId,
      details: `Automated AI call initiated in ${lang}.`
    }
  });

  // Update invoice stage
  await (db.invoice as any).update({
    where: { id: invoiceId },
    data: { escalationStage: 'robot' }
  });
}

/**
 * Escalation Phase 2: Accountant Intervention
 */
export async function alertAccountant(invoiceId: string) {
  const invoice = await db.invoice.findUnique({ 
    where: { id: invoiceId },
    include: { order: { include: { customer: true } } }
  });
  if (!invoice) return;

  await db.notification.create({
    data: {
      type: 'ACCOUNTANT_ALERT',
      title: 'Manual Debt Collection Required',
      message: `Customer ${invoice.order.customer.name} failed to respond to Robot Call. Manual intervention required for Invoice ${invoice.invoiceNumber}.`,
      channels: 'DASHBOARD_PUSH'
    }
  });

  await db.activityLog.create({
    data: {
      action: 'ACCOUNTANT_INTERVENTION_REQUESTED',
      entity: 'Invoice',
      entityId: invoiceId,
      details: `System flagged for manual follow-up by accounting.`
    }
  });
}

/**
 * Escalation Phase 3: Incasso Transfer
 */
export async function transferToIncasso(invoiceId: string) {
  await (db.invoice as any).update({
    where: { id: invoiceId },
    data: { escalationStage: 'incasso' }
  });

  await db.activityLog.create({
    data: {
      action: 'INCASSO_TRANSFER',
      entity: 'Invoice',
      entityId: invoiceId,
      details: `Debt file exported and transferred to external collection agency.`
    }
  });
}

/**
 * Example for delay notification
 */
export async function notifyOrderDelay(orderId: string, delayMinutes: number) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (order?.customerId) {
    await sendLocalizedNotification(order.customerId, 'notification.orderDelay', {
      orderNumber: order.orderNumber,
      minutes: delayMinutes.toString()
    });
  }
}
