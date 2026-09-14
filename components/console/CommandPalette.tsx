"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS } from "@/lib/console/platforms";

export const OPEN_COMMAND_EVENT = "open-console-command";

type CommandItem = {
  id: string;
  group: "Quick action" | "Platform";
  label: string;
  code: string;
  href: string;
};

const QUICK_ACTIONS: CommandItem[] = [
  { id: "qa-order", group: "Quick action", label: "Create a new order", code: "ORD", href: "/orders" },
  { id: "qa-pickup", group: "Quick action", label: "Schedule a pickup", code: "DLV", href: "/delivery" },
  { id: "qa-return", group: "Quick action", label: "Log a garment return", code: "INV", href: "/inventory" },
  { id: "qa-batch", group: "Quick action", label: "Start a laundry batch", code: "LDY", href: "/laundry" },
];

const NAV_ITEMS: CommandItem[] = PLATFORMS.map((p) => ({
  id: `nav-${p.href}`,
  group: "Platform",
  label: p.label,
  code: p.number,
  href: p.href,
}));

const ALL_ITEMS: CommandItem[] = [...QUICK_ACTIONS, ...NAV_ITEMS];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggeredByRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter((item) => item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q));
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    triggeredByRef.current?.focus();
  }, []);

  const activate = useCallback(
    (item: CommandItem) => {
      close();
      router.push(item.href);
    },
    [close, router]
  );

  useEffect(() => {
    function onOpenEvent(e: Event) {
      triggeredByRef.current = (e as CustomEvent<{ source?: HTMLElement }>).detail?.source ?? (document.activeElement as HTMLElement);
      setOpen(true);
    }
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        triggeredByRef.current = document.activeElement as HTMLElement;
        setOpen((prev) => !prev);
      } else if (e.key === "Escape" && open) {
        close();
      }
    }
    function onOutside(e: MouseEvent) {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) close();
    }
    window.addEventListener(OPEN_COMMAND_EVENT, onOpenEvent);
    window.addEventListener("keydown", onKeydown);
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpenEvent);
      window.removeEventListener("keydown", onKeydown);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const groups = [
    { name: "Quick action" as const, items: results.filter((r) => r.group === "Quick action") },
    { name: "Platform" as const, items: results.filter((r) => r.group === "Platform") },
  ];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Console board"
      className="absolute inset-x-0 top-full z-[60] border-b border-brand-navy/10 bg-white shadow-[0_16px_32px_-24px_rgba(23,43,77,0.3)] md:left-16"
      style={{ animation: "rise-in 140ms ease-out" }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results[activeIndex]) {
          e.preventDefault();
          activate(results[activeIndex]);
        }
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-3 md:px-8">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search platforms, orders, customers, garments…"
          aria-label="Search the console"
          className="w-full border-b border-brand-navy/15 bg-transparent py-2 font-ui text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-gold focus:outline-none"
        />

        {results.length === 0 ? (
          <p className="py-6 text-center font-ui text-sm text-brand-navy/50">No matches on this board.</p>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.name} className="mb-3 last:mb-0">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-brand-navy/40">
                      {group.name === "Quick action" ? "Quick actions" : "Platforms"}
                    </p>
                    <ul role="listbox" aria-label={group.name}>
                      {group.items.map((item) => {
                        const i = results.indexOf(item);
                        const isActive = i === activeIndex;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setActiveIndex(i)}
                              onClick={() => activate(item)}
                              className={`flex w-full items-baseline gap-2 py-1.5 text-left font-ui text-sm transition-colors ${
                                isActive ? "text-brand-gold-deep" : "text-brand-navy/80"
                              }`}
                            >
                              <span className="shrink-0">{item.label}</span>
                              <span
                                aria-hidden="true"
                                className="min-w-0 flex-1 -translate-y-0.75 border-b border-dotted border-brand-navy/25"
                              />
                              <span className="shrink-0 font-mono text-xs tabular-nums text-brand-navy/45">
                                {item.code}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
