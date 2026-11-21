"use server";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_ADDRESSES_QUERY } from "../queries/addresses";
import type { ShopifyCustomerAddress } from "../types";

interface GetCustomerAddressesResponse {
  customer: {
    addresses: {
      nodes: ShopifyCustomerAddress[];
    };
  } | null;
}

export async function getCustomerAddresses() {
  const session = await getCustomerSession();
  if (!session) return [];

  const result = await customerAccountFetch<GetCustomerAddressesResponse>(
    GET_CUSTOMER_ADDRESSES_QUERY,
    session.accessToken
  );

  return result.customer?.addresses.nodes ?? [];
}
