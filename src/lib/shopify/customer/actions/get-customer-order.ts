"use server";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_ORDER_QUERY } from "../queries/order-detail";
import type { ShopifyCustomerOrderDetail } from "../types";

interface GetCustomerOrderResponse {
  order: ShopifyCustomerOrderDetail | null;
}

export async function getCustomerOrder(
  orderId: string
): Promise<ShopifyCustomerOrderDetail | null> {
  const session = await getCustomerSession();
  if (!session) return null;

  if (
    typeof orderId !== "string" ||
    orderId.length > 200 ||
    !/^gid:\/\/shopify\/Order\/[A-Za-z0-9_-]+$/.test(orderId)
  ) {
    return null;
  }

  const result = await customerAccountFetch<GetCustomerOrderResponse>(
    GET_CUSTOMER_ORDER_QUERY,
    session.accessToken,
    { id: orderId }
  );

  return result.order;
}
