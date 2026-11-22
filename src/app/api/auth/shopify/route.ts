import { NextResponse } from "next/server";

import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
  CUSTOMER_OAUTH_STATE_COOKIE,
  CUSTOMER_OAUTH_VERIFIER_COOKIE,
  getOpenIdConfiguration,
} from "@/lib/shopify/customer/oauth";
import {
  customerAccountConfig,
  validateCustomerAccountConfig,
} from "@/lib/shopify/customer/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    validateCustomerAccountConfig();

    const state = createOAuthState();
    const verifier = createCodeVerifier();
    const challenge = createCodeChallenge(verifier);
    const authConfig = await getOpenIdConfiguration();

    const authorizationUrl = new URL(authConfig.authorization_endpoint);
    authorizationUrl.searchParams.set("client_id", customerAccountConfig.clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("redirect_uri", customerAccountConfig.redirectUri);
    authorizationUrl.searchParams.set("scope", customerAccountConfig.scopes);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    const response = NextResponse.redirect(authorizationUrl);
    const secure = new URL(request.url).protocol === "https:";

    response.cookies.set(CUSTOMER_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    response.cookies.set(CUSTOMER_OAUTH_VERIFIER_COOKIE, verifier, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/account?error=auth_setup", request.url));
  }
}
