import type { SizeOption } from "@/lib/shop/types";

export function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: SizeOption[];
  selected: string | null;
  onSelect: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Size">
      {sizes.map((s) => (
        <button
          key={s.size}
          type="button"
          role="radio"
          aria-checked={selected === s.size}
          disabled={!s.available}
          onClick={() => s.available && onSelect(s.size)}
          title={s.available ? undefined : `${s.size} — currently unavailable`}
          className={`relative min-w-9 border px-2.5 py-1.5 font-mono text-xs font-medium transition-colors ${
            !s.available
              ? "cursor-not-allowed border-brand-navy/10 text-brand-navy/25"
              : selected === s.size
                ? "border-brand-navy bg-brand-navy text-white"
                : "border-brand-navy/20 text-brand-navy hover:border-brand-navy/40"
          }`}
        >
          {s.size}
          {!s.available && (
            <span
              className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-brand-navy/25"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </div>
  );
}
