import { shopifyFetch } from "../client";
import { CREATE_CART_MUTATION } from "../graphql/mutations/cart";

import type {
  ShopifyCreateCartQueryVariables,
  GetCartMutationResponse,
  CreateCartOptions,
} from "../types";

export async function createCart(
  { lines = [] }: CreateCartOptions = {},
  buyerIp?: string,
) {
  const data = await shopifyFetch<
    GetCartMutationResponse,
    ShopifyCreateCartQueryVariables
  >({
    query: CREATE_CART_MUTATION,
    variables: { input: { lines } },
    buyerIp,
    cache: "no-store",
  });

  const result = data.cartCreate;

  if (!result) throw new Error("Shopify failed to create the cart.");
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map(({ message }) => message).join("; "));
  }
  if (!result.cart) throw new Error("Shopify returned an empty cart.");

  return result.cart;
}
