import Image from "next/image";
import Link from "next/link";
import { StoreHeader } from "@/components/storefront/store-header";
import { getCollections } from "@/lib/shopify/actions/get-collections";
import { SHOPIFY_STOREFRONT_PRIVATE_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/shopify/constants";

export const metadata = {
  title: "Collections",
  description: "Explore the HOODHOLIDAYZ collections.",
};

export default async function CollectionsPage() {
  const isShopifyConfigured = Boolean(SHOPIFY_STORE_DOMAIN) && Boolean(SHOPIFY_STOREFRONT_PRIVATE_TOKEN);
  let collections: Awaited<ReturnType<typeof getCollections>>["collections"] = [];
  let hasError = false;

  if (isShopifyConfigured) {
    try {
      const result = await getCollections({ first: 24 });
      collections = result.collections;
    } catch (error) {
      console.error("Unable to load Shopify collections:", error);
      hasError = true;
    }
  }

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen bg-[#111] text-[#f2f0eb]">
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 lg:pb-16 lg:pt-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">HOODHOLIDAYZ / SHOP</p>
          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <h1 className="max-w-3xl text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.06em] sm:text-7xl">The collections<span className="text-white/35">.</span></h1>
            <p className="max-w-xs text-sm leading-6 text-white/55">Explore the pieces, drops, and archive finds that make up the HOODHOLIDAYZ universe.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          {!isShopifyConfigured ? (
            <div className="border border-white/15 px-6 py-12 text-center text-sm text-white/65">Connect your Shopify storefront credentials to display collections.</div>
          ) : hasError ? (
            <div className="border border-white/15 px-6 py-12 text-center text-sm text-white/65">Collections could not be loaded. Check your Shopify Storefront API access and try again.</div>
          ) : collections.length === 0 ? (
            <div className="border border-white/15 px-6 py-12 text-center text-sm text-white/65">No collections are available yet. Create and publish collections in Shopify Admin.</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection, index) => (
                <Link key={collection.id} href={`/collections/${collection.handle}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.06]">
                    {collection.image ? (
                      <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/30">Collection {String(index + 1).padStart(2, "0")}</div>
                    )}
                    <span className="absolute bottom-4 left-4 bg-black/65 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">Explore collection <span aria-hidden="true">↗</span></span>
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-4">
                    <h2 className="text-lg font-semibold uppercase tracking-[-0.02em]">{collection.title}</h2>
                    <span className="text-xs text-white/40">HH / {String(index + 1).padStart(2, "0")}</span>
                  </div>
                  {collection.description && <p className="mt-2 line-clamp-2 max-w-md text-xs leading-5 text-white/50">{collection.description}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
