"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
      aria-label="Sign out"
      title="Sign out"
      className="flex h-8 w-8 shrink-0 items-center justify-center text-brand-navy/50 transition-colors hover:text-signal-danger disabled:opacity-50"
    >
      <LogOut size={16} strokeWidth={1.5} />
    </button>
  );
}
