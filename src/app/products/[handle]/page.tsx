import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreHeader } from "@/components/storefront/store-header";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { getProduct } from "@/lib/shopify/actions/get-product";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  let product;
  try {
    product = await getProduct(handle);
  } catch (error) {
    console.error("Unable to load Shopify product:", error);
    notFound();
  }

  if (!product) notFound();

  const images = product.images?.nodes ?? [];
  const price = product.priceRange.minVariantPrice;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen bg-[#f4f1eb] text-neutral-950">
        <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 lg:px-12 lg:pb-28 lg:pt-10">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-neutral-500">
            <Link href="/" className="transition-colors hover:text-black">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/collections" className="transition-colors hover:text-black">
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[45vw] truncate text-neutral-900">{product.title}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-16 xl:gap-24">
            <ProductGallery images={images} productTitle={product.title} />

            <section className="lg:sticky lg:top-28 lg:py-3">
              <div className="border-b border-black/15 pb-7">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  {product.vendor && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      {product.vendor}
                    </span>
                  )}
                  {product.productType && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-neutral-400" />
                      <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                        {product.productType}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="max-w-xl text-3xl font-medium uppercase leading-[1.05] tracking-[-0.045em] sm:text-4xl xl:text-5xl">
                  {product.title}
                </h1>

                <p className="mt-5 text-sm font-medium tabular-nums text-neutral-900">
                  {formatPrice(price.amount, price.currencyCode)}
                  {product.priceRange.maxVariantPrice.amount !== price.amount && (
                    <span className="ml-2 text-xs font-normal text-neutral-500">
                      – {formatPrice(
                        product.priceRange.maxVariantPrice.amount,
                        product.priceRange.maxVariantPrice.currencyCode,
                      )}
                    </span>
                  )}
                </p>
              </div>

              <AddToCartForm
                variants={product.variants?.nodes ?? []}
                options={product.options ?? []}
              />

              <div className="mt-8 border-t border-black/15">
                <details className="group border-b border-black/15">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] font-semibold uppercase tracking-[0.18em] marker:content-none">
                    Product details
                    <span className="text-lg font-light transition-transform group-open:rotate-45 motion-reduce:transition-none">
                      +
                    </span>
                  </summary>
                  <p className="whitespace-pre-line pb-6 text-xs leading-6 text-neutral-600">
                    {product.description || "Product details coming soon."}
                  </p>
                </details>
                <div className="flex items-center justify-between border-b border-black/15 py-5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  <span>Availability</span>
                  <span className="font-normal tracking-[0.08em] text-neutral-600">
                    {product.availableForSale ? "In stock" : "Sold out"}
                  </span>
                </div>
              </div>

              <p className="mt-7 text-[9px] uppercase leading-5 tracking-[0.16em] text-neutral-400">
                HOODHOLIDAYZ — Independent streetwear. Made to be worn.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
