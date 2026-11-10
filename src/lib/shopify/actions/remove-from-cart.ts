
import { shopifyFetch } from "../client";
import { REMOVE_FROM_CART_MUTATION } from "../graphql/mutations/cart";

import type {
  ShopifyCartRemoveQueryVariables,
  GetCartMutationResponse,
} from "../types";

export async function removeFromCart({
  cartId,
  lineIds,
}: ShopifyCartRemoveQueryVariables) {
  if (!cartId.trim()) {
    throw new Error("Cart ID is required.");
  }

  if (!lineIds.length) {
    throw new Error("At least one line ID is required.");
  }

  const data = await shopifyFetch<
    GetCartMutationResponse,
    ShopifyCartRemoveQueryVariables
  >({
    query: REMOVE_FROM_CART_MUTATION,
    variables: { cartId, lineIds },
    cache: "no-store",
  });

  const result = data.cartLinesRemove;

  if (!result) {
    throw new Error("Shopify failed to remove cart lines.");
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
