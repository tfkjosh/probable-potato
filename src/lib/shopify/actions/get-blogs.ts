
import { shopifyFetch } from "../client";
import { GET_BLOGS_QUERY } from "../graphql/queries/blogs";

import type {
  ShopifyBlogsQueryResponse,
  ShopifyBlogsQueryVariables,
  GetBlogsOptions,
} from "../types";

export async function getBlogs({
  first = 10,
  after,
}: GetBlogsOptions = {}) {
  const data = await shopifyFetch<
    ShopifyBlogsQueryResponse,
    ShopifyBlogsQueryVariables
  >({
    query: GET_BLOGS_QUERY,
    variables: { first, after },
    cache: "force-cache",
    tags: ["shopify-blogs"],
  });

  return {
    blogs: data.blogs.edges.map(({ node }) => node),
    pageInfo: data.blogs.pageInfo,
  };
}
