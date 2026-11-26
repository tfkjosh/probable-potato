import Link from "next/link";

import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { CollectionCard } from "@/components/storefront/collection-card";
import { getProducts } from "@/lib/shopify/actions/get-products";
import { getCollections } from "@/lib/shopify/actions/get-collections";
import type { ShopifyProduct, ShopifyCollection } from "@/lib/shopify/types";
import {
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  SHOPIFY_STORE_DOMAIN,
} from "@/lib/shopify/constants";

export const metadata = {
  title: "Shop",
  description: "Explore the latest streetwear drops and collections from HOODHOLIDAYZ.",
};

export default async function HomePage() {
  const isShopifyConfigured =
    Boolean(SHOPIFY_STORE_DOMAIN) && Boolean(SHOPIFY_STOREFRONT_PRIVATE_TOKEN);

  let products: ShopifyProduct[] = [];
  let collections: ShopifyCollection[] = [];
  let shopifyError = false;

  if (isShopifyConfigured) {
    try {
      const [productResult, collectionResult] = await Promise.all([
        getProducts({ first: 8, sortKey: "BEST_SELLING" }),
        getCollections({ first: 3 }),
      ]);
      products = productResult.products;
      collections = collectionResult.collections;
    } catch (error) {
      console.error("Unable to load Shopify storefront data:", error);
      shopifyError = true;
    }
  }

  return (
    <>
      <StoreHeader />
      <main>
        <section className="relative isolate overflow-hidden bg-[#111] text-[#f2f0eb]">
          <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div className="max-w-2xl">
              <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                HOODHOLIDAYZ · Future vintage / streetwear archive
              </p>
              <h1 className="text-5xl font-semibold uppercase leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                Worn before.
                <br />
                <span className="text-white/45">Built for next.</span>
              </h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/60 sm:text-base">
                Rare finds, essential streetwear, and pieces with a past. Discover the next drop.
              </p>
              <Link href="/collections" className="mt-9 inline-flex items-center gap-8 border-b border-white/70 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-60">
                Explore collections <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="relative hidden aspect-[5/4] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_65%_35%,rgba(255,255,255,0.16),transparent_38%),linear-gradient(135deg,#292929,#111_55%,#454545)] lg:block">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.08)_50%,transparent_65%)]" />
              <div className="absolute bottom-8 left-8 border-l border-white/35 pl-4">
                <p className="text-[9px] uppercase tracking-[0.25em] text-white/45">Independent fashion archive</p>
                <p className="mt-2 text-2xl font-semibold uppercase tracking-[-0.04em] text-white">Find your next piece.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="collections" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Browse the archive</p>
              <h2 className="text-3xl font-semibold uppercase tracking-[-0.05em] text-neutral-950 sm:text-4xl">Collections</h2>
            </div>
            <Link href="/collections" className="pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:text-neutral-950">View all ↗</Link>
          </div>
          {!isShopifyConfigured ? (
            <div className="border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500">Connect Shopify to display your collections.</div>
          ) : shopifyError ? (
            <div className="border border-neutral-200 px-6 py-10 text-center text-sm text-neutral-500">Shopify collections could not be loaded right now.</div>
          ) : collections.length === 0 ? (
            <div className="border border-neutral-200 px-6 py-10 text-center text-sm text-neutral-500">Create collections in Shopify Admin to feature them here.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {collections.map((collection, index) => <CollectionCard key={collection.id} collection={collection} index={index} />)}
            </div>
          )}
        </section>

        <section id="featured-products" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Selected from the archive</p>
              <h2 className="text-3xl font-semibold uppercase tracking-[-0.05em] text-neutral-950 sm:text-4xl">Featured pieces</h2>
            </div>
            {products.length > 0 && <span className="pb-1 text-xs tabular-nums text-neutral-500">{products.length} pieces</span>}
          </div>
          {!isShopifyConfigured ? (
            <div className="border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">Connect your Shopify store to show products here.</p>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-neutral-500">Add your store domain and private Storefront API token to the environment variables. See the README for setup instructions.</p>
            </div>
          ) : shopifyError ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">Products couldn’t be loaded right now.</p>
              <p className="mt-2 text-xs text-neutral-500">Check your Storefront API credentials and API access in Shopify Admin.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-neutral-900">Your Shopify store is connected.</p>
              <p className="mt-2 text-xs text-neutral-500">Add active products in Shopify Admin and they’ll appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-12">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>

        <section id="about" className="bg-[#111] px-5 py-20 text-center text-[#f2f0eb] sm:px-8 lg:py-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">HOODHOLIDAYZ / Est. in the archive</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold uppercase leading-tight tracking-[-0.05em] sm:text-5xl">Style with a past. Made for what’s next.</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/55">A new perspective on vintage, streetwear, and individual style.</p>
        </section>
      </main>
      <footer className="border-t border-neutral-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-neutral-500 sm:flex-row">
          <span className="font-semibold tracking-[0.2em] text-neutral-900">HOODHOLIDAYZ.</span>
          <span>Powered by Shopify · Built with Next.js</span>
        </div>
      </footer>
    </>
  );
}
