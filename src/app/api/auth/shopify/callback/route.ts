import { NextResponse } from "next/server";

import {
  CUSTOMER_OAUTH_STATE_COOKIE,
  CUSTOMER_OAUTH_VERIFIER_COOKIE,
  exchangeAuthorizationCode,
} from "@/lib/shopify/customer/oauth";
import { customerAccountConfig } from "@/lib/shopify/customer/config";
import {
  clearCustomerSession,
  setCustomerSession,
} from "@/lib/shopify/customer/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const responseUrl = new URL("/account", request.url);
  const response = NextResponse.redirect(responseUrl);

  const stateCookie = request.headers.get("cookie") ?? "";
  const cookieValues = new Map(
    stateCookie.split(";").map((part) => {
      const separator = part.indexOf("=");
      return separator < 0
        ? [part.trim(), ""]
        : [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
    })
  );

  const expectedState = cookieValues.get(CUSTOMER_OAUTH_STATE_COOKIE);
  const verifier = cookieValues.get(CUSTOMER_OAUTH_VERIFIER_COOKIE);
  const returnedState = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");

  response.cookies.delete(CUSTOMER_OAUTH_STATE_COOKIE);
  response.cookies.delete(CUSTOMER_OAUTH_VERIFIER_COOKIE);

  if (oauthError) {
    response.headers.set("Location", new URL("/account?error=login_cancelled", request.url).toString());
    return response;
  }

  if (
    !expectedState ||
    !returnedState ||
    expectedState !== returnedState ||
    !verifier ||
    !code
  ) {
    response.headers.set("Location", new URL("/account?error=invalid_callback", request.url).toString());
    return response;
  }

  try {
    const tokens = await exchangeAuthorizationCode(
      code,
      verifier,
      request.headers.get("user-agent") ?? "ProbablePotatoStorefront/1.0"
    );

    setCustomerSession(response, tokens.accessToken, tokens.expiresIn);
    response.headers.set("Location", new URL("/account", customerAccountConfig.redirectUri).toString());
    return response;
  } catch {
    clearCustomerSession(response);
    response.headers.set("Location", new URL("/account?error=token_exchange", request.url).toString());
    return response;
  }
}
