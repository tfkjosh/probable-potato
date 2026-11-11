"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addToCartAction } from "@/lib/shopify/actions/cart-server-actions";
import type { ShopifyProductVariant } from "@/lib/shopify/types";

function money(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function AddToCartForm({
  variants,
}: {
  variants: ShopifyProductVariant[];
}) {
  const router = useRouter();
  const firstAvailable = variants.find((variant) => variant.availableForSale);
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedVariant = variants.find((variant) => variant.id === variantId);
  const canAdd = Boolean(selectedVariant?.availableForSale && variantId);

  function handleAdd() {
    if (!canAdd) return;
    setMessage("");
    startTransition(async () => {
      try {
        await addToCartAction(variantId, quantity);
        setMessage("Added to your cart.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not add this item.");
      }
    });
  }

  if (!variants.length) {
    return <p className="mt-6 text-sm text-neutral-500">No purchasable variants are available.</p>;
  }

  return (
    <div className="mt-8 space-y-5">
      {variants.length > 1 && (
        <label className="block">
          <span className="mb-2 block text-xs font-medium text-neutral-700">Choose an option</span>
          <select
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
            className="h-12 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-950"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={!variant.availableForSale}>
                {variant.title}{variant.availableForSale ? "" : " — Sold out"} · {money(variant.price.amount, variant.price.currencyCode)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex items-center gap-4">
        <label className="text-xs font-medium text-neutral-700" htmlFor="product-quantity">
          Quantity
        </label>
        <input
          id="product-quantity"
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
          className="h-11 w-20 border border-neutral-300 px-3 text-center text-sm"
        />
        {selectedVariant && (
          <span className="text-sm font-medium text-neutral-900">
            {money(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd || isPending}
        className="flex h-13 w-full items-center justify-center bg-neutral-950 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {isPending ? "Adding…" : canAdd ? "Add to cart" : "Sold out"}
      </button>

      <p aria-live="polite" className="min-h-5 text-xs text-neutral-600">
        {message}
      </p>
    </div>
  );
}
