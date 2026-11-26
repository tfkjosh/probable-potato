"use client";

import Image from "next/image";
import { useState } from "react";

import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({
  images,
  productTitle,
}: {
  images: ShopifyImage[];
  productTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (!images.length) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[#e9e5de] text-[10px] uppercase tracking-[0.22em] text-neutral-500">
        Image coming soon
      </div>
    );
  }

  return (
    <section aria-label="Product images" className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e5de]">
        <Image
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.altText || productTitle}
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition-opacity duration-300 motion-reduce:transition-none"
        />
        <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1.5 text-[9px] font-medium tracking-[0.16em] text-white backdrop-blur-sm">
          {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image.id ?? image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-[4/5] overflow-hidden bg-[#e9e5de] outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 motion-reduce:transition-none ${activeIndex === index ? "opacity-100 ring-1 ring-black ring-offset-2" : "opacity-60 hover:opacity-100"}`}
            >
              <Image
                src={image.url}
                alt={image.altText || `${productTitle} view ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 640px) 22vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
