import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyOtpForm } from "./VerifyOtpForm";

type Props = {
  searchParams: Promise<{ phone?: string; email?: string; redirectTo?: string }>;
};

export default async function VerifyOtpPage({ searchParams }: Props) {
  const { phone, email, redirectTo } = await searchParams;
  if (!phone || !email) redirect("/sign-up");

  return (
    <AuthCard
      heading="Verify your phone"
      subheading={`We sent a 6-digit code to ${phone}.`}
      footer={{ text: "Wrong number?", linkText: "Sign up again", href: "/sign-up" }}
    >
      <VerifyOtpForm phone={phone} email={email} redirectTo={redirectTo ?? "/dashboard"} />
    </AuthCard>
  );
}
