"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { createProductAction, updateProductAction, type ProductActionState } from "@/lib/console/product-actions";
import type { AdminProduct, ProductView } from "@/lib/console/types";

const INPUT_CLASS =
  "mt-1 block w-full border-b border-brand-navy/20 bg-transparent px-1 py-2 font-ui text-sm text-brand-navy placeholder:text-brand-navy/35 transition-colors focus:border-brand-navy focus:outline-none";

const VIEW_LABELS: Record<ProductView, string> = {
  front: "Front",
  back: "Back",
  fabric: "Fabric close-up",
  model: "On model",
  detail: "Detail",
};

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-ui text-xs font-medium uppercase tracking-wide text-brand-navy/55">
        {label} {optional && <span className="normal-case text-brand-navy/35">(optional)</span>}
      </span>
      {children}
      {error && <p className="mt-1 font-ui text-xs text-signal-danger">{error}</p>}
    </label>
  );
}

function SaveButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="border border-brand-navy bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

const initialState: ProductActionState = {};

/**
 * One form for both create and edit — pass `product` for edit (its values
 * become the field defaults and submits go through updateProductAction
 * bound to its id); omit it for create.
 */
export function ProductForm({ product }: { product?: AdminProduct }) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction] = useActionState(action, initialState);

  const measurementsText = product?.measurements.map((m) => `${m.label}: ${m.value}`).join("\n") ?? "";

  return (
    <form action={formAction} className="space-y-6 p-4 md:p-10" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={state.fieldErrors?.name}>
          <input name="name" required defaultValue={product?.name} className={INPUT_CLASS} />
        </Field>
        <Field label="Brand" error={state.fieldErrors?.brand}>
          <input name="brand" required defaultValue={product?.brand} className={INPUT_CLASS} />
        </Field>
        <Field label="Category" error={state.fieldErrors?.category}>
          <input name="category" required defaultValue={product?.category} className={INPUT_CLASS} />
        </Field>
        <Field label="Fabric" error={state.fieldErrors?.fabric}>
          <input name="fabric" required defaultValue={product?.fabric} className={INPUT_CLASS} />
        </Field>
        <Field label="Color name" error={state.fieldErrors?.color}>
          <input name="color" required defaultValue={product?.color} className={INPUT_CLASS} />
        </Field>
        <Field label="Color hex" error={state.fieldErrors?.colorHex}>
          <input name="colorHex" required placeholder="#1B2340" defaultValue={product?.colorHex} className={INPUT_CLASS} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Occasions" optional>
          <input
            name="occasions"
            placeholder="Wedding, Party"
            defaultValue={product?.occasions.join(", ")}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Styles" optional>
          <input
            name="styles"
            placeholder="Formal, Minimal"
            defaultValue={product?.styles.join(", ")}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Care instructions" optional>
        <input
          name="care"
          placeholder="Dry clean only, Iron on low"
          defaultValue={product?.care.join(", ")}
          className={INPUT_CLASS}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Rent price (₹)" error={state.fieldErrors?.rentPricePaise}>
          <input name="rentPrice" type="number" min={0} step={1} required defaultValue={product?.rentPrice} className={INPUT_CLASS} />
        </Field>
        <Field label="Rent days" error={state.fieldErrors?.rentDays}>
          <input name="rentDays" type="number" min={0} step={1} required defaultValue={product?.rentDays} className={INPUT_CLASS} />
        </Field>
        <Field label="Buy price (₹)" error={state.fieldErrors?.buyPricePaise}>
          <input name="buyPrice" type="number" min={0} step={1} required defaultValue={product?.buyPrice} className={INPUT_CLASS} />
        </Field>
        <Field label="Deposit (₹)" error={state.fieldErrors?.depositPaise}>
          <input name="deposit" type="number" min={0} step={1} required defaultValue={product?.deposit} className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="Delivery days" error={state.fieldErrors?.deliveryDays}>
        <input
          name="deliveryDays"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={product?.deliveryDays}
          className={`${INPUT_CLASS} sm:max-w-32`}
        />
      </Field>

      <div>
        <p className="font-ui text-xs font-medium uppercase tracking-wide text-brand-navy/55">Image URLs (optional per view)</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(Object.keys(VIEW_LABELS) as ProductView[]).map((view) => (
            <label key={view} className="block">
              <span className="font-ui text-[11px] text-brand-navy/50">{VIEW_LABELS[view]}</span>
              <input
                name={`imageUrl_${view}`}
                type="url"
                placeholder="https://…"
                defaultValue={product?.imageUrls[view]}
                className={INPUT_CLASS}
              />
            </label>
          ))}
        </div>
      </div>

      <Field label="Measurements" optional>
        <textarea
          name="measurements"
          rows={3}
          placeholder={"Chest: 40in\nLength: 28in"}
          defaultValue={measurementsText}
          className={`resize-y ${INPUT_CLASS}`}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.isActive ?? true}
          className="h-4 w-4 accent-brand-navy"
        />
        <span className="font-ui text-sm text-brand-navy">Visible in the shop</span>
      </label>

      {state.error && (
        <p role="alert" className="font-ui text-sm text-signal-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-brand-navy/10 pt-5">
        <SaveButton>{product ? "Save changes" : "Create product"}</SaveButton>
      </div>
    </form>
  );
}
