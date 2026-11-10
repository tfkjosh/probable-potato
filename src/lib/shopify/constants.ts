
export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2026-10";

export const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ?? "";

export const SHOPIFY_STOREFRONT_PRIVATE_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "";

export const SHOPIFY_GRAPHQL_ENDPOINT =
  SHOPIFY_STORE_DOMAIN
    ? `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
    : "";

export const DEFAULT_PRODUCT_LIMIT = 12;

export const DEFAULT_COLLECTION_LIMIT = 12;

export const DEFAULT_MENU_HANDLE = "main-menu";

export const DEFAULT_IMAGE_SIZE = 800;

export const SHOPIFY_CACHE_TAGS = {
  PRODUCTS: "shopify-products",
  COLLECTIONS: "shopify-collections",
  MENUS: "shopify-menus",
  PAGES: "shopify-pages",
  BLOGS: "shopify-blogs",
  CART: "shopify-cart",
} as const;
