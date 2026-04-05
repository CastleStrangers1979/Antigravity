import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
let apiKeys: Array<{
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
  usageCount: number;
  isActive: boolean;
}> = [];

// GET - Fetch all API keys
export async function GET() {
  try {
    // Return keys without exposing the actual key values (masked)
    const maskedKeys = apiKeys.map(k => ({
      ...k,
      key: k.key.slice(0, 12) + '...' + k.key.slice(-4),
    }));
    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST - Create a new API key
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newKey = {
      id: body.id || Date.now().toString(),
      name: body.name,
      key: body.key,
      permissions: body.permissions || ['read'],
      createdAt: body.createdAt || new Date().toISOString(),
      expiresAt: body.expiresAt || null,
      lastUsed: null,
      usageCount: 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };
    
    apiKeys.push(newKey);
    
    return NextResponse.json(newKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

// DELETE - Delete an API key
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');
    
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }
    
    apiKeys = apiKeys.filter(k => k.id !== keyId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}

// PUT - Update an API key
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId') || body.id;
    
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }
    
    const keyIndex = apiKeys.findIndex(k => k.id === keyId);
    
    if (keyIndex === -1) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    
    apiKeys[keyIndex] = {
      ...apiKeys[keyIndex],
      ...body,
      id: keyId, // Preserve the original ID
    };
    
    return NextResponse.json(apiKeys[keyIndex]);
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}
