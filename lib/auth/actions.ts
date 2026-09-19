"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signUpSchema, signInSchema, otpSchema, requestPasswordResetSchema, resetPasswordSchema } from "./schemas";
import { createSessionCookie, clearSessionCookie, getToken, type SessionUser } from "./session";
import { apiFetch } from "@/lib/api/client";
import { ApiError, fieldErrorsFrom } from "@/lib/api/errors";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

function safeRedirect(target: FormDataEntryValue | null): string {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : "/discover";
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Every action funnels backend failures through this so error handling stays uniform. */
function actionErrorFrom(error: unknown): ActionState {
  if (error instanceof ApiError) {
    if (error.code === "validation_error") {
      const fieldErrors = fieldErrorsFrom(error);
      if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
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
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  try {
    await apiFetch<{ userId: string }>("/auth/sign-up", { method: "POST", body: { name, email, phone, password } });
  } catch (error) {
    return actionErrorFrom(error);
  }

  redirect(`/verify-otp?phone=${encodeURIComponent(phone)}&redirectTo=${encodeURIComponent(redirectTo)}`);
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
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  let token: string;
  try {
    const result = await apiFetch<{ token: string; user: SessionUser }>("/auth/verify-otp", {
      method: "POST",
      body: { phone, code },
    });
    token = result.token;
  } catch (error) {
    return actionErrorFrom(error);
  }

  await createSessionCookie(token);
  redirect(redirectTo);
}

export async function resendOtp(phone: string): Promise<{ error?: string }> {
  const parsed = otpSchema.shape.phone.safeParse(phone);
  if (!parsed.success) return { error: "Invalid phone number." };

  try {
    await apiFetch<void>("/auth/resend-otp", { method: "POST", body: { phone: parsed.data } });
  } catch (error) {
    return actionErrorFrom(error);
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
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  let token: string;
  try {
    const result = await apiFetch<{ token: string; user: SessionUser }>("/auth/sign-in", {
      method: "POST",
      body: { email, password },
    });
    token = result.token;
  } catch (error) {
    // Correct password, unverified account: the backend only reveals the
    // phone number once the password has already been proven correct, so
    // this can't be used to enumerate accounts. Without this redirect the
    // customer would just see an error with no way to finish verifying.
    if (
      error instanceof ApiError &&
      error.status === 403 &&
      error.details &&
      typeof error.details === "object" &&
      "phone" in error.details
    ) {
      const phone = (error.details as { phone?: string }).phone;
      if (phone) redirect(`/verify-otp?phone=${encodeURIComponent(phone)}&redirectTo=${encodeURIComponent(redirectTo)}`);
    }
    return actionErrorFrom(error);
  }

  await createSessionCookie(token);
  redirect(redirectTo);
}

export async function requestOtpLogin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = otpSchema.shape.phone.safeParse(formData.get("phone"));
  if (!parsed.success) {
    return { fieldErrors: { phone: parsed.error.issues[0]?.message ?? "Invalid phone number." } };
  }

  const redirectTo = safeRedirect(formData.get("redirectTo"));
  const phone = parsed.data;

  try {
    await apiFetch<void>("/auth/request-otp-login", { method: "POST", body: { phone } });
  } catch (error) {
    return actionErrorFrom(error);
  }

  redirect(`/verify-otp?phone=${encodeURIComponent(phone)}&redirectTo=${encodeURIComponent(redirectTo)}`);
}

export async function continueWithGoogle(idToken: string, redirectTo: string): Promise<ActionState> {
  let token: string;
  try {
    const result = await apiFetch<{ token: string; user: SessionUser }>("/auth/google", {
      method: "POST",
      body: { idToken },
    });
    token = result.token;
  } catch (error) {
    return actionErrorFrom(error);
  }

  await createSessionCookie(token);
  redirect(safeRedirect(redirectTo));
}

export async function logout(): Promise<void> {
  const token = await getToken();
  if (token) {
    // Best-effort server-side revocation — proceed with local logout either way.
    await apiFetch<void>("/auth/logout", { method: "POST", token }).catch(() => {});
  }
  await clearSessionCookie();
  redirect("/discover");
}

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const genericSuccess = "If an account exists for that email, we've sent password reset instructions.";

  try {
    await apiFetch<void>("/auth/request-password-reset", { method: "POST", body: { email: parsed.data.email } });
  } catch (error) {
    // Never reveal whether the email exists — the backend resolves this
    // endpoint identically either way. Only failures that carry no such
    // signal (rate limiting, network issues, server errors) are surfaced.
    if (error instanceof ApiError && (error.status === 429 || error.status === 0 || error.status >= 500)) {
      return actionErrorFrom(error);
    }
  }

  return { success: genericSuccess };
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { token, password } = parsed.data;

  try {
    await apiFetch<void>("/auth/reset-password", { method: "POST", body: { token, password } });
  } catch (error) {
    return actionErrorFrom(error);
  }

  redirect("/sign-in?reset=success");
}
