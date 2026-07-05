import { auth } from "@/auth";
import { AppDocument } from "@/models/Document";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: User not authenticated");
  }
  
  return session.user.id;
}

export async function withDocumentScoping(
  documentId: string,
  userId: string,
  requiredRole: 'Editor' | 'Viewer' = 'Viewer'
) {
  await connectDB();

  const doc = await AppDocument.findById(documentId);

  if (!doc) {
    throw new Error("Document not found");
  }
  
  const isOwner = doc.ownerId.toString() === userId;
  
  if (isOwner) {
    return doc;
  }
  
  const collaborator = doc.collaborators.find(
    (c) => c.userId.toString() === userId
  );
  
  if (!collaborator) {
    throw new Error("Unauthorized: You do not have access to this document");
  }
  
  if (requiredRole === 'Editor' && collaborator.role !== 'Editor') {
    throw new Error("Unauthorized: You do not have edit permissions for this document");
  }
  
  return doc;
}

// Example wrapper for a mongoose query to enforce scoping automatically
export function getDocumentScopeQuery(userId: string, requireEdit: boolean = false) {
  if (requireEdit) {
    return {
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { 
          collaborators: { 
            $elemMatch: { 
              userId: new mongoose.Types.ObjectId(userId), 
              role: 'Editor' 
            } 
          } 
        }
      ]
    };
  }
  
  return {
    $or: [
      { ownerId: new mongoose.Types.ObjectId(userId) },
      { 'collaborators.userId': new mongoose.Types.ObjectId(userId) }
    ]
  };
}
