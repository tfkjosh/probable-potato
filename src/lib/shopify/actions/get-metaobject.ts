
import { shopifyFetch } from "../client";
import { GET_METAOBJECT_QUERY } from "../graphql/queries/metaobjects";

import type {
  ShopifyMetaobject,
  ShopifyMetaobjectQueryResponse,
  ShopifyMetaobjectQueryVariables,
  GetMetaobjectOptions,
} from "../types";

export async function getMetaobject({
  type,
  handle,
}: GetMetaobjectOptions): Promise<ShopifyMetaobject | null> {
  if (!type.trim() || !handle.trim()) {
    throw new Error(
      "Metaobject type and handle are required."
    );
  }

  const data = await shopifyFetch<
    ShopifyMetaobjectQueryResponse,
    ShopifyMetaobjectQueryVariables
  >({
    query: GET_METAOBJECT_QUERY,
    variables: {
      handle: {
        type,
        handle,
      },
    },
    cache: "force-cache",
    tags: [
      "shopify-metaobjects",
      `shopify-metaobject-${type}-${handle}`,
    ],
  });

  return data.metaobject;
}
