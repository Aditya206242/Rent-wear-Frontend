import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SEVERITY_ICON, SEVERITY_COLOR, type Severity } from "@/lib/console/severity";

export type ManifestItem = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  meta?: string;
  href?: string;
};

export function ManifestList({ items, emptyLabel }: { items: ManifestItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <p className="border-y border-brand-navy/10 px-4 py-8 text-center font-ui text-sm text-brand-navy/45 md:px-10">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-brand-navy/8 border-y border-brand-navy/10">
      {items.map((item) => {
        const Icon = SEVERITY_ICON[item.severity];
        const color = SEVERITY_COLOR[item.severity];
        const Row = (
          <div className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white md:px-10">
            <span
              className="mt-1.5 h-full w-0.5 self-stretch rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <Icon size={16} strokeWidth={1.5} style={{ color }} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-ui text-sm font-medium text-brand-navy">{item.title}</p>
              <p className="mt-0.5 truncate font-ui text-xs text-brand-navy/55">{item.detail}</p>
            </div>
            {item.meta && (
              <span className="hidden shrink-0 font-mono text-xs text-brand-navy/40 sm:block">{item.meta}</span>
            )}
            {item.href && (
              <ChevronRight
                size={15}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-brand-navy/30 transition-transform group-hover:translate-x-0.5"
              />
            )}
          </div>
        );

        return <li key={item.id}>{item.href ? <Link href={item.href}>{Row}</Link> : Row}</li>;
      })}
    </ul>
  );
}
