import "server-only";

import { isIP } from "node:net";
import { headers } from "next/headers";

/**
 * Vercel overwrites x-forwarded-for with the connecting client's public IP.
 * Read it from request headers only; never accept it as a Server Action argument.
 */
export async function getVercelBuyerIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const buyerIp = forwardedFor?.split(",")[0]?.trim();

  if (buyerIp && isIP(buyerIp)) return buyerIp;

  if (process.env.NODE_ENV !== "production") return "127.0.0.1";

  throw new Error(
    "A valid Vercel x-forwarded-for IP header is required for private Storefront API buyer requests.",
  );
}
