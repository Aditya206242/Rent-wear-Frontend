import type { ApiAddress } from "@/lib/shop/checkout-types";

export function formatPhone(phone: string) {
  const m = phone.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

/** The read-only block of an address, shared by checkout and the address book. */
export function AddressSummary({ address }: { address: ApiAddress }) {
  return (
    <div className="font-ui text-sm">
      <p className="flex items-center gap-2 font-semibold text-brand-navy">
        {address.fullName}
        <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-brand-navy/55">{address.label}</span>
        {address.isDefault && <span className="text-[11px] font-medium text-brand-cyan-deep">Default</span>}
      </p>
      <p className="mt-1 text-brand-navy/65">
        {[address.line1, address.line2, address.landmark && `Near ${address.landmark}`].filter(Boolean).join(", ")}
      </p>
      <p className="text-brand-navy/65">
        {address.city}, {address.state} {address.postalCode}
      </p>
      <p className="mt-1 text-brand-navy/50">{formatPhone(address.phone)}</p>
    </div>
  );
}
