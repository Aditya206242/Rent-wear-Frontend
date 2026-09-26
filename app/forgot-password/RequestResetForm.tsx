"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ActionState } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <p role="status" className="text-sm text-neutral-600">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <AuthInput
        label="Email address"
        name="email"
        type="email"
        placeholder="Enter your email address"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton>Send reset link</SubmitButton>
    </form>
  );
}
