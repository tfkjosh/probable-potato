"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addToCart } from "./add-to-cart";
import { createCart } from "./create-cart";
import { getCart } from "./get-cart";
import { removeFromCart } from "./remove-from-cart";
import { updateCart } from "./update-cart";
import { getCartId, removeCartId, setCartId } from "./cart-cookie";
import { getVercelBuyerIp } from "../vercel/buyer-ip";
import type { ShopifyCart } from "../types";

function validateVariantId(merchandiseId: string) {
  if (
    typeof merchandiseId !== "string" ||
    !/^gid:\/\/shopify\/ProductVariant\/[A-Za-z0-9_-]+$/.test(merchandiseId)
  ) {
    throw new Error("A valid Shopify product variant is required.");
  }
}

function validateLineId(lineId: string) {
  if (
    typeof lineId !== "string" ||
    !/^gid:\/\/shopify\/CartLine\/[A-Za-z0-9_-]+$/.test(lineId)
  ) {
    throw new Error("A valid cart line is required.");
  }
}

async function persistCart(cart: ShopifyCart) {
  await setCartId(cart.id);
  revalidatePath("/cart");
  return { totalQuantity: cart.totalQuantity };
}

export async function getCartAction() {
  const cartId = await getCartId();
  if (!cartId) return null;

  const buyerIp = await getVercelBuyerIp();
  const cart = await getCart(cartId, buyerIp);

  if (!cart) {
    await removeCartId();
    return null;
  }

  return cart;
}

export async function addToCartAction(merchandiseId: string, quantity = 1) {
  validateVariantId(merchandiseId);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("Quantity must be between 1 and 99.");
  }

  const buyerIp = await getVercelBuyerIp();
  const cartId = await getCartId();

  const cart = cartId
    ? await addToCart(
        { cartId, lines: [{ merchandiseId, quantity }] },
        buyerIp,
      )
    : await createCart(
        { lines: [{ merchandiseId, quantity }] },
        buyerIp,
      );

  return persistCart(cart);
}

export async function updateCartLineAction(lineId: string, quantity: number) {
  validateLineId(lineId);

  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    throw new Error("Quantity must be between 0 and 99.");
  }

  const cartId = await getCartId();
  if (!cartId) throw new Error("Your cart is empty.");

  const buyerIp = await getVercelBuyerIp();

  const cart =
    quantity === 0
      ? await removeFromCart({ cartId, lineIds: [lineId] }, buyerIp)
      : await updateCart(
          { cartId, lines: [{ id: lineId, quantity }] },
          buyerIp,
        );

  return persistCart(cart);
}

export async function removeCartLineAction(lineId: string) {
  validateLineId(lineId);

  const cartId = await getCartId();
  if (!cartId) throw new Error("Your cart is empty.");

  const buyerIp = await getVercelBuyerIp();
  const cart = await removeFromCart({ cartId, lineIds: [lineId] }, buyerIp);

  return persistCart(cart);
}

export async function checkoutAction(): Promise<never> {
  const cartId = await getCartId();

  if (!cartId) redirect("/cart?error=empty");

  const buyerIp = await getVercelBuyerIp();
  const cart = await getCart(cartId, buyerIp);

  if (!cart) {
    await removeCartId();
    redirect("/cart?error=expired");
  }

  // Redirect to Shopify's checkout URL as returned by the Storefront API.
  redirect(cart.checkoutUrl);
}
