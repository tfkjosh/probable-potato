import Image from "next/image";
import Link from "next/link";

import type { ShopifyProduct } from "@/lib/shopify/types";

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const price = product.priceRange.minVariantPrice;

  return (
    <article className="group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
              Image coming soon
            </div>
          )}
          {!product.availableForSale && (
            <span className="absolute left-3 top-3 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
              Sold out
            </span>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 pt-4">
          <h3 className="text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-500">
            {product.title}
          </h3>
          <p className="shrink-0 text-sm text-neutral-700">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </article>
  );
}
