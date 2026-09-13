"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/lib/auth/actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />

      <div>
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
        <div className="mt-1.5 text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            Forgot password?
          </Link>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton>Sign in</SubmitButton>
    </form>
  );
}
