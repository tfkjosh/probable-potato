import "server-only";

import { customerAccountConfig, validateCustomerAccountConfig } from "./config";

interface CustomerGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
  }>;
}

interface CustomerAccountApiDiscovery {
  graphql_api?: string;
}

async function getCustomerGraphQLEndpoint(): Promise<string> {
  validateCustomerAccountConfig();

  const discoveryUrl =
    `https://${customerAccountConfig.storeDomain}/.well-known/customer-account-api`;

  const response = await fetch(discoveryUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to discover the Shopify Customer Account API.");
  }

  const discovery =
    (await response.json()) as CustomerAccountApiDiscovery;

  if (!discovery.graphql_api) {
    throw new Error("Shopify did not return a Customer Account GraphQL endpoint.");
  }

  const endpoint = new URL(discovery.graphql_api);

  if (endpoint.protocol !== "https:") {
    throw new Error("Shopify returned an insecure Customer Account API endpoint.");
  }

  return endpoint.toString();
}

export async function customerAccountFetch<T>(
  query: string,
  accessToken: string
): Promise<T> {
  const endpoint = await getCustomerGraphQLEndpoint();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Shopify's Customer Account API expects the raw access token.
      Authorization: accessToken,
      Origin: new URL(customerAccountConfig.redirectUri).origin,
      "User-Agent": "ProbablePotatoStorefront/1.0",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Customer Account API error: ${response.status}`);
  }

  const result =
    (await response.json()) as CustomerGraphQLResponse<T>;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map((error) => error.message).join("; ")
    );
  }

  if (!result.data) {
    throw new Error("Customer Account API returned no data.");
  }

  return result.data;
}
