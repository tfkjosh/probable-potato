import { NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_OAUTH_STATE_COOKIE,
  CUSTOMER_OAUTH_VERIFIER_COOKIE,
  exchangeAuthorizationCode,
} from "@/lib/shopify/customer/oauth";
import {
  clearCustomerSession,
  setCustomerSession,
} from "@/lib/shopify/customer/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const response = NextResponse.redirect(new URL("/account", request.url));

  const expectedState = request.cookies.get(CUSTOMER_OAUTH_STATE_COOKIE)?.value;
  const verifier = request.cookies.get(CUSTOMER_OAUTH_VERIFIER_COOKIE)?.value;
  const returnedState = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");

  response.cookies.delete(CUSTOMER_OAUTH_STATE_COOKIE);
  response.cookies.delete(CUSTOMER_OAUTH_VERIFIER_COOKIE);

  if (oauthError) {
    response.headers.set(
      "Location",
      new URL("/account?error=login_cancelled", request.url).toString()
    );
    return response;
  }

  if (
    !expectedState ||
    !returnedState ||
    expectedState !== returnedState ||
    !verifier ||
    !code
  ) {
    response.headers.set(
      "Location",
      new URL("/account?error=invalid_callback", request.url).toString()
    );
    return response;
  }

  try {
    const tokens = await exchangeAuthorizationCode(
      code,
      verifier,
      request.headers.get("user-agent") ?? "ProbablePotatoStorefront/1.0"
    );

    setCustomerSession(response, tokens.accessToken, tokens.expiresIn);
    response.headers.set(
      "Location",
      new URL("/account", request.url).toString()
    );
    return response;
  } catch {
    clearCustomerSession(response);
    response.headers.set(
      "Location",
      new URL("/account?error=token_exchange", request.url).toString()
    );
    return response;
  }
}
