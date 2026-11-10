
import { shopifyFetch } from "../client";
import { GET_CART_QUERY } from "../graphql/queries/cart";

import type {
  ShopifyCartQueryResponse,
  ShopifyCartQueryVariables,
} from "../types";

export async function getCart(cartId: string) {
  if (!cartId.trim()) {
    throw new Error("Cart ID is required.");
  }

  const data = await shopifyFetch<
    ShopifyCartQueryResponse,
    ShopifyCartQueryVariables
  >({
    query: GET_CART_QUERY,
    variables: { cartId },
    cache: "no-store",
  });

  return data.cart;
}
