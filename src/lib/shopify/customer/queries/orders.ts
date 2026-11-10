
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
