export const GET_CUSTOMER_ORDER_RETURNS_QUERY = `#graphql
  query GetCustomerOrderReturns($id: ID!) {
    order(id: $id) {
      id
      name
      createdAt
      returnInformation {
        nonReturnableSummary {
          nonReturnableReasons
        }
        returnableLineItems(first: 50) {
          nodes {
            quantity
            lineItem {
              id
              name
              title
              variantTitle
              image {
                url
                altText
              }
              currentTotalPrice {
                amount
                currencyCode
              }
              suggestedReturnReasonDefinitions(first: 25) {
                nodes {
                  id
                  name
                  handle
                  deleted
                }
              }
            }
          }
        }
        nonReturnableLineItems(first: 50) {
          nodes {
            quantity
            lineItem {
              id
              name
              title
            }
          }
        }
      }
      returns(first: 10) {
        nodes {
          id
          name
          status
          createdAt
          updatedAt
          closedAt
          returnLineItems(first: 25) {
            nodes {
              id
              quantity
              lineItem {
                id
                name
                title
              }
              returnReasonDefinition {
                name
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export const REQUEST_CUSTOMER_RETURN_MUTATION = `#graphql
  mutation RequestCustomerReturn(
    $orderId: ID!
    $requestedLineItems: [RequestedLineItemInput!]!
  ) {
    orderRequestReturn(
      orderId: $orderId
      requestedLineItems: $requestedLineItems
    ) {
      return {
        id
        name
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;
