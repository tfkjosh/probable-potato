
import { shopifyFetch } from "../client";
import { GET_COLLECTION_QUERY } from "../graphql/queries/collections";

import type {
  ShopifyCollectionQueryResponse,
  ShopifyCollectionQueryVariables,
  GetCollectionOptions,
} from "../types";

export async function getCollection({
  handle,
  first = 12,
  after,
  sortKey = "COLLECTION_DEFAULT",
  reverse = false,
}: GetCollectionOptions) {
  if (!handle.trim()) {
    throw new Error("Collection handle is required.");
  }

  const data = await shopifyFetch<
    ShopifyCollectionQueryResponse,
    ShopifyCollectionQueryVariables
  >({
    query: GET_COLLECTION_QUERY,
    variables: {
      handle,
      first,
      after,
      sortKey,
      reverse,
    },
    cache: "force-cache",
    tags: [
      "shopify-collections",
      `shopify-collection-${handle}`,
    ],
  });

  if (!data.collection) {
    return null;
  }

  return {
    ...data.collection,
    products: data.collection.products.edges.map(
      ({ node }) => node
    ),
    pageInfo: data.collection.products.pageInfo,
  };
}
