
export function removeEdgesAndNodes<T>(
  connection: {
    edges: Array<{
      node: T;
    }>;
  }
): T[] {
  return connection.edges.map(({ node }) => node);
}

export function formatPrice(
  amount: string,
  currencyCode: string
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function ensureStartWithSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function ensureEndWithSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

export function handleize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isShopifyDomain(value: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(value);
}
