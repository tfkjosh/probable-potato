"use server";

import { redirect } from "next/navigation";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import {
  GET_CUSTOMER_ORDER_RETURNS_QUERY,
  REQUEST_CUSTOMER_RETURN_MUTATION,
} from "../queries/returns";
import type {
  ShopifyCustomerOrderReturns,
  ShopifyReturnableLineItem,
} from "../types";

interface GetCustomerOrderReturnsResponse {
  order: ShopifyCustomerOrderReturns | null;
}

interface RequestCustomerReturnResponse {
  orderRequestReturn: {
    return: {
      id: string;
      name: string;
      status: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

interface RequestedLineItem {
  lineItemId: string;
  quantity: number;
  returnReasonDefinitionId?: string;
  customerNote?: string;
}

const ORDER_ID_PATTERN = /^gid:\/\/shopify\/Order\/[A-Za-z0-9_-]+$/;
const LINE_ITEM_ID_PATTERN = /^gid:\/\/shopify\/LineItem\/[A-Za-z0-9_-]+$/;
const RETURN_REASON_ID_PATTERN =
  /^gid:\/\/shopify\/ReturnReasonDefinition\/[A-Za-z0-9_-]+$/;

async function fetchOrderReturns(
  orderId: string,
  accessToken: string
): Promise<ShopifyCustomerOrderReturns | null> {
  const result = await customerAccountFetch<GetCustomerOrderReturnsResponse>(
    GET_CUSTOMER_ORDER_RETURNS_QUERY,
    accessToken,
    { id: orderId }
  );

  return result.order;
}

export async function getCustomerOrderReturns(
  orderId: string
): Promise<ShopifyCustomerOrderReturns | null> {
  const session = await getCustomerSession();
  if (!session || !ORDER_ID_PATTERN.test(orderId)) return null;

  return fetchOrderReturns(orderId, session.accessToken);
}

export async function requestCustomerReturn(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/account?error=login_required");

  const orderIdValue = formData.get("orderId");
  const orderId = typeof orderIdValue === "string" ? orderIdValue : "";

  if (!ORDER_ID_PATTERN.test(orderId)) {
    redirect("/account/returns?error=invalid");
  }

  const selectedIds = formData
    .getAll("selectedLineItemIds")
    .filter((value): value is string => typeof value === "string");

  const uniqueIds = [...new Set(selectedIds)];

  if (uniqueIds.length === 0 || uniqueIds.length > 50) {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=select_items`);
  }

  if (uniqueIds.some((id) => !LINE_ITEM_ID_PATTERN.test(id))) {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=invalid`);
  }

  let order: ShopifyCustomerOrderReturns | null;

  try {
    // Re-read Shopify's live eligibility immediately before creating the request.
    order = await fetchOrderReturns(orderId, session.accessToken);
  } catch {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=unavailable`);
  }

  if (!order) {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=not_found`);
  }

  const eligibleItems = new Map<string, ShopifyReturnableLineItem>(
    order.returnInformation.returnableLineItems.nodes.map((item) => [
      item.lineItem.id,
      item,
    ])
  );

  const requestedLineItems: RequestedLineItem[] = [];

  for (const lineItemId of uniqueIds) {
    const eligibleItem = eligibleItems.get(lineItemId);

    if (!eligibleItem) {
      redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=eligibility_changed`);
    }

    const quantityValue = formData.get(`quantity-${lineItemId}`);
    const quantity = Number(quantityValue);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > eligibleItem.quantity
    ) {
      redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=invalid_quantity`);
    }

    const reasonValue = formData.get(`reason-${lineItemId}`);
    const reasonId =
      typeof reasonValue === "string" && reasonValue.length > 0
        ? reasonValue
        : undefined;

    if (reasonId) {
      const allowedReasons =
        eligibleItem.lineItem.suggestedReturnReasonDefinitions?.nodes ?? [];

      if (
        !RETURN_REASON_ID_PATTERN.test(reasonId) ||
        !allowedReasons.some((reason) => reason.id === reasonId && !reason.deleted)
      ) {
        redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=invalid_reason`);
      }
    }

    const noteValue = formData.get(`note-${lineItemId}`);
    const customerNote =
      typeof noteValue === "string" ? noteValue.trim() : "";

    if (customerNote.length > 300) {
      redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=invalid_note`);
    }

    requestedLineItems.push({
      lineItemId,
      quantity,
      ...(reasonId ? { returnReasonDefinitionId: reasonId } : {}),
      ...(customerNote ? { customerNote } : {}),
    });
  }

  let result: RequestCustomerReturnResponse;

  try {
    result = await customerAccountFetch<RequestCustomerReturnResponse>(
      REQUEST_CUSTOMER_RETURN_MUTATION,
      session.accessToken,
      { orderId, requestedLineItems }
    );
  } catch {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=request_failed`);
  }

  if (result.orderRequestReturn.userErrors.length || !result.orderRequestReturn.return) {
    redirect(`/account/returns?id=${encodeURIComponent(orderId)}&error=request_failed`);
  }

  redirect(`/account/returns?id=${encodeURIComponent(orderId)}&result=requested`);
}
