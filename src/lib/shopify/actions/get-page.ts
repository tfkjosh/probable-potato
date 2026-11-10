
import { shopifyFetch } from "../client";
import { GET_PAGE_QUERY } from "../graphql/queries/pages";

import type {
  ShopifyPage,
  ShopifyPageQueryResponse,
  ShopifyPageQueryVariables,
} from "../types";

export async function getPage(
  handle: string
): Promise<ShopifyPage | null> {
  if (!handle.trim()) {
    throw new Error("Page handle is required.");
  }

  const data = await shopifyFetch<
    ShopifyPageQueryResponse,
    ShopifyPageQueryVariables
  >({
    query: GET_PAGE_QUERY,
    variables: { handle },
    cache: "force-cache",
    tags: [
      "shopify-pages",
      `shopify-page-${handle}`,
    ],
  });

  return data.page;
}
