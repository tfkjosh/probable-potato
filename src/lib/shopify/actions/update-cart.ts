
import { shopifyFetch } from "../client";
import { UPDATE_CART_MUTATION } from "../graphql/mutations/cart";

import type {
  ShopifyCartUpdateQueryVariables,
  GetCartMutationResponse,
} from "../types";

export async function updateCart({
  cartId,
  lines,
}: ShopifyCartUpdateQueryVariables) {
  if (!cartId.trim()) {
    throw new Error("Cart ID is required.");
  }

  if (!lines.length) {
    throw new Error("At least one cart line is required.");
  }

  for (const line of lines) {
    if (
      !line.id ||
      (line.quantity !== undefined &&
        (!Number.isInteger(line.quantity) || line.quantity < 1))
    ) {
      throw new Error("Invalid cart line update.");
    }
  }

  const data = await shopifyFetch<
    GetCartMutationResponse,
    ShopifyCartUpdateQueryVariables
  >({
    query: UPDATE_CART_MUTATION,
    variables: { cartId, lines },
    cache: "no-store",
  });

  const result = data.cartLinesUpdate;

  if (!result) {
    throw new Error("Shopify failed to update the cart.");
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
