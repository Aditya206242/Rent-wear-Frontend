import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyOtpForm } from "./VerifyOtpForm";

type Props = {
  searchParams: Promise<{ phone?: string; redirectTo?: string }>;
};

export default async function VerifyOtpPage({ searchParams }: Props) {
  const { phone, redirectTo } = await searchParams;
  if (!phone) redirect("/sign-up");

  return (
    <AuthCard
      heading="Verify your phone"
      subheading={`We sent a 6-digit code to ${phone}.`}
      footer={{ text: "Wrong number?", linkText: "Sign up again", href: "/sign-up" }}
    >
      <VerifyOtpForm phone={phone} redirectTo={redirectTo ?? "/discover"} />
    </AuthCard>
  );
}
