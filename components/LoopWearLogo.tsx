const SIZES = {
  sm: { icon: "h-6 w-6", word: "text-base", tagline: "text-[9px] mt-0.5", gap: "gap-1.5" },
  md: { icon: "h-9 w-9", word: "text-2xl", tagline: "text-[10px] mt-1", gap: "gap-2.5" },
  lg: { icon: "h-12 w-12", word: "text-3xl", tagline: "text-xs mt-1", gap: "gap-3" },
} as const;

type LoopWearLogoProps = {
  size?: keyof typeof SIZES;
  showTagline?: boolean;
  className?: string;
};

export function LoopWearLogo({ size = "md", showTagline = true, className }: LoopWearLogoProps) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className ?? ""}`}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`${s.icon} shrink-0`}>
        <path
          d="M12.6 2.6 21.4 11.4a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6Z"
          fill="#172B4D"
          stroke="#D69A2D"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        <circle cx="7.2" cy="7.2" r="1.5" fill="#FDFBF7" />
      </svg>

      <span className="flex flex-col leading-none">
       <span
  className={`font-['Montserrat'] font-extrabold tracking-[-0.04em] leading-none ${s.word}`}
>
  <span className="text-[#172B4D]">Loop</span>
  <span className="text-[#D69A2D]">Wear</span>
</span>
        {showTagline && (
          <span className={`font-medium uppercase tracking-[0.18em] text-neutral-500 ${s.tagline}`}>
            Everyday Apparel
          </span>
        )}
      </span>
    </span>
  );
}
