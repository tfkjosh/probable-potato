import "server-only";

import { getCart } from "./actions/get-cart";
import { getCartId, removeCartId } from "./actions/cart-cookie";
import { getVercelBuyerIp } from "./vercel/buyer-ip";
import type { ShopifyCart } from "./types";

export async function getCurrentCart(): Promise<Omit<ShopifyCart, "id"> | null> {
  const cartId = await getCartId();
  if (!cartId) return null;

  const buyerIp = await getVercelBuyerIp();
  const cart = await getCart(cartId, buyerIp);

  if (!cart) {
    await removeCartId();
    return null;
  }

  // The cart ID includes a secret key and must never cross the server boundary.
  const { id: _secretCartId, ...safeCart } = cart;
  return safeCart;
}
