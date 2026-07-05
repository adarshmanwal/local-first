import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  password: { type: String },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
