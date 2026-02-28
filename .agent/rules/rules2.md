---
trigger: always_on
---

############################
# 9. SEO STANDARTLARI
############################
- Her sayfa için generateMetadata zorunlu (boş bırakılamaz).
- OpenGraph: title, description, image, url, type zorunlu.
- Twitter card: summary_large_image.
- JSON-LD schema (site türüne göre):
    - Avukatlık → LegalService (LocalBusiness alt türü)
    - Mobilya   → FurnitureStore (LocalBusiness alt türü)
    - Blog      → Article (author, datePublished, dateModified)
- Dinamik sitemap: app/sitemap.ts (yayında olan post'lar dahil).
- robots.txt: app/robots.ts (admin dizinleri hariç).
- Slug: Türkçe karakter normalize (slugify), DB'de unique constraint.
- Canonical URL: tüm sayfalarda tanımlanır.
- h1 her sayfada yalnızca bir adet.
- Semantic HTML zorunlu.

############################
# 10. PERFORMANS
############################
- RSC öncelikli mimari.
- Gereksiz büyük kütüphane eklenmez (next-bundle-analyzer ile kontrol).
- Blog: ISR (revalidate: 3600).
- next/image zorunlu (width+height veya fill+sizes zorunlu).
  sizes prop: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  priority: sadece above-the-fold hero görseli.
- Lazy loading: next/dynamic ile ağır bileşenler (Tiptap, modal ağır içerikler).
- Dynamic rendering minimum, yalnızca zorunlu sayfalarda.
- next/font ile font yükleme (layout shift önlenir).
- next/script ile 3. parti scriptler (strategy='lazyOnload').
- useEffect minimum; useMemo/useCallback yalnızca profiling sonrası.

############################
# 11. HATA YÖNETİMİ VE LOGGING
############################
- Her API route ve Server Action try/catch ile sarılır.
- Server Action → next-safe-action response standardı (yukarıya bak).
- Kritik hatalar sunucu tarafında loglanır (production: Sentry/Axiom hazırlığı).
- Next.js error.tsx ve not-found.tsx her route segment için tanımlanır.
- Global error.tsx root layout için tanımlanır.
- Client component'larda Error Boundary eklenir.

############################
# 12. TASARIM KURALLARI
############################
- Modern ama minimal tasarım.
- Aşırı gradient, glow, neon efekt YOK.
- AI template hissi veren hero tasarımlarından kaçın.
- Spacing: 8px grid (Tailwind spacing scale).
- Typography: net, sade (tek font ailesi, max 2 weight).
- Mobile-first (sm, md, lg, xl breakpoints).
- Tablet (md) özellikle optimize edilmeli.
- Hover efektleri: transition-colors, transition-transform (150-200ms).
- Gereksiz animasyon yok.
- Renk paleti site türüne göre:
    - Avukatlık: lacivert, gri, beyaz (güven + otorite)
    - Mobilya: toprak tonları, krem (sıcaklık + kalite)

############################
# 13. ADMIN PANEL
############################
- Ayrı layout (public site'dan tamamen bağımsız).
- Sidebar: collapse destekli (Zustand ile global state), mobile'da drawer.
- Dashboard: yayın sayısı, taslak sayısı, bu ay eklenen, toplam görsel.
- CRUD: next-safe-action ile Server Actions.
- Pagination: offset-based (admin için yeterli, sayfa numarası URL'de nuqs ile).
- Arama: nuqs + debounce (300ms), server-side Prisma where filtresi.
- Soft delete: deletedAt alanı, listede filtre zorunlu.
- Rich text editor: Tiptap (dynamic import).

############################
# 14. TEST STRATEJİSİ
############################
- Kritik path birim testleri zorunlu:
    - Auth middleware (jose verify)
    - Slug üretim fonksiyonu
    - Zod şemaları
    - Service katmanı (mock Prisma ile)
- Öneri: Vitest (hızlı, TypeScript native).
- E2E: Playwright (login flow, post CRUD).
- Coverage hedefi: %80 (service katmanı).

############################
# 15. DOCKER
############################
- next build --experimental-build-mode standalone.
- Base image: node:20-alpine.
- Multi-stage Dockerfile: builder → runner.
- Prisma migrate: entrypoint script (migrate deploy).
- Health: GET /api/health → { status: "ok", timestamp: ISO8601 }.
- .dockerignore: node_modules, .next, .env hariç.
- Environment: runtime'da inject (build time'a gömme).