import "server-only";

import type {
  ShopifyFetchOptions,
  ShopifyGraphQLResponse,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-10";

const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : undefined;

export async function shopifyFetch<
  TData,
  TVariables = Record<string, unknown>,
>({
  query,
  variables,
  cache = "no-store",
  tags,
  buyerIp,
}: ShopifyFetchOptions<TVariables>): Promise<TData> {
  if (!endpoint || !token) {
    throw new Error("Missing Shopify environment variables.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": token,
      ...(buyerIp ? { "Shopify-Storefront-Buyer-IP": buyerIp } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next: tags?.length ? { tags } : undefined,
  });

  const result: ShopifyGraphQLResponse<TData> = await response.json();

  if (!response.ok) {
    throw new Error(
      `Shopify API error: ${response.status} ${response.statusText}`,
    );
  }

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; "),
    );
  }

  if (result.data == null) {
    throw new Error("Shopify returned an empty response.");
  }

  return result.data;
}
