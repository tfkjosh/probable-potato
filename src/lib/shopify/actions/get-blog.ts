
import { shopifyFetch } from "../client";
import { GET_BLOG_QUERY } from "../graphql/queries/blogs";

import type {
  ShopifyBlog,
  ShopifyBlogQueryResponse,
  ShopifyBlogQueryVariables,
} from "../types";

export async function getBlog(
  handle: string
): Promise<ShopifyBlog | null> {
  if (!handle.trim()) {
    throw new Error("Blog handle is required.");
  }

  const data = await shopifyFetch<
    ShopifyBlogQueryResponse,
    ShopifyBlogQueryVariables
  >({
    query: GET_BLOG_QUERY,
    variables: { handle },
    cache: "force-cache",
    tags: [
      "shopify-blogs",
      `shopify-blog-${handle}`,
    ],
  });

  return data.blog;
}
