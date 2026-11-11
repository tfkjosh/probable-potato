import "server-only";

import { cookies } from "next/headers";
import { shopifyFetch } from "./client";

const CART_COOKIE = "shopify_cart";

export async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value;
}

// Call only from a Server Action or Route Handler.
export async function storeCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

// Call only from a Server Action or Route Handler.
export async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

// Pass an IP obtained from trusted hosting infrastructure,
// not a browser-submitted form field or JSON value.
export async function resolveCheckoutUrl(buyerIp: string) {
  const id = await readCartId();
  if (!id) return null;

  if (!buyerIp.trim()) {
    throw new Error("A trusted buyer IP is required.");
  }

  const { cart } = await shopifyFetch<{
    cart: { checkoutUrl: string } | null;
  }>({
    query: `
      query CheckoutUrl($id: ID!) {
        cart(id: $id) {
          checkoutUrl
        }
      }
    `,
    variables: { id },
    buyerIp,
    cache: "no-store",
  });

  return cart?.checkoutUrl ?? null;
}