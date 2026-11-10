import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { getProducts } from "@/lib/shopify/actions/get-products";
import {
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  SHOPIFY_STORE_DOMAIN,
} from "@/lib/shopify/constants";

export const metadata = {
  title: "Shop",
  description: "Explore the latest products from our Shopify storefront.",
};

export default async function HomePage() {
  const isShopifyConfigured =
    Boolean(SHOPIFY_STORE_DOMAIN) && Boolean(SHOPIFY_STOREFRONT_PRIVATE_TOKEN);

  let products = [];
  let shopifyError = false;

  if (isShopifyConfigured) {
    try {
      const result = await getProducts({ first: 8, sortKey: "BEST_SELLING" });
      products = result.products;
    } catch (error) {
      console.error("Unable to load Shopify products:", error);
      shopifyError = true;
    }
  }

  return (
    <>
      <StoreHeader />
      <main>
        <section className="relative isolate overflow-hidden bg-[#f4f2ed]">
          <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div className="max-w-2xl">
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                Thoughtfully selected · Made to be lived in
              </p>
              <h1 className="text-5xl font-medium leading-[1.04] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-7xl">
                Find your
                <br />
                everyday
                <br />
                <span className="font-serif italic font-normal">essential.</span>
              </h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-neutral-600 sm:text-base">
                A considered collection of pieces designed to fit naturally into
                the way you live.
              </p>
              <Link
                href="#featured-products"
                className="mt-9 inline-flex items-center gap-8 border-b border-neutral-950 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-950 transition-opacity hover:opacity-60"
              >
                Explore the collection <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="relative hidden aspect-[5/4] overflow-hidden bg-[#e7e3dc] lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,rgba(255,255,255,0.85),transparent_42%),linear-gradient(135deg,#dedbd4,#f7f5f0_52%,#c9c4ba)]" />
              <div className="absolute bottom-8 left-8 max-w-[220px] border-l border-neutral-500/50 pl-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  The collection
                </p>
                <p className="mt-2 font-serif text-2xl italic text-neutral-800">
                  Less, but better.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="featured-products"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28"
        >
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Curated for you
              </p>
              <h2 className="text-3xl font-medium tracking-[-0.04em] text-neutral-950 sm:text-4xl">
                Featured products
              </h2>
            </div>
            {products.length > 0 && (
              <span className="pb-1 text-xs text-neutral-500">
                {products.length} items
              </span>
            )}
          </div>

          {!isShopifyConfigured ? (
            <div className="border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">
                Connect your Shopify store to show products here.
              </p>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-neutral-500">
                Add your store domain and private Storefront API token to the
                environment variables. See the README for setup instructions.
              </p>
            </div>
          ) : shopifyError ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">
                Products couldn’t be loaded right now.
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Check your Storefront API credentials and API access in Shopify Admin.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">
                Your Shopify store is connected.
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Add available products in Shopify Admin and they’ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section id="about" className="bg-[#f4f2ed] px-5 py-20 text-center sm:px-8 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
            A better way to shop
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl font-serif text-3xl italic leading-tight text-neutral-900 sm:text-5xl">
            Good design belongs in the details.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-neutral-600">
            We believe the right pieces make everyday moments feel a little more
            intentional.
          </p>
        </section>
      </main>
      <footer className="border-t border-neutral-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-neutral-500 sm:flex-row">
          <span className="font-semibold tracking-[0.2em] text-neutral-900">STORE.</span>
          <span>Powered by Shopify · Built with Next.js</span>
        </div>
      </footer>
    </>
  );
}
