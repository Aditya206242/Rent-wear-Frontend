"use client";

import { useState } from "react";

export function TextToggle({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);

  return (
    <div className="flex items-start justify-between gap-6 border-t border-brand-navy/8 py-4 first:border-t-0">
      <div>
        <p className="font-ui text-sm font-medium text-brand-navy">{label}</p>
        <p className="mt-0.5 font-ui text-xs text-brand-navy/50">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`shrink-0 font-mono text-xs font-semibold uppercase tracking-wide ${
          on ? "text-brand-gold-deep" : "text-brand-navy/35"
        }`}
      >
        {on ? "On" : "Off"}
      </button>
    </div>
  );
}
