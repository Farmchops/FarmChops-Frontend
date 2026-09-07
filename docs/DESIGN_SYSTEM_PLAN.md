# FarmChops Storefront — Design System Audit & Plan

**Status:** Phase 1 (audit + plan). No code changes yet. Awaiting approval before Phase 2.
**Scope:** Customer-facing storefront. Admin/ops screens are a later phase (audited here only where they share code).
**Date:** 2026-09-07

---

## 1. Audit

### 1.1 Stack & styling approach

| Area | What's there |
|---|---|
| Framework | React 19, Vite 7, TypeScript, React Router 7 (data router, lazy routes) |
| State/data | Redux Toolkit + RTK Query. **Not touched by this work.** |
| Styling | Tailwind CSS **v4** (CSS-first config via `@import "tailwindcss"` + `@theme` in `src/index.css`). No `tailwind.config.js`. |
| Component base | shadcn/ui "new-york" scaffold (`components.json`), `class-variance-authority`, `clsx`, `tailwind-merge` (`cn()` in `src/lib/utils.ts`). Only **4** primitives generated: `card`, `dropdown-menu`, `select`, `toast`. No `Button`, `Input`, `Badge`, `Dialog`. |
| Icons | `lucide-react` **and** `react-icons` both installed. Lucide is the configured library; react-icons usage should be phased out (no new dependency needed to do so). |
| Fonts | `index.html` loads **3 Google families** (DM Sans, Nunito Sans, Plus Jakarta Sans, all with wide weight ranges). `index.css` also `@font-face`-loads **8 NeueMontreal `.otf` files** (~380 KB) that are **almost entirely unused** (the `body { font-family: NeueMontreal }` rule is commented out). Active rules: `body → Nunito Sans`, `p → DM Sans`. Plus Jakarta Sans and NeueMontreal ship to every visitor and render nothing. |

### 1.2 Existing design tokens

`src/index.css` contains the **stock shadcn neutral token set** (`--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border`, `--radius: 0.625rem`, chart colours, sidebar colours, a full `.dark` block) wired through `@theme inline`.

**These tokens are effectively dead.** `--primary` is `oklch(0.205 0 0)` — near-black, not green. Components never reference `bg-primary`/`text-foreground`; they hardcode hex. The only token actually consumed is `--radius` (via shadcn `card`) and the base layer's `border-border`. There is a `.dark` palette but **no dark mode toggle anywhere** in the app.

**Net: there is a theme file, but the app does not use it. There is no working source of truth.**

### 1.3 Values actually in use (measured across `src/**/*.tsx`)

#### Colour — the core problem

- **66 distinct hex literals**, **914 hex occurrences**, plus **~1,900 Tailwind palette-colour utility classes** (`text-gray-600` ×465, `text-gray-900` ×399, `text-gray-500` ×359, `bg-gray-50` ×246, `border-gray-300` ×236, …).
- **852** arbitrary colour classes of the form `bg-[#1D7B3C]`.
- The brand green is expressed **at least five incompatible ways**:
  - `#1D7B3C` — **544 occurrences** (the "real" brand green)
  - `#20571E` — 49 (a second, yellower dark green used in Navbar + Featured)
  - Tailwind `green-600 / green-700 / green-800 / emerald-*` — ~200 combined (hover states, borders, rings)
  - `#166430`, `#0F5132`, `#145A2B`, `#133F1F`, `#0F2E19`, `#166331`, `#1A6B34`, `#1A4A18`, `#1A4718`, `#0E5430`, `#16A34A` — one-off "darker greens" for hovers and gradients (**11 more greens**)
  - `--primary` CSS var — black, ignored
- Greys: `#E6E6E6` (×78), `#1A1A1A` (×19), `#666666` (×11), `#525252`, `#808080`, `#121212`, `#4D4D4D`, `#CCCCCC`, `#9FA5A3`, `#687182`, `#8E95A9`, `#D9D9D9`, `#F5F5F5`, `#F2F2F2` — **~14 bespoke greys** layered on top of Tailwind's `gray-*` (which is itself used at 8+ steps). Two grey ramps, no agreement on which.
- Semantic colours are ad hoc: red is `#DC2626` / `red-500` / `red-600` / `#EF4444` / `#B42318`; amber is `yellow-500` / `#FACC15` / `#F59E0B` / `#D97706` / `#FEF3C7`; deal-orange is `#E07B00` / `#C96D00` / `#FF8901` / `#F97316` / `#FF9E67`.
- Stray one-offs: `#3B82F6`, `#1E40AF`, `#DBEAFE` (blue "group sharing" badge), `#8B5CF6` (a purple), `#00D8FF`, `#4A8F7D`.

**Summary: no colour scale. ~66 hex + ~1,900 palette classes, five spellings of the brand green, two grey ramps, five spellings of each status colour.**

#### Spacing

- No arbitrary px spacing (`p-[13px]` etc.) — good; everything is on Tailwind's 4px step scale.
- But **the full scale is used ad hoc**: padding alone spans `p-0, p-0.5, p-1, p-1.5, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12` and `py-*` adds `0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 16, 20, 24`. **~20 distinct spacing values in live use, with half-steps (`1.5`, `2.5`, `3.5`) mixed into the same components as whole steps.** No rhythm — `py-2.5` and `py-3` appear side by side for the same kind of control.
- Section vertical padding: `py-12 md:py-24` (home sections), `py-8`, `py-16`, `py-20` — **4 different section rhythms**.

#### Typography

- **Font size:** `text-sm` ×953, `text-xs` ×508, `text-2xl` ×169, `text-lg` ×110, `text-xl` ×68, `text-3xl` ×65, `text-base` ×35, `text-4xl` ×21, `text-5xl` ×11, `text-6xl` ×3, plus arbitraries `text-[15px]`, `text-[16px]`, `text-[11px]`, `text-[10px]`. **~13 sizes.** The app is overwhelmingly `text-sm`/`text-xs` — most UI text is 12–14px with no deliberate step between "body" and "small".
- **Weight:** `font-medium` ×753, `font-semibold` ×370, `font-bold` ×196, `font-light` ×24, `font-normal` ×3. **5 weights.** `font-light` on a 12px label on a cheap LCD is a legibility problem. Default body weight is essentially "medium everywhere".
- **Line-height:** **zero `leading-*` classes in the codebase.** Every block uses the browser/Tailwind default for its size. No control over paragraph readability.
- **Font-family in components:** **zero** `font-sans`/`font-<name>` utility classes. Family is decided entirely by the two raw CSS rules in 1.1, so `<p>` and `<div>` text in the same card render in different typefaces (DM Sans vs Nunito Sans).

#### Border radius

`rounded-lg` ×518, `rounded-full` ×273, `rounded-md` ×148, `rounded-xl` ×130, `rounded` ×109, `rounded-2xl` ×95, `rounded-3xl` ×28, `rounded-sm` ×5. **8 radii.** Product cards use `rounded-2xl`; the near-identical Featured card uses `rounded-xl`; the Category card uses `rounded-2xl`; modals use `rounded-xl` and `rounded-2xl` and `rounded-3xl`.

#### Shadow

`shadow-sm` ×114, `shadow-lg` ×52, `shadow` ×51, `shadow-xl` ×27, `shadow-md` ×18, `shadow-2xl` ×5. **6 levels**, applied by feel. `ProductCard` is `shadow-lg` at rest and `hover:shadow-2xl` **plus `hover:scale-105`** — a large layout-shifting hover on a touch device.

#### Motion

`transition` ×163, `transition-colors` ×109, `transition-all` ×38 (animates every property, including layout), `duration-300` ×36, `duration-200` ×14, `duration-1000` ×1, `duration-500` ×4. `ease-*` barely used (`ease-in` ×5, `ease-out` ×1). No `prefers-reduced-motion` handling. One hand-rolled `@keyframes` in `index.css` and `App.css`.

#### Other

- Gradients: 22 `bg-gradient-to-br` (mostly `from-[#1D7B3C]` panels — Wallet card, FAQ, admin), 1 `from-purple`, 1 `backdrop-blur-sm` (admin header). Not pervasive; a handful to reconsider.
- 13 files use inline `style={{…}}`.
- **Assets: `src/assets/` is 58 MB.** A **34 MB `compressed-video.mp4`**, a 3 MB `carthero.jpg`, and **~20 PNGs over 700 KB** (hero slides ~0.8–1.7 MB each, "realistic" product renders ~1 MB each). `public/` adds 1.6 MB. On metered Lagos data this is the single biggest performance liability and is **in scope of the constraints even though it isn't "tokens"**.

### 1.4 Component inventory

**Primitives (`components/ui/`):** `card`, `dropdown-menu`, `select`, `toast` — 4 only. **Missing:** Button, Input/Field, Badge/Tag, Dialog/Modal, IconButton, Skeleton, Pagination. Each of these is currently re-implemented inline in every screen (the "Add to cart" button has ~5 distinct implementations; the modal shell is copy-pasted ~10 times).

**Chrome / layout:** `Navbar`, `Footer`, `AnnouncementBar`, `DealBanner`, `PromoBanner`, `ProfileLayout`, `admin/adminLayout`, `admin/AdminHeader`.

**Product & discovery:** `Product/ProductCard`, `Product/ProductGrid`, `Product/ProductDetail`, `Product/ProductPageHero`, `Product/FilterBar` (`FilterSidebar`), `Product/SortBar`, `Product/BulkBuying`, `Product/DualRangeSlider`, `Featured` (home), `Category` (home), `ExploreStore`, `DealBanner`, `DiscountDisplay`, `CouponInput`.

**Cart & checkout:** `Cart/CartSidebar`, `Cart/CartHero`, `pages/CartPage`, `pages/CheckOut`, `Checkout/OrderSuccess`, `Checkout/GroupOrderSuccess`, and **4 address-input variants** (`AddressAutoComplete`, `AddressInput`, `HybridAddressInput`, `ModernAddressAutocomplete`).

**Home sections:** `Hero`, `Category`, `Featured`, `HowItWork`, `Features`, `WhyChooseUs`, `ExploreStore`.

**Marketing pages:** About (`Abouthero`, `AboutUs`, `OurSolution`, `OurSolution2`), `Services`, `Resources`, `FAQ`, `BecomeVendor`, `BulkBuying`, `GroupSharing`, `DealOfTheDay`.

**Account:** `profile/*` (Wallet, WalletTransactions, FundWallet, PaymentLinks, CreatePaymentLink, OrderHistory, PersonalInfo, Notifications, ProfileSettings, PaymentMethods, MyGroups), `Wallet/*` cards, `PayLater/*` (Shop, Cart, Checkout, Application, Status).

**Auth:** `auth/Login`, `auth/Register`, `auth/ForgetPassword`, `auth/ResetPassword`, `auth/EmailVerification`, `auth/ProfileCompletion`.

**Feedback:** `LoadingSpinner`, `AlertModal`, `context/AlertContext`, `ui/toast`, `lib/alertService`.

**Duplication / dead code found:**
- `pages/Login.tsx` **and** `pages/auth/Login.tsx`; `pages/Register.tsx` **and** `pages/auth/Register.tsx`; `pages/VerifyEmail.tsx` **and** `pages/auth/EmailVerification.tsx` (router uses the `auth/` ones — the top-level copies look orphaned).
- 4 address inputs, 2 `BulkBuying` entry points.
- Large commented-out blocks left in `components/Category.tsx`, `Product/SortBar.tsx`, `admin/adminLayout.tsx`.
- 3 divergent product-card implementations: `ProductCard`, `Featured`'s inline card, `Category`'s inline card.

### 1.5 Highest-traffic storefront screens

Ranked by expected traffic and revenue proximity:

1. **Home `/`** — entry point. `Hero` + `Category` + `Featured` + 4 marketing sections + `Footer`.
2. **Products `/products`** — the shop. `ProductPageHero` + `SortBar` + `FilterSidebar` + `ProductGrid` (of `ProductCard`) + pagination.
3. **Product Detail `/products/:slug`** — the decision point. Gallery + pricing/tiers + deal block + CTAs + `CartSidebar`.
4. **Cart `/cart` + `CartSidebar`** — every add-to-cart opens the sidebar.
5. **Checkout `/checkout`** — money. Address, delivery, payment method, coupon.
6. **Deal of the Day `/deals`** — promoted heavily in `DealBanner` on every page.

Chrome present on nearly every route: `Navbar`, `DealBanner`, `Footer`.

---

## 2. Proposed design system (from first principles)

Design targets, in priority order, derived from the product: **(a)** mid-range Android, 360 px wide, metered data, outdoors/low brightness; **(b)** price-sensitive shoppers who scan many items and compare unit prices; **(c)** a real discount/deal mechanic and a real group-buy mechanic that must read as *trustworthy*, not as a spam banner; **(d)** naira pricing as the most important number on the screen.

### 2.1 Typography

**Families — one, not two.**
Ship a **system UI stack** for everything and remove all four downloaded families:

```
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
             Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
```

- *Why:* on a mid-range Android the system face is Roboto — already the OS UI font, hinted for low-DPI, and **0 KB over the wire**. Removing DM Sans + Nunito Sans + Plus Jakarta Sans + 8 NeueMontreal `.otf` files cuts ~150–250 KB of render-blocking font downloads and eliminates the DM-Sans-vs-Nunito-Sans split inside every card. The brand is carried by colour, layout, photography and the naira treatment — not by a bespoke UI typeface nobody notices at 13px.
- If a distinctive display face is wanted later for headings only, that is a separate, explicit decision: one self-hosted variable `woff2`, subset to Latin + `₦`, `font-display: swap`, ~15–25 KB, headings only. Not in this plan.

**Scale — base 16 px, ratio 1.2 (minor third).**

The tokens use **role names**, not `xs`/`sm`/`lg` — so they never collide with Tailwind's built-in `text-*` scale (which 1,900+ existing usages still depend on until migrated), and so the name says what the text *is*. Utility = `text-<token>` (e.g. `text-body`, `text-title`).

| Token | px / rem | Line-height | Use |
|---|---|---|---|
| `text-caption` | 12 / 0.75 | 16 (1.33) | badges, legal, timestamps — the floor |
| `text-fine` | 13 / 0.8125 | 18 (1.38) | dense table cells, helper text |
| `text-meta` | 14 / 0.875 | 20 (1.43) | secondary/meta text, input labels |
| `text-body` | 16 / 1.0 | 24 (1.5) | body copy, paragraphs — **default** |
| `text-lead` | 19 / 1.1875 | 26 (1.37) | product-card title, list-item lead, price |
| `text-title` | 23 / 1.4375 | 30 (1.3) | sub-section headings, modal titles |
| `text-heading` | 28 / 1.75 | 34 (1.21) | page headings |
| `text-display` | 33 / 2.0625 | 38 (1.15) | hero headline (mobile) |
| `text-hero` | 40 / 2.5 | 44 (1.1) | hero headline (≥ lg) — **hard ceiling** |

- *Why 1.2:* a grocery UI is information-dense — dozens of prices, units, tiers and badges per screen. A tight ratio keeps `text-meta` (14) and `text-body` (16) visually distinct without a big jump, so hierarchy comes from **weight and colour**, not size. Larger ratios (1.25/1.333) force either too-big body text or a gap between 16 and 24 that this UI has no use for.
- *Why 14 breaks the strict ratio (16 ÷ 1.2 = 13.3):* 13 px meta text is fragile on cheap panels in daylight. 14 (`text-meta`) is a deliberate, defensible off-grid step; 13 (`text-fine`) is available only for genuinely dense contexts.
- *Line-heights* are set per size (currently zero exist): tighter as size grows, `1.5` for body, `1.1` for the hero. Every text style must carry its line-height token — no more browser defaults.
- **Cap the hero at 40 px.** Current `text-5xl`/`text-6xl` (48–60 px) on marketing pages is exactly the "oversized hero text" to avoid.

**Weights — 4 max:** `400` regular (body), `500` medium (UI labels, nav, buttons), `600` semibold (card titles, prices, section headings), `700` bold (page/hero headline, the one price that matters on PDP). **Drop `300` (`font-light`) entirely** — it fails legibility at the sizes it's used.

### 2.2 Spacing

**Base unit: 4 px.** One scale, used for *every* margin, padding, gap, and layout dimension:

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | icon-to-label gap, badge padding-y |
| `space-2` | 8 | tight stacks, chip padding-x |
| `space-3` | 12 | control padding-y, card inner gap |
| `space-4` | 16 | **default** card padding, grid gutter (mobile), paragraph spacing |
| `space-5` | 20 | card padding (comfortable) |
| `space-6` | 24 | grid gutter (≥ md), section inner padding |
| `space-8` | 32 | block separation, section gutter (≥ lg) |
| `space-10` | 40 | small section vertical rhythm |
| `space-12` | 48 | section vertical rhythm (mobile) |
| `space-16` | 64 | section vertical rhythm (≥ md) |
| `space-20` | 80 | major section breaks (≥ lg) |
| `space-24` | 96 | hero / page top-bottom (≥ lg) |

- **Banned:** the half-steps (`0.5`, `1.5`, `2.5`, `3.5`) and the odd whole steps (`7`, `9`, `11`, `14`) that currently appear. Any arbitrary value (`p-[13px]`) is a review-blocking bug.
- *Why 4 px, this subset:* it is Tailwind v4's native step, so **most of the codebase already complies** — the migration is deleting outliers, not rewriting layouts. The subset gives 12 rungs, enough for a commerce UI, few enough to memorise.
- **Section rhythm is one decision, not four:** `py-12` (mobile) → `py-16` (md) → `py-20` (lg). Replaces today's `py-8 / py-12 md:py-24 / py-16 / py-20` scatter.

### 2.3 Colour

Semantic tokens only. Components reference roles (`bg-surface`, `text-ink-muted`, `bg-brand`), never hex. Raw hex in a component is a bug.

Contrast ratios below are **computed** (WCAG 2.1 relative luminance). All text pairings clear **AA (4.5:1)**; most clear AAA (7:1).

#### Neutrals — one warm ramp

| Token (utility) | Hex | On what | Ratio | Role |
|---|---|---|---|---|
| `canvas` (`bg-canvas`) | `#F6F4EF` | — | — | app background (warm off-white, reads as paper/produce, not cold SaaS grey) |
| `surface` (`bg-surface`) | `#FFFFFF` | — | — | cards, sheets, inputs |
| `surface-sunken` | `#EDEAE2` | — | — | wells, table headers, disabled fills |
| `line` (`border-line`) | `#E7E3D8` | on surface | 1.3:1 | hairlines between rows |
| `line-strong` | `#D6D1C4` | on surface | 1.5:1 | card & control outlines |
| `line-input` | `#8A8474` | on surface | 3.1:1 | input borders, focus outline base (meets non-text 3:1) |
| `ink` (`text-ink`) | `#1D1B16` | surface `#FFF` / canvas `#F6F4EF` | **17.2 / 15.7** | headings, prices, primary copy |
| `ink-secondary` | `#4C4A42` | surface / canvas | **8.9 / 8.1** | body copy, descriptions |
| `ink-muted` | `#6B685D` | surface / canvas | **5.6 / 5.1** | meta, captions, unit labels, placeholders |

- *Why warm neutrals:* the entire palette leans warm-green; a warm off-white and warm greys sit under it without the blue-grey clash that `gray-50`/`slate` currently create against `#1D7B3C`. One ramp replaces the two (`gray-*` + 14 bespoke hex) in use now.
- `ink-muted` at 5.1:1 on the canvas background is the **lowest** any text is allowed to go, and it still clears AA.

#### Brand — green, reworked into a scale

Current `#1D7B3C` (5.3:1 on white) technically passes but is a slightly muddy mid-green used for *everything* (fills, text, borders, hovers, price). The rework: **decouple** — green means "brand / primary action / go", and the price is **not** green (it's `ink`, so it stops competing with buttons). **Confirmed: shift to `#1C6B3A`.**

| Token | Hex | Contrast | Role |
|---|---|---|---|
| `brand` | `#1C6B3A` | 6.5:1 white text on it | primary buttons, active nav, selected tier |
| `brand-hover` | `#17572F` | 8.6:1 | hover/active of the above |
| `brand-ink` | `#14532B` | 7.9:1 on `brand-tint` | brand-coloured text/links on light |
| `brand-tint` | `#E8F1EA` | — | selected-state fill, subtle badge bg |
| `brand-fg` | `#FFFFFF` | — | text/icons on `brand` |

- *Why shift off `#1D7B3C`:* a single hue can't be a good fill *and* good small text *and* a good hover. Three defined stops (`brand` / `brand-hover` / `brand-ink`) replace the 13 ad-hoc greens. `#1C6B3A` is marginally deeper and less yellow — better as a button under white text (6.5:1 vs 5.3:1) and cleaner beside the warm neutrals.
- The green stays unmistakably green. This is not a rebrand; it's the same brand with a working scale.

#### Semantic status — one spelling each

| Token | Hex | Ratio (white text / on tint) | Use |
|---|---|---|---|
| `success` | `#15803D` | 5.0:1 | in-stock, order confirmed, positive delta |
| `success-tint` | `#E6F1E9` | ink `#14532B` → 7.9:1 | success banners |
| `warning` | `#B45309` | ink `#7A4A0B` on `#FBF0DA` → 6.6:1 | low stock, "ends soon", pending |
| `danger` | `#B42318` | 6.6:1 white / ink `#7A271A` on `#FBE9E7` → 8.4:1 | out of stock, errors, destructive |
| `deal` | `#B44708` | 5.5:1 white / ink `#7C2D12` on `#FBEAD9` → 8.0:1 | **deals & savings only** — the "harvest" colour |

- *Why a dedicated `deal` colour:* discount/urgency needs a colour that is **not** the brand green (so a deal doesn't look like a normal CTA) and **not** `danger` red (so it doesn't look like an error). A deep burnt-orange (`#B44708`) is warm, harvest-adjacent, passes AA as a fill *and* as text, and is visually loud without being a neon "SALE" banner. Replaces `#E07B00`/`#C96D00`/`#FF8901`/`#F97316`/`#FF9E67`. (Token named `--color-deal`, not `accent`, to avoid colliding with the shadcn `--color-accent` the 4 primitives use.)
- Blue (`#3B82F6` "group sharing" badge) → recategorise. Group-buy is a core feature, not an alert; it gets `brand-tint` bg + `brand-ink` + the `Users` icon, not a blue that appears nowhere else.

#### Elevation-on-colour rule

Coloured fills (`brand`, `deal`, `danger`) only ever carry `*-fg` (white) text or an icon. Coloured *text* only ever sits on white / `canvas` / the matching `*-tint`. This makes every combination one of the ~10 verified pairings above — no guessing.

### 2.4 Layout

Mobile-first. Design and test at **360 px**.

- **Breakpoints:** Tailwind defaults, unchanged — `sm 640`, `md 768`, `lg 1024`, `xl 1280`. (Changing them would churn the whole codebase for no user benefit.)
- **Page container:** `max-width: 1200px`, centred. Content-text container (legal, FAQ, article): `max-width: 720px`. Replaces today's mix of `max-w-7xl` (1280), `max-w-6xl`, `max-w-4xl`, `max-w-[540px]`…
- **Gutters:** `16px` (< sm) → `24px` (md) → `32px` (lg). One rule, applied by the container, not re-declared per section.
- **Product grid:**
  | Breakpoint | Columns (no filter sidebar) | Columns (with sidebar) | Gutter |
  |---|---|---|---|
  | 360–639 | 2 | 2 | 12 px |
  | 640–1023 | 3 | 2 | 16 px |
  | 1024–1279 | 4 | 3 | 24 px |
  | ≥ 1280 | 4 | 3 | 24 px |

  At 360 px: `360 − 32 (gutter) − 12 (gap) = 316 → 158 px` per card. Enough for image + name + price + one CTA. **2-up on mobile is deliberate** (see §3): price-comparison shoppers want to see more than one item per screen.
- **Vertical rhythm:** sections `py-12 / md:py-16 / lg:py-20`. Hero is the only full-bleed element; cap its height (see §3.1) — no more `h-[100dvh]`.
- **Thumb zone:** primary action on Cart, Checkout and PDP is a sticky bottom bar on mobile (`< md`), inside the safe-area inset.

### 2.5 Elevation & radius

**Elevation = distance from the page + how transient the surface is.** Four levels, no more.

| Token (utility) | Shadow | Meaning |
|---|---|---|
| *(no class)* | none (border only) | anything anchored to the page: cards in a grid, form fields, list rows. **The default.** |
| `shadow-e1` | `0 1px 2px rgb(20 18 12 / .06), 0 1px 3px rgb(20 18 12 / .04)` | gently lifted & still: a hovered card (desktop only), a standalone summary card |
| `shadow-e2` | `0 4px 12px rgb(20 18 12 / .10)` | temporarily on top: dropdowns, popovers, sticky headers/bars, toasts |
| `shadow-e3` | `0 16px 40px rgb(20 18 12 / .16)` | modal layer: dialogs, the cart drawer, bottom sheets |

- *Why:* shadows currently signal nothing — `shadow-lg` cards, `shadow-2xl` hovers and `shadow-sm` inputs coexist arbitrarily. Tying elevation to *meaning* means a reviewer can tell whether a shadow is right by asking "what layer is this on".
- **No elevation change on tap.** `ProductCard`'s `hover:shadow-2xl hover:scale-105` goes: on mobile it either does nothing or fires on tap and shifts layout. Desktop hover adds `shadow-e1` and a `1px` border-colour shift, nothing more.

**Radius — four values.** Role-named (utility = `rounded-<token>`) so they don't collide with Tailwind's `rounded-sm/md/lg/xl/2xl` that existing code still uses until migrated.

| Token (utility) | px | Use |
|---|---|---|
| `rounded-control` | 6 | inputs, small controls, inline badges |
| `rounded-card` | 10 | buttons, product cards, modals-on-mobile |
| `rounded-panel` | 16 | desktop modals, drawers, hero/feature panels |
| `rounded-pill` | 9999 | pills, chips, avatars, icon buttons |

Replaces the current 8 (`rounded` → `sm` → `md` → `lg` → `xl` → `2xl` → `3xl` → `full`). `rounded-3xl` (28 uses) and blanket `rounded-2xl` on cards both collapse to `rounded-card`.

### 2.6 Motion

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120 ms | hover/press feedback, colour & background transitions, checkbox/toggle |
| `duration-base` | 200 ms | dropdowns, accordions, tab changes, badge swaps |
| `duration-slow` | 320 ms | cart drawer, bottom sheets, full-screen overlays, route-level fades |
| `ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | most transitions (both directions) |
| `ease-enter` | `cubic-bezier(0, 0, 0, 1)` | elements appearing (decelerate in) |
| `ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | elements leaving (accelerate out) |

- **Motion is used for:** state feedback on interactive controls; entrances/exits of overlays, drawers, dropdowns, toasts; the cart-sidebar slide.
- **Motion is *not* used for:** scroll-triggered reveals, number counters, decorative loops, hover-scale on cards, the hero carousel doing anything fancier than a cross-fade. `transition-all` is banned — name the property (`transition-colors`, `transition-transform`, `transition-opacity`).
- **`prefers-reduced-motion: reduce`** → all of the above collapse to a `1ms` opacity change. (Currently unhandled.)

### 2.7 How it's expressed in code

Single source of truth in `src/index.css` — **this is live as of Phase 0** (see §9):

```css
@theme {
  /* colour */
  --color-canvas: #f6f4ef;
  --color-surface: #ffffff;
  --color-ink: #1d1b16;
  --color-brand: #1c6b3a;
  --color-deal: #b44708;
  /* … full token set in the file … */

  /* type — role-named, non-colliding with Tailwind's text-* scale */
  --text-body: 1rem;        --text-body--line-height: 1.5rem;
  --text-lead: 1.1875rem;   --text-lead--line-height: 1.625rem;
  /* … */

  /* radius / shadow / motion */
  --radius-card: 10px;
  --shadow-e2: 0 4px 12px rgb(20 18 12 / 0.10);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

Components then use `bg-surface`, `text-ink`, `text-ink-muted`, `rounded-card`, `shadow-e2`, `text-lead`, `bg-brand`, `bg-deal` — all native Tailwind v4 utilities generated from the theme. No config file, no new dependency. `npm run lint:design` (`scripts/check-design-tokens.mjs`) counts every remaining raw `#hex`, `text-[…px]`, and grey-palette class in `src/` — **baseline 2,926**; the target is 0, and the gate flips to build-blocking in Phase 7.

---

## 3. Reference research — mechanics, not vibes

**Method note.** Pricepally, Farm to People, Misfits Market, Imperfect Foods and Too Good To Go are all client-rendered and geo/cookie-gated; their live DOM/CSS could not be scraped directly. The mechanics below are drawn from hands-on product knowledge, public write-ups (linked), the companies' own "how it works" pages, and Baymard's product-list research. Treat pixel values as approximate; treat the *mechanics* as the takeaway.

### 3.1 Pricepally (closest analogue — Nigerian, bulk + group-buy)

- **Card content order:** square produce photo on white → product name → **price in bold with the pack unit** (e.g. "₦4,500 / 1kg" or "₦4,500 (1 crate)") → add control. Pack size is never implicit.
- **Bulk vs retail:** the same product exposes a bulk price and a smaller "pally" (split-a-bulk-pack) price; the card makes the cheaper-per-unit bulk option visible rather than hiding it on the PDP.
- **Discount framing:** savings are expressed as **"~35% cheaper than the local market"** — a comparison to an external reference price, sourced-direct-from-farmers story attached. Not strikethrough theatre.
- **Urgency:** low-key. Availability is stock-driven ("in stock" / limited), no countdown timers.
- **Density:** ~2 per row on mobile, 3–4 on desktop; modest padding, photo does most of the work.
- **Trust signals:** "sourced directly from farmers and wholesalers", explicit delivery-city list (Lagos, Abuja, PH, Ibadan), freshness language — sit near the top of PDP and in the footer.
- **Fits FarmChops:** unit price on every card; bulk-tier visible on the card, not buried; **group-buy entry point on the card**; savings framed as a real comparison; 2-up mobile; naira formatting with `toLocaleString`; city-scoped delivery promise.
- Sources: [How we made it in Africa](https://www.howwemadeitinafrica.com/nigerias-pricepally-allows-its-customers-to-save-by-buying-food-in-bulk/74186/), [Innovation Village — group-buying launch](https://innovation-village.com/nigerias-pricepally-launches-group-buying-platform-for-food/), [Pricepally blog — 3 ways to shop](https://blog.pricepally.com/2023/04/14/3-ways-you-can-shop-on-pricepally/).

### 3.2 Farm to People (premium, editorial)

- **Card content order:** large, high-quality photo (often 4:5 portrait) → product name → **producer / farm name + location as a distinct line** → price with unit → add. The farm name *is* the trust signal and it's given real estate.
- **Discount framing:** minimal. Positioning is quality-led ("Grown today, delivered tomorrow"), not discount-led; sales are occasional and understated.
- **Urgency:** harvest-driven — "available this week", order-by cutoffs tied to the delivery calendar. Honest, calendar-based, not a ticking clock.
- **Density:** low. ~3 per row on desktop, big cards, lots of whitespace (~24–32 px inside a card).
- **Trust signals:** producer name + location on the card; harvest/pack dates; a producer story page one tap away.
- **Fits FarmChops:** a **producer / "from [farm/region]" line** on the card and PDP; harvest-freshness microcopy; order-by-time-for-next-delivery cutoff messaging.
- **Doesn't fit:** the low-density, huge-photo editorial layout. FarmChops users are on metered data and are comparing prices across many items — 3 giant cards per desktop row and portrait hero photos would mean more scrolling, more data, fewer items considered. Adapt the *attribution mechanic*, keep our denser grid.
- Source: [farmtopeople.com](https://www.farmtopeople.com) (home / how-it-works messaging).

### 3.3 Misfits Market / Imperfect Foods (discount-led, "rescued" produce)

- **Value prop up front:** "up to 40% off grocery store prices" is the headline, repeated site-wide.
- **Card content order:** photo → name → **size / weight** → price, often with a **compare-at (grocery) price** beside or under it → quantity stepper (not just "add"). Category/attribute **badges**: "Rescued & Upcycled", "Specialty Produce", "Small Makers".
- **Discount framing:** compare-at price + percentage; the "imperfect/rescued" story does the rest of the justification ("sourced for flavour, not appearance"). The discount is *explained*, which keeps it from reading as a spam blast.
- **Urgency:** "while supplies last", time-boxed sale sections, "going, going, gone" rails. Tied to genuinely limited rescued inventory.
- **Density:** medium. 2 mobile / 3–4 desktop, quantity stepper inline on the card.
- **Trust signals:** 100% money-back guarantee, sourcing/mission copy, delivery-day selector.
- **Fits FarmChops:** **compare-at price + % for deal items** (the PDP deal block already computes `discountPercentage` and `retailPrice` — surface it consistently on the card too); **attribute badges** (bulk-available, group-buy, low-stock) as a small consistent set; an inline **quantity stepper on the card** for simple retail items to cut taps; "X left at this price" tied to real `remainingUnits` (already computed in `ProductDetail`).
- **Doesn't fit:** the subscription-box-first flow and the "mystery of what's in your box" framing — FarmChops is a direct transactional cart + BNPL + group-buy, not a curated weekly box.
- Sources: [Misfits Market (Wikipedia)](https://en.wikipedia.org/wiki/Misfits_Market), [Penny Hoarder comparison](https://www.thepennyhoarder.com/save-money/misfits-market-vs-imperfect-foods/), [Healthline comparison](https://www.healthline.com/nutrition/misfits-market-vs-imperfect-foods).

### 3.4 Too Good To Go (real scarcity, done honestly)

- **Card content order:** store name + logo → "Surprise Bag" (item type) → **pickup window (e.g. "Collect 6:00–9:00 PM")** → **price with original value struck** ("₦X · worth ₦3X") → **"X left" counter** → store rating → distance.
- **Discount framing:** always a strikethrough original value next to the (roughly ⅓) price. The gap *is* the pitch; no separate "SALE" decoration needed.
- **Urgency:** the honest kind — a real "3 bags left" that decrements, a real pickup window, real sell-outs. No fake countdown; scarcity is a property of the inventory, shown plainly.
- **Trust signals:** store rating, exact pickup window, map/distance — logistics certainty is the trust.
- **Fits FarmChops:** **delivery-window / next-delivery info shown on the item** near price/CTA, not hidden in checkout; **"X left" only when it's real** (deal `remainingUnits`, low-stock threshold) shown as plain text, not a pulsing banner; **original-value strikethrough** for deal pricing.
- **Doesn't fit:** timers and pressure UI on every card; the surprise/mystery mechanic; distance/map (we deliver, not pick-up). Take the "scarcity shown honestly as a number" principle; leave the adrenaline.
- Sources: [Too Good To Go — how the app works](https://www.toogoodtogo.com/en-us/how-does-the-app-work), [Axios — Whole Foods surprise bags](https://www.axios.com/2024/07/17/whole-foods-too-good-to-go-app-surprise-bags).

### 3.5 Baymard product-list guidance (applies across all of the above)

- Show **unit price** whenever pack sizes vary — 67% of sites fail this; for grocery it's essential. → FarmChops: unit is already in `pricing.retail.unit`; make "₦price / unit" a fixed part of the card price line.
- Provide **≥ 3 thumbnails** and combine variants into one list item. → less relevant (produce has 1–2 images) but the PDP gallery should degrade gracefully with 1 image (it currently renders a lone thumbnail row oddly).
- Keep the discount signal to **one compare-at price + one badge**, not stacked banners.
- Source: [Baymard — Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering).

### 3.6 Synthesis — the FarmChops product card

Adopt (adapted):

1. **Fixed price line:** `₦4,500` in `text-lead`/`600` `text-ink`, then `/ kg` in `text-meta` `text-ink-muted`, on one baseline. Never green.
2. **One compare-at treatment** for deals: struck `retailPrice` + `deal` "−25%" chip. Reuse the PDP's existing calc.
3. **One badge set, top-left, max two shown:** `Deal` (`bg-deal`), `Group buy` (`bg-brand-tint`), `Bulk −{n}%` (`bg-brand`), `Low stock` (`bg-warning-tint`), `Out of stock` (`bg-danger`, greys the image). Consistent pill, `rounded-pill`, `text-caption`/`600`.
4. **Bulk / tier affordance:** the "N Options" control stays but styled as a quiet secondary button; the cheapest per-unit tier is previewed in text ("from ₦4,100/kg in bulk").
5. **"X left at this price"** as plain `warning` text, only when `remainingUnits` or low-stock is real.
6. **Producer/origin line** (`text-meta` `text-ink-muted`) under the name when the data exists — "from Oyo State farms". New data dependency; degrade silently if absent.
7. **CTA:** one primary `Add` button (`brand`, full-width, ≥ 44 px). Inline quantity stepper appears *after* first add, replacing the button, so the common case is one tap.
8. **Density:** 2-up mobile confirmed; `space-3` gap, `space-4` inner padding, no-shadow + `border-line-strong`, `rounded-card`. No hover-scale.

Reject: countdown timers, mystery framing, giant portrait photos, subscription-box IA, a blue that exists nowhere else, strikethrough on non-deal items.

---

## 4. Phased task list (highest visual impact per unit of effort first)

Each phase is one reviewable PR with diffs. Phases 0–3 are where nearly all the visible improvement is; 4–7 are consolidation.

### Phase 0 — Token foundation + font removal `[S effort, very high impact, near-zero risk]`
- Rewrite `src/index.css` `@theme` with the §2 tokens (colour, type scale + line-heights, spacing aliases, 4 radii, 4 elevations, motion). Keep the old shadcn vars as **aliases** pointing at new tokens so the 4 existing `ui/` primitives don't break.
- Remove the 3 Google font `<link>`s from `index.html` and the 8 `@font-face` blocks + `p {}` / `body {}` overrides from `index.css`; set `--font-sans` system stack; delete `src/fonts/` and unused `src/font/`.
- Add `prefers-reduced-motion` block.
- Add CI grep gate (warn-only this phase): new `#hex` / `text-[…px]` / `bg-gray-*` in `src/`.
- **Visible result:** consistent type rendering (no more DM-Sans/Nunito split), ~150–250 KB less to download on first paint, warm neutral background. No layout changes.

### Phase 1 — Core primitives `[M effort, high impact]`
- Add `ui/button.tsx` (variants: primary/secondary/ghost/danger; sizes sm/md/lg; all ≥ 44 px target; token-driven; visible focus ring using `border-line-input`/`brand`).
- Add `ui/badge.tsx` (the §3.6 badge set), `ui/input.tsx` + `ui/field.tsx` (label + hint + error, `border-line-input`, 16 px text to prevent iOS zoom), `ui/skeleton.tsx`, `ui/modal.tsx` (one shell: focus trap, `Esc`, scroll-lock, `shadow-e3`, `rounded-panel`/`md`).
- Refactor `ui/card.tsx` to no-shadow + `border-line-strong` + `rounded-card` defaults.
- **Visible result:** buttons, inputs, badges, modals become consistent the moment screens adopt them.

### Phase 2 — Product card + grid `[M effort, very high impact]`
- Build the §3.6 card as the single `ProductCard`. Delete the bespoke cards in `Featured.tsx` and `Category.tsx`; point them at `ProductCard` / a shared `CategoryCard`.
- Fix price line (decouple from green, add unit), badge set, compare-at, "X left", remove `hover:scale-105`, CTA ≥ 44 px, post-add quantity stepper.
- `ProductGrid`: the §2.4 column/gutter rules; verify at 360 px.
- **Visible result:** the highest-frequency UI element on the site becomes coherent; Home and Products both jump.

### Phase 3 — Products listing page `[M effort, high impact]`
- `pages/Products.tsx`, `SortBar`, `FilterSidebar`, pagination: token surfaces (kill `bg-green-50` page wash → `canvas`), spacing scale, filter chips as `ui/badge`, sticky mobile "Filters" trigger as `ui/button`, pagination as a primitive. Loading state → `ui/skeleton` grid instead of a lone spinner.
- **Visible result:** the shop reads as one designed surface instead of stacked green bands.

### Phase 4 — Product Detail `[M effort, high impact]`
- `Product/ProductDetail.tsx`: pricing block, deal block, tier rows, badges, CTAs all on tokens and primitives. One deal styling (`deal` tokens, not emerald + `#0F2E19` + `#1D7B3C` mixed). Gallery degrades cleanly with 1 image. Sticky bottom CTA bar on mobile.
- **Visible result:** the decision screen stops looking like three different designers' work stacked vertically.

### Phase 5 — Cart & Checkout `[M effort, high impact on conversion]`
- `Cart/CartSidebar`, `pages/CartPage`, `pages/CheckOut`: token surfaces, `ui/button` (fix `bg-green-800` / `#1D7B3C` / `hover:bg-green-700` inconsistency), quantity steppers = the card's component, sticky checkout CTA in the thumb zone, consistent order-summary card. Consolidate the 4 address inputs to 1 (behaviour-preserving) if low-risk; otherwise flag separately.
- **Visible result:** the money path looks trustworthy and consistent.

### Phase 6 — Home & marketing sections `[M effort, medium-high impact]`
- `Hero`: cap height (no `100dvh`), cross-fade only, drop 3 of the 5 near-identical slides or make them data-driven, headline ≤ `text-2xl`/`3xl`, real alt text, `next-gen` compressed images.
- `Category`, `Featured`, `HowItWork`, `Features`, `WhyChooseUs`, `ExploreStore`, `Footer`: replace the repeated "centred `text-xs` green eyebrow + `text-3xl` centred heading + green band" pattern with the §2 section rhythm and left-aligned headings where it suits; remove dead commented code.
- **Visible result:** Home stops looking like a template; sections get visual variety with a consistent system.

### Phase 7 — Global sweep + gate `[M effort, low-per-file, high cumulative]`
- Remaining storefront pages (auth, About, Services, FAQ, Deals, GroupSharing, BecomeVendor, profile/*) adopt tokens + primitives.
- Delete orphaned `pages/Login.tsx`, `pages/Register.tsx`, `pages/VerifyEmail.tsx` after confirming router doesn't reach them.
- Flip the CI grep gate to **blocking**.
- Separate follow-up (not this project): image/video optimisation pipeline for `src/assets` (the 34 MB mp4 and ~20 MB of oversized PNGs); admin design-system rollout.

### Effort key
S ≈ half a day · M ≈ 1–3 days. Impact is visual-improvement-per-effort for a storefront visitor.

---

## 5. Before / after — the three screens that matter

### 5.1 Product listing (card + grid + `/products`)

**Before**
- Page is a stack of full-width `bg-green-50` / `bg-green-100` bands; the grid sits on a green wash.
- Cards: `rounded-2xl`, `shadow-lg`, `hover:shadow-2xl hover:scale-105` (layout shift on tap). Title `text-base md:text-xl` with a hardcoded `min-h-[48px]`. Price is `#1D7B3C` bold — same colour and near-same weight as the green "Add to cart" button below it, so price and CTA compete.
- Unit shown as "(piece)" in muted grey, easy to miss. No unit *price*.
- Badges: blue `GROUP SHARING`, green `SAVE x%`, red `OUT OF STOCK`, yellow `LOW STOCK` — four colours, inconsistent casing, up to four stacked.
- "N Options" button and "Add to cart" button are both prominent; on a 158 px-wide mobile card that's a lot of controls.
- Featured (home) and Category (home) cards are visually different components (`rounded-xl` vs `2xl`, `#20571E` vs `#1D7B3C`).
- Loading = one centered spinner for the whole page.

**After**
- `canvas` background throughout; `SortBar`/filters on `surface` with `border-line-strong`. No green bands.
- Cards: `rounded-card`, no-shadow + `border-line-strong`; desktop hover → `shadow-e1` + border shift, no scale, no motion on touch. Title `text-lead`/`600`, 2-line clamp via line-height (no magic `min-h`).
- Price line: `₦4,500` `text-lead`/`700` `text-ink` + `/ kg` `text-meta` `text-ink-muted`, one baseline. Bulk hint: "from ₦4,100/kg in bulk" `text-meta` `brand-ink`.
- Deals: struck `retailPrice` + one `deal` −25%` chip. Non-deal items never show strikethrough.
- Badges: one pill style, top-left, **max two**, from the fixed set; `Group buy` uses `brand-tint` (not blue).
- One primary `Add` (`brand`, ≥ 44 px, full-width). Quantity stepper replaces it after first add. "N Options" demoted to a quiet link-style control for products that actually have tiers.
- Home's Featured/Category reuse the same card component — one design everywhere a product appears.
- Loading = skeleton grid matching the real layout.

### 5.2 Product Detail (`/products/:slug`)

**Before**
- `bg-gray-50` page. Back-bar, then a 2-col grid.
- Three different "panel" styles stacked: the deal block is `border-2 border-[#1D7B3C] bg-emerald-50` with text in `#0F2E19` and `#0F2E19/80` and `#1D7B3C`; the retail-price box is `border-2 border-gray-200`; bulk-tier boxes are `border-2 border-[#1D7B3C] bg-green-50`. Emerald, three hand-mixed greens, and grey all in one column.
- Title `text-3xl font-bold`; section labels `font-semibold` with no size token.
- Badges here are a *different* set from the card (`bg-green-100 text-[#1D7B3C]` rounded-full category chip, etc.).
- CTAs: `bg-[#1D7B3C] hover:bg-green-800`, disabled state `bg-[#1D7B3C]/60`. "Buy Bulk" is a second identical-weight green button.
- Error toast is a bespoke inline `fixed top-4 right-4` element with two hand-drawn SVG paths.
- On mobile the CTA is inline, so it scrolls away below a long description + tier list.

**After**
- `canvas`; one panel style (`surface`, `border-line-strong`, `rounded-card`) for retail price, tiers and the deal block; the deal block is differentiated by a `deal` left border + `deal-tint` header, not a fourth green.
- Deal block: `deal` "Deal of the Day" label, `text-ink` price, struck original, one `deal` `−{n}%` chip, "`{remainingUnits}` left" as plain `warning-ink` text. Same tokens as the card's deal treatment.
- Title `text-xl`/`700`; "Description", "Pricing options" as `text-lg`/`600`.
- Same badge component and set as the listing card.
- Primary CTA = `ui/button` primary; "Buy Bulk" = `ui/button` secondary (clearly subordinate). Disabled uses the button's own disabled token, not `/60` opacity.
- Errors go through the existing `AlertContext` / `ui/toast`, not a bespoke element.
- Mobile: sticky bottom bar with price + primary CTA, always reachable.

### 5.3 Cart (`CartSidebar` + `/cart`) & Checkout

**Before**
- Sidebar: `w-[95%] sm:w-[90%] md:w-[420px]`, `shadow-xl`. Header icon `text-[#1D7B3C]`, title `text-xl sm:text-2xl`. Item cards `border border-gray-200 rounded-lg shadow-sm`. Totals box `bg-green-50 rounded-lg`. Subtotal per line is `text-green-700`; the grand total is `text-[#1D7B3C]` — two greens for the same concept.
- Buttons: primary `bg-[#1D7B3C] hover:bg-green-800`; secondary `border-2 border-[#1D7B3C] text-[#1D7B3C] hover:bg-green-50`; a third "Continue Shopping" text button. Quantity steppers are `w-10 h-10` (OK) but styled locally.
- Clear-cart confirm is a second, differently-styled modal (`rounded-xl`, `bg-black bg-opacity-50`) nested inside the sidebar.
- Checkout page repeats all of this with its own spacing.

**After**
- Sidebar: `shadow-e3`, `rounded-panel` (left corners), one width rule. Header title `text-title`/`600`, icon `brand-ink`.
- Item rows: `surface`, `border-line` between rows, `rounded-card`. All money in `text-ink`/`600`; only the final payable total is emphasised (`text-lead`/`700`) — one treatment, no competing greens.
- Buttons: `ui/button` primary + secondary + ghost. Steppers = the shared component from the product card.
- Clear-cart confirm = the shared `ui/modal`.
- Checkout consumes the same order-summary card component and the same sticky-CTA pattern as the sidebar, so cart → checkout feels continuous.
- Mobile: sticky "Proceed to checkout" bar with the total, in the thumb zone.

---

## 6. Constraints check

| Constraint | How this plan honours it |
|---|---|
| No functionality / routing / data / logic changes | All phases are presentation-only. RTK Query, routes, handlers untouched. The only *deletions* proposed (orphan `Login.tsx` etc., dead comments) are verified-unreachable and called out separately. |
| No new dependencies / UI kits / icon libs | Everything uses Tailwind v4 theme + the existing shadcn scaffold + lucide. Removing `react-icons` and unused fonts is subtraction. Any exception asked first. |
| Accessibility kept or improved | ≥ 44 px targets on all buttons/steppers; visible focus rings (`border-line-input`/`brand`, not `outline-none` with nothing); semantic `<button>`/`<nav>`/`<main>`; real `alt` text on hero + product images; keyboard-navigable modals (focus trap, `Esc`); AA-verified contrast on every text pairing (§2.3). |
| Bundle / image weight | Phase 0 removes ~150–250 KB of fonts. `transition-all`→named properties trims style recalc. Image/video optimisation flagged as a required follow-up (34 MB mp4, ~20 MB PNGs). |
| Preserve behaviour on all breakpoints; test 360 px | Breakpoints unchanged. Grid math checked at 360 (§2.4). Each phase's PR includes 360 / 768 / 1280 screenshots before merge. |

## 7. What this plan deliberately avoids

No purple/blue gradients (the one `from-purple` and the blue badge are removed). No glassmorphism (the single `backdrop-blur` on the admin header is out of storefront scope; not added anywhere). No emoji as icons (the `🔍` empty-state and `🌍` in a hero headline get real treatment). Hero text capped at 40 px. Shadows reduced to 4 meaningful levels, default is *no* shadow. No centred-hero-plus-three-cards template — the home sections get real hierarchy and left-alignment where it reads better. Every token in §2 has a one-sentence reason; if a choice can't be defended in a sentence it isn't in here.

---

## 8. Decisions taken (2026-09-07)

1. **Brand green → `#1C6B3A`** (slight shift from `#1D7B3C` for contrast headroom). Approved.
2. **Deal colour → burnt orange `#B44708`** (`--color-deal`). No existing brand secondary; approved.
3. **Producer/origin line** — omit for now; the API has no farm/region field. Revisit when the data lands.
4. Address-input consolidation and image optimisation remain separate follow-up tasks, not part of the design-token work.

---

## 9. Phase 0 — DONE (token foundation + font removal)

One commit's worth of changes, presentation-only, no component logic touched. `vite build` passes.

| File | Change |
|---|---|
| `src/index.css` | New `@theme` block: full semantic colour set (`canvas`, `surface`, `ink*`, `line*`, `brand*`, `deal*`, `success*`, `warning*`, `danger*`), role-named type scale with per-step line-heights (`text-caption`…`text-hero`), radius (`rounded-control/card/panel/pill`), elevation (`shadow-e1/e2/e3`), motion easings. System-UI `--font-sans` (Roboto on Android). shadcn `:root` vars retargeted onto the new palette (was near-black + cool grey → warm neutrals + brand green + green focus ring). Removed 4 `@font-face` blocks + the `body`/`p` font overrides. Added a `prefers-reduced-motion` block. |
| `index.html` | Removed the 3 Google Fonts `<link>`s + 2 preconnects (~150–250 KB of render-blocking downloads gone). |
| `src/font/` | Deleted — 8 unused NeueMontreal `.otf` files (384 KB), referenced by a broken path (`./fonts/` vs `./font/`). |
| `scripts/check-design-tokens.mjs` + `npm run lint:design` | Warn-only guard counting raw hex / arbitrary font-size / grey-palette classes in `src/`. **Baseline: 2,926.** Target 0; blocking in Phase 7. |

**Visible effect:** type renders in one consistent family (no more DM-Sans-vs-Nunito split inside a card); first paint is lighter on metered data; background and default borders/focus rings pick up the warm palette. No layout shifts — the new token *utilities* aren't consumed by components until Phase 1+.

**What Phase 0 deliberately did *not* touch:** Tailwind's built-in `text-*`, `rounded-*`, `shadow-*`, `gray-*` scales stay intact, so the 1,900+ existing usages render exactly as before. The `index.html` pre-React loading spinner (still hardcoded `#1D7B3C`) — trivial, folded into Phase 6.

---

## 10. Phase 1 — DONE (core primitives)

Additive: 6 new files in `src/components/ui/`, plus a defaults-only refactor of `card.tsx`. Nothing imports them yet except `card.tsx` (used only by admin `Overview.tsx`), so **zero storefront visual change** — these are the toolkit Phase 2 assembles the product card from. `tsc`, `eslint`, `vite build` all clean. Guard count unchanged at 2,926 (primitives contain no raw hex / grey classes).

| File | What it is |
|---|---|
| `ui/button.tsx` | `Button` + `buttonVariants` (CVA). Variants `primary` / `secondary` / `ghost` / `danger`; sizes `default` (h-11 = 44px) / `lg` (h-12) / `icon` (44×44). **No sub-44px size exists** — honours the hit-target constraint by construction. `type="button"` default. Focus ring = `ring-brand` + offset. `buttonVariants` exported so `<Link>` can be styled as a button. |
| `ui/badge.tsx` | `Badge` + `badgeVariants` (CVA). The fixed §3.6 set: `neutral` / `brand` / `brandSoft` / `deal` / `success` / `warning` / `danger`, sizes `sm` / `md`, `rounded-pill`, forces child `svg` to `size-3`. |
| `ui/input.tsx` | `Input` — `text-body` (16px, no iOS zoom), `border-line-input` (3:1), `rounded-control`, `focus-visible:ring-brand/40`, `aria-invalid` → danger styling. |
| `ui/field.tsx` | `Field` — label + control + hint/error with the a11y wiring done once: generates an `id`, clones its single child to attach `id` / `aria-invalid` / `aria-describedby`. Optional `required` asterisk. |
| `ui/skeleton.tsx` | `Skeleton` — `animate-pulse` on `bg-surface-sunken`; `aria-hidden`; pulse auto-neutralised under `prefers-reduced-motion` (global rule). |
| `ui/modal.tsx` | `Modal` + `Modal.Footer` — one dialog shell (replaces ~10 hand-rolled copies). Portal, backdrop-click + Esc close, **focus trap**, scroll-lock, focus restored to trigger on close, `role="dialog"` / `aria-modal` / `aria-labelledby` / `aria-describedby`, `shadow-e3`, `rounded-card` → `sm:rounded-panel`. **Hand-rolled — no new dependency** (`@radix-ui/react-dialog` was the alternative; not added). |
| `ui/card.tsx` | Defaults retargeted: `bg-card … rounded-xl border py-6 shadow-sm` → `bg-surface text-ink rounded-card border border-line-strong py-5` (no shadow). API unchanged. Only affects admin `Overview.tsx`. |

---

## 11. Phase 2 — DONE (product card + grid)

First phase with a **visible** change. `tsc` / `eslint` (own files) / `vite build` clean. Verified with real screenshots at true 360 CSS px and 1280 px (Chrome DevTools Protocol, device-emulated — the earlier `--window-size` screenshots were misleading due to Windows display scaling). Guard: **2,926 → 2,878**.

| File | Change |
|---|---|
| `Product/ProductCard.tsx` | **Compact rebuild** on `Badge` + tokens (Pricepally / Farm-to-People density — the first pass was too tall). **All state/nav/BulkBuying logic unchanged.** `rounded-card`, `border-line-strong`, no shadow. Image is a keyboard-accessible `<button>` (was a bare `onClick` div), `aspect-square`, with a **floating 44×44 "+" add button** (`bg-brand`, white ring, `shadow-e2`) bottom-right — opens the BulkBuying drawer; muted/disabled when out of stock. Body: name `text-meta`/`500` `line-clamp-2`; price `₦…` `text-body`/`600` `text-ink` + `/ unit` `text-fine` `text-ink-muted` — **decoupled from green**. Badges → `<Badge>` set, top-left, max 2 (`Out of stock` · `Group buy` brandSoft, was a lone blue · `Bulk −n%` · `Low stock`). "N options ▾" → tiny inline `text-fine` disclosure, shown **only when >1 tier**. The two stacked full-width 44px buttons are gone — card height roughly halved. |
| `Product/ProductGrid.tsx` | Denser grid: `grid-cols-2` → `sm:3 lg:4 xl:5` (no sidebar) or `lg:3 xl:4` (with sidebar); gutter `10 / 12 / 16`. 2-up at 360px, no overflow. |
| `Product/SortBar.tsx` | **Fixed a pre-existing mobile overflow** (fixed `w-56` search + `w-[140px]` select = 364px > 360). Search now `flex-1` on mobile, `sm:w-64` on desktop; select `w-[116px]` → `sm:w-[180px]`. No restyle yet (Phase 3). |
| `ui/button.tsx` | Added `whitespace-nowrap`; disabled → `opacity-60` + `cursor-not-allowed` (was `opacity-50`, too faint). |

`ProductCard` renders on both `/products` and (via the old `Featured.tsx`) the home page. Only `/products` was signed off.

### Before → after (product card)

| | Before | After |
|---|---|---|
| Height | ~450px (big image + 2 stacked full-width buttons) | ~230px — image + name + price + tiny options link |
| Add action | full-width green "Add to cart" button + full-width "N options" button, stacked | one floating 44px "+" on the image (Pricepally pattern) |
| Shadow | `shadow-lg` → `hover:shadow-2xl` **+ `hover:scale-105`** (layout jump on tap) | none → `md:hover` border only, no transform |
| Price | `#1D7B3C` bold — same colour & weight as the CTA below it | `text-ink` — stops competing with the button |
| Badges | blue `GROUP SHARING` + green `SAVE x%` + red + yellow, 4 colours, up to 4 stacked | one `<Badge>` component, max 2, `Group buy` uses `brand-tint` not blue |
| Density | 3-up desktop (with sidebar) | 4-up (with sidebar) / 5-up (without), tighter gutters |
| Green | `#1D7B3C` + `green-700` hardcoded | `bg-brand` / `bg-brand-hover` tokens (`#1C6B3A`) |

---

## 12. Home page re-IA — ATTEMPTED, REVERTED (2026-09-07)

Tried a full information-architecture rework of `/` (Pricepally-shaped: search-first hero replacing the 100dvh carousel, product rails, a condensed value strip replacing `Features` + `WhyChooseUs`, a tightened `HowItWork`). **The user rejected it outright and asked for a full revert.**

All eight home-page files — `Home.tsx`, `Hero.tsx`, `Featured.tsx`, `Category.tsx`, `HowItWork.tsx`, `Features.tsx`, `WhyChooseUs.tsx`, `ExploreStore.tsx` — and the `Products.tsx` `?search=` wiring were restored to `HEAD`. The new `components/home/` directory was deleted. This also rolled back the Phase 2 `Featured.tsx` / `Category.tsx` restyles.

**Lesson for any future home work:** the current home structure (hero carousel → Category → Featured → HowItWork → Features → WhyChooseUs → ExploreStore → Footer) stays. Home changes, if any, must be restyle-only within that structure and shown in small increments before going further.

### Current state of the branch (uncommitted)

Kept: Phase 0 (tokens, font removal), Phase 1 (`ui/` primitives), Phase 2 `ProductCard` / `ProductGrid` / `SortBar` / `ui/button` (drive `/products`).

---

## 13. Home page — in-structure restyle (2026-09-07, take 2)

After the re-IA was rejected, agreed with the user on **A + C + D + F** — no section removed, no re-ordering beyond one swap. `tsc` / `eslint` / `vite build` clean. Home JS chunk 21.8 KB → 14.3 KB; ~2–3 MB of hero/decoration PNGs no longer imported.

| Move | File(s) | What changed |
|---|---|---|
| **A — cap + fix hero** | `Hero.tsx` | `h-[100dvh]` → `h-[420px] sm:460 lg:520`. 5 slides → promo (if active) + 2 distinct ("Fresh from the farm", "Now shipping worldwide" — 🌍 emoji dropped). Headline was clipping at 360 (`whitespace-pre-line` + `max-w-[500px]`) → natural wrap, `max-w-[34ch]`, `text-display`/`lg:text-hero`, **left-aligned** lower-left (not centred). Added a bottom-up black scrim for text legibility (was white text straight on the photo). CTA + dots on tokens. Dropped `heroProduce`, `heroCooking`, `overlay.png` imports. |
| **C — product first** | `Home.tsx` | `Featured` moved above `Category` — product row is now the first thing under the hero. |
| **D — declutter HowItWorks** | `HowItWork.tsx` | Removed the `#20571E` full-bleed band, the two decorative flower PNGs, and the empty `#D9D9D9` icon circles. Now a clean numbered 3-step row on the page ground. |
| **F — warm the page** | `Featured` · `Category` · `Features` · `WhyChooseUs` · `ExploreStore` | All on tokens + the compact `ProductCard`. `Featured` → 5 compact cards + "View all". `Category` → 6 tiles, no `hover:scale-105`, ~65-line commented block deleted. `Features` → warm `brand-tint` band, bordered grid, `text-heading` (copy kept verbatim — see note). `WhyChooseUs` → token restyle, `Check`-icon list. `ExploreStore` → `h-80`, token CTA. Consistent `max-w-[1200px]` container + `py-10/12/16` rhythm across all sections. |

**Width & spacing pass (follow-up):** home section container `max-w-[1200px]` → **`max-w-[1440px]`**, edge padding `px-4` → `px-4 sm:px-5` (16 → 20px, roughly matching the card gap so nothing looks lopsided — cf. Pricepally). Product/category grid gaps opened up: `gap-2.5/3/4` → `gap-3 sm:gap-4 lg:gap-6` (12 / 16 / 24). `Featured` shows 6 and goes `xl:grid-cols-6`.

**Copy note:** the six `Features` descriptions are kept verbatim (run-ons and typos included) — tightening them is the "E" move the user deferred. Offered separately.

**Not done (still original):** Navbar, DealBanner, Footer, the `index.html` pre-React loader. The now-unimported PNGs (`hero-produce`, `hero-cooking`, `overlay`, `flower1/2`, `Frame`, `product.jpg`) are still in `src/assets/` — Vite doesn't ship them, but they can be deleted for repo hygiene.

### Take 3 — mobile rails + bottom tab bar (2026-09-07)

User compared our mobile home to Pricepally's and asked for four things. All done, verified with device-emulated screenshots at 390 px.

| # | Change | Files |
|---|---|---|
| **1. Compact cards on mobile** | `ProductCard` body: `text-fine` name / `text-meta` price / `p-2` at mobile, stepping up to `text-meta` / `text-body` / `p-2.5` from `sm`. "+" button stays 44px. | `Product/ProductCard.tsx` |
| **2. Horizontal rails** | New `home/ProductRail.tsx` — title + subtitle + "View all", **horizontal scroll-snap on mobile** (cards ~42% wide, ~2½ visible), 6-up grid from `md`. `Featured` now renders a `ProductRail`. `Category` tiles get the same scroll-on-mobile treatment. | `home/ProductRail.tsx`, `Featured.tsx`, `Category.tsx` |
| **3. More themed rows** | New `home/CategoryProductRail.tsx` — self-fetches one category (`useGetProductsQuery({category})`), renders a `ProductRail` with a subtitle. `Home.tsx` drops in a rail for `categories[0]` and `categories[1]` between the existing sections. | `home/CategoryProductRail.tsx`, `Home.tsx` |
| **4. Mobile bottom tab bar** | New `MobileTabBar.tsx` — fixed bottom, `md:hidden`, **Home / Products / Cart / Orders / Account** (lucide icons, `NavLink` active state, cart badge, safe-area inset). Rendered in `App.tsx` alongside the existing hamburger; `<main>` gets `pb-14 md:pb-0`. | `MobileTabBar.tsx`, `App.tsx` |

Home order is now: Hero → Fresh picks (rail) → Shop by category (rail) → *category rail* → How it works → *category rail* → Features → WhyChooseUs → ExploreStore → Footer. No page horizontal overflow at 390 px (rails scroll internally). Still deferred: the `Features` copy (run-ons/typos), Navbar/DealBanner/Footer restyle, products-listing page.
