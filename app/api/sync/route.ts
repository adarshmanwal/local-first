import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { connectDB } from '@/lib/mongoose'; 
import { AppDocument as Document } from '@/models/Document'; 
import { getDocumentScopeQuery } from '@/lib/auth-guards';
import { z } from 'zod';

const syncSchema = z.object({
  docId: z.string().min(1, "Document ID is required").max(100, "Invalid Document ID length"),
  content: z.string().max(500000, "Content exceeds maximum allowed size"),
  timestamp: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = syncSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: parsed.error }, 
        { status: 400 }
      );
    }

    const { docId, content, timestamp } = parsed.data;
    const userId = session.user.id;

    await connectDB();

    const updatedDoc = await Document.findOneAndUpdate(
      { 
        _id: docId,
        ...getDocumentScopeQuery(userId, true)
      },
      { 
        $set: { content: content } 
      },
      { returnDocument: 'after' }
    );

    if (!updatedDoc) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, timestamp });

  } catch (error) {
    console.error('Background Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}