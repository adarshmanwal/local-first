import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export interface IDocumentVersion extends MongooseDocument {
  documentId: mongoose.Types.ObjectId;
  snapshot: any;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>({
  documentId: { type: Schema.Types.ObjectId, ref: "AppDocument", required: true },
  snapshot: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const DocumentVersion: Model<IDocumentVersion> =
  mongoose.models.DocumentVersion || mongoose.model<IDocumentVersion>("DocumentVersion", DocumentVersionSchema);
