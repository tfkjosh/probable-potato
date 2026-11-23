"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import {
  SUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION,
  UNSUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION,
} from "../mutations/customer-email-marketing";
import { GET_CUSTOMER_QUERY } from "../queries/customer";
import type { ShopifyCustomer } from "../types";

interface CustomerEmailResponse {
  customer: ShopifyCustomer | null;
}

interface MarketingMutationResponse {
  customerEmailMarketingSubscribe?: {
    emailAddress: {
      emailAddress: string | null;
      marketingState: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
      code?: string | null;
    }>;
  };
  customerEmailMarketingUnsubscribe?: {
    emailAddress: {
      emailAddress: string | null;
      marketingState: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
      code?: string | null;
    }>;
  };
}

export async function updateCustomerEmailMarketing(
  formData: FormData
): Promise<void> {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/account?error=login_required");
  }

  const intent = formData.get("intent");

  if (intent !== "subscribe" && intent !== "unsubscribe") {
    redirect("/account?marketing=failed");
  }

  let succeeded = false;

  try {
    const customerResult = await customerAccountFetch<CustomerEmailResponse>(
      GET_CUSTOMER_QUERY,
      session.accessToken
    );

    if (customerResult.customer?.emailAddress?.emailAddress) {
      const mutation =
        intent === "subscribe"
          ? SUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION
          : UNSUBSCRIBE_CUSTOMER_EMAIL_MARKETING_MUTATION;

      const result = await customerAccountFetch<MarketingMutationResponse>(
        mutation,
        session.accessToken
      );

      const payload =
        intent === "subscribe"
          ? result.customerEmailMarketingSubscribe
          : result.customerEmailMarketingUnsubscribe;

      succeeded =
        Boolean(payload?.emailAddress?.emailAddress) &&
        (payload?.userErrors.length ?? 1) === 0;

      if (!succeeded) {
        console.error("Shopify customer email preference update rejected:", payload?.userErrors);
      }
    }
  } catch (error) {
    console.error("Unable to update Shopify customer email preferences:", error);
    succeeded = false;
  }

  if (!succeeded) {
    redirect("/account?marketing=failed");
  }

  revalidatePath("/account");
  redirect(`/account?marketing=${intent === "subscribe" ? "subscribed" : "unsubscribed"}`);
}
