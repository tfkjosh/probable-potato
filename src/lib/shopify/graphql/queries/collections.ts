
export const GET_COLLECTIONS_QUERY = `#graphql
  query GetCollections(
    $first: Int!
    $after: String
    $sortKey: CollectionSortKeys
    $reverse: Boolean
  ) {
    collections(
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          id
          title
          handle
          description

          image {
            url
            altText
            width
            height
          }

          products(first: 4) {
            nodes {
              id
              title
              handle
              availableForSale

              featuredImage {
                url
                altText
                width
                height
              }

              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
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

export const GET_COLLECTION_QUERY = `#graphql
  query GetCollection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description

      image {
        url
        altText
        width
        height
      }

      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
      ) {
        edges {
          cursor
          node {
            id
            title
            handle
            description
            availableForSale

            featuredImage {
              url
              altText
              width
              height
            }

            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
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
