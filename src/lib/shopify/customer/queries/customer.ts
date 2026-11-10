
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
