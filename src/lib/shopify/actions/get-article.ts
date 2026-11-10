
import { shopifyFetch } from "../client";
import { GET_ARTICLE_QUERY } from "../graphql/queries/blogs";

import type {
  ShopifyArticle,
  ShopifyArticleQueryResponse,
  ShopifyArticleQueryVariables,
} from "../types";

export async function getArticle({
  blogHandle,
  articleHandle,
}: ShopifyArticleQueryVariables): Promise<ShopifyArticle | null> {
  if (!blogHandle.trim() || !articleHandle.trim()) {
    throw new Error(
      "Blog handle and article handle are required."
    );
  }

  const data = await shopifyFetch<
    ShopifyArticleQueryResponse,
    ShopifyArticleQueryVariables
  >({
    query: GET_ARTICLE_QUERY,
    variables: {
      blogHandle,
      articleHandle,
    },
    cache: "force-cache",
    tags: [
      "shopify-blogs",
      `shopify-blog-${blogHandle}`,
      `shopify-article-${articleHandle}`,
    ],
  });

  return data.blog?.articleByHandle ?? null;
}
