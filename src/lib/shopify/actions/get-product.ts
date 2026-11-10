
import { shopifyFetch } from "../client";
import { GET_PRODUCT_QUERY } from "../graphql/queries/products";

import type {
  ShopifyProductQueryResponse,
  ShopifyProductQueryVariables,
} from "../types";

export async function getProduct(
  handle: string
) {
  if (!handle.trim()) {
    throw new Error("Product handle is required.");
  }

  const data = await shopifyFetch<
    ShopifyProductQueryResponse,
    ShopifyProductQueryVariables
  >({
    query: GET_PRODUCT_QUERY,
    variables: { handle },
    cache: "force-cache",
    tags: ["shopify-products", `shopify-product-${handle}`],
  });

  return data.product;
}
