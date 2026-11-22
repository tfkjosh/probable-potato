import { getCustomerSession } from "@/lib/shopify/customer/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCustomerSession();

  return Response.json(
    { authenticated: Boolean(session) },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}
