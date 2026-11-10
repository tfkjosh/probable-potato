
export const GET_PRODUCTS_QUERY = `#graphql
  query GetProducts(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
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
`;

export const GET_PRODUCT_QUERY = `#graphql
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      vendor
      productType
      tags

      images(first: 10) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }

      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }

      options {
        name
        values
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
`;
