import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      heading="Create your account"
      subheading="Start renting in minutes."
      footer={{ text: "Already have an account?", linkText: "Sign in", href: "/sign-in" }}
    >
      <SignUpForm />
    </AuthCard>
  );
}
