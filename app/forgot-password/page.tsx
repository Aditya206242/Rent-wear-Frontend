import { AuthCard } from "@/components/auth/AuthCard";

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
      <form className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Send reset link
        </button>
      </form>
    </AuthCard>
  );
}