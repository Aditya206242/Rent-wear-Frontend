import { MapPin } from "lucide-react";
import { AddressForm } from "@/components/shop/AddressForm";

export const metadata = { title: "Saved address — LoopWear" };

export default function AddressPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-0">
      <h1 className="font-display text-3xl font-medium text-brand-navy">Saved Address</h1>
      <p className="mt-2 font-ui text-sm text-brand-navy/55">
        Manage your delivery location — saved on this device and filled in automatically at checkout.
      </p>

      <div className="mt-8 rounded-xl border border-brand-navy/10 bg-white px-6 py-6 sm:px-7 sm:py-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan-deep">
            <MapPin size={17} strokeWidth={1.8} />
          </span>
          <p className="font-ui text-sm font-semibold text-brand-navy">Delivery details</p>
        </div>
        <AddressForm />
      </div>
    </div>
  );
}
