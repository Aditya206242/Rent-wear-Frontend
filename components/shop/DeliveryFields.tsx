import type { ReactNode } from "react";
import type { DeliveryDetails } from "@/lib/shop/types";

const INPUT_CLASS =
  "mt-1.5 block w-full rounded-lg border border-brand-navy/15 bg-white px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/35 transition-colors focus:border-brand-cyan-deep/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/25";

function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block font-ui text-[12.5px] font-semibold text-brand-navy">
      {label} {optional && <span className="font-normal text-brand-navy/40">(optional)</span>}
      {children}
    </label>
  );
}

/**
 * The full name/phone/email/address block used both at checkout
 * (components/shop/payment/PaymentPanel.tsx) and on the account address page
 * (components/shop/AddressForm.tsx) — one field set, one style, edited once.
 */
export function DeliveryFields({
  value,
  onChange,
}: {
  value: DeliveryDetails;
  onChange: <Key extends keyof DeliveryDetails>(key: Key, value: DeliveryDetails[Key]) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <input required autoComplete="name" value={value.fullName} onChange={(e) => onChange("fullName", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Phone number">
          <input required type="tel" autoComplete="tel" value={value.phone} onChange={(e) => onChange("phone", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Email address">
        <input required type="email" autoComplete="email" value={value.email} onChange={(e) => onChange("email", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <Field label="Address line 1">
        <input required autoComplete="address-line1" placeholder="House / flat number, street" value={value.addressLine1} onChange={(e) => onChange("addressLine1", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <Field label="Address line 2" optional>
        <input autoComplete="address-line2" placeholder="Area, landmark" value={value.addressLine2} onChange={(e) => onChange("addressLine2", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="City">
          <input required autoComplete="address-level2" value={value.city} onChange={(e) => onChange("city", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="State">
          <input required autoComplete="address-level1" value={value.state} onChange={(e) => onChange("state", e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="PIN code">
          <input required inputMode="numeric" autoComplete="postal-code" value={value.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Country">
        <input required autoComplete="country-name" value={value.country} onChange={(e) => onChange("country", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <Field label="Delivery note" optional>
        <textarea value={value.deliveryNote} onChange={(e) => onChange("deliveryNote", e.target.value)} rows={2} placeholder="Delivery instructions or a nearby landmark" className={`resize-y ${INPUT_CLASS}`} />
      </Field>
    </>
  );
}
