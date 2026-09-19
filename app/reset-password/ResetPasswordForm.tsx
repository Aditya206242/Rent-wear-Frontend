"use client";

import { useActionState } from "react";
import { resetPassword, type ActionState } from "@/lib/auth/actions";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />

      <div>
        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.password}
        />
        <p className="mt-1.5 text-xs text-neutral-500">At least 8 characters, with a letter and a number.</p>
      </div>

      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton>Reset password</SubmitButton>
    </form>
  );
}
