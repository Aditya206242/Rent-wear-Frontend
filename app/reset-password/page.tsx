import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "./ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard heading="Invalid reset link" subheading="This password reset link is missing or malformed.">
        <p className="text-sm text-neutral-500">
          Request a new one from the{" "}
          <Link href="/forgot-password" className="font-semibold text-brand-navy underline-offset-4 hover:underline">
            forgot password
          </Link>{" "}
          page.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Set a new password"
      subheading="Choose a new password for your account."
      footer={{ text: "Remembered it?", linkText: "Sign in", href: "/sign-in" }}
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
