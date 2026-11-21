
export const GET_CUSTOMER_QUERY = `#graphql
  query GetCustomer {
    customer {
      id
      firstName
      lastName
      displayName

      emailAddress {
        emailAddress
      }

      phoneNumber {
        phoneNumber
      }
    }
  }
`;
