import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <AuthCard
      heading="Welcome back"
      subheading="Sign in to continue."
      footer={{ text: "Don't have an account?", linkText: "Sign up", href: "/sign-up" }}
    >
      <SignInForm />
    </AuthCard>
  );
}
