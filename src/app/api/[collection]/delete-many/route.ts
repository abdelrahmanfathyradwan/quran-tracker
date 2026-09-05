import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

// POST /api/[collection]/delete-many — delete multiple documents by ids
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const db = await getDb();
    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    await db.collection(collection).deleteMany({ id: { $in: ids } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API delete-many error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
