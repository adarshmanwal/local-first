"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { AppDocument } from "@/models/Document";
import { revalidatePath } from "next/cache";

export async function createDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  if (!title) {
    throw new Error("Title is required");
  }

  await connectDB();
  
  await AppDocument.create({
    title,
    ownerId: session.user.id,
    content: "",
    collaborators: []
  });

  revalidatePath("/");
}

export async function deleteDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const documentId = formData.get("documentId") as string;
  if (!documentId) throw new Error("Document ID required");

  await connectDB();
  
  const doc = await AppDocument.findById(documentId);
  if (!doc) throw new Error("Document not found");
  if (doc.ownerId.toString() !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await AppDocument.findByIdAndDelete(documentId);

  revalidatePath("/");
}
