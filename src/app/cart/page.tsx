import Image from "next/image";
import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { CartLineControls } from "@/components/storefront/cart-line-controls";
import {
  checkoutAction,
  getCartAction,
} from "@/lib/shopify/actions/cart-server-actions";

export const metadata = {
  title: "Your cart",
  description: "Review your shopping cart and continue to secure checkout.",
};

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

interface CartPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function CartPage({ searchParams }: CartPageProps) {
  const [{ error }, cart] = await Promise.all([searchParams, getCartAction()]);
  const lines = cart?.lines?.edges.map(({ node }) => node) ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <>
      <StoreHeader />
      <main className="mx-auto min-h-[65vh] max-w-5xl px-5 py-12 sm:px-8 lg:py-20">
        <div className="mb-10 flex items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Your selection
            </p>
            <h1 className="text-3xl font-medium tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              Shopping cart
            </h1>
          </div>
          <Link href="/#featured-products" className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-950">
            Continue shopping
          </Link>
        </div>

        {error && (
          <p role="alert" className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error === "expired" ? "Your cart expired. Please add your items again." : "Your cart is empty."}
          </p>
        )}

        {!cart || lines.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl italic text-neutral-800">Your cart is taking a breather.</p>
            <p className="mt-3 text-sm text-neutral-500">Find something you love and it’ll show up here.</p>
            <Link
              href="/#featured-products"
              className="mt-8 inline-flex h-12 items-center bg-neutral-950 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-neutral-700"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <div className="divide-y divide-neutral-200">
              {lines.map((line) => {
                const product = line.merchandise.product;
                const image = product.featuredImage;
                return (
                  <article key={line.id} className="flex gap-5 py-6 first:pt-0">
                    <Link href={`/products/${product.handle}`} className="relative h-32 w-28 shrink-0 overflow-hidden bg-neutral-100 sm:h-40 sm:w-32">
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.altText || product.title}
                          fill
                          unoptimized
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">No image</span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link href={`/products/${product.handle}`} className="text-sm font-medium text-neutral-950 hover:text-neutral-500">
                            {product.title}
                          </Link>
                          {line.merchandise.title !== "Default Title" && (
                            <p className="mt-1 text-xs text-neutral-500">{line.merchandise.title}</p>
                          )}
                          <p className="mt-2 text-xs text-neutral-500">
                            {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-neutral-900">
                          {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </p>
                      </div>
                      <CartLineControls lineId={line.id} quantity={line.quantity} />
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit border border-neutral-200 p-6">
              <h2 className="text-sm font-semibold text-neutral-950">Order summary</h2>
              <div className="mt-6 space-y-3 border-b border-neutral-200 pb-5 text-xs">
                <div className="flex justify-between gap-4 text-neutral-600">
                  <span>Items</span>
                  <span>{cart.totalQuantity}</span>
                </div>
                {subtotal && (
                  <div className="flex justify-between gap-4 text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal.amount, subtotal.currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-neutral-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              {total && (
                <div className="flex justify-between gap-4 py-5 text-sm font-semibold text-neutral-950">
                  <span>Estimated total</span>
                  <span>{formatPrice(total.amount, total.currencyCode)}</span>
                </div>
              )}
              <form action={checkoutAction}>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center bg-neutral-950 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-700"
                >
                  Continue to checkout
                </button>
              </form>
              <p className="mt-4 text-center text-[10px] leading-5 text-neutral-500">
                Final shipping, taxes, and payment are confirmed securely by Shopify.
              </p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
