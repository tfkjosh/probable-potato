
import { shopifyFetch } from "../client";
import { GET_ARTICLES_QUERY } from "../graphql/queries/blogs";

import type {
  ShopifyArticlesQueryResponse,
  ShopifyArticlesQueryVariables,
  GetArticlesOptions,
} from "../types";

export async function getArticles({
  blogHandle,
  first = 12,
  after,
}: GetArticlesOptions) {
  if (!blogHandle.trim()) {
    throw new Error("Blog handle is required.");
  }

  const data = await shopifyFetch<
    ShopifyArticlesQueryResponse,
    ShopifyArticlesQueryVariables
  >({
    query: GET_ARTICLES_QUERY,
    variables: {
      blogHandle,
      first,
      after,
    },
    cache: "force-cache",
    tags: [
      "shopify-blogs",
      `shopify-blog-${blogHandle}`,
    ],
  });

  if (!data.blog) {
    return null;
  }

  return {
    blog: {
      id: data.blog.id,
      title: data.blog.title,
      handle: data.blog.handle,
    },
    articles: data.blog.articles.edges.map(
      ({ node }) => node
    ),
    pageInfo: data.blog.articles.pageInfo,
  };
}
