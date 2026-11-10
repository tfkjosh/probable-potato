
import { shopifyFetch } from "../client";
import {
  GET_COLLECTION_METAFIELDS_QUERY,
} from "../graphql/queries/metaobjects";

import type {
  ShopifyCollectionMetafieldsQueryResponse,
  ShopifyMetafieldsQueryVariables,
  GetMetafieldsOptions,
} from "../types";

export async function getCollectionMetafields({
  handle,
  identifiers,
}: GetMetafieldsOptions) {
  if (!handle.trim()) {
    throw new Error("Collection handle is required.");
  }

  if (!identifiers.length) {
    throw new Error("At least one metafield identifier is required.");
  }

  const data = await shopifyFetch<
    ShopifyCollectionMetafieldsQueryResponse,
    ShopifyMetafieldsQueryVariables
  >({
    query: GET_COLLECTION_METAFIELDS_QUERY,
    variables: {
      handle,
      identifiers,
    },
    cache: "force-cache",
    tags: [
      "shopify-collections",
      `shopify-collection-${handle}`,
      `shopify-collection-metafields-${handle}`,
    ],
  });

  return data.collection;
}
