"use client";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-signal-danger">Something went wrong</p>
      <h1 className="mt-2 font-display text-2xl font-medium text-brand-navy">This page couldn&apos;t load</h1>
      <p className="mt-3 font-ui text-sm text-brand-navy/60">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 bg-brand-navy px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-navy-dark"
      >
        Try again
      </button>
    </div>
  );
}
