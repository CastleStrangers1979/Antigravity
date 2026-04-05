import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all payment providers
export async function GET() {
  try {
    // Try to get providers from database
    let providers = await db.paymentProvider.findMany({
      orderBy: { name: 'asc' },
    });

    // If no providers exist, create default ones
    if (providers.length === 0) {
      const defaultProviders = [
        {
          name: 'stripe',
          displayName: 'Stripe',
          isActive: false,
          isTestMode: true,
          apiKey: '',
          secretKey: '',
          webhookSecret: '',
          settings: JSON.stringify({
            supportedMethods: ['card', 'apple_pay', 'google_pay'],
            fees: { percentage: 2.9, fixed: 0.30 },
          }),
        },
        {
          name: 'mollie',
          displayName: 'Mollie',
          isActive: false,
          isTestMode: true,
          apiKey: '',
          secretKey: '',
          webhookSecret: '',
          settings: JSON.stringify({
            supportedMethods: ['ideal', 'creditcard', 'paypal', 'bancontact', 'sofort'],
            fees: { ideal: 0.29, creditcard: 2.5 },
          }),
        },
        {
          name: 'ideal',
          displayName: 'iDEAL',
          isActive: false,
          isTestMode: true,
          apiKey: '',
          secretKey: '',
          webhookSecret: '',
          settings: JSON.stringify({
            bankCode: '',
            supportedBanks: ['ABNAMRO', 'ASN', 'BUNQ', 'ING', 'KNAB', 'RABOBANK', 'SNS', 'TRIODOS'],
          }),
        },
        {
          name: 'apple_pay',
          displayName: 'Apple Pay',
          isActive: false,
          isTestMode: true,
          apiKey: '',
          secretKey: '',
          webhookSecret: '',
          settings: JSON.stringify({
            merchantId: '',
            supportedNetworks: ['visa', 'mastercard', 'amex'],
            requiresProvider: true,
            linkedProvider: 'stripe',
          }),
        },
        {
          name: 'google_pay',
          displayName: 'Google Pay',
          isActive: false,
          isTestMode: true,
          apiKey: '',
          secretKey: '',
          webhookSecret: '',
          settings: JSON.stringify({
            merchantId: '',
            supportedNetworks: ['visa', 'mastercard', 'amex'],
            requiresProvider: true,
            linkedProvider: 'stripe',
          }),
        },
      ];

      providers = await db.paymentProvider.createMany({
        data: defaultProviders,
        skipDuplicates: true,
      });

      providers = await db.paymentProvider.findMany({
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return NextResponse.json([]);
  }
}

// POST create new payment provider
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const provider = await db.paymentProvider.create({
      data: {
        name: data.name,
        displayName: data.displayName || data.name,
        isActive: data.isActive ?? false,
        isTestMode: data.isTestMode ?? true,
        apiKey: data.apiKey || '',
        secretKey: data.secretKey || '',
        webhookSecret: data.webhookSecret || '',
        settings: JSON.stringify(data.settings || {}),
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error creating payment provider:', error);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}

// PUT update payment provider
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    const provider = await db.paymentProvider.update({
      where: { id: data.id },
      data: {
        displayName: data.displayName,
        isActive: data.isActive,
        isTestMode: data.isTestMode,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        webhookSecret: data.webhookSecret,
        settings: JSON.stringify(data.settings || {}),
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating payment provider:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}
