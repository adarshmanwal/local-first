import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationToken extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  identifier: { type: String, required: true },
  token: { type: String, unique: true, required: true },
  expires: { type: Date, required: true },
});

export const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);
