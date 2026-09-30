"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddressEditor } from "@/components/shop/address/AddressEditor";
import { AddressSummary } from "@/components/shop/address/AddressSummary";
import type { ApiAddress } from "@/lib/shop/checkout-types";

/** Pick a saved address, edit one, or add a new one (saved to the account). */
export function AddressStep({
  addresses,
  selectedId,
  states,
  customerName,
  onSelect,
  onSaved,
  onContinue,
}: {
  addresses: ApiAddress[];
  selectedId: string | null;
  states: string[];
  customerName: string;
  onSelect: (id: string) => void;
  onSaved: (address: ApiAddress) => void;
  onContinue: () => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(addresses.length === 0 ? "new" : null);

  return (
    <div className="space-y-3">
      {addresses.map((address) =>
        editing === address.id ? (
          <div key={address.id} className="rounded-lg border border-brand-cyan-deep/40 px-5 py-5">
            <AddressEditor
              states={states}
              address={address}
              onSaved={(saved) => {
                setEditing(null);
                onSaved(saved);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <label
            key={address.id}
            className={`flex cursor-pointer gap-3 rounded-lg border px-4 py-4 transition-colors ${
              selectedId === address.id ? "border-brand-cyan-deep/60 bg-brand-cyan/5" : "border-brand-navy/12 hover:border-brand-navy/30"
            }`}
          >
            <input
              type="radio"
              name="address"
              checked={selectedId === address.id}
              onChange={() => onSelect(address.id)}
              className="mt-1 h-4 w-4 accent-[var(--color-brand-cyan-deep)]"
            />
            <div className="min-w-0 flex-1">
              <AddressSummary address={address} />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setEditing(address.id);
              }}
              className="self-start font-ui text-xs font-semibold text-brand-cyan-deep hover:underline"
            >
              Edit
            </button>
          </label>
        )
      )}

      {editing === "new" ? (
        <div className="rounded-lg border border-brand-navy/12 px-5 py-5">
          <p className="mb-4 font-ui text-sm font-semibold text-brand-navy">{addresses.length === 0 ? "Where should we deliver?" : "New address"}</p>
          <AddressEditor
            states={states}
            defaultName={customerName}
            makeDefault={addresses.length === 0}
            onSaved={(saved) => {
              setEditing(null);
              onSaved(saved);
            }}
            onCancel={addresses.length > 0 ? () => setEditing(null) : undefined}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-navy/25 py-3 font-ui text-sm font-semibold text-brand-navy/70 transition-colors hover:border-brand-cyan-deep/50 hover:text-brand-navy"
        >
          <Plus size={15} strokeWidth={1.75} /> Add a new address
        </button>
      )}

      {editing === null && selectedId && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-lg bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark"
        >
          Deliver here
        </button>
      )}
    </div>
  );
}
