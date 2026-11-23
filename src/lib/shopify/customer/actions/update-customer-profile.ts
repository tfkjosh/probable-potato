"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { UPDATE_CUSTOMER_PROFILE_MUTATION } from "../mutations/update-customer-profile";

interface UpdateCustomerProfileResponse {
  customerUpdate: {
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      displayName: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
      code?: string | null;
    }>;
  };
}

export async function updateCustomerProfile(formData: FormData): Promise<void> {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/account?error=login_required");
  }

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    redirect("/account?profile=invalid");
  }

  const normalizedFirstName = firstName.trim();
  const normalizedLastName = lastName.trim();

  if (
    !normalizedFirstName ||
    normalizedFirstName.length > 100 ||
    normalizedLastName.length > 100
  ) {
    redirect("/account?profile=invalid");
  }

  let updateFailed = false;

  try {
    const result = await customerAccountFetch<UpdateCustomerProfileResponse>(
      UPDATE_CUSTOMER_PROFILE_MUTATION,
      session.accessToken,
      {
        input: {
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
        },
      }
    );

    updateFailed =
      result.customerUpdate.userErrors.length > 0 ||
      !result.customerUpdate.customer;

    if (updateFailed) {
      console.error(
        "Shopify customer profile update rejected:",
        result.customerUpdate.userErrors
      );
    }
  } catch (error) {
    console.error("Unable to update Shopify customer profile:", error);
    updateFailed = true;
  }

  if (updateFailed) {
    redirect("/account?profile=failed");
  }

  revalidatePath("/account");
  redirect("/account?profile=updated");
}
