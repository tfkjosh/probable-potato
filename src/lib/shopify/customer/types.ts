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
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zoneCode: string | null;
  zip: string | null;
  country: string | null;
  countryCode: string | null;
  phoneNumber: string | null;
  isDefault: boolean;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCustomerOrder {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: ShopifyMoney;
}

export interface ShopifyCustomerOrderDetail {
  id: string;
  name: string;
  confirmationNumber: string | null;
  createdAt: string;
  processedAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  subtotal: ShopifyMoney | null;
  totalShipping: ShopifyMoney;
  totalTax: ShopifyMoney | null;
  totalRefunded: ShopifyMoney;
  totalPrice: ShopifyMoney;
  shippingAddress: {
    firstName: string | null;
    lastName: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    zoneCode: string | null;
    zip: string | null;
    country: string | null;
    countryCode: string | null;
  } | null;
  lineItems: {
    nodes: Array<{
      id: string;
      title: string;
      name: string;
      quantity: number;
      sku: string | null;
      variantTitle: string | null;
      vendor: string | null;
      image: {
        url: string;
        altText: string | null;
      } | null;
      price: ShopifyMoney | null;
      totalPrice: ShopifyMoney | null;
    }>;
  };
  fulfillments: {
    nodes: Array<{
      id: string;
      status: string | null;
      createdAt: string;
      estimatedDeliveryAt: string | null;
      latestShipmentStatus: string | null;
      trackingInformation: Array<{
        company: string | null;
        number: string | null;
        url: string | null;
      }>;
    }>;
  };
}

export interface CustomerAccountSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
}
