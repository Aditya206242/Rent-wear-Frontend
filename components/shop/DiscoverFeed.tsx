import { ProductTicket } from "./ProductTicket";
import { OutfitSpread } from "./OutfitSpread";
import type { Garment, Outfit } from "@/lib/shop/types";

type ResolvedOutfit = { outfit: Outfit; garments: Garment[] };

export function DiscoverFeed({ garments, outfits }: { garments: Garment[]; outfits: ResolvedOutfit[] }) {
  if (garments.length === 0) {
    return (
      <div className="px-4 py-20 text-center md:px-10">
        <p className="font-display text-xl text-brand-navy">Nothing in this edit yet.</p>
        <p className="mt-2 font-ui text-sm text-brand-navy/55">Try a different occasion, or browse everything.</p>
      </div>
    );
  }

  // Outfit spreads are full-width blocks inserted between garment rows —
  // never mixed into the same row as single-span cards. Group size must
  // divide evenly by the widest column count (4) or the last row of a
  // group leaves dangling empty cells at that breakpoint.
  const groupSize = 4;
  const groups: Garment[][] = [];
  for (let i = 0; i < garments.length; i += groupSize) groups.push(garments.slice(i, i + groupSize));

  return (
    <div className="space-y-px">
      {groups.map((group, i) => (
        <div key={i}>
          {outfits[i] && (
            <div className="mb-px grid grid-cols-1">
              <OutfitSpread outfit={outfits[i].outfit} garments={outfits[i].garments} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-px bg-brand-navy/10 sm:grid-cols-2 lg:grid-cols-4">
            {group.map((g) => (
              <div key={g.id} className="bg-brand-cream">
                <ProductTicket garment={g} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
