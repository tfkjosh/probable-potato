
export const GET_CUSTOMER_ORDERS_QUERY = `#graphql
  query GetCustomerOrders {
    customer {
      orders(first: 20) {
        nodes {
          id
          number
          processedAt
          financialStatus
          fulfillmentStatus

          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
