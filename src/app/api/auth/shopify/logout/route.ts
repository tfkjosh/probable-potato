import { NextResponse } from "next/server";

import { clearCustomerSession } from "@/lib/shopify/customer/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/account", request.url), 303);
  clearCustomerSession(response);
  return response;
}
