
import { shopifyFetch } from "../client";
import { GET_PRODUCTS_QUERY } from "../graphql/queries/products";

import type {
  ShopifyProductsQueryResponse,
  ShopifyProductsQueryVariables,
  GetProductsOptions,
} from "../types";

export async function getProducts({
  first = 12,
  after,
  sortKey = "BEST_SELLING",
  reverse = false,
}: GetProductsOptions = {}) {
  const data = await shopifyFetch<
    ShopifyProductsQueryResponse,
    ShopifyProductsQueryVariables
  >({
    query: GET_PRODUCTS_QUERY,
    variables: {
      first,
      after,
      sortKey,
      reverse,
    },
    cache: "force-cache",
    tags: ["shopify-products"],
  });

  return {
    products: data.products.edges.map(({ node }) => node),
    pageInfo: data.products.pageInfo,
  };
}
