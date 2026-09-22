"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/lib/console/product-actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Delete "${productName}"? This hides it from the shop — it can't be removed while any unit is reserved or rented.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 font-ui text-xs font-medium text-signal-danger transition-opacity hover:opacity-75 disabled:opacity-50"
      >
        <Trash2 size={13} strokeWidth={1.75} />
        {isPending ? "Deleting…" : "Delete product"}
      </button>
      {error && <p className="mt-1.5 font-ui text-xs text-signal-danger">{error}</p>}
    </div>
  );
}
