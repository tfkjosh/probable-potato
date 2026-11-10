
import { shopifyFetch } from "../client";
import { ADD_TO_CART_MUTATION } from "../graphql/mutations/cart";

import type {
  ShopifyCartLinesQueryVariables,
  GetCartMutationResponse,
} from "../types";

export async function addToCart({
  cartId,
  lines,
}: ShopifyCartLinesQueryVariables) {
  if (!cartId.trim()) {
    throw new Error("Cart ID is required.");
  }

  if (!lines.length) {
    throw new Error("At least one cart line is required.");
  }

  for (const line of lines) {
    if (!line.merchandiseId || !Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Invalid cart line.");
    }
  }

  const data = await shopifyFetch<
    GetCartMutationResponse,
    ShopifyCartLinesQueryVariables
  >({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });

  const result = data.cartLinesAdd;

  if (!result) {
    throw new Error("Shopify failed to add cart lines.");
  }

  if (result.userErrors.length) {
    throw new Error(
      result.userErrors.map(({ message }) => message).join("; ")
    );
  }

  if (!result.cart) {
    throw new Error("Shopify returned an empty cart.");
  }

  return result.cart;
}
