import { CheckoutFlow } from "@/components/shop/checkout/CheckoutFlow";
import { requireUser } from "@/lib/auth/session";
import { fetchIndianStatesAction } from "@/lib/shop/address-actions";

export const metadata = { title: "Checkout — LoopWear" };

// Checkout gate: middleware already sends cookie-less visitors to sign-in;
// requireUser also catches an expired/revoked session and returns the
// shopper here (redirectTo) once they've signed in again.
export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const states = await fetchIndianStatesAction();
  return <CheckoutFlow states={states} customerName={user.name} />;
}
