"use client";

import { useEffect, useRef, useState } from "react";
import { useShopCart } from "@/lib/shop/cart-context";
import { DeliveryFields } from "./DeliveryFields";
import type { DeliveryDetails } from "@/lib/shop/types";

const EMPTY: DeliveryDetails = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  deliveryNote: "",
};

export function AddressForm() {
  const { address, saveAddress } = useShopCart();
  const [form, setForm] = useState<DeliveryDetails>(address ?? EMPTY);
  const [saved, setSaved] = useState(false);
  const loadedSavedAddress = useRef(false);

  // address comes from localStorage a tick after mount (ShopProvider), so
  // pick it up once it arrives rather than only at the (still-empty)
  // initial render — but only the first time, so it doesn't overwrite typing.
  useEffect(() => {
    if (address && !loadedSavedAddress.current) {
      loadedSavedAddress.current = true;
      setForm(address);
    }
  }, [address]);

  function update<Key extends keyof DeliveryDetails>(key: Key, value: DeliveryDetails[Key]) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        saveAddress(form);
        setSaved(true);
      }}
    >
      <DeliveryFields value={form} onChange={update} />

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="cursor-pointer rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark">
          Save address
        </button>
        {saved && <p className="font-ui text-xs text-brand-cyan-deep">Saved — we&apos;ll use this at your next checkout.</p>}
      </div>
    </form>
  );
}
