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
  const secondaryImage = product.images?.nodes?.[1] ?? null;

  return (
    <article className="group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
          {product.featuredImage ? (
            <>
              <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none" />
              {secondaryImage && (
                <Image src={secondaryImage.url} alt={secondaryImage.altText || `${product.title} alternate view`} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/35">Image coming soon</div>
          )}
          {!product.availableForSale && <span className="absolute left-3 top-3 bg-black/75 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">Sold out</span>}
          {product.availableForSale && <span className="absolute bottom-3 right-3 translate-y-2 bg-white px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">View piece ↗</span>}
        </div>
        <div className="flex items-start justify-between gap-3 pt-4 transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none">
          <h3 className="text-xs font-medium uppercase tracking-[0.04em] text-neutral-900 transition-colors group-hover:text-neutral-500 sm:text-sm">{product.title}</h3>
          <p className="shrink-0 text-xs tabular-nums text-neutral-700 sm:text-sm">{formatPrice(price.amount, price.currencyCode)}</p>
        </div>
      </Link>
    </article>
  );
}
