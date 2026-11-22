"use server";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_QUERY } from "../queries/customer";
import type { ShopifyCustomer } from "../types";

interface GetCustomerResponse {
  customer: ShopifyCustomer | null;
}

export async function getCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;

  const result = await customerAccountFetch<GetCustomerResponse>(
    GET_CUSTOMER_QUERY,
    session.accessToken
  );

  return result.customer;
}
