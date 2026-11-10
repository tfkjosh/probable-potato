
export const GET_METAOBJECTS_QUERY = `#graphql
  query GetMetaobjects(
    $type: String!
    $first: Int!
    $after: String
  ) {
    metaobjects(
      type: $type
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          id
          type
          handle
          fields {
            key
            type
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on Product {
                id
                handle
                title
              }
              ... on Collection {
                id
                handle
                title
              }
            }
          }
          updatedAt
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

export const GET_METAOBJECT_QUERY = `#graphql
  query GetMetaobject(
    $handle: MetaobjectHandleInput!
  ) {
    metaobject(handle: $handle) {
      id
      type
      handle
      fields {
        key
        type
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on Product {
            id
            handle
            title
          }
          ... on Collection {
            id
            handle
            title
          }
        }
      }
      updatedAt
    }
  }
`;

export const GET_PRODUCT_METAFIELDS_QUERY = `#graphql
  query GetProductMetafields(
    $handle: String!
    $identifiers: [HasMetafieldsIdentifier!]!
  ) {
    product(handle: $handle) {
      id
      handle
      title

      metafields(identifiers: $identifiers) {
        id
        namespace
        key
        type
        value

        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_METAFIELDS_QUERY = `#graphql
  query GetCollectionMetafields(
    $handle: String!
    $identifiers: [HasMetafieldsIdentifier!]!
  ) {
    collection(handle: $handle) {
      id
      handle
      title

      metafields(identifiers: $identifiers) {
        id
        namespace
        key
        type
        value

        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;
