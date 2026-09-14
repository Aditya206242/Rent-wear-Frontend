import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      heading="Reset your password"
      subheading="Enter your email address and we'll send you a link to reset your password."
      footer={{
        text: "Remembered it?",
        linkText: "Sign in",
        href: "/sign-in",
      }}
    >
      <form className="space-y-4">
        <AuthInput
          label="Email address"
          name="email"
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          required
        />

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
        >
          Send reset link
        </button>
      </form>
    </AuthCard>
  );
}
