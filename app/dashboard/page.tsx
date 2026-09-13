import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            {session ? `Welcome, ${session.name}` : "Welcome to LoopWear"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {session ? session.email : "Browse items — sign in when you're ready to purchase."}
          </p>
        </div>
        {session ? (
          <LogoutButton />
        ) : (
          <Link
            href="/sign-in"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
