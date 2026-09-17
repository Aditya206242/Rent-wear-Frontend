"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function OrderSortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeSort(nextSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    router.push(`/account/orders?${params.toString()}`);
  }

  return (
    <label className="relative w-32 shrink-0">
      <select
        value={value}
        onChange={(event) => changeSort(event.target.value)}
        aria-label="Order sorting"
        className="h-9 w-full appearance-none rounded-lg border border-brand-navy/15 bg-white py-2 pl-3 pr-7 font-ui text-xs text-brand-navy transition-colors hover:border-brand-navy/30 focus:border-brand-navy/30"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      <ChevronDown size={13} strokeWidth={1.75} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-navy/45" />
    </label>
  );
}
