import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { getCustomer } from "@/lib/shopify/customer/actions/get-customer";
import { getCustomerOrder } from "@/lib/shopify/customer/actions/get-customer-order";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  searchParams: Promise<{ id?: string }>;
}

function money(amount: string, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(new Date(value));
}

function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function readableStatus(value: string | null | undefined) {
  if (!value) return "Not available";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CustomerOrderDetailPage({
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await searchParams;
  const customer = await getCustomer();

  if (!customer) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in to view this order</h1>
          <p className="mt-3 text-neutral-600">Your order details are available after you sign in to your customer account.</p>
          <Link href="/api/auth/shopify" className="mt-7 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white">Continue with Shopify</Link>
        </main>
      </>
    );
  }

  const order = id ? await getCustomerOrder(id) : null;

  if (!order) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <Link href="/account#orders" className="text-sm text-neutral-500 underline underline-offset-4">Back to your account</Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">We couldn't find that order</h1>
          <p className="mt-3 text-neutral-600">This order may not exist or may not belong to your signed-in account.</p>
        </main>
      </>
    );
  }

  const statusUrl = safeExternalUrl(order.statusPageUrl);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-6 py-14">
        <Link href="/account#orders" className="text-sm text-neutral-500 underline underline-offset-4">← Back to orders</Link>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Order details</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{order.name}</h1>
            <p className="mt-2 text-sm text-neutral-500">Placed {date(order.createdAt)}{order.confirmationNumber ? ` · Confirmation ${order.confirmationNumber}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold">{readableStatus(order.financialStatus)}</span>
            <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold">{readableStatus(order.fulfillmentStatus)}</span>
          </div>
        </div>

        {statusUrl && (
          <a href={statusUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700">
            View Shopify order status <span aria-hidden="true">↗</span>
          </a>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section>
            <h2 className="text-xl font-semibold">Items ordered</h2>
            <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
              {order.lineItems.nodes.map((item) => (
                <article key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{item.name || item.title}</h3>
                    {item.variantTitle && item.variantTitle !== "Default Title" && <p className="mt-1 text-sm text-neutral-500">{item.variantTitle}</p>}
                    {item.sku && <p className="mt-1 text-xs text-neutral-400">SKU: {item.sku}</p>}
                    {item.vendor && <p className="mt-1 text-xs text-neutral-400">{item.vendor}</p>}
                    <p className="mt-2 text-sm text-neutral-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm">
                    {item.totalPrice && <p className="font-semibold">{money(item.totalPrice.amount, item.totalPrice.currencyCode)}</p>}
                    {item.price && <p className="mt-1 text-xs text-neutral-500">{money(item.price.amount, item.price.currencyCode)} each</p>}
                  </div>
                </article>
              ))}
            </div>

            <section className="mt-10">
              <h2 className="text-xl font-semibold">Shipping updates</h2>
              {order.fulfillments.nodes.length ? (
                <div className="mt-4 grid gap-4">
                  {order.fulfillments.nodes.map((fulfillment) => (
                    <article key={fulfillment.id} className="rounded-2xl border border-neutral-200 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{readableStatus(fulfillment.latestShipmentStatus ?? fulfillment.status)}</p>
                        <p className="text-xs text-neutral-500">Updated {date(fulfillment.createdAt)}</p>
                      </div>
                      {fulfillment.estimatedDeliveryAt && <p className="mt-2 text-sm text-neutral-600">Estimated delivery: {date(fulfillment.estimatedDeliveryAt)}</p>}
                      {fulfillment.trackingInformation.length ? (
                        <div className="mt-4 grid gap-3">
                          {fulfillment.trackingInformation.map((tracking, index) => {
                            const trackingUrl = safeExternalUrl(tracking.url);
                            return (
                              <div key={`${fulfillment.id}-tracking-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                                <div>
                                  <p className="text-sm font-medium">{tracking.company ?? "Carrier tracking"}</p>
                                  {tracking.number && <p className="mt-1 text-xs text-neutral-500">{tracking.number}</p>}
                                </div>
                                {trackingUrl && <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline underline-offset-4">Track package ↗</a>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-neutral-500">Tracking information isn't available yet.</p>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 p-6">
                  <p className="font-medium">No shipment yet</p>
                  <p className="mt-2 text-sm text-neutral-500">Tracking details will appear here when your order is fulfilled.</p>
                </div>
              )}
            </section>
          </section>

          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                {order.subtotal && <div className="flex justify-between gap-4"><dt className="text-neutral-500">Subtotal</dt><dd>{money(order.subtotal.amount, order.subtotal.currencyCode)}</dd></div>}
                <div className="flex justify-between gap-4"><dt className="text-neutral-500">Shipping</dt><dd>{money(order.totalShipping.amount, order.totalShipping.currencyCode)}</dd></div>
                {order.totalTax && <div className="flex justify-between gap-4"><dt className="text-neutral-500">Tax</dt><dd>{money(order.totalTax.amount, order.totalTax.currencyCode)}</dd></div>}
                <div className="flex justify-between gap-4"><dt className="text-neutral-500">Refunded</dt><dd>{money(order.totalRefunded.amount, order.totalRefunded.currencyCode)}</dd></div>
                <div className="mt-2 flex justify-between gap-4 border-t border-neutral-200 pt-4 text-base font-semibold"><dt>Total</dt><dd>{money(order.totalPrice.amount, order.totalPrice.currencyCode)}</dd></div>
              </dl>
            </section>

            {order.shippingAddress && (
              <section className="rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold">Shipping address</h2>
                <address className="mt-4 space-y-1 text-sm not-italic leading-6 text-neutral-600">
                  <p className="font-medium text-neutral-900">{[order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(" ")}</p>
                  {order.shippingAddress.address1 && <p>{order.shippingAddress.address1}</p>}
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{[order.shippingAddress.city, order.shippingAddress.zoneCode, order.shippingAddress.zip].filter(Boolean).join(", ")}</p>
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                </address>
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
