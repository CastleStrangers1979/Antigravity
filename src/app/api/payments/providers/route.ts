import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// Default payment providers (in-memory for demo since PaymentProvider model doesn't exist)
const defaultProviders = [
  {
    id: 'stripe',
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
    id: 'mollie',
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
    id: 'ideal',
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
    id: 'apple_pay',
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
    id: 'google_pay',
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

// In-memory store for providers
let providersStore = [...defaultProviders];

// GET all payment providers
export async function GET() {
  try {
    // Return in-memory providers since PaymentProvider model doesn't exist
    return NextResponse.json(providersStore);
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    return NextResponse.json([]);
  }
}

// POST create new payment provider
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const provider = {
      id: data.name || `provider-${Date.now()}`,
      name: data.name,
      displayName: data.displayName || data.name,
      isActive: data.isActive ?? false,
      isTestMode: data.isTestMode ?? true,
      apiKey: data.apiKey || '',
      secretKey: data.secretKey || '',
      webhookSecret: data.webhookSecret || '',
      settings: JSON.stringify(data.settings || {}),
    };

    providersStore.push(provider);
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

    const index = providersStore.findIndex(p => p.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    providersStore[index] = {
      ...providersStore[index],
      displayName: data.displayName,
      isActive: data.isActive,
      isTestMode: data.isTestMode,
      apiKey: data.apiKey,
      secretKey: data.secretKey,
      webhookSecret: data.webhookSecret,
      settings: JSON.stringify(data.settings || {}),
    };

    return NextResponse.json(providersStore[index]);
  } catch (error) {
    console.error('Error updating payment provider:', error);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}
