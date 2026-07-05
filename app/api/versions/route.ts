import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongoose';
import { DocumentVersion } from '@/models/DocumentVersion';
import { AppDocument } from '@/models/Document';

import { z } from 'zod';

const createVersionSchema = z.object({
    docId: z.string().min(1, "Document ID is required").max(100, "Invalid Document ID length"),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createVersionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error }, { status: 400 });
        }
        const { docId } = parsed.data;
        await connectDB();

        // 1. Fetch the current document
        const currentDoc = await AppDocument.findById(docId);
        if (!currentDoc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // 2. Create the snapshot
        const newVersion = await DocumentVersion.create({
            documentId: currentDoc._id,
            snapshot: currentDoc.content, // Changed from snapshotData to match model
            createdBy: session.user.id,
        });

        return NextResponse.json({ success: true, version: newVersion });
    } catch (error) {
        console.error('Snapshot Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const docId = searchParams.get('docId');

        if (!docId) {
            return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
        }

        await connectDB();

        // Fetch versions sorted by newest first
        const versions = await DocumentVersion.find({ documentId: docId })
            .sort({ createdAt: -1 })
            .select('createdAt _id'); // We only need id and date for the sidebar list

        return NextResponse.json({ success: true, versions });
    } catch (error) {
        console.error('Fetch Versions Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}