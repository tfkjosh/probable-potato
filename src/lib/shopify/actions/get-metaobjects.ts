
import { shopifyFetch } from "../client";
import { GET_METAOBJECTS_QUERY } from "../graphql/queries/metaobjects";

import type {
  ShopifyMetaobjectsQueryResponse,
  ShopifyMetaobjectsQueryVariables,
  GetMetaobjectsOptions,
} from "../types";

export async function getMetaobjects({
  type,
  first = 12,
  after,
}: GetMetaobjectsOptions) {
  if (!type.trim()) {
    throw new Error("Metaobject type is required.");
  }

  const data = await shopifyFetch<
    ShopifyMetaobjectsQueryResponse,
    ShopifyMetaobjectsQueryVariables
  >({
    query: GET_METAOBJECTS_QUERY,
    variables: {
      type,
      first,
      after,
    },
    cache: "force-cache",
    tags: [
      "shopify-metaobjects",
      `shopify-metaobjects-${type}`,
    ],
  });

  return {
    metaobjects: data.metaobjects.edges.map(
      ({ node }) => node
    ),
    pageInfo: data.metaobjects.pageInfo,
  };
}
