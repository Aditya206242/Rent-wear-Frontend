import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "./SignUpForm";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;

  return (
    <AuthCard
      heading="Create your account"
      subheading=""
      footer={{ text: "Already have an account?", linkText: "Sign in", href: "/sign-in" }}
    >
      <div className="space-y-5">
        <SignUpForm redirectTo={redirectTo ?? "/discover"} />
      </div>
    </AuthCard>
  );
}
