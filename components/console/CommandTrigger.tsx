"use client";

import { OPEN_COMMAND_EVENT } from "./CommandPalette";

export function CommandTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT, { detail: { source: e.currentTarget } }))}
      className={className}
    >
      {children ?? (
        <>
          Search
          <kbd className="font-mono text-[10px] text-brand-navy/40">⌘K</kbd>
        </>
      )}
    </button>
  );
}
