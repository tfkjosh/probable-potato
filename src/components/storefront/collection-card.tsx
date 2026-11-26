import Image from "next/image";
import Link from "next/link";
import type { ShopifyCollection } from "@/lib/shopify/types";

export function CollectionCard({ collection, index }: { collection: ShopifyCollection; index: number }) {
  return (
    <Link href={`/collections/${collection.handle}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
        {collection.image ? (
          <Image src={collection.image.url} alt={collection.image.altText || collection.title} fill unoptimized sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-white/35">HH / {String(index + 1).padStart(2, "0")}</div>
        )}
        <span className="absolute bottom-4 left-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">Explore ↗</span>
      </div>
      <h3 className="pt-4 text-sm font-semibold uppercase tracking-[0.04em] text-neutral-950">{collection.title}</h3>
      {collection.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{collection.description}</p>}
    </Link>
  );
}
