import type { ReactNode } from "react";
import { ShopProvider } from "@/lib/shop/cart-context";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { getSession } from "@/lib/auth/session";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  return (
    <ShopProvider isAuthenticated={!!user}>
      <div className="flex min-h-screen flex-col bg-brand-cream">
        <ShopHeader user={user} />
        <main className="flex-1">{children}</main>
        <ShopFooter />
      </div>
    </ShopProvider>
  );
}
