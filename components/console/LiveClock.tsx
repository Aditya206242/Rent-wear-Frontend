"use client";

import { useEffect, useState } from "react";

function format(date: Date) {
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const day = date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
  return { time, day };
}

export function LiveClock() {
  // Starts unmounted (null) so the server-rendered markup and the first
  // client render are byte-identical — Node's ICU formats midnight as
  // "24:xx" under some builds while browsers format it as "00:xx" for the
  // same hour12:false option, which would otherwise trip a hydration
  // mismatch. The real time appears a tick after mount.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { time, day } = now ? format(now) : { time: "", day: "" };

  return (
    <div className="flex min-w-16 items-baseline gap-1.5 font-mono text-brand-navy">
      <span className="text-sm tabular-nums">{time}</span>
      <span className="text-[10px] uppercase tracking-wide text-brand-navy/45">{day}</span>
    </div>
  );
}
