import { AuthCard } from "@/components/auth/AuthCard";
import { RequestResetForm } from "./RequestResetForm";

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
      <RequestResetForm />
    </AuthCard>
  );
}
