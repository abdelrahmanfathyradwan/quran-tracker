import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

// GET /api/[collection] — get all documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const db = await getDb();

    // Settings is a single document, not an array
    if (collection === 'settings') {
      const doc = await db.collection(collection).findOne({ _key: 'settings' });
      return NextResponse.json(doc?.data ?? null);
    }

    const docs = await db.collection(collection).find({}).toArray();
    // Strip MongoDB's _id and return clean data
    const items = docs.map(({ _id, ...rest }) => rest);
    return NextResponse.json(items);
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/[collection] — create a document or bulk set
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const db = await getDb();
    const body = await request.json();

    // Settings: upsert single document
    if (collection === 'settings') {
      await db.collection(collection).updateOne(
        { _key: 'settings' },
        { $set: { _key: 'settings', data: body } },
        { upsert: true }
      );
      return NextResponse.json(body);
    }

    // Bulk set: replace entire collection
    if (body._bulk === true && Array.isArray(body.items)) {
      await db.collection(collection).deleteMany({});
      if (body.items.length > 0) {
        await db.collection(collection).insertMany(body.items);
      }
      return NextResponse.json({ success: true });
    }

    // Single create
    await db.collection(collection).insertOne(body);
    const { _id, ...clean } = body;
    return NextResponse.json(clean, { status: 201 });
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/[collection] — clear all documents
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const db = await getDb();
    await db.collection(collection).deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
