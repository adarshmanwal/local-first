import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export interface ICollaborator {
  userId: mongoose.Types.ObjectId;
  role: 'Editor' | 'Viewer';
}

export interface IDocument extends MongooseDocument {
  title: string;
  content: any; // Mixed JSON object or String
  ownerId: mongoose.Types.ObjectId;
  collaborators: ICollaborator[];
}

const DocumentSchema = new Schema<IDocument>({
  title: { type: String, required: true },
  content: { type: Schema.Types.Mixed },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ['Editor', 'Viewer'], required: true },
    },
  ],
}, { timestamps: true });

export const AppDocument: Model<IDocument> =
  mongoose.models.AppDocument || mongoose.model<IDocument>("AppDocument", DocumentSchema);
