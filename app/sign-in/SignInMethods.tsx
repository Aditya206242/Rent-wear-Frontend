"use client";

import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { SignInForm } from "./SignInForm";
import { MobileOtpForm } from "./MobileOtpForm";

export function SignInMethods({ redirectTo }: { redirectTo: string }) {
  const [method, setMethod] = useState<"password" | "mobile">("password");

  return (
    <div className="space-y-5">
      <GoogleButton />
      <AuthDivider text="or" />

      <div className="flex rounded-lg border border-neutral-200  text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMethod("mobile")}
          className={`flex-1 rounded-md py-1.5 cursor-pointer transition-colors ${
            method === "mobile" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Mobile OTP
        </button>
      </div>

      {method === "password" ? <SignInForm redirectTo={redirectTo} /> : <MobileOtpForm redirectTo={redirectTo} />}
    </div>
  );
}
