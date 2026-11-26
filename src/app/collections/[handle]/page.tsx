import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { getCollection } from "@/lib/shopify/actions/get-collection";

type CollectionSort = "COLLECTION_DEFAULT" | "BEST_SELLING" | "CREATED" | "PRICE_ASC" | "PRICE_DESC" | "TITLE";

const sortOptions: { label: string; value: CollectionSort }[] = [
  { label: "Featured", value: "COLLECTION_DEFAULT" },
  { label: "Best selling", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED" },
  { label: "Price: low to high", value: "PRICE_ASC" },
  { label: "Price: high to low", value: "PRICE_DESC" },
  { label: "Alphabetical", value: "TITLE" },
];

function getSortSettings(sort: string | undefined) {
  const selected = sortOptions.find((option) => option.value === sort)?.value ?? "COLLECTION_DEFAULT";
  if (selected === "PRICE_ASC") return { sortKey: "PRICE", reverse: false, selected };
  if (selected === "PRICE_DESC") return { sortKey: "PRICE", reverse: true, selected };
  if (selected === "CREATED") return { sortKey: "CREATED", reverse: true, selected };
  if (selected === "TITLE") return { sortKey: "TITLE", reverse: false, selected };
  if (selected === "BEST_SELLING") return { sortKey: "BEST_SELLING", reverse: false, selected };
  return { sortKey: "COLLECTION_DEFAULT", reverse: false, selected };
}

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { handle } = await params;
  return { title: handle.replace(/-/g, " "), description: `Shop the ${handle.replace(/-/g, " ")} collection at HOODHOLIDAYZ.` };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const sortValue = Array.isArray(query.sort) ? query.sort[0] : query.sort;
  const cursorValue = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor;
  const { sortKey, reverse, selected } = getSortSettings(sortValue);
  const cursor = typeof cursorValue === "string" && cursorValue.length <= 512 ? cursorValue : undefined;

  let collection;
  try {
    collection = await getCollection({ handle, first: 16, after: cursor, sortKey, reverse });
  } catch (error) {
    console.error("Unable to load Shopify collection:", error);
    notFound();
  }

  if (!collection) notFound();

  const nextHref = collection.pageInfo.hasNextPage && collection.pageInfo.endCursor
    ? `/collections/${handle}?sort=${selected}&cursor=${encodeURIComponent(collection.pageInfo.endCursor)}`
    : null;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen bg-[#111] text-[#f2f0eb]">
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 lg:pb-16 lg:pt-16">
          <Link href="/collections" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-white">← All collections</Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">HOODHOLIDAYZ / COLLECTION</p>
              <h1 className="mt-4 text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.06em] sm:text-7xl">{collection.title}</h1>
              {collection.description && <p className="mt-6 max-w-xl text-sm leading-7 text-white/55">{collection.description}</p>}
            </div>
            {collection.image && (
              <div className="relative hidden aspect-[16/9] overflow-hidden bg-white/[0.06] lg:block">
                <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill unoptimized sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority />
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="mb-7 flex flex-col gap-4 border-y border-white/15 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{collection.products.length} products shown</p>
            <nav aria-label="Sort products" className="flex flex-wrap gap-x-4 gap-y-2">
              {sortOptions.map((option) => (
                <Link key={option.value} href={`/collections/${handle}?sort=${option.value}`} aria-current={selected === option.value ? "page" : undefined} className={`text-[10px] uppercase tracking-[0.12em] transition-colors ${selected === option.value ? "text-white" : "text-white/40 hover:text-white"}`}>
                  {option.label}
                </Link>
              ))}
            </nav>
          </div>

          {collection.products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-12">
              {collection.products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="border border-white/15 px-6 py-16 text-center">
              <p className="text-sm font-medium">This collection is waiting for its next drop.</p>
              <p className="mt-2 text-xs text-white/45">Add available products to this collection in Shopify Admin.</p>
            </div>
          )}

          {nextHref && (
            <div className="mt-14 flex justify-center">
              <Link href={nextHref} className="border border-white/35 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-white hover:bg-white hover:text-black">Next page <span aria-hidden="true">↗</span></Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
