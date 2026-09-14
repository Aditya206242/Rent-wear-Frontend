"use client";

import { useActionState } from "react";
import { requestOtpLogin, type ActionState } from "@/lib/auth/actions";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

const initialState: ActionState = {};

export function MobileOtpForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(requestOtpLogin, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <PhoneInput
        label="Phone number"
        name="phone"
        required
        error={state.fieldErrors?.phone}
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <SubmitButton>Send code</SubmitButton>
    </form>
  );
}
