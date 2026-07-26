<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Apex Force — Project Guide for AI Agents

> Read this ENTIRE file before making ANY code changes. It prevents 90% of common errors.

## Stack & Versions

- **Framework:** Next.js 16.2.9 (Turbopack) — App Router
- **Language:** TypeScript 5
- **ORM:** Prisma 6 + PostgreSQL
- **Auth:** JWT (jose for edge/proxy, jsonwebtoken for server)
- **Hosting:** Railway (apex-production.up.railway.app)
- **Fonts:** Inter (body) + Outfit (headings) via `next/font/google`
- **Images:** Cloudinary (`res.cloudinary.com`, upload preset: `jjekokdx`, account: `th95enet`)
- **Theme:** Light only (no dark mode)

## ⛔ CRITICAL RULES — NEVER BREAK THESE

### 1. File `src/proxy.ts` — NOT middleware.ts
Next.js 16 uses the `proxy` convention. The file MUST be named `proxy.ts` with export `proxy`. **NEVER rename it to middleware.ts**.

### 2. Root Layout Already Wraps Children in `<main className="main-content">`
See `src/app/layout.tsx`. **NEVER add another `main-content` wrapper** in any page or sub-layout. Use `<>...</>` (Fragment) if you need a wrapper element.

### 3. Serialize Prisma Objects Before Passing to Client Components
Prisma objects contain `Date` fields (`createdAt`, `updatedAt`) that are NOT serializable across the Server→Client boundary. Always map to plain objects first. See `src/app/page.tsx` for the correct pattern.

### 4. CSS: Always Check Brace Matching in `globals.css`
The file is 2300+ lines. When adding rules inside `@media` blocks, **count your braces**. A mismatched `}` will crash the entire build with "Parsing CSS source code failed".

### 5. All Imports Go at the Top of the File
Never place `import` statements after `export` declarations.

### 6. No `Promise.resolve().then()` in useEffect
Call state setters directly. `Promise.resolve().then(() => setState(x))` is an anti-pattern that adds latency.

### 7. Product Interface — Use the One from `Shared.tsx`
The `Product` interface is duplicated in 3+ files. The canonical source is `src/app/admin/dashboard/components/Shared.tsx`. When modifying the interface, update it there FIRST.

### 8. No Dark Theme
There is NO dark theme. Do not add `[data-theme="dark"]` CSS or theme toggle components.

---

## Architecture Overview

```
src/
├── proxy.ts                    ← Edge auth guard (NOT middleware.ts!)
├── app/
│   ├── layout.tsx              ← Root layout (Header + main.main-content + CartDrawer + Footer)
│   ├── page.tsx                ← Homepage (server) → HomeClient
│   ├── globals.css             ← ALL public styles (2300+ lines)
│   ├── admin.css               ← Admin-only styles (toasts, spinners, confirm dialogs)
│   ├── product/[id]/
│   │   ├── page.tsx            ← Product detail (server, serializes Prisma)
│   │   └── ProductDetailClient.tsx  ← Product detail UI (client)
│   ├── build/page.tsx          ← Redirects to /#constructor
│   ├── admin/
│   │   ├── page.tsx            ← Login page (client)
│   │   └── dashboard/
│   │       ├── layout.tsx      ← Auth guard (server, checks session)
│   │       ├── page.tsx        ← Dashboard with 3 tabs (client)
│   │       └── components/
│   │           ├── OrdersTab.tsx        ← Kanban board for orders
│   │           ├── ProductsTab.tsx      ← Product CRUD + category filters
│   │           ├── ConstructorTab.tsx   ← Constructor elements & colors
│   │           ├── CategoriesManager.tsx ← Category CRUD modal (opened from ProductsTab)
│   │           ├── Shared.tsx           ← Shared types (Product interface)
│   │           └── Toast.tsx            ← Toast notifications + confirm dialog
│   └── api/                    ← REST API routes
│       ├── auth/               ← login, logout, me
│       ├── orders/             ← CRUD + rate limiting
│       ├── products/           ← CRUD
│       ├── categories/         ← Category CRUD (GET/POST + [id] PUT/DELETE)
│       ├── content/            ← Translations CRUD
│       ├── constructor/        ← Elements + Colors CRUD
│       └── seo/                ← SEO metadata CRUD
├── components/
│   ├── Header.tsx              ← Sticky nav (client)
│   ├── Footer.tsx              ← Footer (client)
│   ├── CartDrawer.tsx          ← Slide-out cart with checkout (client)
│   └── HomeClient.tsx          ← Homepage UI: hero + catalog + constructor + reviews + contacts (client)
├── context/
│   ├── CartContext.tsx          ← Cart state (localStorage key: 'apex_cart')
│   └── LanguageContext.tsx      ← i18n: uk/ru/en (localStorage key: 'apex_language', cookie: 'NEXT_LOCALE')
└── lib/
    ├── prisma.ts               ← Prisma singleton
    ├── auth.ts                 ← JWT sign/verify (server-side, uses jsonwebtoken)
    └── telegram.ts             ← Order notifications to Telegram bot
```

## Database Schema (Prisma)

| Model              | PK       | Key Fields |
|---------------------|----------|------------|
| User               | id (Int) | username (unique), passwordHash |
| Product            | id (Int) | category (String, matches ProductCategory.id), nameUk/Ru/En, price (Int, UAH), badgeUk/Ru/En?, specsJson, photo, createdAt, updatedAt |
| ProductCategory    | id (String) | nameUk/Ru/En, order (Int) — dynamic categories managed via admin |
| ConstructorElement | id (String) | nameUk/Ru/En, price, icon (emoji) |
| Color              | id (String, hex) | nameUk/Ru/En |
| Order              | id (Int) | type ('callback'/'order'/'customizer'), name, phone, comment?, detailsJson, deliveryMethod?, deliveryCity?, deliveryWarehouse?, paymentMethod?, paymentStatus?, status ('new'/'in_progress'/'done'), createdAt |
| ContentText        | key (String) | uk, ru, en |
| SeoMetadata        | route (String) | titleUk/Ru/En, descUk/Ru/En |

### Product Categories
Categories are **dynamic** — stored in `ProductCategory` table. Default categories: `street`, `turnik`, `swedish`, `ruckhod`, `workout`. Managed via CategoriesManager modal in admin ProductsTab.

### Product specsJson Format
Stored as JSON array of `[key, value]` tuples:
```json
[["Колір", "Чорний"], ["Профіль труби", "40х40 мм"], ["Опис", "Текст опису..."]]
```
- The key `"Опис"` (case-insensitive) is treated specially — rendered as a separate "Description" block on the product detail page.
- In admin, specs and description are edited in **separate textareas** but merged into one specsJson on save.

## Component Hierarchy

```
RootLayout (server)
├── LanguageProvider (client context)
│   └── CartProvider (client context)
│       ├── Header (client)
│       ├── <main className="main-content">  ← ALREADY EXISTS, don't duplicate!
│       │   └── {children}  ← page content goes here
│       ├── CartDrawer (client)
│       └── Footer (client)
```

## Admin Dashboard Tabs

1. **Заявки (OrdersTab)** — Kanban board with 3 columns: Нові → В роботі → Виконані
2. **Каталог (ProductsTab)** — Product CRUD with:
   - Dynamic category filter tabs (fetched from DB)
   - "⚙️ Управління категоріями" button → opens CategoriesManager modal
   - "+ Додати товар" button → opens product editor modal (2-column, 900px wide)
   - Product editor has separate fields for specs (textarea, `key: value` per line) and description (textarea)
3. **Деталі & Кольори (ConstructorTab)** — Constructor element prices and color presets

## API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /api/auth/login | Public | Login → sets admin_token cookie |
| POST | /api/auth/logout | Public | Logout → deletes cookie |
| GET | /api/auth/me | Cookie | Check admin session |
| GET | /api/orders | Admin | List all orders |
| POST | /api/orders | Public (rate limited) | Create order (callback/order/customizer) |
| PUT | /api/orders/[id] | Admin | Update order status |
| DELETE | /api/orders/[id] | Admin | Delete order |
| GET | /api/products | Public | List products (?category=) |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/[id] | Admin | Update product |
| DELETE | /api/products/[id] | Admin | Delete product |
| GET | /api/categories | Public | List all categories (sorted by order) |
| POST | /api/categories | Admin | Create category |
| PUT | /api/categories/[id] | Admin | Update category |
| DELETE | /api/categories/[id] | Admin | Delete category (fails if products exist) |
| GET/PUT | /api/content | Admin (PUT) | Translations CRUD |
| GET/POST/PUT/DELETE | /api/constructor/elements | Admin (mutations) | Constructor parts |
| GET/POST/PUT/DELETE | /api/constructor/colors | Admin (mutations) | Color presets |
| GET/PUT | /api/seo | Admin (PUT) | SEO metadata |

## HTML Section IDs (Homepage)

Used for anchor navigation (`#catalog`, etc.):
- `id="catalog"` — Product catalog
- `id="constructor"` — Custom builder
- `id="reviews"` — Reviews
- `id="contact"` — Contact form

## CSS Architecture

### Design Tokens (`:root` variables)
```css
--red: #E53935            /* Primary brand color */
--red-hover: #C62828      /* Button hover */
--red-glow: rgba(229,57,83,0.22)  /* Box-shadow glow */
--bg-dark: #D4D4D4        /* Main background */
--bg-card: #FFFFFF        /* Card backgrounds */
--bg-card-hover: #F8F7F5
--bg-input: #FFFFFF
--border-light: #C0BEBC   /* Borders, dividers */
--border-focus: #E53935
--text-primary: #1A1A1A   /* Headings, bold text */
--text-secondary: #5A5553 /* Body text */
--text-muted: #8A8886     /* Hints, placeholders */
--transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)
--photo-wrap-bg: #D4D4D4  /* Product photo container */
--footer-bg: #111111
```

### When Adding New CSS
1. Add your rules at the appropriate location in `globals.css`
2. If adding to `@media` block — **verify brace matching** before saving
3. Use existing variables (`var(--red)`, `var(--border-light)`, etc.) — never hardcode colors
4. Use `var(--transition-smooth)` for transitions

## i18n System

- 3 languages: `uk` (Ukrainian, default), `ru` (Russian), `en` (English)
- All UI text should use `t('key')` from `useLanguage()` context
- Translations stored in DB (`ContentText` model), fetched from `/api/content`
- Product names: `nameUk`, `nameRu`, `nameEn` fields
- Use `getLocalizedName(item)` helper pattern:
  ```ts
  const getLocalizedName = (item: { nameUk: string; nameRu: string; nameEn: string }) =>
    language === 'en' ? item.nameEn : language === 'ru' ? item.nameRu : item.nameUk;
  ```

### Known i18n Gaps
Some components still have hardcoded Ukrainian strings instead of using `t('key')`:
- `CartDrawer.tsx` — delivery/payment labels, error messages
- `Footer.tsx` — uses local translation object instead of `t()`
- `ProductDetailClient.tsx` — specs headings, error messages, form labels
- `Header.tsx` — mobile menu admin link, language label

## Checkout Flow (CartDrawer)

### Delivery Options
- **Nova Poshta (`novaposhta`)** — text inputs for city & warehouse (no API integration yet, needs API key)
- **Pickup (`pickup`)** — self-pickup

### Payment Options
- **Cash on delivery (`cash`)** — works
- **Monobank (`monobank`)** — UI only, no real payment gateway (needs API key)
- **LiqPay (`liqpay`)** — UI only, no real payment gateway (needs API key)

All orders are saved to DB with `paymentMethod` and `paymentStatus: 'pending'`.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret (crash if missing!) |
| TELEGRAM_BOT_TOKEN | No | Telegram notification bot |
| TELEGRAM_CHAT_ID | No | Telegram chat for notifications |

## Hardcoded Data (Not in DB)

- **Reviews**: 3 static reviews in `HomeClient.tsx` (Андрій К., Марина П., Олена С.)
- **Contact info**: Phone `+38 (073) 373-01-10` and social links in `Header.tsx` and `Footer.tsx`
- **Cloudinary**: Upload preset `jjekokdx`, account `th95enet` in `ProductsTab.tsx`

## Common Mistakes to Avoid

1. ❌ Adding `className="main-content"` in page components → double padding
2. ❌ Renaming `proxy.ts` to `middleware.ts` → deprecation warning in Next.js 16
3. ❌ Passing raw Prisma objects to client components → Date serialization errors
4. ❌ Mismatched braces in `globals.css` `@media` blocks → build crash
5. ❌ Using `Promise.resolve().then()` in useEffect → unnecessary async deferral
6. ❌ Hardcoding text strings instead of using `t('key')` → breaks i18n
7. ❌ Using `<img>` instead of `next/image` for public-facing images → no optimization
8. ❌ Forgetting to serialize dates when passing server data to client components
9. ❌ Adding CSS classes in components without defining them in globals.css
10. ❌ Placing imports after exports in module files
11. ❌ Adding dark theme CSS or `[data-theme="dark"]` — light theme only
12. ❌ Hardcoding product categories — they are dynamic, fetched from `ProductCategory` table
