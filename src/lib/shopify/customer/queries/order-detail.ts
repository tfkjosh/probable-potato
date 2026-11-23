export const GET_CUSTOMER_ORDER_QUERY = `#graphql
  query GetCustomerOrder($id: ID!) {
    order(id: $id) {
      id
      name
      confirmationNumber
      createdAt
      processedAt
      financialStatus
      fulfillmentStatus
      statusPageUrl
      subtotal {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalRefunded {
        amount
        currencyCode
      }
      totalPrice {
        amount
        currencyCode
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        zoneCode
        zip
        country
        countryCode
      }
      lineItems(first: 50) {
        nodes {
          id
          title
          name
          quantity
          sku
          variantTitle
          vendor
          image {
            url
            altText
          }
          price {
            amount
            currencyCode
          }
          totalPrice {
            amount
            currencyCode
          }
        }
      }
      fulfillments(first: 10) {
        nodes {
          id
          status
          createdAt
          estimatedDeliveryAt
          latestShipmentStatus
          trackingInformation {
            company
            number
            url
          }
        }
      }
    }
  }
`;
