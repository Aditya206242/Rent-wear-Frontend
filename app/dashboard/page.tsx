import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Welcome, {session.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{session.email}</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
