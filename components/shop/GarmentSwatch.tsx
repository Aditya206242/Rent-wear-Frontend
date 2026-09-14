import type { GarmentView } from "@/lib/shop/types";

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

const VIEW_LABEL: Record<GarmentView, string> = {
  front: "Front",
  back: "Back",
  fabric: "Fabric",
  model: "Styled",
  detail: "Detail",
};

export function GarmentSwatch({
  colorHex,
  name,
  view = "front",
  className,
}: {
  colorHex: string;
  name: string;
  view?: GarmentView;
  className?: string;
}) {
  const light = isLight(colorHex);
  const ink = light ? "rgba(23,43,77,0.7)" : "rgba(255,255,255,0.85)";
  const inkFaint = light ? "rgba(23,43,77,0.35)" : "rgba(255,255,255,0.4)";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: colorHex }}
      aria-hidden="true"
    >
      {view === "fabric" && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${ink} 0, ${ink} 1px, transparent 1px, transparent 7px)`,
            opacity: 0.12,
          }}
        />
      )}

      <span
        className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wide"
        style={{ color: inkFaint }}
      >
        {VIEW_LABEL[view]}
      </span>

      {view === "model" ? (
        <span
          className="px-6 text-center font-display text-lg font-medium leading-tight"
          style={{ color: ink }}
        >
          {name}
        </span>
      ) : (
        <span className="font-display text-6xl font-medium" style={{ color: ink }}>
          {initial}
        </span>
      )}
    </div>
  );
}
