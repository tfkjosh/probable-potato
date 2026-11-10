
query GetCustomerAddresses {
  customer {
    addresses(first: 20) {
      nodes {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phoneNumber
      }
    }
  }
}
