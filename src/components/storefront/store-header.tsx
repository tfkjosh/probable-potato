import Link from "next/link";

const navigation = [
  { label: "Shop", href: "/#featured-products" },
  { label: "Collections", href: "/#collections" },
  { label: "About", href: "/#about" },
];

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.22em] text-neutral-950"
          aria-label="Storefront home"
        >
          STORE<span className="text-neutral-400">.</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-9 sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-medium tracking-wide text-neutral-600 transition-colors hover:text-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="text-xs font-medium text-neutral-700 transition-colors hover:text-neutral-950"
          >
            Cart
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
          >
            Account
          </Link>
        </div>
      </div>
    </header>
  );
}
