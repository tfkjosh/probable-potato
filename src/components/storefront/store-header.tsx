import Image from "next/image";
import Link from "next/link";

import { AccountNavLink } from "@/components/storefront/account-nav-link";

const navigation = [
  { label: "Shop", href: "/#featured-products" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/#about" },
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-7 lg:px-10">
        <Link
          href="/"
          aria-label="HOODHOLIDAYZ home"
          className="flex w-fit items-center transition-opacity hover:opacity-75"
        >
          <Image
            src="/brand/hoodholidayz-hh-star-transparent.png"
            alt="HOODHOLIDAYZ"
            width={54}
            height={54}
            priority
            className="h-11 w-11 object-contain sm:h-12 sm:w-12"
          />
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex items-center justify-center gap-4 sm:gap-7 lg:gap-10"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[9px] font-semibold uppercase tracking-[0.19em] text-white/65 transition-colors hover:text-white sm:text-[10px] sm:tracking-[0.23em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-3 sm:gap-5">
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-[19px] w-[19px]"
            >
              <path
                d="M5 8h14l1 12H4L5 8Z"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinejoin="round"
              />
              <path
                d="M9 9V6a3 3 0 0 1 6 0v3"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Cart</span>
          </Link>
          <AccountNavLink />
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </header>
  );
}
