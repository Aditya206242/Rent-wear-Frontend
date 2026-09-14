"use client";

import { useActionState } from "react";
import { signUp, type ActionState } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <AuthInput
        label="Full name"
        name="name"
        autoComplete="name"
        required
        error={state.fieldErrors?.name}
      />
      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <PhoneInput
        label="Phone number"
        name="phone"
        required
        error={state.fieldErrors?.phone}
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
      />
      <PasswordInput
        label="Confirm password"
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

      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
