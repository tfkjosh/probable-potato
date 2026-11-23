export const SUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION = `#graphql
  mutation SubscribeCustomerEmailMarketing {
    customerEmailMarketingSubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const UNSUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION = `#graphql
  mutation UnsubscribeCustomerEmailMarketing {
    customerEmailMarketingUnsubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
