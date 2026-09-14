"use client";

import { useState } from "react";
import { GarmentSwatch } from "./GarmentSwatch";
import type { GarmentView } from "@/lib/shop/types";

export function ImageFilmstrip({ colorHex, name, views }: { colorHex: string; name: string; views: GarmentView[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-[4/5] w-full">
        <GarmentSwatch colorHex={colorHex} name={name} view={views[active]} />
      </div>
      <div className="mt-2 flex gap-2">
        {views.map((view, i) => (
          <button
            key={view}
            type="button"
            onClick={() => setActive(i)}
            aria-current={active === i}
            aria-label={`Show ${view} view`}
            className={`h-16 w-14 shrink-0 border-2 transition-colors ${
              active === i ? "border-brand-gold" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <GarmentSwatch colorHex={colorHex} name={name} view={view} />
          </button>
        ))}
      </div>
    </div>
  );
}
