"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signUpSchema, signInSchema, otpSchema } from "./schemas";
import {
  createUnverifiedUser,
  getUserByEmail,
  markUserVerified,
  verifyPassword,
  issueOtp,
  consumeOtp,
} from "./store";
import { sendOtpSms } from "./sms";
import { createSessionCookie, clearSessionCookie } from "./session";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { name, email, phone, password } = parsed.data;
  const existing = getUserByEmail(email);
  if (existing?.verified) {
    return { error: "An account with this email already exists." };
  }

  await createUnverifiedUser({ name, email, phone, password });

  const code = await issueOtp(phone);
  try {
    await sendOtpSms(phone, code);
  } catch {
    return { error: "Could not send verification code. Please try again." };
  }

  redirect(`/verify-otp?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = otpSchema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { phone, code } = parsed.data;
  const email = formData.get("email");
  if (typeof email !== "string") {
    return { error: "Something went wrong. Please sign up again." };
  }

  const result = await consumeOtp(phone, code);
  if (!result.ok) {
    const messages = {
      expired: "This code has expired. Request a new one.",
      invalid: "That code is incorrect.",
      too_many_attempts: "Too many incorrect attempts. Request a new code.",
    } as const;
    return { error: messages[result.reason] };
  }

  const user = getUserByEmail(email);
  if (!user) {
    return { error: "Something went wrong. Please sign up again." };
  }

  markUserVerified(email);
  await createSessionCookie({ userId: user.id, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function resendOtp(phone: string): Promise<{ error?: string }> {
  const parsed = otpSchema.shape.phone.safeParse(phone);
  if (!parsed.success) return { error: "Invalid phone number." };

  const code = await issueOtp(parsed.data);
  try {
    await sendOtpSms(parsed.data, code);
  } catch {
    return { error: "Could not send verification code. Please try again." };
  }
  return {};
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { email, password } = parsed.data;
  const user = getUserByEmail(email);
  const genericError = "Invalid email or password.";

  if (!user || !(await verifyPassword(user, password))) {
    return { error: genericError };
  }

  if (!user.verified) {
    redirect(`/verify-otp?phone=${encodeURIComponent(user.phone)}&email=${encodeURIComponent(user.email)}`);
  }

  await createSessionCookie({ userId: user.id, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/sign-in");
}
