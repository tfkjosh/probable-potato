
import { shopifyFetch } from "../client";
import { GET_PAGES_QUERY } from "../graphql/queries/pages";

import type {
  ShopifyPagesQueryResponse,
  ShopifyPagesQueryVariables,
  GetPagesOptions,
} from "../types";

export async function getPages({
  first = 20,
  after,
}: GetPagesOptions = {}) {
  const data = await shopifyFetch<
    ShopifyPagesQueryResponse,
    ShopifyPagesQueryVariables
  >({
    query: GET_PAGES_QUERY,
    variables: {
      first,
      after,
    },
    cache: "force-cache",
    tags: ["shopify-pages"],
  });

  return {
    pages: data.pages.edges.map(({ node }) => node),
    pageInfo: data.pages.pageInfo,
  };
}
