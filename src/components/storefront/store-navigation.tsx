import Link from "next/link";

import type { ShopifyMenuItem } from "@/lib/shopify/types";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify/constants";

function getMenuHref(url: string) {
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    const storeDomain = SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");

    if (storeDomain && (parsed.hostname === storeDomain || parsed.hostname.endsWith(`.${storeDomain}`))) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return "/";
  }

  return url;
}

function MenuItems({ items, nested = false }: { items: ShopifyMenuItem[]; nested?: boolean }) {
  return (
    <ul className={nested ? "space-y-3 border-l border-neutral-200 pl-4" : "flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"}>
      {items.map((item) => {
        const href = getMenuHref(item.url);
        const hasChildren = item.items.length > 0;

        return (
          <li key={item.id} className={hasChildren ? "group relative" : undefined}>
            {hasChildren ? (
              <details className="group/menu">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium tracking-wide text-neutral-600 transition-colors hover:text-neutral-950 [&::-webkit-details-marker]:hidden">
                  {item.title}
                  <span aria-hidden="true" className="text-[9px] text-neutral-400 transition-transform group-open/menu:rotate-180">⌄</span>
                </summary>
                <div className="pt-3 sm:absolute sm:left-0 sm:top-full sm:min-w-52 sm:pt-4">
                  <div className="border border-neutral-200 bg-white p-4 shadow-xl shadow-black/5">
                    <MenuItems items={item.items} nested />
                  </div>
                </div>
              </details>
            ) : (
              <Link href={href} className="text-xs font-medium tracking-wide text-neutral-600 transition-colors hover:text-neutral-950">
                {item.title}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function StoreNavigation({ items }: { items: ShopifyMenuItem[] }) {
  const navigation: ShopifyMenuItem[] = items.length > 0 ? items : [
    { id: "shop", title: "Shop", url: "/shop", type: "HTTP", items: [] },
    { id: "collections", title: "Collections", url: "/collections", type: "HTTP", items: [] },
    { id: "about", title: "About", url: "/#about", type: "HTTP", items: [] },
  ];

  return (
    <>
      <nav aria-label="Main navigation" className="hidden sm:block">
        <MenuItems items={navigation} />
      </nav>
      <details className="relative sm:hidden">
        <summary aria-label="Open navigation menu" className="flex h-10 cursor-pointer list-none items-center justify-center px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700 [&::-webkit-details-marker]:hidden">
          Menu <span aria-hidden="true" className="ml-2 text-sm">☰</span>
        </summary>
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(88vw,340px)] border border-neutral-200 bg-white p-5 shadow-xl shadow-black/10">
          <MenuItems items={navigation} />
        </div>
      </details>
    </>
  );
}
