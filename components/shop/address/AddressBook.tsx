"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { AddressEditor } from "./AddressEditor";
import { AddressSummary } from "./AddressSummary";
import { deleteAddressAction, listAddressesAction, setDefaultAddressAction } from "@/lib/shop/address-actions";
import { useShopCart } from "@/lib/shop/cart-context";
import type { ApiAddress } from "@/lib/shop/checkout-types";

/** Account → Saved addresses. The same book checkout picks from. */
export function AddressBook({ initial, states, defaultName }: { initial: ApiAddress[]; states: string[]; defaultName: string }) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(initial.length === 0 ? "new" : null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { refreshAddresses } = useShopCart();

  function reload() {
    startTransition(async () => {
      const res = await listAddressesAction();
      if (res.ok) setAddresses(res.data);
      await refreshAddresses();
    });
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      reload();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="font-ui text-sm text-signal-danger">
          {error}
        </p>
      )}

      {addresses.map((address) =>
        editing === address.id ? (
          <div key={address.id} className="rounded-xl border border-brand-cyan-deep/40 bg-white px-6 py-6">
            <AddressEditor
              states={states}
              address={address}
              onSaved={() => {
                setEditing(null);
                reload();
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <div key={address.id} className="flex flex-col gap-4 rounded-xl border border-brand-navy/10 bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <AddressSummary address={address} />
            <div className={`flex shrink-0 gap-4 font-ui text-xs font-semibold ${isPending ? "pointer-events-none opacity-50" : ""}`}>
              {!address.isDefault && (
                <button type="button" onClick={() => run(() => setDefaultAddressAction(address.id))} className="text-brand-cyan-deep hover:underline">
                  Set as default
                </button>
              )}
              <button type="button" onClick={() => setEditing(address.id)} className="text-brand-navy/70 hover:text-brand-navy">
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this address?")) run(() => deleteAddressAction(address.id));
                }}
                className="text-brand-navy/50 hover:text-signal-danger"
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}

      {editing === "new" ? (
        <div className="rounded-xl border border-brand-navy/10 bg-white px-6 py-6">
          <p className="mb-4 font-ui text-sm font-semibold text-brand-navy">New address</p>
          <AddressEditor
            states={states}
            defaultName={defaultName}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
            onCancel={addresses.length > 0 ? () => setEditing(null) : undefined}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-navy/25 py-4 font-ui text-sm font-semibold text-brand-navy/70 transition-colors hover:border-brand-cyan-deep/50 hover:text-brand-navy"
        >
          <Plus size={16} strokeWidth={1.75} /> Add a new address
        </button>
      )}
    </div>
  );
}
