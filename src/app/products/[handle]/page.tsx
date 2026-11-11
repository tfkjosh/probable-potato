import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoreHeader } from "@/components/storefront/store-header";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";
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
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <Link
          href="/#featured-products"
          className="mb-8 inline-flex text-xs text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="grid grid-cols-2 gap-3">
            {(images.length ? images : [null]).slice(0, 4).map((image, index) => (
              <div
                key={image?.id ?? index}
                className="relative aspect-[4/5] overflow-hidden bg-neutral-100"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText || product.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                    No product image
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:h-fit lg:py-8">
            {product.vendor && (
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {product.vendor}
              </p>
            )}
            <h1 className="text-3xl font-medium tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-5 text-lg text-neutral-800">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            <p className="mt-8 whitespace-pre-line text-sm leading-7 text-neutral-600">
              {product.description}
            </p>

            <div className="mt-10 border-y border-neutral-200 py-6">
              <p className="text-xs font-medium text-neutral-900">
                {product.availableForSale ? "Available for purchase" : "Currently sold out"}
              </p>
              {product.options?.filter((option) => option.name !== "Title").map((option) => (
                <div key={option.name} className="mt-5">
                  <p className="mb-2 text-xs font-medium text-neutral-700">{option.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <span
                        key={value}
                        className="border border-neutral-200 px-3 py-2 text-xs text-neutral-600"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <AddToCartForm variants={product.variants?.nodes ?? []} />
          </div>
        </div>
      </main>
    </>
  );
}
