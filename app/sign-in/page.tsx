import { AuthCard } from "@/components/auth/AuthCard";
import { SignInMethods } from "./SignInMethods";

type Props = {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { redirectTo, reset } = await searchParams;

  return (
    <AuthCard
      heading="Sign in or create account"
      subheading=""
      footer={{ text: "Don't have an account?", linkText: "Sign up", href: "/sign-up" }}
    >
      {reset === "success" && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          Your password has been reset. Sign in with your new password.
        </p>
      )}
      <SignInMethods redirectTo={redirectTo ?? "/discover"} />
    </AuthCard>
  );
}
