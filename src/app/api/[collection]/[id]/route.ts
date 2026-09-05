import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

// GET /api/[collection]/[id] — get a single document by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const db = await getDb();
    const doc = await db.collection(collection).findOne({ id });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const { _id, ...clean } = doc;
    return NextResponse.json(clean);
  } catch (error) {
    console.error('API GET [id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/[collection]/[id] — update a document by id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const db = await getDb();
    const body = await request.json();

    const result = await db.collection(collection).findOneAndUpdate(
      { id },
      { $set: body },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { _id, ...clean } = result;
    return NextResponse.json(clean);
  } catch (error) {
    console.error('API PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/[collection]/[id] — delete a document by id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const db = await getDb();
    const result = await db.collection(collection).deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API DELETE [id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
