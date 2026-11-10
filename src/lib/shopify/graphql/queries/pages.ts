
export const GET_PAGES_QUERY = `#graphql
  query GetPages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          handle
          body
          bodySummary
          createdAt
          updatedAt
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

export const GET_PAGE_QUERY = `#graphql
  query GetPage($handle: String!) {
    page(handle: $handle) {
      id
      title
      handle
      body
      bodySummary
      createdAt
      updatedAt

      seo {
        title
        description
      }
    }
  }
`;
