"use server";

import { signIn, signOut } from "@/auth";
import { User } from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginUser(state: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    await signIn("credentials", { ...data, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function registerUser(state: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !name) {
      return { error: "Missing required fields." };
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Something went wrong during login." };
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut();
}
