import "server-only";

export const customerAccountConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
  clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!,
  redirectUri: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_REDIRECT_URI!,
  scopes:
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_SCOPES ??
    "openid email customer-account-api:full",
};

export function validateCustomerAccountConfig() {
  const config = customerAccountConfig;

  if (
    !config.storeDomain ||
    !config.clientId ||
    !config.redirectUri ||
    !config.scopes
  ) {
    throw new Error(
      "Shopify Customer Account environment variables are missing."
    );
  }

  if (
    config.storeDomain.includes("://") ||
    config.storeDomain.includes("/")
  ) {
    throw new Error(
      "SHOPIFY_STORE_DOMAIN must be a hostname without a protocol or path."
    );
  }

  const redirectUrl = new URL(config.redirectUri);

  if (
    redirectUrl.protocol !== "https:" &&
    !(redirectUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(redirectUrl.hostname))
  ) {
    throw new Error(
      "The Shopify Customer Account redirect URI must use HTTPS."
    );
  }
}
