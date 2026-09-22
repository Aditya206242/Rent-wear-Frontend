import { addStockAction } from "@/lib/console/product-actions";
import type { Facility } from "@/lib/console/types";

const INPUT_CLASS =
  "mt-1 block w-full border-b border-brand-navy/20 bg-transparent px-1 py-2 font-ui text-sm text-brand-navy placeholder:text-brand-navy/35 focus:border-brand-navy focus:outline-none";

/** Adds one physical GarmentUnit (a SKU + size) to a product's stock. */
export function StockPanel({ productId, facilities }: { productId: string; facilities: Facility[] }) {
  const addStock = addStockAction.bind(null, productId);

  return (
    <form action={addStock} className="grid gap-3 sm:grid-cols-4 sm:items-end">
      <label className="block">
        <span className="font-ui text-xs font-medium uppercase tracking-wide text-brand-navy/55">SKU</span>
        <input name="sku" required placeholder="BLZ-NVY-M-01" className={INPUT_CLASS} />
      </label>
      <label className="block">
        <span className="font-ui text-xs font-medium uppercase tracking-wide text-brand-navy/55">Size</span>
        <input name="size" required placeholder="M" className={INPUT_CLASS} />
      </label>
      <label className="block">
        <span className="font-ui text-xs font-medium uppercase tracking-wide text-brand-navy/55">Facility</span>
        <select name="facilityId" defaultValue="" className={INPUT_CLASS}>
          <option value="">Unassigned</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="border border-brand-navy px-4 py-2 font-ui text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
      >
        Add unit
      </button>
    </form>
  );
}
