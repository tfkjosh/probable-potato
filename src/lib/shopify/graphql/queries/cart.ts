
export const GET_CART_QUERY = `#graphql
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      createdAt
      updatedAt

      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }

      lines(first: 100) {
        edges {
          node {
            id
            quantity

            merchandise {
              ... on ProductVariant {
                id
                title
                availableForSale

                selectedOptions {
                  name
                  value
                }

                product {
                  id
                  title
                  handle

                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                }

                price {
                  amount
                  currencyCode
                }
              }
            }

            cost {
              amountPerQuantity {
                amount
                currencyCode
              }
              compareAtAmountPerQuantity {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }

        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
