import bcrypt from "bcryptjs";

/**
 * In-memory store — resets on server restart. Swap the internals of these
 * functions for real database calls; callers never need to change.
 */

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  verified: boolean;
};

type OtpRecord = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
};

declare global {
  var __authStore: { usersByEmail: Map<string, User>; otpsByPhone: Map<string, OtpRecord> } | undefined;
}

// Next.js dev mode can recompile this module per-route, which would otherwise
// reset these maps mid-flow (e.g. an OTP issued during sign-up "disappearing"
// by the time /verify-otp compiles). Stash it on globalThis to survive that.
const store =
  globalThis.__authStore ?? (globalThis.__authStore = { usersByEmail: new Map(), otpsByPhone: new Map() });
const { usersByEmail, otpsByPhone } = store;

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export async function createUnverifiedUser(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    verified: false,
  };
  usersByEmail.set(input.email, user);
  return user;
}

export function getUserByEmail(email: string): User | undefined {
  return usersByEmail.get(email);
}

export function getUserByPhone(phone: string): User | undefined {
  return [...usersByEmail.values()].find((user) => user.phone === phone);
}

export function markUserVerified(email: string): void {
  const user = usersByEmail.get(email);
  if (user) user.verified = true;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function issueOtp(phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpsByPhone.set(phone, {
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return code;
}

export async function consumeOtp(
  phone: string,
  code: string,
): Promise<{ ok: true } | { ok: false; reason: "expired" | "invalid" | "too_many_attempts" }> {
  const record = otpsByPhone.get(phone);
  if (!record) return { ok: false, reason: "invalid" };

  if (Date.now() > record.expiresAt) {
    otpsByPhone.delete(phone);
    return { ok: false, reason: "expired" };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    otpsByPhone.delete(phone);
    return { ok: false, reason: "too_many_attempts" };
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    return { ok: false, reason: "invalid" };
  }

  otpsByPhone.delete(phone);
  return { ok: true };
}
