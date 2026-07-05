import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { withDocumentScoping } from '@/lib/auth-guards';
import { EditorClient } from '@/components/editor/EditorClient';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const { id } = await params;

    // Securely fetch the document via SSR
    // By default, this ensures the user is either the Owner, Editor, or Viewer.
    // If they have no access, withDocumentScoping throws an error which can be caught by an ErrorBoundary
    const document = await withDocumentScoping(id, session.user.id, 'Viewer');

    // Determine Role
    const isOwner = document.ownerId.toString() === session.user.id;
    let role: 'Owner' | 'Editor' | 'Viewer' = 'Viewer';
    
    if (isOwner) {
        role = 'Owner';
    } else {
        const collab = document.collaborators.find((c: any) => c.userId.toString() === session!.user!.id);
        if (collab) {
            role = collab.role;
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex selection:bg-indigo-500/30 overflow-hidden">
            <EditorClient 
                docId={id} 
                initialContent={document.content || ''} 
                role={role} 
            />
        </div>
    );
}