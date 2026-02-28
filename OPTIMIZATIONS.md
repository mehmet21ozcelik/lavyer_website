# Optimization Audit Report

## 1) Optimization Summary

**Current Optimization Health**: Moderate. The project establishes a solid foundation using App Router, Prisma, and Next.js 13+ standards. However, it currently suffers from severe data-fetching anti-patterns on critical user-facing pages and conflicting Next.js caching directives that completely neutralize its performance potential. Furthermore, core web vitals (LCP, CLS) are ignored by the absence of `next/image`.

**Top 3 Highest-Impact Improvements**:
1. **Fix Conflicting ISR Directives**: Remove `force-dynamic` from `app/(public)/blog/page.tsx` so `revalidate = 3600` can actually cache the page.
2. **Paginate and Constrain DB Queries**: Add `.select` and pagination to `findMany` in `app/(public)/blog/page.tsx` to prevent fetching massive HTML contents into memory.
3. **Adopt `next/image`**: Swap standard `<img>` tags with `next/image` (as mandated by rule #8) to drastically reduce bandwidth and layout shifts.

**Biggest Risk if no changes are made**: **Memory Out-of-Memory (OOM) Crashes.** The unpaginated `findMany` in the blog listing fetches the entire `content` payload for every published post on every request (since `force-dynamic` forces SSR). As the blog grows, a handful of concurrent users will cause the Node/Vercel server instance to crash.

---

## 2) Findings (Prioritized)

### Unpaginated & Over-fetched Blog List Query
* **Category**: DB / Memory
* **Severity**: Critical
* **Impact**: Memory usage, CPU throughput, DB I/O latency
* **Evidence**: `app/(public)/blog/page.tsx` (Line 14) executes `prisma.blogPost.findMany({...})` without `take`, `skip`, or a `select` payload constraint.
* **Why it’s inefficient**: It pulls the entire database table of published content into the Node.js memory space, including the heavy `content` column containing rich HTML, just to render a title and an excerpt.
* **Recommended fix**: Add pagination bounds (`take: 10`) and strictly declare `select: { id: true, title: true, slug: true, excerpt: true, createdAt: true, practiceArea: true }`.
* **Tradeoffs / Risks**: Requires adding pagination UI logic.
* **Expected impact estimate**: 80%+ reduction in server memory overhead per request.
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

### Conflicting Next.js Fetch Directives (ISR vs SSR)
* **Category**: Performance / Caching
* **Severity**: Critical
* **Impact**: Server CPU time, Latency (TTFB), Compute Cost
* **Evidence**: `app/(public)/blog/page.tsx` (Lines 3-4) explicitly sets both `export const revalidate = 3600;` and `export const dynamic = 'force-dynamic';`
* **Why it’s inefficient**: `force-dynamic` forcefully disables standard Incremental Static Regeneration (ISR). Every request incurs a full database roundtrip and React server render, making the `revalidate` command dead code.
* **Recommended fix**: Remove `export const dynamic = 'force-dynamic'`. 
* **Tradeoffs / Risks**: Content will be cached up to 1 hour, standard for blogs. If build fails without a DB locally, mock the data rather than crippling production performance.
* **Expected impact estimate**: Drops TTFB from ~200ms+ to <50ms (CDN cache hit).
* **Removal Safety**: Safe
* **Reuse Scope**: Local file

### Missing `next/image` Component (LCP Penalty)
* **Category**: Frontend / Network
* **Severity**: High
* **Impact**: Bandwidth, LCP (Core Web Vitals), SEO ranking
* **Evidence**: No explicit `next/image` usage found in `.tsx` components. `@tiptap/extension-image` outputs raw `<img>` tags.
* **Why it’s inefficient**: Raw images are loaded unoptimized, uncompressed (no WebP/AVIF enforcement), and block rendering.
* **Recommended fix**: 
  1. Replace static images with `next/image`.
  2. For the RichText HTML (`dangerouslySetInnerHTML`), implement a custom parser (like `html-react-parser`) to swap `<img>` strings with `<Image />` components safely on render.
* **Tradeoffs / Risks**: HTML parsing entails a minor CPU hit, offset by massive network gains.
* **Expected impact estimate**: 50-80% reduction in image payload sizes.
* **Removal Safety**: Safe
* **Reuse Scope**: Service-wide

### Missing Foreign Key Indexes in Prisma Schema
* **Category**: Database
* **Severity**: Medium
* **Impact**: DB Latency
* **Evidence**: `prisma/schema.prisma` lacks `@@index` for heavy relations like `practiceAreaId` across models.
* **Why it’s inefficient**: While SQLite creates some inherent lookups, migrating to PostgreSQL (mandated by rule #1) without standard indexes will cause full-table scans when filtering posts by practice area, or handling cascading deletions.
* **Recommended fix**: Add `@@index([practiceAreaId])` inside the `BlogPost` and `CityPracticeArea` models. 
* **Tradeoffs / Risks**: Slight disk space usage increase.
* **Expected impact estimate**: query times drop from O(N) to O(1) during filtered lookups.
* **Removal Safety**: Safe
* **Reuse Scope**: Service-wide

### Cursor Pagination Malfunction in Admin API
* **Category**: Relational Logic / Algorithm
* **Severity**: Medium
* **Impact**: Correctness, Table Scans
* **Evidence**: `app/api/admin/blog/route.ts` (Lines 15-17) uses `id` as the cursor (`cursor: { id: cursor }`), but orders the return list by `orderBy: { createdAt: 'desc' }`.
* **Why it’s inefficient**: Cursor pagination breaks down entirely if the cursor variable does not align identically with the sorted column. This forces the relational engine into inefficient scan paths or skipped records when multiple items are created in the same timestamp window.
* **Recommended fix**: Because Prisma `cuid()` instances are chronologically sortable (or partially sequentially based), either change `orderBy: { id: 'desc' }` or enforce a composite index on `(createdAt, id)` and cursor both.
* **Tradeoffs / Risks**: None.
* **Expected impact estimate**: Reliability fix, avoids edge-case data skips.
* **Removal Safety**: Likely Safe
* **Reuse Scope**: Local file

### Duplicate JWT Secret Allocation (Memory Allocation)
* **Category**: Memory / Build
* **Severity**: Low
* **Impact**: Negligible CPU/Memory
* **Evidence**: `app/api/auth/login/route.ts` and `middleware.ts` identically recreate `new TextEncoder().encode(...)`.
* **Why it’s inefficient**: Violates DRY. Because Next.js middleware runs in Edge Isolates, this executes independently on boot. 
* **Recommended fix**: Extract `JWT_SECRET` initialization to a single file `lib/auth/jwtConfig.ts` and import it.
* **Tradeoffs / Risks**: None.
* **Expected impact estimate**: Micro-optimization, purely structural.
* **Removal Safety**: Safe
* **Reuse Scope**: Reuse Opportunity

---

## 3) Quick Wins (Do First)
1. **Remove `export const dynamic = 'force-dynamic'`** from `app/(public)/blog/page.tsx`.
2. **Implement `.select` constraint** in the same blog route to exclude the heavily weighted `content` column.
3. Update `app/api/admin/blog/route.ts` sorting to align with the `id` cursor: `orderBy: { id: 'desc' }`.

---

## 4) Deeper Optimizations (Do Next)
* **Implement HTML AST parsing** to convert raw `<img>` tags generated by Tiptap into `next/image` components within `app/(public)/[slug]/page.tsx` and blog detail pages. 
* **Migrate from SQLite to PostgreSQL**: The schema currently defines SQLite, violating the architectural rule (`rules.md` #1). PostgreSQL handles concurrent DB transactions orders of magnitude better in serverless environments.

---

## 5) Validation Plan

**To prove the memory payload optimization:**
1. Generate 50 dummy blog posts with heavy text via admin panel.
2. Load `/blog` route, profiling Node memory usage. 
3. After applying the `.select` fetch constraint, verify that the fetched Prisma payload drastically drops payload parsing limits (use `console.time` and check Vercel Logs / Profiler if deployed).

**To prove ISR optimization:**
1. Load the `/blog` index route.
2. Inspect the network response headers for `x-nextjs-cache: HIT`. Under `force-dynamic`, this will always evaluate to `MISS`. After the fix, subsequent reloads must reflect `HIT`.

---

## 6) Optimized Code / Patch

**Before (`app/(public)/blog/page.tsx`):**
```tsx
export const revalidate = 3600; 
export const dynamic = 'force-dynamic'; 

// ...
posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: { practiceArea: true, seo: true }
});
```

**After (Optimized):**
```tsx
export const revalidate = 3600; 
// Removed force-dynamic to allow cache persistence

// ...
posts = await prisma.blogPost.findMany({
    take: 20, // Added Pagination / limit bounds
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    select: { // Stop Overfetching
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        practiceArea: true,
        // specifically skipping 'content' here!
    }
});
```
