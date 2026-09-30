import { Check, CircleSlash } from "lucide-react";
import type { ApiTimeline } from "@/lib/shop/checkout-types";

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Progress steps with the real time each was reached (from the order's event history). */
export function OrderTimeline({ timeline }: { timeline: ApiTimeline }) {
  if (timeline.terminal) {
    return (
      <div className="flex gap-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-danger/15 text-signal-danger">
          <CircleSlash size={12} strokeWidth={2.5} />
        </span>
        <div>
          <p className="font-ui text-[13.5px] font-semibold text-brand-navy">{timeline.terminal.label}</p>
          {timeline.terminal.message && <p className="mt-0.5 font-ui text-xs text-brand-navy/55">{timeline.terminal.message}</p>}
          {timeline.terminal.at && <p className="mt-0.5 font-ui text-xs text-brand-navy/40">{when(timeline.terminal.at)}</p>}
        </div>
      </div>
    );
  }

  return (
    <ol>
      {timeline.steps.map((step, i) => {
        const done = step.state === "done";
        const current = step.state === "current";
        const last = i === timeline.steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  done ? "bg-emerald-600" : current ? "bg-brand-cyan ring-4 ring-brand-cyan/20" : "border-2 border-brand-navy/15 bg-white"
                }`}
              >
                {done && <Check size={11} strokeWidth={3} className="text-white" />}
                {current && <span className="h-1.5 w-1.5 rounded-full bg-brand-navy-dark" />}
              </span>
              {!last && <span className={`w-px flex-1 ${done ? "bg-emerald-600" : "bg-brand-navy/15"}`} style={{ minHeight: 32 }} />}
            </div>
            <div className={last ? "pb-0" : "pb-6"}>
              <p className={`font-ui text-[13.5px] font-semibold ${done || current ? "text-brand-navy" : "text-brand-navy/45"}`}>{step.label}</p>
              <p className="mt-0.5 font-ui text-xs text-brand-navy/45">{step.at ? when(step.at) : step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
