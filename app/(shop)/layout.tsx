import type { ReactNode } from "react";
import { ShopProvider } from "@/lib/shop/cart-context";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { getSession } from "@/lib/auth/session";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  return (
    <ShopProvider isAuthenticated={!!user}>
      <div className="min-h-screen bg-brand-cream">
        <ShopHeader user={user} />
        <main>{children}</main>
      </div>
    </ShopProvider>
  );
}
