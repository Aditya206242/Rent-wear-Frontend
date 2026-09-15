"use client";

import { useState, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: "var(--font-ui), system-ui, sans-serif",
      fontSize: "14px",
      color: "#172b4d",
      "::placeholder": { color: "#6b6459" },
    },
    invalid: { color: "#b23a34" },
  },
};

function CardForm({
  clientSecret,
  onPaid,
  onError,
}: {
  clientSecret: string;
  onPaid: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });
    setSubmitting(false);

    if (error) {
      onError(error.message ?? "Your card was declined.");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onPaid(paymentIntent.id);
    } else {
      onError(`Payment status: ${paymentIntent?.status ?? "unknown"}. Please try again.`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="border border-brand-navy/20 bg-white px-3 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full cursor-pointer bg-brand-navy py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-navy-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Confirming…" : "Pay with card"}
      </button>
    </form>
  );
}

/**
 * Stripe covers non-INR checkout. It renders nothing when
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY isn't set — same "quietly disappear
 * when unconfigured" behavior as GoogleButton — since the backend itself
 * only reaches this path with a real Stripe secret key configured too.
 */
export function StripeCardForm({
  clientSecret,
  onPaid,
  onError,
}: {
  clientSecret: string;
  onPaid: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}) {
  if (!stripePromise) {
    return (
      <p className="mt-4 border border-brand-navy/12 bg-white px-4 py-3 font-ui text-sm text-brand-navy/60">
        Card payment for this currency isn&apos;t set up yet. Please try again in INR, or contact support.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardForm clientSecret={clientSecret} onPaid={onPaid} onError={onError} />
    </Elements>
  );
}
