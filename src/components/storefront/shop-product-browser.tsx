"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CollectionCard } from "@/components/storefront/collection-card";
import { ProductCard } from "@/components/storefront/product-card";
import type { ShopifyCollection, ShopifyProduct } from "@/lib/shopify/types";

type SortMode = "featured" | "price-low" | "price-high" | "name";

interface ShopProductBrowserProps {
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  hasMoreProducts: boolean;
}

export function ShopProductBrowser({ products, collections, hasMoreProducts }: ShopProductBrowserProps) {
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("all");
  const [tag, setTag] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortMode>("featured");

  const productTypes = useMemo(
    () => [...new Set(products.map((product) => product.productType).filter((value): value is string => Boolean(value)))].sort(),
    [products],
  );
  const tags = useMemo(
    () => [...new Set(products.flatMap((product) => product.tags ?? []))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const price = Number(product.priceRange.minVariantPrice.amount);
      const matchesSearch = !normalizedSearch
        || product.title.toLowerCase().includes(normalizedSearch)
        || product.description.toLowerCase().includes(normalizedSearch)
        || (product.productType ?? "").toLowerCase().includes(normalizedSearch)
        || (product.tags ?? []).some((item) => item.toLowerCase().includes(normalizedSearch));
      const matchesType = productType === "all" || product.productType === productType;
      const matchesTag = tag === "all" || (product.tags ?? []).includes(tag);
      const matchesAvailability = availability === "all"
        || (availability === "available" ? product.availableForSale : !product.availableForSale);
      const matchesMin = minPrice === "" || price >= Number(minPrice);
      const matchesMax = maxPrice === "" || price <= Number(maxPrice);

      return matchesSearch && matchesType && matchesTag && matchesAvailability && matchesMin && matchesMax;
    });

    if (sort === "price-low") filtered.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
    if (sort === "price-high") filtered.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
    if (sort === "name") filtered.sort((a, b) => a.title.localeCompare(b.title));

    return filtered;
  }, [products, search, productType, tag, availability, minPrice, maxPrice, sort]);

  const resetFilters = () => {
    setSearch("");
    setProductType("all");
    setTag("all");
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  };

  const filterFields = (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Category</span>
        <select value={productType} onChange={(event) => setProductType(event.target.value)} className="w-full border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-900 outline-none focus:border-neutral-900">
          <option value="all">All categories</option>
          {productTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Collection tag</span>
        <select value={tag} onChange={(event) => setTag(event.target.value)} className="w-full border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-900 outline-none focus:border-neutral-900">
          <option value="all">All tags</option>
          {tags.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>

      <fieldset>
        <legend className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Availability</legend>
        <div className="space-y-3">
          {[
            { value: "all", label: "All pieces" },
            { value: "available", label: "In stock" },
            { value: "sold-out", label: "Sold out" },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-xs text-neutral-700">
              <input type="radio" name="availability" value={option.value} checked={availability === option.value} onChange={() => setAvailability(option.value)} className="accent-neutral-950" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Price range</legend>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Minimum price</span>
            <input type="number" min="0" inputMode="decimal" placeholder="Min $" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="w-full border border-neutral-200 px-3 py-3 text-xs outline-none focus:border-neutral-900" />
          </label>
          <label>
            <span className="sr-only">Maximum price</span>
            <input type="number" min="0" inputMode="decimal" placeholder="Max $" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="w-full border border-neutral-200 px-3 py-3 text-xs outline-none focus:border-neutral-900" />
          </label>
        </div>
      </fieldset>

      <button type="button" onClick={resetFilters} className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500 underline underline-offset-4 transition-colors hover:text-neutral-950">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div>
      {collections.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The archive, organized</p>
              <h2 className="text-2xl font-semibold uppercase tracking-[-0.05em] text-neutral-950 sm:text-3xl">Shop collections</h2>
            </div>
            <Link href="/collections" className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-neutral-950">All collections ↗</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {collections.slice(0, 4).map((collection, index) => <CollectionCard key={collection.id} collection={collection} index={index} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="all-pieces-heading">
        <div className="mb-7 flex flex-col gap-5 border-y border-neutral-200 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-500">HOODHOLIDAYZ / Store</p>
            <h2 id="all-pieces-heading" className="text-3xl font-semibold uppercase tracking-[-0.055em] text-neutral-950 sm:text-4xl">All pieces<span className="text-neutral-400">.</span></h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative">
              <span className="sr-only">Search products</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the archive" className="w-full border border-neutral-200 bg-white px-4 py-3 text-xs outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 sm:w-56" />
            </label>
            <label className="flex items-center gap-3">
              <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="min-w-40 border border-neutral-200 bg-white px-3 py-3 text-xs text-neutral-900 outline-none focus:border-neutral-900">
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-950">Filter by</h3>
                <span className="text-[9px] text-neutral-400">HH / 01</span>
              </div>
              {filterFields}
            </div>
          </aside>

          <div>
            <details className="mb-5 border-y border-neutral-200 py-4 lg:hidden">
              <summary className="cursor-pointer list-none text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-800 [&::-webkit-details-marker]:hidden">
                Filter pieces <span aria-hidden="true" className="ml-2 text-neutral-400">＋</span>
              </summary>
              <div className="pt-5">{filterFields}</div>
            </details>

            <div className="mb-5 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}</p>
              {(search || productType !== "all" || tag !== "all" || availability !== "all" || minPrice || maxPrice) && (
                <button type="button" onClick={resetFilters} className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500 hover:text-neutral-950">Reset filters</button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="border border-neutral-200 px-6 py-16 text-center">
                <p className="text-sm font-medium uppercase tracking-wide text-neutral-900">No pieces found.</p>
                <p className="mt-2 text-xs text-neutral-500">Try adjusting your search or clearing a filter.</p>
                <button type="button" onClick={resetFilters} className="mt-6 border border-neutral-900 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-neutral-900 hover:text-white">Clear filters</button>
              </div>
            )}

            {hasMoreProducts && (
              <p className="mt-10 border-t border-neutral-200 pt-5 text-center text-[10px] leading-6 text-neutral-500">
                Showing the first 250 products. Additional products are available through your Shopify collections.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
