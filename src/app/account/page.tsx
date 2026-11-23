import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { getCustomer } from "@/lib/shopify/customer/actions/get-customer";
import { getCustomerOrders } from "@/lib/shopify/customer/actions/get-customer-orders";
import { getCustomerAddresses } from "@/lib/shopify/customer/actions/get-customer-addresses";

export const dynamic = "force-dynamic";

interface AccountPageProps {
  searchParams: Promise<{ error?: string }>;
}

const authErrors: Record<string, string> = {
  auth_setup: "Customer sign-in is not configured correctly. Check the server environment variables.",
  login_cancelled: "Sign-in was cancelled. You can try again.",
  invalid_callback: "The sign-in response could not be verified. Please try again.",
  token_exchange: "Shopify could not complete sign-in. Please try again.",
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { error } = await searchParams;
  const customer = await getCustomer();

  if (!customer) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            Customer account
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-4 max-w-xl text-neutral-600">
            View your profile, order history, and saved addresses through Shopify.
          </p>
          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {authErrors[error] ?? "Something went wrong. Please try again."}
            </p>
          )}
          <Link
            href="/api/auth/shopify"
            className="mt-8 inline-flex w-fit rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            Continue with Shopify
          </Link>
        </main>
      </>
    );
  }

  const [orders, addresses] = await Promise.all([
    getCustomerOrders(),
    getCustomerAddresses(),
  ]);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
              Customer account
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Welcome{customer.firstName ? `, ${customer.firstName}` : ""}
            </h1>
            <p className="mt-2 text-neutral-600">
              {customer.emailAddress?.emailAddress ?? "Your Shopify account"}
            </p>
          </div>
          <form action="/api/auth/shopify/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100"
            >
              Sign out
            </button>
          </form>
        </div>

        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">Recent orders</h2>
            <p className="text-xs text-neutral-500">Showing your latest {orders.length} orders</p>
          </div>
          {orders.length ? (
            <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
              {orders.map((order) => (
                <article key={order.id} className="flex flex-wrap justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">Order #{order.number}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Placed {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: order.totalPrice.currencyCode,
                      }).format(Number(order.totalPrice.amount))}
                    </p>
                    <p className="mt-1 text-neutral-500">
                      {order.fulfillmentStatus ?? order.financialStatus ?? "Processing"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-neutral-300 px-6 py-10 text-center">
              <p className="text-sm font-medium text-neutral-900">No orders yet</p>
              <p className="mt-2 text-sm text-neutral-500">
                Your Shopify orders will appear here after your first purchase.
              </p>
              <Link
                href="/#featured-products"
                className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4"
              >
                Explore the collection
              </Link>
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Saved addresses</h2>
          {addresses.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {addresses.map((address) => (
                <article key={address.id} className="rounded-xl border border-neutral-200 p-5">
                  <p className="font-medium">
                    {[address.firstName, address.lastName].filter(Boolean).join(" ")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {[address.address1, address.address2, address.city, address.province, address.zip, address.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600">No saved addresses found.</p>
          )}
        </section>
      </main>
    </>
  );
}
