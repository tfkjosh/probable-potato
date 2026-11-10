
import { shopifyFetch } from "../client";
import {
  GET_PRODUCT_METAFIELDS_QUERY,
} from "../graphql/queries/metaobjects";

import type {
  ShopifyProductMetafieldsQueryResponse,
  ShopifyMetafieldsQueryVariables,
  GetMetafieldsOptions,
} from "../types";

export async function getProductMetafields({
  handle,
  identifiers,
}: GetMetafieldsOptions) {
  if (!handle.trim()) {
    throw new Error("Product handle is required.");
  }

  if (!identifiers.length) {
    throw new Error("At least one metafield identifier is required.");
  }

  const data = await shopifyFetch<
    ShopifyProductMetafieldsQueryResponse,
    ShopifyMetafieldsQueryVariables
  >({
    query: GET_PRODUCT_METAFIELDS_QUERY,
    variables: {
      handle,
      identifiers,
    },
    cache: "force-cache",
    tags: [
      "shopify-products",
      `shopify-product-${handle}`,
      `shopify-product-metafields-${handle}`,
    ],
  });

  return data.product;
}
