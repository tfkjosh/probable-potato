
import { shopifyFetch } from "../client";
import { GET_MENU_QUERY } from "../graphql/queries/menu";

import type {
  ShopifyMenu,
  GetMenuQueryVariables,
  GetMenuQueryResponse,
} from "../types";

export async function getMenu(
  handle: string
): Promise<ShopifyMenu | null> {
  if (!handle.trim()) {
    throw new Error("Menu handle is required.");
  }

  const data = await shopifyFetch<
    GetMenuQueryResponse,
    GetMenuQueryVariables
  >({
    query: GET_MENU_QUERY,
    variables: { handle },
    cache: "force-cache",
    tags: ["shopify-menus", `shopify-menu-${handle}`],
  });

  return data.menu;
}
