import { ProductTicket } from "@/components/shop/ProductTicket";
import { fetchWishlistAction } from "@/lib/shop/cart-actions";
import { getProduct } from "@/lib/shop/api";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Wishlist — LoopWear" };

export default async function WishlistPage() {
  await requireUser("/wishlist");

  const { items } = await fetchWishlistAction();
  const resolved = await Promise.all(items.map((item) => getProduct(item.productId)));
  const saved = resolved.filter((r): r is NonNullable<typeof r> => r !== null).map((r) => r.garment);

  return (
    <div>
      <div className="border-b border-brand-navy/10 px-4 pt-8 pb-6 md:px-10">
        <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">Saved</p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-navy">Your wishlist</h1>
      </div>

      {saved.length === 0 ? (
        <p className="px-4 py-20 text-center font-ui text-sm text-brand-navy/55 md:px-10">
          Nothing saved yet — tap the heart on any garment while browsing.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-10 lg:grid-cols-4">
          {saved.map((g) => (
            <ProductTicket key={g.id} garment={g} />
          ))}
        </div>
      )}
    </div>
  );
}
