import { MapPin } from "lucide-react";
import { AddressBook } from "@/components/shop/address/AddressBook";
import { requireUser } from "@/lib/auth/session";
import { fetchIndianStatesAction, listAddressesAction } from "@/lib/shop/address-actions";

export const metadata = { title: "Saved addresses — LoopWear" };

export default async function AddressPage() {
  const user = await requireUser("/account/address");
  const [addresses, states] = await Promise.all([listAddressesAction(), fetchIndianStatesAction()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-0">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan-deep">
          <MapPin size={17} strokeWidth={1.8} />
        </span>
        <h1 className="font-display text-3xl font-medium text-brand-navy">Saved addresses</h1>
      </div>
      <p className="mt-2 font-ui text-sm text-brand-navy/55">Saved to your account and offered at checkout. We deliver anywhere in India.</p>

      <div className="mt-8">
        {addresses.ok ? (
          <AddressBook initial={addresses.data} states={states} defaultName={user.name} />
        ) : (
          <p role="alert" className="font-ui text-sm text-signal-danger">
            {addresses.error}
          </p>
        )}
      </div>
    </div>
  );
}
