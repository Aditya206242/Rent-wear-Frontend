import type { ReactNode } from "react";
import { PlatformRail } from "@/components/console/PlatformRail";
import { ConcourseHeader } from "@/components/console/ConcourseHeader";
import { MobileDispatchBar } from "@/components/console/MobileDispatchBar";
import { requireOperator } from "@/lib/auth/session";
import { listConsoleNotifications } from "@/lib/console/api";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const operator = await requireOperator();
  const { items: notifications } = await listConsoleNotifications().catch(() => ({ items: [], unreadCount: 0 }));
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-brand-cream">
      <a
        href="#console-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-brand-navy focus:px-4 focus:py-2 focus:font-ui focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <PlatformRail />

      <div className="flex min-h-screen flex-col md:pl-16">
        <ConcourseHeader operatorName={operator.name} unreadNotifications={unreadNotifications} />
        <main id="console-main" className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      <MobileDispatchBar />
    </div>
  );
}
