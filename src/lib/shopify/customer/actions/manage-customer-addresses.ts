"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { customerAccountFetch } from "../client";
import { getCustomerSession } from "../session";
import { GET_CUSTOMER_ADDRESSES_QUERY } from "../queries/addresses";
import {
  CREATE_CUSTOMER_ADDRESS_MUTATION,
  DELETE_CUSTOMER_ADDRESS_MUTATION,
  UPDATE_CUSTOMER_ADDRESS_MUTATION,
} from "../mutations/customer-addresses";

interface AddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  zoneCode?: string;
  zip: string;
  countryCode: string;
  phoneNumber?: string;
}

interface CustomerAddressesResponse {
  customer: {
    defaultAddress: { id: string } | null;
    addresses: { nodes: Array<{ id: string }> };
  } | null;
}

interface AddressMutationResponse {
  customerAddressCreate?: {
    customerAddress: { id: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
  customerAddressUpdate?: {
    customerAddress: { id: string } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
  customerAddressDelete?: {
    deletedAddressId: string | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
}

function readAddressInput(formData: FormData): AddressInput | null {
  const value = (key: string) => {
    const entry = formData.get(key);
    return typeof entry === "string" ? entry.trim() : "";
  };

  const address: AddressInput = {
    firstName: value("firstName"),
    lastName: value("lastName"),
    company: value("company") || undefined,
    address1: value("address1"),
    address2: value("address2") || undefined,
    city: value("city"),
    zoneCode: value("zoneCode") || undefined,
    zip: value("zip"),
    countryCode: value("countryCode").toUpperCase(),
    phoneNumber: value("phoneNumber") || undefined,
  };

  if (
    !address.firstName ||
    !address.lastName ||
    !address.address1 ||
    !address.city ||
    !address.zip ||
    !/^[A-Z]{2}$/.test(address.countryCode) ||
    (address.phoneNumber && !/^\+[1-9]\d{7,14}$/.test(address.phoneNumber)) ||
    Object.values(address).some(
      (item) => typeof item === "string" && item.length > 255
    )
  ) {
    return null;
  }

  return address;
}

async function getOwnedAddressIds(accessToken: string) {
  const result = await customerAccountFetch<CustomerAddressesResponse>(
    GET_CUSTOMER_ADDRESSES_QUERY,
    accessToken
  );

  return {
    ids: new Set(
      result.customer?.addresses.nodes.map((address) => address.id) ?? []
    ),
    defaultId: result.customer?.defaultAddress?.id ?? null,
  };
}

function finish(
  status: "created" | "updated" | "deleted" | "default" | "invalid" | "failed"
): never {
  revalidatePath("/account");
  redirect(`/account?address=${status}`);
}

export async function createCustomerAddress(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/account?error=login_required");

  const address = readAddressInput(formData);
  if (!address) finish("invalid");

  let failed = false;
  try {
    const result = await customerAccountFetch<AddressMutationResponse>(
      CREATE_CUSTOMER_ADDRESS_MUTATION,
      session.accessToken,
      {
        address,
        defaultAddress: formData.get("defaultAddress") === "on",
      }
    );

    failed =
      !result.customerAddressCreate?.customerAddress ||
      result.customerAddressCreate.userErrors.length > 0;

    if (failed) {
      console.error(
        "Shopify address creation rejected:",
        result.customerAddressCreate?.userErrors
      );
    }
  } catch (error) {
    console.error("Unable to create Shopify customer address:", error);
    failed = true;
  }

  finish(failed ? "failed" : "created");
}

export async function updateCustomerAddress(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/account?error=login_required");

  const addressId = formData.get("addressId");
  const address = readAddressInput(formData);
  if (typeof addressId !== "string" || !addressId || !address) finish("invalid");

  let failed = false;
  try {
    const owned = await getOwnedAddressIds(session.accessToken);
    if (!owned.ids.has(addressId)) {
      failed = true;
    } else {
      const result = await customerAccountFetch<AddressMutationResponse>(
        UPDATE_CUSTOMER_ADDRESS_MUTATION,
        session.accessToken,
        {
          addressId,
          address,
          defaultAddress:
            formData.get("defaultAddress") === "on" ? true : undefined,
        }
      );

      failed =
        !result.customerAddressUpdate?.customerAddress ||
        result.customerAddressUpdate.userErrors.length > 0;

      if (failed) {
        console.error(
          "Shopify address update rejected:",
          result.customerAddressUpdate?.userErrors
        );
      }
    }
  } catch (error) {
    console.error("Unable to update Shopify customer address:", error);
    failed = true;
  }

  finish(failed ? "failed" : "updated");
}

export async function setDefaultCustomerAddress(
  formData: FormData
): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/account?error=login_required");

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || !addressId) finish("invalid");

  let failed = false;
  try {
    const owned = await getOwnedAddressIds(session.accessToken);
    if (!owned.ids.has(addressId)) {
      failed = true;
    } else {
      const result = await customerAccountFetch<AddressMutationResponse>(
        UPDATE_CUSTOMER_ADDRESS_MUTATION,
        session.accessToken,
        { addressId, defaultAddress: true }
      );

      failed =
        !result.customerAddressUpdate?.customerAddress ||
        result.customerAddressUpdate.userErrors.length > 0;

      if (failed) {
        console.error(
          "Shopify default address update rejected:",
          result.customerAddressUpdate?.userErrors
        );
      }
    }
  } catch (error) {
    console.error("Unable to set default Shopify address:", error);
    failed = true;
  }

  finish(failed ? "failed" : "default");
}

export async function deleteCustomerAddress(
  formData: FormData
): Promise<void> {
  const session = await getCustomerSession();
  if (!session) redirect("/account?error=login_required");

  const addressId = formData.get("addressId");
  if (typeof addressId !== "string" || !addressId) finish("invalid");

  let failed = false;
  try {
    const owned = await getOwnedAddressIds(session.accessToken);
    if (!owned.ids.has(addressId) || owned.defaultId === addressId) {
      failed = true;
    } else {
      const result = await customerAccountFetch<AddressMutationResponse>(
        DELETE_CUSTOMER_ADDRESS_MUTATION,
        session.accessToken,
        { addressId }
      );

      failed =
        !result.customerAddressDelete?.deletedAddressId ||
        result.customerAddressDelete.userErrors.length > 0;

      if (failed) {
        console.error(
          "Shopify address deletion rejected:",
          result.customerAddressDelete?.userErrors
        );
      }
    }
  } catch (error) {
    console.error("Unable to delete Shopify customer address:", error);
    failed = true;
  }

  finish(failed ? "failed" : "deleted");
}
