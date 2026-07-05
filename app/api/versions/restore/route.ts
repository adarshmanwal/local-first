import { NextResponse } from 'next/server';
import { auth } from '@/auth'; 
import { connectDB } from '@/lib/mongoose';
import { DocumentVersion } from '@/models/DocumentVersion';
import { AppDocument } from '@/models/Document';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { versionId } = await req.json();
    await connectDB();

    // 1. Find the historical snapshot
    const version = await DocumentVersion.findById(versionId);
    if (!version) {
      return NextResponse.json({ error: 'Version snapshot not found' }, { status: 404 });
    }

    // 2. Overwrite the parent document's content with the snapshot data
    // No tenant isolation applied based on user's earlier requirement ("no restriction for now")
    const updatedDoc = await AppDocument.findOneAndUpdate(
      { 
        _id: version.documentId
      },
      { $set: { content: version.snapshot } }, // Changed from snapshotData to snapshot
      { new: true }
    );

    if (!updatedDoc) {
      return NextResponse.json({ error: 'Access denied or document missing' }, { status: 403 });
    }

    return NextResponse.json({ success: true, content: updatedDoc.content });
  } catch (error) {
    console.error('Restore Version Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}