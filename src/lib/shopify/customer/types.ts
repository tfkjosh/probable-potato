
export interface ShopifyCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  emailAddress: {
    emailAddress: string;
  } | null;
  phoneNumber: {
    phoneNumber: string;
  } | null;
}

export interface ShopifyCustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
  phoneNumber: string | null;
}

export interface ShopifyCustomerOrder {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
}

export interface CustomerAccountSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
}
