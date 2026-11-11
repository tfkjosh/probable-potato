# Headless Shopify Storefront

A headless ecommerce storefront built with Next.js App Router, TypeScript, Tailwind CSS, and Shopify's Storefront GraphQL API.

Shopify Admin remains the commerce management system. This repository contains the custom Next.js storefront.

## Requirements

- Node.js 20.9 or later
- npm
- A Shopify development store created through the Shopify Partner Dashboard
- A private Storefront API token with the Storefront API access needed by this app

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`.

3. In Shopify Admin, configure the Headless sales channel / Storefront API access. Add the store domain and private Storefront API token to `.env.local`:

   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your-private-storefront-token
   SHOPIFY_API_VERSION=2026-10
   ```

   Keep the private token server-side. Do not prefix it with `NEXT_PUBLIC_`, commit it, or use an Admin API access token in its place.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Deploying on Vercel

1. Import this GitHub repository into Vercel and select the Next.js framework preset.
2. In **Project Settings → Environment Variables**, add:
   - `SHOPIFY_STORE_DOMAIN` — your `*.myshopify.com` domain
   - `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` — the private Storefront API token
   - `SHOPIFY_API_VERSION` — optional; defaults to `2026-10`
3. Add the variables to Production, Preview, and Development environments as appropriate, then redeploy.
4. No buyer-IP environment variable is needed. The server actions read Vercel's `x-forwarded-for` request header and pass its validated client IP to Shopify as `Shopify-Storefront-Buyer-IP`.

The private token and full Shopify cart ID (which includes a secret key) remain server-side. Cart mutations are exposed through Server Actions in `src/lib/shopify/actions/cart-server-actions.ts`. Do not pass a cart ID or buyer IP from browser code.

## Current milestone

- Server-side Shopify Storefront GraphQL client
- Product and collection query/action foundations
- Responsive storefront homepage
- Featured products loaded from Shopify
- Product detail route
- Friendly setup and API error states when Shopify is not connected
- Product variant selection and add-to-cart
- Server-managed cart session with an HttpOnly cookie
- Cart page with quantity updates, item removal, and Shopify checkout handoff

## Next milestones

- Product variant selection and add-to-cart interactions
- Cart drawer and checkout handoff
- Collection browsing, filtering, and search
- Customer account authentication
- Deployment and production environment configuration

## Available scripts

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run build` — production build
