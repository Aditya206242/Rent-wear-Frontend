import { AuthCard } from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      heading="Reset your password"
      subheading="Password reset isn't set up yet — contact support to regain access to your account."
      footer={{ text: "Remembered it?", linkText: "Sign in", href: "/sign-in" }}
    >
      <p className="text-sm text-neutral-500">
        This flow requires an email delivery service and is tracked as follow-up work.
      </p>
    </AuthCard>
  );
}
