import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export interface ISession extends MongooseDocument {
  sessionToken: string;
  userId: mongoose.Types.ObjectId;
  expires: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionToken: { type: String, unique: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expires: { type: Date, required: true },
});

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
