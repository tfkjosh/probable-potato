import "server-only";

import { headers } from "next/headers";

/**
 * Vercel overwrites x-forwarded-for with the connecting client's public IP.
 * Do not accept this value from action arguments or browser-submitted data.
 */
export async function getVercelBuyerIp(): Promise<string> {
  const requestHeaders = await headers();
  const buyerIp = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (buyerIp) return buyerIp;

  if (process.env.NODE_ENV !== "production") return "127.0.0.1";

  throw new Error(
    "Vercel did not provide x-forwarded-for; refusing a private Storefront API request without buyer context.",
  );
}
