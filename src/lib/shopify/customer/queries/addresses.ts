export const GET_CUSTOMER_ADDRESSES_QUERY = `#graphql
  query GetCustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zoneCode
          zip
          country
          countryCode
          phoneNumber
        }
      }
    }
  }
`;
