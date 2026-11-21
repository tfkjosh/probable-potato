import "server-only";

import { createHash, randomBytes } from "node:crypto";

import {
  customerAccountConfig,
  validateCustomerAccountConfig,
} from "./config";

interface OpenIdConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
}

interface ShopifyTokenResponse {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
}

export const CUSTOMER_OAUTH_STATE_COOKIE = "shopify_customer_oauth_state";
export const CUSTOMER_OAUTH_VERIFIER_COOKIE =
  "shopify_customer_oauth_verifier";

export function createOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function createCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function getOpenIdConfiguration(): Promise<OpenIdConfiguration> {
  validateCustomerAccountConfig();

  const discoveryUrl =
    `https://${customerAccountConfig.storeDomain}/.well-known/openid-configuration`;

  const response = await fetch(discoveryUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to discover Shopify authentication endpoints.");
  }

  const config = (await response.json()) as Partial<OpenIdConfiguration>;

  if (
    !config.authorization_endpoint ||
    !config.token_endpoint ||
    new URL(config.authorization_endpoint).protocol !== "https:" ||
    new URL(config.token_endpoint).protocol !== "https:"
  ) {
    throw new Error("Shopify returned invalid authentication endpoints.");
  }

  return {
    authorization_endpoint: config.authorization_endpoint,
    token_endpoint: config.token_endpoint,
  };
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  userAgent: string
): Promise<{ accessToken: string; expiresIn: number }> {
  validateCustomerAccountConfig();

  const openIdConfig = await getOpenIdConfiguration();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: customerAccountConfig.clientId,
    redirect_uri: customerAccountConfig.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(openIdConfig.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: new URL(customerAccountConfig.redirectUri).origin,
      "User-Agent": userAgent || "ProbablePotatoStorefront/1.0",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Shopify customer authentication failed.");
  }

  const tokens = (await response.json()) as ShopifyTokenResponse;

  if (
    !tokens.access_token ||
    !Number.isFinite(tokens.expires_in) ||
    !tokens.expires_in ||
    tokens.expires_in <= 0
  ) {
    throw new Error("Shopify returned an invalid customer access token.");
  }

  // Public app clients use PKCE and do not receive refresh tokens.
  return {
    accessToken: tokens.access_token,
    expiresIn: tokens.expires_in,
  };
}
