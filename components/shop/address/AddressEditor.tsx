"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createAddressAction, updateAddressAction } from "@/lib/shop/address-actions";
import type { AddressInput, ApiAddress } from "@/lib/shop/checkout-types";

const INPUT_CLASS =
  "mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/35 transition-colors focus:border-brand-cyan-deep/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/25";

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <label className="block font-ui text-[12.5px] font-semibold text-brand-navy">
      {label} {optional && <span className="font-normal text-brand-navy/40">(optional)</span>}
      {children}
      {error && <span className="mt-1 block font-normal text-signal-danger">{error}</span>}
    </label>
  );
}

const EMPTY: AddressInput = { label: "Home", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", postalCode: "" };

function toInput(a: ApiAddress): AddressInput {
  return {
    label: a.label,
    fullName: a.fullName,
    phone: a.phone.replace(/^\+91/, ""),
    line1: a.line1,
    line2: a.line2 ?? "",
    landmark: a.landmark ?? "",
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
  };
}

/** The backend sends zod's flatten() shape: { fieldErrors: { field: string[] } }. */
function fieldErrorsFrom(details: unknown): Record<string, string> {
  const fe = (details as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors;
  if (!fe) return {};
  return Object.fromEntries(Object.entries(fe).filter(([, v]) => v?.[0]).map(([k, v]) => [k, v[0]]));
}

/**
 * Create or edit a saved address. Validation that matters (PIN format,
 * state, phone) happens on the backend; its per-field messages are shown
 * inline next to the offending input.
 */
export function AddressEditor({
  states,
  address,
  defaultName,
  makeDefault,
  onSaved,
  onCancel,
}: {
  states: string[];
  address?: ApiAddress;
  defaultName?: string;
  makeDefault?: boolean;
  onSaved: (address: ApiAddress) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<AddressInput>(address ? toInput(address) : { ...EMPTY, fullName: defaultName ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function submit() {
    setFormError(null);
    startTransition(async () => {
      const payload: AddressInput = { ...form, ...(makeDefault ? { isDefault: true } : {}) };
      const res = address ? await updateAddressAction(address.id, payload) : await createAddressAction(payload);
      if (res.ok) {
        onSaved(res.data);
        return;
      }
      const fieldErrors = fieldErrorsFrom(res.details);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(res.error);
    });
  }

  const border = (key: string) => (errors[key] ? "border-signal-danger/60" : "border-brand-navy/15");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Address type">
        {["Home", "Work", "Other"].map((label) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={form.label === label}
            onClick={() => update("label", label)}
            className={`rounded-full border px-3.5 py-1 font-ui text-xs font-medium transition-colors ${
              form.label === label ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/15 text-brand-navy/65 hover:border-brand-navy/35"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName}>
          <input required autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={`${INPUT_CLASS} ${border("fullName")}`} />
        </Field>
        <Field label="Mobile number" error={errors.phone}>
          <div className={`mt-1.5 flex items-center rounded-lg border bg-white ${border("phone")}`}>
            <span className="pl-3.5 font-ui text-sm text-brand-navy/50">+91</span>
            <input
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="block w-full rounded-lg bg-transparent px-2 py-2.5 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none"
            />
          </div>
        </Field>
      </div>

      <Field label="House / flat, building, street" error={errors.line1}>
        <input required autoComplete="address-line1" value={form.line1} onChange={(e) => update("line1", e.target.value)} className={`${INPUT_CLASS} ${border("line1")}`} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Area / locality" optional error={errors.line2}>
          <input autoComplete="address-line2" value={form.line2} onChange={(e) => update("line2", e.target.value)} className={`${INPUT_CLASS} ${border("line2")}`} />
        </Field>
        <Field label="Landmark" optional error={errors.landmark}>
          <input value={form.landmark} onChange={(e) => update("landmark", e.target.value)} className={`${INPUT_CLASS} ${border("landmark")}`} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="PIN code" error={errors.postalCode}>
          <input
            required
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, ""))}
            className={`${INPUT_CLASS} ${border("postalCode")}`}
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input required autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} className={`${INPUT_CLASS} ${border("city")}`} />
        </Field>
        <Field label="State" error={errors.state}>
          {states.length > 0 ? (
            <select required value={form.state} onChange={(e) => update("state", e.target.value)} className={`${INPUT_CLASS} ${border("state")}`}>
              <option value="">Select…</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input required autoComplete="address-level1" value={form.state} onChange={(e) => update("state", e.target.value)} className={`${INPUT_CLASS} ${border("state")}`} />
          )}
        </Field>
      </div>

      {formError && (
        <p role="alert" className="font-ui text-sm text-signal-danger">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-50"
        >
          {isPending ? "Saving…" : address ? "Save changes" : "Save address"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="font-ui text-sm font-medium text-brand-navy/60 hover:text-brand-navy">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
