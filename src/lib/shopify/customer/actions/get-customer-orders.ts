"use server";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_ORDERS_QUERY } from "../queries/orders";
import type { ShopifyCustomerOrder } from "../types";

interface GetCustomerOrdersResponse {
  customer: {
    orders: {
      nodes: ShopifyCustomerOrder[];
    };
  } | null;
}

export async function getCustomerOrders() {
  const session = await getCustomerSession();
  if (!session) return [];

  const result = await customerAccountFetch<GetCustomerOrdersResponse>(
    GET_CUSTOMER_ORDERS_QUERY,
    session.accessToken
  );

  return result.customer?.orders.nodes ?? [];
}
