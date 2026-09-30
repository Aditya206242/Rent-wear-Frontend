"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Info } from "lucide-react";
import { useShopCart } from "@/lib/shop/cart-context";
import { revalidateCartAction } from "@/lib/shop/cart-actions";
import { getCheckoutSummaryAction, getDeliveryOptionsAction, previewOrderAction } from "@/lib/shop/checkout-actions";
import { formatMoney } from "@/lib/shop/format";
import type { ApiAddress, ApiCart, ApiDeliveryOption, ApiOrderPreview, ApiPriceChange } from "@/lib/shop/checkout-types";
import { BagLineItem } from "@/components/shop/BagLineItem";
import { AddressSummary } from "@/components/shop/address/AddressSummary";
import { AddressStep } from "./AddressStep";
import { DeliveryStep } from "./DeliveryStep";
import { OrderSummary } from "./OrderSummary";
import { CouponField } from "./CouponField";
import { PlaceOrderPanel } from "./PlaceOrderPanel";

type Step = "address" | "delivery" | "review";
const STEPS: { key: Step; title: string }[] = [
  { key: "address", title: "Delivery address" },
  { key: "delivery", title: "Delivery method" },
  { key: "review", title: "Review & pay" },
];

function firstAvailable(options: ApiDeliveryOption[]) {
  return options.find((o) => o.available)?.code ?? null;
}

function StepSection({
  index,
  title,
  state,
  summary,
  onChange,
  children,
}: {
  index: number;
  title: string;
  state: "done" | "active" | "upcoming";
  summary?: ReactNode;
  onChange?: () => void;
  children?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border bg-white px-5 py-5 sm:px-6 ${state === "active" ? "border-brand-navy/20" : "border-brand-navy/10"}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`flex items-center gap-3 font-ui text-sm font-semibold ${state === "upcoming" ? "text-brand-navy/40" : "text-brand-navy"}`}>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
              state === "done" ? "bg-emerald-600 text-white" : state === "active" ? "bg-brand-navy text-white" : "border border-brand-navy/20 text-brand-navy/40"
            }`}
          >
            {state === "done" ? <Check size={13} strokeWidth={3} /> : index}
          </span>
          {title}
        </h2>
        {state === "done" && onChange && (
          <button type="button" onClick={onChange} className="font-ui text-xs font-semibold text-brand-cyan-deep hover:underline">
            Change
          </button>
        )}
      </div>
      {state === "done" && summary && <div className="mt-3 pl-9">{summary}</div>}
      {state === "active" && <div className="mt-4">{children}</div>}
    </section>
  );
}

/**
 * Checkout: Address → Delivery → Review & pay. Every number shown comes
 * from the backend (cart revalidation, delivery options, order preview);
 * this component only tracks which address/method the customer picked.
 */
export function CheckoutFlow({ states, customerName }: { states: string[]; customerName: string }) {
  const router = useRouter();
  const { cartSynced, lines, applyServerCart, updateQuantity, removeLine, busyLineIds, coupon, refreshAddresses } = useShopCart();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [priceChanges, setPriceChanges] = useState<ApiPriceChange[]>([]);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [options, setOptions] = useState<ApiDeliveryOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("address");
  const [preview, setPreview] = useState<ApiOrderPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const acceptCart = useCallback(
    (next: ApiCart) => {
      setCart(next);
      applyServerCart(next);
    },
    [applyServerCart]
  );

  // Load once the bag is in sync (after a guest bag has been merged).
  useEffect(() => {
    if (!cartSynced) return;
    let cancelled = false;
    (async () => {
      const revalidated = await revalidateCartAction();
      if (!cancelled && revalidated.ok) setPriceChanges(revalidated.data.priceChanges);

      const res = await getCheckoutSummaryAction();
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) router.push("/sign-in?redirectTo=/checkout");
        setLoadError(res.error);
        setLoading(false);
        return;
      }
      acceptCart(res.data.cart);
      setAddresses(res.data.addresses);
      setAddressId(res.data.defaultAddressId);
      setOptions(res.data.deliveryOptions);
      setMethod(firstAvailable(res.data.deliveryOptions));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cartSynced, acceptCart, router]);

  const loadOptions = useCallback(async (id: string) => {
    setOptionsLoading(true);
    const res = await getDeliveryOptionsAction(id);
    setOptionsLoading(false);
    if (!res.ok) return;
    setOptions(res.data);
    setMethod((current) => (res.data.some((o) => o.code === current && o.available) ? current : firstAvailable(res.data)));
  }, []);

  const loadPreview = useCallback(
    async (addr: string, meth: string) => {
      setPreviewLoading(true);
      setPreviewError(null);
      const res = await previewOrderAction({ addressId: addr, deliveryMethod: meth });
      setPreviewLoading(false);
      if (res.ok) {
        setPreview(res.data);
        acceptCart(res.data.cart);
        return;
      }
      setPreview(null);
      setPreviewError(res.error);
      if (res.code === "address_invalid") setStep("address");
      else if (res.code === "delivery_unavailable") setStep("delivery");
    },
    [acceptCart]
  );

  // One idempotency key per reviewed (address, method, total) — a double
  // click or retry reuses it; any change to what's being bought gets a new one.
  const signature = `${addressId}|${method}|${preview?.expectedTotalPaise ?? ""}|${attempt}`;
  const keyRef = useRef({ signature: "", key: "" });
  if (keyRef.current.signature !== signature) keyRef.current = { signature, key: crypto.randomUUID() };
  const idempotencyKey = keyRef.current.key;

  function goToDelivery() {
    if (!addressId) return;
    setStep("delivery");
    loadOptions(addressId);
  }

  function goToReview() {
    if (!addressId || !method) return;
    setStep("review");
    loadPreview(addressId, method);
  }

  async function afterLineChange(action: Promise<void>) {
    await action;
    if (addressId && method) await loadPreview(addressId, method);
  }

  if (!cartSynced || loading) {
    return <Shell><p className="font-ui text-sm text-brand-navy/55">Checking your bag…</p></Shell>;
  }
  if (loadError) {
    return (
      <Shell>
        <p role="alert" className="font-ui text-sm text-signal-danger">
          {loadError}
        </p>
      </Shell>
    );
  }
  if (lines.length === 0) {
    return (
      <Shell>
        <div className="rounded-xl border border-brand-navy/12 bg-white px-6 py-14 text-center">
          <p className="font-ui text-sm text-brand-navy/55">Your bag is empty.</p>
          <Link href="/discover" className="mt-4 inline-block rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-navy-dark">
            Continue browsing
          </Link>
        </div>
      </Shell>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === addressId) ?? null;
  const selectedOption = options.find((o) => o.code === method) ?? null;
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const stateOf = (key: Step) => {
    const i = STEPS.findIndex((s) => s.key === key);
    return i < stepIndex ? "done" : i === stepIndex ? "active" : "upcoming";
  };
  const blockedLines = lines.filter((l) => l.status === "blocked");
  const summaryPricing = step === "review" && preview ? preview.pricing : cart?.summary;

  return (
    <Shell>
      {priceChanges.length > 0 && (
        <div role="status" className="mb-5 flex items-start gap-2 rounded-xl border border-signal-warning/30 bg-signal-warning/8 px-4 py-3">
          <Info size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-signal-warning" />
          <div className="font-ui text-sm text-signal-warning">
            <p className="font-semibold">Some prices changed since you added these items</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {priceChanges.map((c) => (
                <li key={c.itemId}>
                  {c.productName}: {formatMoney(c.pricing.display.previousUnitPrice, c.pricing.displayCurrency)} →{" "}
                  {formatMoney(c.pricing.display.currentUnitPrice, c.pricing.displayCurrency)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {blockedLines.length > 0 && step !== "review" && (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-signal-danger/25 bg-signal-danger/6 px-4 py-3">
          <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-signal-danger" />
          <p className="font-ui text-sm text-signal-danger">
            {blockedLines.length === 1 ? "One item needs" : `${blockedLines.length} items need`} attention before you can pay — you can fix it at the review step.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-4">
          <StepSection
            index={1}
            title="Delivery address"
            state={stateOf("address")}
            onChange={() => setStep("address")}
            summary={selectedAddress && <AddressSummary address={selectedAddress} />}
          >
            <AddressStep
              addresses={addresses}
              selectedId={addressId}
              states={states}
              customerName={customerName}
              onSelect={setAddressId}
              onSaved={(saved) => {
                setAddresses((prev) => {
                  const others = prev.filter((a) => a.id !== saved.id).map((a) => (saved.isDefault ? { ...a, isDefault: false } : a));
                  return [saved, ...others];
                });
                setAddressId(saved.id);
                refreshAddresses();
              }}
              onContinue={goToDelivery}
            />
          </StepSection>

          <StepSection
            index={2}
            title="Delivery method"
            state={stateOf("delivery")}
            onChange={() => {
              setStep("delivery");
              if (addressId) loadOptions(addressId);
            }}
            summary={
              selectedOption && (
                <p className="font-ui text-sm text-brand-navy/70">
                  {selectedOption.label} ·{" "}
                  {selectedOption.pricing.display.fee === 0 ? "Free" : formatMoney(selectedOption.pricing.display.fee, selectedOption.pricing.displayCurrency)}
                </p>
              )
            }
          >
            <DeliveryStep options={options} selected={method} loading={optionsLoading} onSelect={setMethod} onContinue={goToReview} />
          </StepSection>

          <StepSection index={3} title="Review & pay" state={stateOf("review")}>
            <ul className="space-y-4">
              {lines.map((line) => (
                <BagLineItem
                  key={line.id}
                  line={line}
                  busy={busyLineIds.has(line.id) || previewLoading}
                  onQuantityChange={(q) => afterLineChange(updateQuantity(line.id, q))}
                  onRemove={() => afterLineChange(removeLine(line.id))}
                />
              ))}
            </ul>

            {previewLoading && <p className="mt-4 font-ui text-sm text-brand-navy/55">Confirming prices and stock…</p>}
            {previewError && (
              <p role="alert" className="mt-4 font-ui text-sm text-signal-danger">
                {previewError}
              </p>
            )}
            {preview && !preview.canPlaceOrder && (
              <ul role="alert" className="mt-4 space-y-1 rounded-lg border border-signal-danger/25 bg-signal-danger/6 px-4 py-3 font-ui text-xs text-signal-danger">
                {preview.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {preview && addressId && method && (
              <PlaceOrderPanel
                key={idempotencyKey}
                preview={preview}
                addressId={addressId}
                deliveryMethod={method}
                idempotencyKey={idempotencyKey}
                disabled={!preview.canPlaceOrder || previewLoading}
                onPriceChanged={(fresh) => {
                  setPreview(fresh);
                  acceptCart(fresh.cart);
                }}
                onCartChanged={() => loadPreview(addressId, method)}
                onRestart={() => {
                  setAttempt((a) => a + 1);
                  loadPreview(addressId, method);
                }}
              />
            )}
          </StepSection>
        </div>

        {summaryPricing && (
          <OrderSummary
            pricing={summaryPricing}
            couponCode={coupon?.applied ? coupon.code : null}
            deliveryLabel={step === "review" ? preview?.delivery.label : null}
            itemCount={lines.reduce((n, l) => n + l.quantity, 0)}
          >
            <CouponField
              coupon={coupon}
              onCartChange={(next) => {
                acceptCart(next);
                if (step === "review" && addressId && method) loadPreview(addressId, method);
              }}
            />
          </OrderSummary>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      <p className="font-mono text-xs uppercase tracking-wide text-brand-cyan-deep">Secure checkout</p>
      <h1 className="mt-1 mb-8 font-display text-3xl font-medium text-brand-navy">Checkout</h1>
      {children}
    </div>
  );
}
