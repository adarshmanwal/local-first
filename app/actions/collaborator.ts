'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/mongoose';
import { AppDocument } from '@/models/Document';
import { User } from '@/models/User';
import { revalidatePath } from 'next/cache';

export async function addCollaborator(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const documentId = formData.get('documentId') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as 'Editor' | 'Viewer';

        if (!documentId || !email || !role) {
            return { error: 'Missing required fields' };
        }

        await connectDB();

        // 1. Verify ownership
        const doc = await AppDocument.findById(documentId);
        if (!doc) {
            return { error: 'Document not found' };
        }

        if (doc.ownerId.toString() !== session.user.id) {
            return { error: 'Only the owner can add collaborators' };
        }

        // 2. Find the user to add
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return { error: 'User with this email does not exist' };
        }

        if (userToAdd._id.toString() === session.user.id) {
            return { error: 'You are already the owner of this document' };
        }

        // 3. Check if they are already a collaborator
        const existingCollabIndex = doc.collaborators.findIndex((c: any) => c.userId.toString() === userToAdd._id.toString());
        
        if (existingCollabIndex > -1) {
            // Update role if they exist
            doc.collaborators[existingCollabIndex].role = role;
        } else {
            // Add new collaborator
            doc.collaborators.push({
                userId: userToAdd._id,
                role: role
            });
        }

        await doc.save();
        revalidatePath(`/notes/${documentId}`);
        return { success: `Successfully added ${email} as ${role}` };

    } catch (error: any) {
        console.error('Failed to add collaborator:', error);
        return { error: 'Internal Server Error' };
    }
}
