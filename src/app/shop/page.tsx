import { StoreHeader } from "@/components/storefront/store-header";
import { ShopProductBrowser } from "@/components/storefront/shop-product-browser";
import { getProducts } from "@/lib/shopify/actions/get-products";
import { getCollections } from "@/lib/shopify/actions/get-collections";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/types";
import { SHOPIFY_STOREFRONT_PRIVATE_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/shopify/constants";

export const metadata = {
  title: "Shop the archive",
  description: "Discover streetwear, vintage finds, and the latest HOODHOLIDAYZ pieces.",
};

export default async function ShopPage() {
  const isShopifyConfigured = Boolean(SHOPIFY_STORE_DOMAIN) && Boolean(SHOPIFY_STOREFRONT_PRIVATE_TOKEN);
  let products: ShopifyProduct[] = [];
  let collections: ShopifyCollection[] = [];
  let hasMoreProducts = false;
  let hasError = false;

  if (isShopifyConfigured) {
    try {
      const [productResult, collectionResult] = await Promise.all([
        getProducts({ first: 250, sortKey: "BEST_SELLING" }),
        getCollections({ first: 8 }),
      ]);
      products = productResult.products;
      collections = collectionResult.collections;
      hasMoreProducts = productResult.pageInfo.hasNextPage;
    } catch (error) {
      console.error("Unable to load the HOODHOLIDAYZ shop:", error);
      hasError = true;
    }
  }

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen bg-white">
        <section className="bg-[#111] px-5 py-16 text-[#f2f0eb] sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/45">HOODHOLIDAYZ / Online store</p>
            <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold uppercase leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-8xl">
                The archive<span className="text-white/35">.</span>
              </h1>
              <p className="max-w-sm text-sm leading-7 text-white/55">
                Shop the latest drops, explore collections, and find pieces worth keeping.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          {!isShopifyConfigured ? (
            <div className="border border-dashed border-neutral-300 px-6 py-16 text-center">
              <p className="text-sm font-medium text-neutral-900">Connect Shopify to open the archive.</p>
              <p className="mt-2 text-xs text-neutral-500">Add your Storefront API credentials to the environment to display products and collections.</p>
            </div>
          ) : hasError ? (
            <div className="border border-neutral-200 px-6 py-16 text-center">
              <p className="text-sm font-medium text-neutral-900">The archive is temporarily unavailable.</p>
              <p className="mt-2 text-xs text-neutral-500">Check your Shopify Storefront API access and try again.</p>
            </div>
          ) : (
            <ShopProductBrowser products={products} collections={collections} hasMoreProducts={hasMoreProducts} />
          )}
        </section>
      </main>
    </>
  );
}
