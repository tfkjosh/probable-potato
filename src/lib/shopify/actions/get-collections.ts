
import { shopifyFetch } from "../client";
import { GET_COLLECTIONS_QUERY } from "../graphql/queries/collections";

import type {
  ShopifyCollectionsQueryResponse,
  ShopifyCollectionsQueryVariables,
  GetCollectionsOptions,
} from "../types";

export async function getCollections({
  first = 12,
  after,
  sortKey = "COLLECTION_DEFAULT",
  reverse = false,
}: GetCollectionsOptions = {}) {
  const data = await shopifyFetch<
    ShopifyCollectionsQueryResponse,
    ShopifyCollectionsQueryVariables
  >({
    query: GET_COLLECTIONS_QUERY,
    variables: {
      first,
      after,
      sortKey,
      reverse,
    },
    cache: "force-cache",
    tags: ["shopify-collections"],
  });

  return {
    collections: data.collections.edges.map(
      ({ node }) => node
    ),
    pageInfo: data.collections.pageInfo,
  };
}
