"use client";

import { useActionState, useState, useTransition } from "react";
import { verifyOtp, resendOtp, type ActionState } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function VerifyOtpForm({
  phone,
  redirectTo,
}: {
  phone: string;
  redirectTo: string;
}) {
  const [state, formAction] = useActionState(verifyOtp, initialState);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, startResend] = useTransition();

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <AuthInput
        label="Verification code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        required
        error={state.fieldErrors?.code}
        className="text-center text-xl font-semibold tracking-[0.5em] text-brand-navy caret-brand-gold"
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton>Verify</SubmitButton>

      <button
        type="button"
        disabled={isResending}
        onClick={() =>
          startResend(async () => {
            setResendMessage(null);
            const result = await resendOtp(phone);
            setResendMessage(result.error ?? "A new code has been sent.");
          })
        }
        className="w-full text-center text-sm font-semibold text-brand-gold-deep hover:text-brand-navy disabled:opacity-60"
      >
        {isResending ? "Sending…" : "Resend code"}
      </button>

      {resendMessage && (
        <p role="status" className="text-center text-sm text-neutral-500">
          {resendMessage}
        </p>
      )}
    </form>
  );
}
