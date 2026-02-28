---
trigger: always_on
---

# NEXTJS ENTERPRISE MODERN RULESET
# Next.js App Router + TypeScript + Tailwind + Prisma + JWT
# Amaç: SEO güçlü, güvenli, performanslı, modern kurumsal site + blog + admin

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
- Prisma ORM (PostgreSQL) — sadece Node.js runtime'da kullanılır, Edge'de YASAK.
- JWT tabanlı authentication (sadece admin için) — jose kütüphanesi (Edge uyumlu).
- Image upload destekli yapı (sharp sadece orijinal sıkıştırma için, thumbnail YOK).
- Docker production uyumlu.
- Zod: runtime validation zorunlu (hem server hem client).
- next-safe-action: Server Action response standardı için zorunlu.

############################
# 2. PROJE MİMARİSİ
############################

app/
  (public)/         → site frontend (layout.tsx ayrı)
  (admin)/          → admin panel (layout.tsx ayrı, middleware korumalı)
  api/
    auth/
      login/
      logout/
      refresh/      → Token yenileme BURADA yapılır (Node runtime, Prisma erişebilir)
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
  auth/             → JWT işlemleri (jose, Edge uyumlu)
  db/               → Prisma client singleton (Node runtime only)
  storage/          → upload abstraction
  seo/              → metadata üretim yardımcıları
  cache/            → unstable_cache wrapper'ları ve tag sabitleri
  validations/      → ortak Zod şemaları
prisma/
  schema.prisma
  migrations/
types/
  global.d.ts

- Business logic component içinde yazılmaz → services katmanına taşınır.
- Veri erişimi lib/db altında soyutlanır.
- JWT işlemleri lib/auth altında (jose, Edge-safe).
- Prisma Client YALNIZCA Node.js runtime'da çalışır:
    ✅ API Routes, Server Actions, Server Components
    ❌ middleware.ts (Edge Runtime) — KESİNLİKLE YASAK
- Upload işlemleri lib/storage altında.
- Direkt DB sorgusu component içinde yasak.

############################
# 3. JWT AUTH KURALLARI
############################

Runtime Ayrımı (KRİTİK):
- middleware.ts → Edge Runtime → YALNIZCA jose ile access token doğrulama.
  Veritabanı sorgusu YASAK. Prisma import YASAK.
- /api/auth/refresh → Node Runtime → Prisma ile DB erişimi burada yapılır.

Middleware davranışı:
  Access token geçerli   → isteği geçir
  Access token süresi dolmuş → /api/auth/refresh'e yönlendir veya
                               Set-Cookie header ile client'a sinyal gönder
  Access token geçersiz  → /admin/login'e yönlendir

Token kuralları:
- Access token: httpOnly cookie, 15dk ömür, jose ile sign/verify.
- Refresh token: httpOnly cookie, 7 gün ömür, DB'de saklanır (Prisma).
- Token client-side localStorage/sessionStorage'a YAZILMAZ.
- Refresh token rotation: her kullanımda yeni token, eskisi DB'den silinir.
- Role bazlı kontrol: admin / editor (Prisma User.role).
- Logout: her iki cookie silinir, DB'deki refresh token silinir.

Password hash:
- bcrypt (saltRounds: 12) — YALNIZCA Node runtime (API Route / Server Action).
  Middleware içinde bcrypt kullanımı YASAK.

############################
# 4. SERVER ACTION STANDARDI
############################

Tüm Server Action'lar next-safe-action ile tanımlanır:

Dönüş tipi standardı:
  Başarı: { success: true, data: T }
  Hata:   { success: false, error: string }

Kurallar:
- Server Action içinde hiçbir zaman doğrudan throw yapılmaz.
- Service katmanı hata fırlatabilir (throw); Server Action bunu try/catch ile yakalar
  ve standardize response olarak döner.
- Client component'ta useAction hook ile kullanılır, hata mesajı toast ile gösterilir.
- Stack trace veya Prisma hata detayı client'a ASLA dönmez.
- Validasyon: Server Action girişlerinde Zod şeması next-safe-action'a bağlanır.

############################
# 5. IMAGE UPLOAD KURALLARI
############################

Strateji:
- Thumbnail üretimi YAPILMAZ. next/image on-the-fly optimize eder.
- Upload sırasında sadece tek işlem: orijinal görseli max 1920px genişlik,
  webp formatında sıkıştırarak kaydet (sharp ile, Node runtime).
- Varyasyon/boyutlandırma tamamen next/image sizes parametresine bırakılır.

Upload Pipeline:
  POST /api/upload →
  Auth middleware (admin/editor zorunlu) →
  Zod ile request validate →
  MIME type kontrolü (image/jpeg | image/png | image/webp) →
  Magic bytes doğrulaması (file-type paketi) →
  Boyut kontrolü (max: 5MB, env ile konfigüre edilebilir) →
  UUID v4 ile dosya adı üret →
  sharp: max 1920px, webp'e çevir, kalite 85 →
  Storage provider'a kaydet →
  DB'ye metadata kaydet →
  { url, altText } dön

Alt text zorunluluğu:
- Upload formunda altText alanı zorunlu (boş string kabul edilmez).
- DB'de saklanır.

Storage Abstraction:
  interface StorageProvider {
    upload(file: Buffer, filename: string): Promise<string>
    delete(filename: string): Promise<void>
  }
  - LocalStorageProvider  → /public/uploads (development)
  - S3StorageProvider     → AWS S3 / Cloudflare R2 (production)
  - STORAGE_PROVIDER=local|s3 env ile seçilir.

############################
# 6. GÜVENLİK
############################
- Tüm input Zod ile validate edilir (server-side zorunlu, client-side UX için).
- Blog rich text içeriği sanitize-html (server) + DOMPurify (client) ile sanitize edilir.
  → dangerouslySetInnerHTML YALNIZCA sanitize edilmiş içerik için kullanılabilir.
- Content Security Policy (CSP) header: next.config.js headers() ile tanımlanır.
- Rate limiting: /api/auth/login için (5 deneme / 15dk, IP bazlı).
- SQL injection: Prisma parametrik query zorunlu, $queryRaw YASAK.
- Admin brute force: rate limit + geçici hesap kilidi.
- ENV: NEXT_PUBLIC_ prefix olmayan değişkenler client bundle'a girmez.
- Security headers (next.config.js): X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy.
- Server error mesajları client'a ham haliyle dönmez (generic mesaj + server log).

############################
# 7. CLIENT STATE YÖNETİMİ
############################

Katmanlı state standardı (kütüphane seçimi nete bağlı):

  Basit local state:
    useState / useReducer (modal, toggle, form)

  URL senkronize state:
    nuqs kütüphanesi (arama, sayfalama, filtre)
    → useSearchParams YALNIZCA okuma için; yazma için nuqs kullanılır.

  Global UI state (sepet, sidebar, bildirim):
    Zustand (minimal, TypeScript-first, SSR-safe)

  Server verisi cache/sync:
    Server Component + revalidatePath/revalidateTag
    → Client'ta harici data-fetching kütüphanesi (SWR, React Query) KULLANILMAZ.
       Veri akışı Server Component üzerinden sağlanır.

YASAKLAR:
  ❌ Redux / Redux Toolkit (overkill, App Router ile anlamsız)
  ❌ Context API ile global state (render waterfall yaratır)
  ❌ Client'ta doğrudan fetch ile DB sorgusu

############################
# 8. CACHING STRATEJİSİ
############################

Next.js Data Cache kullanımı zorunlu:

  unstable_cache kuralları:
  - Sık okunan, nadir değişen veriler service katmanında unstable_cache ile sarılır.
  - Örnekler:
      - Site ayarları (getSiteSettings)
      - Header/Footer navigasyon menüsü
      - Son 5 blog yazısı (getLatestPosts)
      - Kategori listesi
  - tags parametresi zorunlu (hedefli cache bozma için).
  - Admin herhangi bir güncelleme yaptığında ilgili tag revalidateTag ile bozulur.

  Tag sabitleri lib/cache/tags.ts'de merkezi olarak tanımlanır:
    export const CACHE_TAGS = {
      posts: 'posts',
      categories: 'categories',
      settings: 'settings',
    } as const

  ISR:
  - Blog listesi ve detay sayfaları: revalidate = 3600 (1 saat).
  - Avukatlık sitesi statik sayfalar: revalidate = 86400 (1 gün).
