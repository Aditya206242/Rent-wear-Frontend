"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import type { AdminProduct } from "@/lib/console/types";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="px-4 py-16 text-center font-ui text-sm text-brand-navy/45 md:px-10">
        No products yet — create the first one.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 border-collapse">
        <thead>
          <tr className="border-b border-brand-navy/10 text-left">
            {["Product", "Category", "Rent", "Buy", "Stock", "Status", ""].map((h) => (
              <th key={h} className="px-4 py-3 font-ui text-xs font-semibold uppercase tracking-wide text-brand-navy/45 md:px-10 md:first:pl-10">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-navy/8">
          {products.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-white">
              <td className="px-4 py-3.5 md:px-10">
                <p className="font-ui text-sm font-medium text-brand-navy">{p.name}</p>
                <p className="font-ui text-xs text-brand-navy/50">{p.brand}</p>
              </td>
              <td className="px-4 py-3.5 font-ui text-xs text-brand-navy/60">{p.category}</td>
              <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{currency.format(p.rentPrice)}</td>
              <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{currency.format(p.buyPrice)}</td>
              <td className="px-4 py-3.5 font-mono text-sm tabular-nums text-brand-navy">{p.unitCount}</td>
              <td className="px-4 py-3.5">
                <span
                  className={`font-ui text-xs font-medium ${p.isActive ? "text-signal-success" : "text-brand-navy/40"}`}
                >
                  {p.isActive ? "Live" : "Hidden"}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <Link
                  href={`/products/${p.id}`}
                  aria-label={`Edit ${p.name}`}
                  className="inline-flex items-center gap-1.5 font-ui text-xs font-medium text-brand-navy/60 hover:text-brand-navy"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
