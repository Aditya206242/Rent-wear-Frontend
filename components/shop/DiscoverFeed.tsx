import { ProductTicket } from "./ProductTicket";
import { OutfitSpread } from "./OutfitSpread";
import type { Garment, Outfit } from "@/lib/shop/types";

type ResolvedOutfit = { outfit: Outfit; garments: Garment[] };

/**
 * Editorial rhythm for the feed grid: most tiles are plain portrait cards,
 * but every 6th becomes a wide two-column "hero" and every 3rd offset gets
 * a shorter landscape crop. Keeps the grid from reading as a uniform wall
 * of identical cards while still tiling cleanly at every breakpoint.
 */
function tileLayout(index: number): { aspect: "portrait" | "wide"; span: boolean } {
  const cyclePos = index % 6;
  if (cyclePos === 0) return { aspect: "wide", span: true };
  if (cyclePos === 3) return { aspect: "wide", span: false };
  return { aspect: "portrait", span: false };
}

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
          {/* Each ProductTicket already carries its own border, so the grid
              itself needs no gap-line background — that trick left the
              trailing empty tracks of a partial last row (fewer than 4
              items) showing as a solid tinted block. items-start plus the
              per-tile aspect/span variation below is what gives the feed
              its asymmetric, editorial feel instead of a uniform grid —
              dense flow lets normal tiles backfill the gaps hero/landscape
              tiles leave behind. */}
          <div className="grid grid-cols-1 items-start gap-4 grid-flow-dense sm:grid-cols-2 lg:grid-cols-4">
            {group.map((g, gj) => {
              const { aspect, span } = tileLayout(i * groupSize + gj);
              return (
                <ProductTicket key={g.id} garment={g} aspect={aspect} className={span ? "sm:col-span-2" : undefined} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
