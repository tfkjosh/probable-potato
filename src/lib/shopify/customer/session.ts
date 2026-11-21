import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { CustomerAccountSession } from "./types";

const ACCESS_TOKEN_COOKIE = "shopify_customer_access_token";
const EXPIRES_AT_COOKIE = "shopify_customer_expires_at";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getCustomerSession(): Promise<CustomerAccountSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const expiresAtValue = cookieStore.get(EXPIRES_AT_COOKIE)?.value;
  const expiresAt = Number(expiresAtValue);

  if (
    !accessToken ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return null;
  }

  return { accessToken, expiresAt };
}

export function setCustomerSession(
  response: NextResponse,
  accessToken: string,
  expiresIn: number
): void {
  const expiresAt = Date.now() + expiresIn * 1000;

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    cookieOptions(expiresIn)
  );
  response.cookies.set(
    EXPIRES_AT_COOKIE,
    String(expiresAt),
    cookieOptions(expiresIn)
  );
}

export function clearCustomerSession(response: NextResponse): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(EXPIRES_AT_COOKIE);
}
