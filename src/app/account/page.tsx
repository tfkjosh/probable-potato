import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { getCustomer } from "@/lib/shopify/customer/actions/get-customer";
import { getCustomerOrders } from "@/lib/shopify/customer/actions/get-customer-orders";
import { getCustomerAddresses } from "@/lib/shopify/customer/actions/get-customer-addresses";
import { updateCustomerProfile } from "@/lib/shopify/customer/actions/update-customer-profile";
import { updateCustomerEmailMarketing } from "@/lib/shopify/customer/actions/update-customer-marketing";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "@/lib/shopify/customer/actions/manage-customer-addresses";

export const dynamic = "force-dynamic";

interface AccountPageProps {
  searchParams: Promise<{ error?: string; profile?: string; address?: string; marketing?: string }>;
}

const authErrors: Record<string, string> = {
  auth_setup: "Customer sign-in is not configured correctly. Check the server environment variables.",
  login_cancelled: "Sign-in was cancelled. You can try again.",
  invalid_callback: "The sign-in response could not be verified. Please try again.",
  token_exchange: "Shopify could not complete sign-in. Please try again.",
  login_required: "Please sign in before updating your account.",
};

const profileMessages: Record<string, { message: string; isError: boolean }> = {
  updated: { message: "Your profile details have been updated.", isError: false },
  invalid: { message: "Enter a first name and keep each name under 100 characters.", isError: true },
  failed: { message: "Shopify couldn't update your profile. Check your account API permissions and try again.", isError: true },
};

const marketingMessages: Record<string, { message: string; isError: boolean }> = {\n  subscribed: { message: "You are now subscribed to email updates.", isError: false },\n  unsubscribed: { message: "You have been unsubscribed from email updates.", isError: false },\n  failed: { message: "Shopify could not update your email preferences. Please try again.", isError: true },\n};\n\nconst addressMessages: Record<string, { message: string; isError: boolean }> = {
  created: { message: "Your new address has been saved.", isError: false },
  updated: { message: "Your address has been updated.", isError: false },
  deleted: { message: "Your address has been deleted.", isError: false },
  default: { message: "Your default address has been updated.", isError: false },
  invalid: { message: "Check the required address fields and try again.", isError: true },
  failed: { message: "Shopify couldn't complete that address change. Check your account permissions and try again.", isError: true },
};

function AddressFields({
  address,
}: {
  address?: {
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    zoneCode: string | null;
    zip: string | null;
    countryCode: string | null;
    phoneNumber: string | null;
  };
}) {
  const fieldClass = "h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm font-normal outline-none transition focus:border-neutral-950";
  const labelClass = "grid gap-1.5 text-xs font-medium text-neutral-600";

  return (
    <>
      <label className={labelClass}>First name
        <input className={fieldClass} name="firstName" required maxLength={100} autoComplete="given-name" defaultValue={address?.firstName ?? ""} />
      </label>
      <label className={labelClass}>Last name
        <input className={fieldClass} name="lastName" required maxLength={100} autoComplete="family-name" defaultValue={address?.lastName ?? ""} />
      </label>
      <label className={labelClass}>Company (optional)
        <input className={fieldClass} name="company" maxLength={255} autoComplete="organization" defaultValue={address?.company ?? ""} />
      </label>
      <label className={labelClass}>Address line 1
        <input className={fieldClass} name="address1" required maxLength={255} autoComplete="address-line1" defaultValue={address?.address1 ?? ""} />
      </label>
      <label className={labelClass}>Address line 2
        <input className={fieldClass} name="address2" maxLength={255} autoComplete="address-line2" defaultValue={address?.address2 ?? ""} />
      </label>
      <label className={labelClass}>City
        <input className={fieldClass} name="city" required maxLength={100} autoComplete="address-level2" defaultValue={address?.city ?? ""} />
      </label>
      <label className={labelClass}>State / Province code
        <input className={fieldClass} name="zoneCode" maxLength={20} autoComplete="address-level1" placeholder="e.g. TX" defaultValue={address?.zoneCode ?? ""} />
      </label>
      <label className={labelClass}>ZIP / Postal code
        <input className={fieldClass} name="zip" required maxLength={32} autoComplete="postal-code" defaultValue={address?.zip ?? ""} />
      </label>
      <label className={labelClass}>Country code
        <input className={fieldClass} name="countryCode" required minLength={2} maxLength={2} pattern="[A-Za-z]{2}" autoComplete="country" placeholder="US" defaultValue={address?.countryCode ?? "US"} />
      </label>
      <label className={labelClass}>Phone (optional)
        <input className={fieldClass} name="phoneNumber" type="tel" maxLength={32} autoComplete="tel" placeholder="+12125550123" defaultValue={address?.phoneNumber ?? ""} />
      </label>
    </>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { error, profile, address: addressStatus, marketing } = await searchParams;
  const customer = await getCustomer();

  if (!customer) {
    return (
      <>
        <StoreHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">Customer account</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign in to your account</h1>
          <p className="mt-4 max-w-xl text-neutral-600">View your profile, order history, and saved addresses through Shopify.</p>
          {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{authErrors[error] ?? "Something went wrong. Please try again."}</p>}
          <Link href="/api/auth/shopify" className="mt-8 inline-flex w-fit rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700">Continue with Shopify</Link>
        </main>
      </>
    );
  }

  const [orders, addresses] = await Promise.all([getCustomerOrders(), getCustomerAddresses()]);
  const profileMessage = profile ? profileMessages[profile] : undefined;
  const addressMessage = addressStatus ? addressMessages[addressStatus] : undefined;\n  const marketingMessage = marketing ? marketingMessages[marketing] : undefined;

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">Customer account</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome{customer.firstName ? `, ${customer.firstName}` : ""}</h1>
            <p className="mt-2 text-neutral-600">{customer.emailAddress?.emailAddress ?? "Your Shopify account"}</p>
          </div>
          <form action="/api/auth/shopify/logout" method="post">
            <button type="submit" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100">Sign out</button>
          </form>
        </div>

        <section className="mt-12 rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Personal details</p>
            <h2 className="mt-2 text-xl font-semibold">Your profile</h2>
            <p className="mt-2 text-sm text-neutral-500">Update the name associated with your Shopify customer account.</p>
          </div>
          {profileMessage && <p role={profileMessage.isError ? "alert" : "status"} className={`mb-5 rounded-lg px-4 py-3 text-sm ${profileMessage.isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{profileMessage.message}</p>}
          <form action={updateCustomerProfile} className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-neutral-700">First name
              <input name="firstName" type="text" autoComplete="given-name" required maxLength={100} defaultValue={customer.firstName ?? ""} className="h-12 rounded-lg border border-neutral-300 px-4 font-normal outline-none transition focus:border-neutral-950" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-neutral-700">Last name
              <input name="lastName" type="text" autoComplete="family-name" maxLength={100} defaultValue={customer.lastName ?? ""} className="h-12 rounded-lg border border-neutral-300 px-4 font-normal outline-none transition focus:border-neutral-950" />
            </label>
            <div className="sm:col-span-2"><button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-700">Save changes</button></div>
          </form>
        </section>


        <section className="mt-8 rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Communication preferences</p>
              <h2 className="mt-2 text-xl font-semibold">Email updates</h2>
              <p className="mt-2 max-w-xl text-sm text-neutral-500">Choose whether you receive promotional emails and product updates from the store. Order and account service emails are not affected.</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
              {customer.emailAddress?.marketingState === "SUBSCRIBED" ? "Subscribed" : customer.emailAddress?.marketingState === "PENDING" ? "Confirmation pending" : customer.emailAddress?.marketingState === "UNSUBSCRIBED" ? "Unsubscribed" : "Not subscribed"}
            </span>
          </div>
          {marketingMessage && <p role={marketingMessage.isError ? "alert" : "status"} className={`mt-5 rounded-lg px-4 py-3 text-sm ${marketingMessage.isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{marketingMessage.message}</p>}
          <p className="mt-4 text-sm text-neutral-600">{customer.emailAddress?.emailAddress ?? "No email address on file"}</p>
          <form action={updateCustomerEmailMarketing} className="mt-5">
            <input type="hidden" name="intent" value={customer.emailAddress?.marketingState === "SUBSCRIBED" || customer.emailAddress?.marketingState === "PENDING" ? "unsubscribe" : "subscribe"} />
            <button type="submit" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100">
              {customer.emailAddress?.marketingState === "SUBSCRIBED" || customer.emailAddress?.marketingState === "PENDING" ? "Unsubscribe from marketing" : "Subscribe to email updates"}
            </button>
          </form>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Shipping details</p>
              <h2 className="mt-2 text-2xl font-semibold">Saved addresses</h2>
            </div>
            <p className="text-xs text-neutral-500">{addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}</p>
          </div>

          {addressMessage && <p role={addressMessage.isError ? "alert" : "status"} className={`mt-5 rounded-lg px-4 py-3 text-sm ${addressMessage.isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{addressMessage.message}</p>}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {addresses.map((savedAddress) => (
              <article key={savedAddress.id} className="rounded-2xl border border-neutral-200 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{[savedAddress.firstName, savedAddress.lastName].filter(Boolean).join(" ")}</p>
                  {savedAddress.isDefault && <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-700">Default</span>}
                </div>
                <p className="text-sm leading-6 text-neutral-600">
                  {[savedAddress.company, savedAddress.address1, savedAddress.address2, savedAddress.city, savedAddress.province, savedAddress.zip, savedAddress.country].filter(Boolean).join(", ")}
                </p>
                {savedAddress.phoneNumber && <p className="mt-2 text-xs text-neutral-500">{savedAddress.phoneNumber}</p>}

                <details className="mt-5 border-t border-neutral-100 pt-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-neutral-700">Edit address</summary>
                  <form action={updateCustomerAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="addressId" value={savedAddress.id} />
                    <AddressFields address={savedAddress} />
                    <label className="flex items-center gap-2 text-xs text-neutral-600 sm:col-span-2">
                      <input type="checkbox" name="defaultAddress" defaultChecked={savedAddress.isDefault} />
                      Set as default address
                    </label>
                    <button type="submit" className="rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-medium text-white sm:col-span-2">Save address</button>
                  </form>
                </details>

                <div className="mt-4 flex flex-wrap gap-3">
                  {!savedAddress.isDefault && (
                    <form action={setDefaultCustomerAddress}>
                      <input type="hidden" name="addressId" value={savedAddress.id} />
                      <button type="submit" className="text-xs font-medium text-neutral-600 underline underline-offset-4">Make default</button>
                    </form>
                  )}
                  {!savedAddress.isDefault && (
                    <form action={deleteCustomerAddress}>
                      <input type="hidden" name="addressId" value={savedAddress.id} />
                      <button type="submit" className="text-xs font-medium text-red-600 underline underline-offset-4">Delete</button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Address book</p>
            <h3 className="mt-2 text-xl font-semibold">Add a new address</h3>
            <p className="mt-2 text-sm text-neutral-500">Save another delivery destination to your Shopify account.</p>
            <form action={createCustomerAddress} className="mt-6 grid gap-4 sm:grid-cols-2">
              <AddressFields />
              <label className="flex items-center gap-2 text-xs text-neutral-600 sm:col-span-2">
                <input type="checkbox" name="defaultAddress" />
                Make this my default address
              </label>
              <div className="sm:col-span-2"><button type="submit" className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700">Add address</button></div>
            </form>
          </section>
        </section>

        <section className="mt-12 rounded-2xl border border-neutral-200 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Order support</p>
              <h2 className="mt-2 text-xl font-semibold">Returns & refunds</h2>
              <p className="mt-2 text-sm text-neutral-500">Check eligible items, request a return, and follow its status.</p>
            </div>
            <Link href="/account/returns" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-100">Manage returns</Link>
          </div>
        </section>

        <section id="orders" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">Recent orders</h2>
            <p className="text-xs text-neutral-500">Showing your latest {orders.length} orders</p>
          </div>
          {orders.length ? (
            <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
              {orders.map((order) => (
                <article key={order.id} className="flex flex-wrap justify-between gap-3 py-4">
                  <div><p className="font-medium">Order #{order.number}</p><p className="mt-1 text-sm text-neutral-500">Placed {new Date(order.processedAt).toLocaleDateString()}</p></div>
                  <div className="text-right text-sm"><p className="font-medium">{new Intl.NumberFormat(undefined, { style: "currency", currency: order.totalPrice.currencyCode }).format(Number(order.totalPrice.amount))}</p><p className="mt-1 text-neutral-500">{order.fulfillmentStatus ?? order.financialStatus ?? "Processing"}</p><Link href={`/account/orders?id=${encodeURIComponent(order.id)}`} className="mt-2 inline-flex text-xs font-semibold underline underline-offset-4">View details</Link></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 border border-dashed border-neutral-300 px-6 py-10 text-center">
              <p className="text-sm font-medium text-neutral-900">No orders yet</p>
              <p className="mt-2 text-sm text-neutral-500">Your Shopify orders will appear here after your first purchase.</p>
              <Link href="/#featured-products" className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4">Explore the collection</Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
