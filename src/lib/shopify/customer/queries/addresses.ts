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
          address1
          address2
          city
          province
          provinceCode: zoneCode
          zip
          country
          countryCode
          phoneNumber
        }
      }
    }
  }
`;
