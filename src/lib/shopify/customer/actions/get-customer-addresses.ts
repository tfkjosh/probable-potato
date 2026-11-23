"use server";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_ADDRESSES_QUERY } from "../queries/addresses";
import type { ShopifyCustomerAddress } from "../types";

interface GetCustomerAddressesResponse {
  customer: {
    defaultAddress: { id: string } | null;
    addresses: {
      nodes: Omit<ShopifyCustomerAddress, "isDefault">[];
    };
  } | null;
}

export async function getCustomerAddresses(): Promise<ShopifyCustomerAddress[]> {
  const session = await getCustomerSession();
  if (!session) return [];

  const result = await customerAccountFetch<GetCustomerAddressesResponse>(
    GET_CUSTOMER_ADDRESSES_QUERY,
    session.accessToken
  );

  const defaultAddressId = result.customer?.defaultAddress?.id;

  return (result.customer?.addresses.nodes ?? []).map((address) => ({
    ...address,
    isDefault: address.id === defaultAddressId,
  }));
}
