import { AuthCard } from "@/components/auth/AuthCard";
import { SignInMethods } from "./SignInMethods";

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;

  return (
    <AuthCard
      heading="Sign in or create account"
      subheading=""
      footer={{ text: "Don't have an account?", linkText: "Sign up", href: "/sign-up" }}
    >
      <SignInMethods redirectTo={redirectTo ?? "/dashboard"} />
    </AuthCard>
  );
}
