import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { getCustomer } from "@/lib/shopify/customer/actions/get-customer";
import { getCustomerOrders } from "@/lib/shopify/customer/actions/get-customer-orders";
import {
  getCustomerOrderReturns,
  requestCustomerReturn,
} from "@/lib/shopify/customer/actions/manage-customer-returns";
import type {
  ShopifyCustomerRefund,
  ShopifyCustomerReturn,
  ShopifyNonReturnableLineItem,
  ShopifyReturnableLineItem,
} from "@/lib/shopify/customer/types";

export const dynamic = "force-dynamic";

interface ReturnsPageProps {
  searchParams: Promise<{
    id?: string;
    result?: string;
    error?: string;
  }>;
}

const errorMessages: Record<string, string> = {
  invalid: "The return request details were invalid. Please try again.",
  select_items: "Select at least one eligible item to return.",
  unavailable: "We couldn't check return eligibility with Shopify. Please try again.",
  not_found: "We couldn't find that order in your customer account.",
  eligibility_changed: "One or more items are no longer eligible. Refresh the page and review the updated items.",
  invalid_quantity: "Choose a valid quantity for each selected item.",
  invalid_reason: "Choose one of the return reasons provided for the selected item.",
  invalid_note: "Keep each item note under 300 characters.",
  request_failed: "Shopify couldn't submit your return request. Please try again.",
};

const statusDescriptions: Record<string, string> = {
  REQUESTED: "Your request is waiting for the store to review it.",
  OPEN: "Your return has been approved and is being processed.",
  CLOSED: "This return has been completed.",
  DECLINED: "The store declined this return request.",
  CANCELED: "This return was canceled.",
};

function readableStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RefundHistory({ refunds }: { refunds: ShopifyCustomerRefund[] }) {
  if (!refunds.length) return null;

  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Payment updates</p>
      <h2 className="mt-2 text-xl font-semibold">Refund history</h2>
      <div className="mt-4 divide-y divide-neutral-100">
        {refunds.map((refund) => (
          <div key={refund.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{refund.returnName ? `Refund for ${refund.returnName}` : "Order refund"}</p>
              <p className="mt-1 text-xs text-neutral-500">{refund.createdAt ? `Created ${new Date(refund.createdAt).toLocaleDateString()}` : `Updated ${new Date(refund.updatedAt).toLocaleDateString()}`}</p>
            </div>
            <p className="font-semibold">{new Intl.NumberFormat(undefined, { style: "currency", currency: refund.totalRefunded.currencyCode }).format(Number(refund.totalRefunded.amount))}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">This shows refund records Shopify has attached to the order. Your payment provider may take additional time to post funds.</p>
    </section>
  );
}

function ReturnHistory({ returns }: { returns: ShopifyCustomerReturn[] }) {
  if (!returns.length) return null;

  return (
    <section className="mt-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Your history</p>
        <h2 className="mt-2 text-xl font-semibold">Return requests</h2>
      </div>
      <div className="mt-4 grid gap-4">
        {returns.map((returnItem) => (
          <article key={returnItem.id} className="rounded-2xl border border-neutral-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{returnItem.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">Requested {new Date(returnItem.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold">{readableStatus(returnItem.status)}</span>
            </div>
            <p className="mt-3 text-sm text-neutral-600">{statusDescriptions[returnItem.status] ?? "Your return status is available here."}</p>
            <div className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100">
              {returnItem.returnLineItems.nodes.map((lineItem) => (
                <div key={lineItem.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">{lineItem.lineItem.name || lineItem.lineItem.title}</p>
                    {lineItem.returnReasonDefinition?.name && <p className="mt-1 text-xs text-neutral-500">Reason: {lineItem.returnReasonDefinition.name}</p>}
                  </div>
                  <p className="text-neutral-500">Qty {lineItem.quantity}</p>
                </div>
              ))}
            </div>
            {returnItem.updatedAt !== returnItem.createdAt && <p className="mt-3 text-xs text-neutral-400">Last updated {new Date(returnItem.updatedAt).toLocaleDateString()}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function ReturnableItem({ item }: { item: ShopifyReturnableLineItem }) {
  const lineItem = item.lineItem;
  const reasons = (lineItem.suggestedReturnReasonDefinitions?.nodes ?? []).filter((reason) => !reason.deleted);

  return (
    <article className="grid gap-4 border-b border-neutral-200 py-5 sm:grid-cols-[auto_1fr]">
      <div className="flex items-start gap-3">
        <input
          aria-label={`Select ${lineItem.name || lineItem.title} for return`}
          className="mt-1 size-4 accent-neutral-950"
          type="checkbox"
          name="selectedLineItemIds"
          value={lineItem.id}
        />
        {lineItem.image?.url ? (
          // Shopify-hosted product image from the authenticated order.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lineItem.image.url} alt={lineItem.image.altText ?? lineItem.name} className="size-20 rounded-xl bg-neutral-100 object-cover" />
        ) : (
          <div className="size-20 rounded-xl bg-neutral-100" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h3 className="font-medium">{lineItem.name || lineItem.title}</h3>
            {lineItem.variantTitle && lineItem.variantTitle !== "Default Title" && <p className="mt-1 text-sm text-neutral-500">{lineItem.variantTitle}</p>}
            <p className="mt-1 text-xs text-neutral-500">Up to {item.quantity} {item.quantity === 1 ? "item" : "items"} eligible</p>
          </div>
          {lineItem.currentTotalPrice && <p className="text-sm font-medium">{new Intl.NumberFormat(undefined, { style: "currency", currency: lineItem.currentTotalPrice.currencyCode }).format(Number(lineItem.currentTotalPrice.amount))}</p>}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-neutral-600">
            Quantity to return
            <input className="h-10 rounded-lg border border-neutral-300 px-3 text-sm font-normal" type="number" name={`quantity-${lineItem.id}`} min={1} max={item.quantity} defaultValue={1} />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-neutral-600">
            Return reason {reasons.length ? "" : "(optional)"}
            <select className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal" name={`reason-${lineItem.id}`} defaultValue="">
              <option value="">Select a reason</option>
              {reasons.map((reason) => <option key={reason.id} value={reason.id}>{reason.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-neutral-600 sm:col-span-2">
            Note for the store (optional)
            <textarea className="min-h-20 rounded-lg border border-neutral-300 p-3 text-sm font-normal" name={`note-${lineItem.id}`} maxLength={300} placeholder="Add any helpful details (300 characters max)." />
          </label>
        </div>
      </div>
    </article>
  );
}

function NonReturnableItems({ items }: { items: ShopifyNonReturnableLineItem[] }) {
  if (!items.length) return null;

  return (
    <section className="mt-8 rounded-2xl bg-neutral-50 p-5">
      <h3 className="font-semibold">Items not eligible for return</h3>
      <ul className="mt-3 grid gap-2 text-sm text-neutral-600">
        {items.map((item) => <li key={item.lineItem.id}>{item.lineItem.name || item.lineItem.title} <span className="text-neutral-400">· Qty {item.quantity}</span></li>)}
      </ul>
    </section>
  );
}

export default async function CustomerReturnsPage({ searchParams }: ReturnsPageProps) {
  const { id, result, error } = await searchParams;
  const customer = await getCustomer();

  if (!customer) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Customer account</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to manage returns</h1>
          <p className="mt-3 text-neutral-600">Sign in to view return eligibility and track your return requests.</p>
          <Link href="/api/auth/shopify" className="mt-7 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white">Continue with Shopify</Link>
        </main>
      </>
    );
  }

  if (!id) {
    const orders = await getCustomerOrders();

    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-4xl px-6 py-14">
          <Link href="/account" className="text-sm text-neutral-500 underline underline-offset-4">← Back to account</Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Customer service</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Returns & refunds</h1>
          <p className="mt-3 max-w-2xl text-neutral-600">Choose an order to check which items are eligible for return, submit a request, and follow its status.</p>
          {orders.length ? (
            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {orders.map((order) => (
                <article key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <h2 className="font-semibold">Order #{order.number}</h2>
                    <p className="mt-1 text-sm text-neutral-500">Placed {new Date(order.processedAt).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/account/returns?id=${encodeURIComponent(order.id)}`} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100">Manage return</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
              <p className="font-medium">No orders found</p>
              <p className="mt-2 text-sm text-neutral-500">Your eligible orders will appear here after you make a purchase.</p>
            </div>
          )}
        </main>
      </>
    );
  }

  const order = await getCustomerOrderReturns(id);

  if (!order) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <Link href="/account/returns" className="text-sm text-neutral-500 underline underline-offset-4">← All orders</Link>
          <h1 className="mt-8 text-3xl font-semibold">We couldn't find that order</h1>
          <p className="mt-3 text-neutral-600">This order may not exist or may not belong to your signed-in account.</p>
        </main>
      </>
    );
  }

  const returnableItems = order.returnInformation.returnableLineItems.nodes;
  const nonReturnableItems = order.returnInformation.nonReturnableLineItems.nodes;

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Link href="/account/returns" className="text-sm text-neutral-500 underline underline-offset-4">← All orders</Link>
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Returns & refunds</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{order.name}</h1>
          <p className="mt-2 text-sm text-neutral-500">Order placed {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        {result === "requested" && <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Your return request was sent to the store. You can follow its status below.</p>}
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessages[error] ?? "Something went wrong. Please try again."}</p>}

        <RefundHistory refunds={order.refunds} />
        <ReturnHistory returns={order.returns.nodes} />

        <section className="mt-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Return eligibility</p>
            <h2 className="mt-2 text-2xl font-semibold">Choose items to return</h2>
            <p className="mt-2 text-sm text-neutral-600">Eligibility and available quantities are checked directly with Shopify before your request is submitted.</p>
          </div>

          {returnableItems.length ? (
            <form action={requestCustomerReturn} className="mt-5">
              <input type="hidden" name="orderId" value={order.id} />
              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                {returnableItems.map((item) => <ReturnableItem key={item.lineItem.id} item={item} />)}
              </div>
              <button type="submit" className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700">Submit return request</button>
              <p className="mt-3 text-xs text-neutral-500">Submitting creates a request for store approval. It does not issue an immediate refund.</p>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 p-6">
              <p className="font-medium">No items are currently eligible</p>
              <p className="mt-2 text-sm text-neutral-500">Shopify's return rules determine eligibility for this order.</p>
              {order.returnInformation.nonReturnableSummary?.nonReturnableReasons.length ? (
                <p className="mt-3 text-xs text-neutral-500">Reason: {order.returnInformation.nonReturnableSummary.nonReturnableReasons.map(readableStatus).join(", ")}</p>
              ) : null}
            </div>
          )}
          <NonReturnableItems items={nonReturnableItems} />
        </section>

        <div className="mt-10 border-t border-neutral-200 pt-6">
          <Link href={`/account/orders?id=${encodeURIComponent(order.id)}`} className="text-sm font-medium underline underline-offset-4">View order details</Link>
        </div>
      </main>
    </>
  );
}
