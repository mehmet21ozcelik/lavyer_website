---
trigger: manual
---

# NEXTJS ENTERPRISE MODERN RULESET
# Next.js App Router + TypeScript + Tailwind + Prisma + JWT
# Amaç: SEO güçlü, güvenli, performanslı, modern kurumsal site + blog + admin
# Kapsam: İki ayrı bağımsız proje (avukatlık, mobilya) — aynı ruleset paylaşılır

############################
# 0. PROJE YAPISI KARARI
############################
- Her site bağımsız Next.js projesi olarak kurulur (monorepo DEĞİL).
- Ortak UI bileşenleri gerekirse npm workspace veya private package olarak çıkarılabilir.
- Her projenin kendi .env, prisma schema ve DB'si olacak.

############################
# 1. TEMEL TEKNOLOJİ KARARLARI
############################
- Next.js App Router zorunlu.
- Server Components varsayılan.
- Client component yalnızca interaktif UI için ('use client' direktifi zorunlu).
- TypeScript strict mode zorunlu (tsconfig: strict: true).
- Prisma ORM (PostgreSQL).
- JWT tabanlı authentication (sadece admin için).
- Image upload destekli yapı (sharp ile thumbnail üretimi).
- Docker production uyumlu.
- Zod: runtime validation zorunlu (hem server hem client).

############################
# 2. PROJE MİMARİSİ
############################

app/
  (public)/         → site frontend (layout.tsx ayrı)
  (admin)/          → admin panel (layout.tsx ayrı, middleware korumalı)
  api/
    auth/
    upload/
    health/
components/
  ui/               → genel atomik bileşenler (Button, Input, Card...)
  layout/           → Header, Footer, Sidebar
modules/
  blog/
    components/
    services/
    schemas/
    hooks/
    types/
  auth/
    components/
    services/
    schemas/
    types/
lib/
  auth/             → JWT işlemleri burada
  db/               → Prisma client singleton
  storage/          → upload abstraction
  seo/              → metadata üretim yardımcıları
  validations/      → ortak Zod şemaları
prisma/
  schema.prisma
  migrations/
types/
  global.d.ts

- Business logic component içinde yazılmaz → services katmanına taşınır.
- Veri erişimi lib/db altında soyutlanır.
- JWT işlemleri lib/auth altında.
- Upload işlemleri lib/storage altında.
- Direkt DB sorgusu component içinde yasak.

############################
# 3. JWT AUTH KURALLARI
############################
- Access token httpOnly cookie (15dk-1sa ömür).
- Refresh token httpOnly cookie (7 gün ömür, DB'de saklanır).
- Token client-side localStorage/sessionStorage'a YAZILMAZ.
- Admin route'lar Next.js middleware ile korunur (matcher config zorunlu).
- Token verify işlemi yalnızca server-side (jose veya jsonwebtoken).
- Refresh token rotation: her kullanımda yeni token üretilir, eskisi invalidate edilir.
- Role bazlı kontrol altyapısı hazır olmalı (admin / editor rolleri Prisma'da tutulur).
- Logout: her iki cookie de temizlenir, refresh token DB'den silinir.

############################
# 4. IMAGE UPLOAD KURALLARI
############################
- Upload yalnızca /api/upload server route üzerinden.
- Dosya tipi kontrolü: image/png, image/jpeg, image/webp (MIME type + magic bytes).
- Maksimum dosya boyutu: 5MB (env ile konfigüre edilebilir).
- Dosya isimleri: UUID v4 ile üretilir, orijinal isim saklanmaz.
- Thumbnail üretimi: sharp paketi ile (300px ve 800px genişlik, webp çıktı).
- Alt text alanı zorunlu (erişilebilirlik + SEO).
- Storage abstraction:
    - Development: /public/uploads (local)
    - Production: S3 compatible (env ile toggle edilir)
- Prisma DB'de image metadata tutulur:
    - originalUrl, thumbnailUrl, altText, mimeType, size, uploadedAt

############################
# 5. GÜVENLİK
############################
- Tüm input Zod ile validate edilir (server-side zorunlu, client-side UX için).
- Blog rich text içeriği DOMPurify (client) + sanitize-html (server) ile sanitize edilir.
  → dangerouslySetInnerHTML YALNIZCA sanitize edilmiş içerik için kullanılabilir.
- Content Security Policy (CSP) header: next.config.js headers() ile tanımlanır.
- Rate limiting: /api/auth/login için (örn. 5 deneme / 15dk, IP bazlı).
- SQL injection: Prisma parametrik query zorunlu, $queryRaw yasak.
- Admin panel brute force koruması: rate limit + geçici hesap kilidi.
- CORS: sadece izinli origin'ler (next.config.js).
- ENV değişkenleri: NEXT_PUBLIC_ prefix olmayan değişkenler client bundle'a girmez.
- Helmet alternatifi olarak next.config.js security headers zorunlu.
- Server error mesajları client'a ham haliyle dönmez (generic mesaj + server log).

############################
# 6. HATA YÖNETİMİ VE LOGGING
############################
- Her server action ve API route try/catch ile sarılır.
- Kritik hatalar sunucu tarafında loglanır (console.error minimum, production'da
  harici servis entegrasyonuna hazır: Sentry, Axiom vb.).
- Next.js error.tsx ve not-found.tsx her route segment için tanımlanır.
- Global error.tsx root layout için tanımlanır.
- Client component'larda Error Boundary kullanılır.

############################
# 7. SEO STANDARTLARI
############################
- Her sayfa için generateMetadata zorunlu (boş bırakılamaz).
- OpenGraph: title, description, image, url, type zorunlu alanlar.
- Twitter card: summary_large_image.
- JSON-LD schema (site türüne göre):
    - Avukatlık sitesi → LegalService schema (LocalBusiness alt türü)
    - Mobilya sitesi   → FurnitureStore schema (LocalBusiness alt türü)
    - Blog yazıları    → Article schema (author, datePublished, dateModified)
- Dinamik sitemap: app/sitemap.ts (yayında olan post'lar dahil edilir).
- robots.txt: app/robots.ts (admin panel dizinleri hariç tutulur).
- Slug: Türkçe karakter normalize edilir (slugify kütüphanesi), unique constraint DB'de.
- Canonical URL: tüm sayfalarda tanımlanır.
- h1 her sayfada yalnızca bir adet.
- Semantic HTML zorunlu (article, section, nav, main, aside, header, footer).

############################
# 8. PERFORMANS
############################
- RSC öncelikli mimari (Client Component ağırlığı minimize edilir).
- Gereksiz büyük kütüphane eklenmez (bundle analyzer ile kontrol edilir).
- Blog: ISR (revalidate süresi içerik türüne göre ayarlanır, önerilen: 3600s).
- next/image zorunlu (width, height veya fill + sizes zorunlu).
- Lazy loading: görsel ve ağır bileşenler için next/dynamic ile.
- Dynamic rendering (force-dynamic) minimum, yalnızca zorunlu sayfalarda.
- Font: next/font ile (layout shift önlenir).
- Üçüncü parti script: next/script ile (strategy="lazyOnload" veya "afterInteractive").

############################
# 9. TASARIM KURALLARI
############################
- Modern ama minimal tasarım.
- Aşırı gradient, glow, neon efekt YOK.
- Stok AI template hissi veren hero tasarımlarından kaçın.
- Spacing: 8px grid sistemi (Tailwind spacing scale buna uygundur).
- Typography: net, sade, okunabilir (tek bir font ailesi, max 2 weight varyasyonu).
- Mobile-first yaklaşım (Tailwind breakpoints: sm, md, lg, xl).
- Tablet breakpoint (md) özellikle optimize edilmeli.
- Hover efektleri subtle (renk geçişi 150-200ms ease).
- Gereksiz animasyon yok; anlamlı animasyonlar için Framer Motion değil,
  Tailwind transition kullanmak tercih edilir.
- Renk paleti site türüne göre ayrışır:
    - Avukatlık: nötr, güven veren tonlar (koyu lacivert, gri, beyaz)
    - Mobilya: sıcak, davetkar tonlar (toprak tonları, krem, ahşap renkleri)

############################
# 10. ADMIN PANEL
############################
- Ayrı layout (admin panel public site layout'undan tamamen bağımsız).
- Sidebar navigation (collapse destekli, mobile'da drawer).
- Dashboard: toplam post, bu ay eklenen post, taslak sayısı istatistik kartları.
- CRUD: Server Actions tercih edilir (progressive enhancement).
- Pagination: cursor-based (büyük veri setleri için) veya offset-based.
- Arama: debounce ile (useSearchParams + server-side filtreleme).
- Soft delete: deletedAt alanı (Prisma), listeleme sorgularında filtre zorunlu.
- Rich text editor: Tiptap (hafif, headless, Next.js uyumlu).
- Image alt text yönetimi: upload formunda zorunlu alan.
- Post preview: taslak post'lar için önizleme modu (draft URL ile).

############################
# 11. TEST STRATEJİSİ
############################
- Kritik path'ler için en az birim test yazılır:
    - Auth middleware
    - Slug üretim fonksiyonu
    - Input validation şemaları
- Öneri: Vitest (hızlı, TypeScript native).
- E2E test: Playwright (login flow, post CRUD).
- Test coverage hedefi: %80 (servis katmanı için).

############################
# 12. DOCKER
############################
- next build --experimental-build-mode standalone.
- Base image: node:20-alpine (LTS, minimal boyut).
- Multi-stage Dockerfile: builder → runner.
- Prisma migrate: entrypoint script içinde (migrate deploy, seed opsiyonel).
- Health endpoint: GET /api/health → { status: "ok", timestamp: ISO8601 }.
- .dockerignore: node_modules, .next, .env dosyaları hariç tutulur.
- Environment: runtime'da env inject (build time'a gömme).