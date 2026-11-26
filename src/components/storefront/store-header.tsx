import Link from "next/link";

import { AccountNavLink } from "@/components/storefront/account-nav-link";
import { StoreNavigation } from "@/components/storefront/store-navigation";
import { getMenu } from "@/lib/shopify/actions/get-menu";
import { DEFAULT_MENU_HANDLE, SHOPIFY_STOREFRONT_PRIVATE_TOKEN, SHOPIFY_STORE_DOMAIN } from "@/lib/shopify/constants";

export async function StoreHeader() {
  let menuItems = [];

  if (SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_PRIVATE_TOKEN) {
    try {
      const menu = await getMenu(DEFAULT_MENU_HANDLE);
      menuItems = menu?.items ?? [];
    } catch (error) {
      console.error("Unable to load Shopify navigation menu:", error);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-[0.22em] text-neutral-950" aria-label="HOODHOLIDAYZ home">
          HOODHOLIDAYZ<span className="text-neutral-400">.</span>
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-4 sm:flex-1 sm:gap-8">
          <StoreNavigation items={menuItems} />
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/cart" aria-label="Shopping cart" className="text-xs font-medium text-neutral-700 transition-colors hover:text-neutral-950">Cart</Link>
            <AccountNavLink />
          </div>
        </div>
      </div>
    </header>
  );
}
