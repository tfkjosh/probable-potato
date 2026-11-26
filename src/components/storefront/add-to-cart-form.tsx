"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addToCartAction } from "@/lib/shopify/actions/cart-server-actions";
import type { ShopifyProductVariant } from "@/lib/shopify/types";

type ProductOption = {
  name: string;
  values: string[];
};

function money(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function getInitialOptions(variant?: ShopifyProductVariant) {
  return Object.fromEntries(
    (variant?.selectedOptions ?? []).map(({ name, value }) => [name, value]),
  );
}

export function AddToCartForm({
  variants,
  options,
}: {
  variants: ShopifyProductVariant[];
  options: ProductOption[];
}) {
  const router = useRouter();
  const firstAvailable = variants.find((variant) => variant.availableForSale);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => getInitialOptions(firstAvailable ?? variants[0]),
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectableOptions = options.filter(
    (option) => option.values.length > 1 && option.values[0] !== "Default Title",
  );

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        variant.selectedOptions.every(
          ({ name, value }) => selectedOptions[name] === value,
        ),
      ),
    [selectedOptions, variants],
  );

  const canAdd = Boolean(selectedVariant?.availableForSale);

  function canSelectValue(optionName: string, value: string) {
    return variants.some(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.every(({ name, value: variantValue }) =>
          name === optionName
            ? variantValue === value
            : selectedOptions[name] === variantValue,
        ),
    );
  }

  function handleOptionChange(optionName: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [optionName]: value }));
    setMessage("");
  }

  function handleAdd() {
    if (!selectedVariant?.availableForSale) return;

    setMessage("");
    startTransition(async () => {
      try {
        await addToCartAction(selectedVariant.id, quantity);
        setMessage("Added to your bag.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not add this piece.",
        );
      }
    });
  }

  if (!variants.length) {
    return (
      <p className="border-y border-black/10 py-5 text-sm text-neutral-500">
        This piece has no purchasable options right now.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-7">
      {selectableOptions.map((option) => (
        <fieldset key={option.name}>
          <legend className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-800">
            {option.name}
          </legend>
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              Selected: {selectedOptions[option.name] ?? "Select"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              const isAvailable = canSelectValue(option.name, value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!isAvailable}
                  aria-pressed={isSelected}
                  className={`relative min-w-12 border px-4 py-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 motion-reduce:transition-none ${isSelected ? "border-black bg-black text-white" : "border-black/20 bg-transparent text-neutral-800 hover:border-black"} ${!isAvailable ? "cursor-not-allowed opacity-30 line-through" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center justify-between border-y border-black/10 py-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-800">
          Quantity
        </span>
        <div className="flex items-center border border-black/20">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="h-10 w-10 text-lg text-neutral-700 transition-colors hover:bg-black/5 disabled:opacity-30"
          >
            −
          </button>
          <output aria-live="polite" className="w-9 text-center text-xs tabular-nums">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.min(99, current + 1))}
            disabled={quantity >= 99}
            aria-label="Increase quantity"
            className="h-10 w-10 text-lg text-neutral-700 transition-colors hover:bg-black/5 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {selectedVariant && (
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            {selectedVariant.availableForSale ? "Available to purchase" : "Unavailable"}
          </span>
          <div className="flex items-baseline gap-3">
            {selectedVariant.compareAtPrice &&
              Number(selectedVariant.compareAtPrice.amount) >
                Number(selectedVariant.price.amount) && (
                <span className="text-xs text-neutral-400 line-through">
                  {money(
                    selectedVariant.compareAtPrice.amount,
                    selectedVariant.compareAtPrice.currencyCode,
                  )}
                </span>
              )}
            <span className="text-lg font-medium tabular-nums text-neutral-950">
              {money(
                selectedVariant.price.amount,
                selectedVariant.price.currencyCode,
              )}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd || isPending}
        className="flex min-h-14 w-full items-center justify-center bg-black px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300 motion-reduce:transition-none"
      >
        {isPending
          ? "Adding to bag…"
          : canAdd
            ? "Add to bag"
            : "Currently unavailable"}
      </button>

      <p
        aria-live="polite"
        role="status"
        className="min-h-5 text-center text-xs text-neutral-600"
      >
        {message}
      </p>
    </div>
  );
}
