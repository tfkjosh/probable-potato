
export const GET_BLOGS_QUERY = `#graphql
  query GetBlogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
          seo {
            title
            description
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_BLOG_QUERY = `#graphql
  query GetBlog($handle: String!) {
    blog(handle: $handle) {
      id
      title
      handle
      seo {
        title
        description
      }
    }
  }
`;

export const GET_ARTICLES_QUERY = `#graphql
  query GetArticles(
    $blogHandle: String!
    $first: Int!
    $after: String
  ) {
    blog(handle: $blogHandle) {
      id
      title
      handle

      articles(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            title
            handle
            excerpt
            contentHtml
            publishedAt
            tags

            authorV2 {
              name
              firstName
              lastName
            }

            image {
              url
              altText
              width
              height
            }

            seo {
              title
              description
            }
          }
        }

        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const GET_ARTICLE_QUERY = `#graphql
  query GetArticle(
    $blogHandle: String!
    $articleHandle: String!
  ) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        title
        handle
        excerpt
        contentHtml
        publishedAt
        tags

        authorV2 {
          name
          firstName
          lastName
        }

        image {
          url
          altText
          width
          height
        }

        seo {
          title
          description
        }
      }
    }
  }
`;
