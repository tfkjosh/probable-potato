export const UPDATE_CUSTOMER_PROFILE_MUTATION = `#graphql
  mutation UpdateCustomerProfile($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        displayName
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
