
import "server-only";

export const customerAccountConfig = {
  clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID!,
  apiUrl: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_URL!,
  redirectUri: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_REDIRECT_URI!,
  scopes: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_SCOPES!,
};

export function validateCustomerAccountConfig() {
  const config = customerAccountConfig;

  if (
    !config.clientId ||
    !config.apiUrl ||
    !config.redirectUri ||
    !config.scopes
  ) {
    throw new Error(
      "Shopify Customer Account environment variables are missing."
    );
  }
}
