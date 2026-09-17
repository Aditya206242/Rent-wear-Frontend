import { OutfitSpread } from "@/components/shop/OutfitSpread";
import { listOutfits } from "@/lib/shop/api";

export const metadata = { title: "Looks — LoopWear" };

export default async function LooksPage() {
  const outfits = await listOutfits().catch(() => []);

  return (
    <div>
      <div className="border-b border-brand-navy/10 px-4 pt-8 pb-6 md:px-10">
        <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">Complete outfits</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">Looks</h1>
        <p className="mt-2 max-w-lg font-ui text-sm text-brand-navy/55">
          Pre-styled sets — rent the whole thing in one line, or open a piece to swap it out.
        </p>
      </div>

      {outfits.length === 0 ? (
        <p className="px-4 py-16 text-center font-ui text-sm text-brand-navy/55 md:px-10">
          No looks to show right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-10">
          {outfits.map(({ outfit, garments }) => (
            <OutfitSpread key={outfit.id} outfit={outfit} garments={garments} />
          ))}
        </div>
      )}
    </div>
  );
}
