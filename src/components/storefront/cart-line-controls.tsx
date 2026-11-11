"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/shopify/actions/cart-server-actions";

export function CartLineControls({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function update(nextQuantity: number) {
    setError("");
    startTransition(async () => {
      try {
        await updateCartLineAction(lineId, nextQuantity);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not update the cart.");
      }
    });
  }

  function remove() {
    setError("");
    startTransition(async () => {
      try {
        await removeCartLineAction(lineId);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not remove the item.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <div className="flex h-9 items-center border border-neutral-300">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={isPending || quantity <= 1}
          onClick={() => update(quantity - 1)}
          className="h-full w-9 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-8 text-center text-xs tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={isPending || quantity >= 99}
          onClick={() => update(quantity + 1)}
          className="h-full w-9 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-950 disabled:opacity-40"
      >
        {isPending ? "Updating…" : "Remove"}
      </button>
      {error && <p role="alert" className="w-full text-xs text-red-700">{error}</p>}
    </div>
  );
}
