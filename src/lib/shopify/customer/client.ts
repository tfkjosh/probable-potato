
import "server-only";

import { customerAccountConfig } from "./config";

interface CustomerGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
  }>;
}

export async function customerAccountFetch<T>(
  query: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(
    `${customerAccountConfig.apiUrl}/graphql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Customer Account API error: ${response.status}`
    );
  }

  const result =
    (await response.json()) as CustomerGraphQLResponse<T>;

  if (result.errors?.length) {
    throw new Error(
      result.errors.map(error => error.message).join("; ")
    );
  }

  if (!result.data) {
    throw new Error("Customer Account API returned no data.");
  }

  return result.data;
}
