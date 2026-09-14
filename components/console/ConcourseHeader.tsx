import Link from "next/link";
import { Plus } from "lucide-react";
import { LoopWearLogo } from "@/components/LoopWearLogo";
import { SectionTitle } from "./SectionTitle";
import { AnnouncementTicker } from "./AnnouncementTicker";
import { CommandTrigger } from "./CommandTrigger";
import { LiveClock } from "./LiveClock";
import { CommandPalette } from "./CommandPalette";
import { LogoutButton } from "./LogoutButton";
import type { Notification } from "@/lib/console/types";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "OP";
}

export function ConcourseHeader({
  operatorName,
  unreadNotifications,
}: {
  operatorName: string;
  unreadNotifications: Notification[];
}) {
  const unread = unreadNotifications.length;

  return (
    <header className="sticky top-0 z-20 border-b border-brand-navy/10 bg-brand-cream/95 backdrop-blur-sm">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/overview" className="hidden shrink-0 lg:block">
            <LoopWearLogo size="sm" showTagline={false} />
          </Link>
          <div className="hidden h-8 w-px shrink-0 bg-brand-navy/10 lg:block" aria-hidden="true" />
          <SectionTitle />
        </div>

        <div className="hidden min-w-0 justify-center xl:flex">
          <AnnouncementTicker items={unreadNotifications} />
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <CommandTrigger className="hidden items-baseline gap-1.5 font-ui text-sm text-brand-navy/55 transition-colors hover:text-brand-navy sm:flex" />

          <Link
            href="/orders"
            className="hidden items-center gap-1.5 bg-brand-gold px-3 py-1.5 font-ui text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-light md:flex"
          >
            <Plus size={15} strokeWidth={2} />
            Dispatch
          </Link>

          <Link
            href="/notifications"
            className="hidden whitespace-nowrap font-ui text-sm text-brand-navy/55 transition-colors hover:text-brand-navy sm:block"
          >
            {unread > 0 ? (
              <>
                <span className="font-mono font-semibold text-brand-gold-deep">{unread}</span> unread
              </>
            ) : (
              "No alerts"
            )}
          </Link>

          <div className="hidden h-8 w-px bg-brand-navy/10 sm:block" aria-hidden="true" />

          <LiveClock />

          <Link
            href="/settings"
            className="flex shrink-0 items-baseline gap-1.5 font-mono text-xs text-brand-navy/60 transition-colors hover:text-brand-navy"
            title={`${operatorName} — on shift`}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal-success" />
            OPERATOR · {initialsOf(operatorName)}
          </Link>

          <LogoutButton />
        </div>
      </div>

      <CommandPalette />
    </header>
  );
}
