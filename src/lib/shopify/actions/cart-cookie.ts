
import "server-only";

import { cookies } from "next/headers";

const CART_COOKIE_NAME = "shopify_cart_id";

export async function getCartId(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(CART_COOKIE_NAME)?.value ?? null;
}

export async function setCartId(cartId: string): Promise<void> {
  if (!cartId.trim()) {
    throw new Error("Cart ID is required.");
  }

  const cookieStore = await cookies();

  cookieStore.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function removeCartId(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(CART_COOKIE_NAME);
}
