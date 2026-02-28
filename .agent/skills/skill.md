# NEXTJS ENTERPRISE SKILL
# Amaç: Modern Kurumsal Site + Blog + Admin Panel Üretmek
# Kapsam: Avukatlık ve Mobilya siteleri (ayrı projeler, ortak skill)

##################################################
# 1. PROJE GENERATION SKILL
##################################################

Yeni feature üretirken:
- Feature bazlı modül oluştur (modules/ altında).
- Her modül içinde:
    - components/   → UI katmanı (Server Component varsayılan)
    - services/     → business logic (async fonksiyon, DB erişimi burada)
    - schemas/      → Zod validation şemaları
    - hooks/        → custom React hooks (yalnızca client)
    - types/        → TypeScript tipleri (Prisma'dan türetilir)

Service katmanı kuralları:
- Her fonksiyon tek sorumluluk taşır.
- Hata durumunda throw eder (çağıran katman handle eder).
- Return tipi explicit belirtilir.
- Sık okunan veriler unstable_cache ile sarılır (lib/cache/).

Server Action kuralları (next-safe-action):
- Service'den gelen hata try/catch ile yakalanır.
- Her zaman { success, data } | { success, error } döner.
- Stack trace veya Prisma hatası client'a ASLA dönmez.
- Zod şeması action tanımına bağlanır (input validation otomatik).

##################################################
# 2. BLOG MODÜLÜ ÜRETME SKILL
##################################################

Blog içerikleri Prisma üzerinden PostgreSQL'de saklanır.

Post Model (Prisma):

model Post {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  content      String    @db.Text      // sanitize edilmiş HTML
  excerpt      String?
  coverImage   String?                 // URL (next/image ile render)
  coverAlt     String?                 // alt text (zorunlu, SEO)
  isPublished  Boolean   @default(false)
  publishedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?               // soft delete
  author       User      @relation(fields: [authorId], references: [id])
  authorId     String
  category     Category? @relation(fields: [categoryId], references: [id])
  categoryId   String?
  tags         Tag[]
}

Slug üretimi:
- Başlıktan otomatik (slugify, Türkçe normalize: ş→s, ı→i, ç→c, ğ→g, ö→o, ü→u).
- Çakışmada sonuna -2, -3 eklenir (DB unique constraint kontrolü).
- generateUniqueSlug(title: string, prisma: PrismaClient): Promise<string>

Cache:
- getLatestPosts → unstable_cache, tag: CACHE_TAGS.posts
- getSinglePost(slug) → unstable_cache, tag: `post-${slug}`
- Admin güncellemesinde revalidateTag(CACHE_TAGS.posts) çağrılır.

Blog işlemleri:
- Pagination: cursor-based (public site) / offset (admin).
- ISR: revalidate = 3600.
- Draft preview: isPublished=false post'lar /preview/[slug]?token= ile görünür.
- JSON-LD Article schema: her blog detay sayfasında zorunlu.

Rich text:
- Editor: Tiptap (admin, dynamic import).
- Sunucu kaydı: sanitize-html ile sanitize edilmiş HTML.
- Render: dangerouslySetInnerHTML (YALNIZCA sanitize sonrası).

##################################################
# 3. AUTH SKILL (JWT ADMIN LOGIN)
##################################################

Runtime Ayrımı — KRİTİK:

  middleware.ts (Edge Runtime):
    ✅ jose ile access token verify
    ❌ Prisma kullanımı — KESİNLİKLE YASAK
    ❌ bcrypt kullanımı — KESİNLİKLE YASAK

  /api/auth/* (Node Runtime):
    ✅ Prisma ile DB erişimi
    ✅ bcrypt ile şifre kontrolü
    ✅ Refresh token işlemleri

Middleware davranışı:

  middleware.ts:
    Access token geçerli     → next()
    Access token süresi dolmuş → Response.redirect('/api/auth/refresh')
                                  veya x-needs-refresh header set et
    Token yok / geçersiz    → Response.redirect('/admin/login')

Token Refresh Flow (/api/auth/refresh — Node Runtime):
  Refresh token cookie oku →
  DB'de geçerli mi kontrol et (Prisma) →
  Süresi dolmuşsa login'e yönlendir →
  Rotation: eski token DB'den sil, yeni token üret →
  Yeni access token üret (jose) →
  Her iki cookie'yi güncelle →
  Orijinal sayfaya yönlendir

Kullanıcı Modeli (Prisma):

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  role          Role           @default(EDITOR)
  refreshTokens RefreshToken[]
  posts         Post[]
  createdAt     DateTime       @default(now())
}

enum Role { ADMIN  EDITOR }

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

Login Flow (/api/auth/login — Node Runtime):
  Rate limit kontrol (5 deneme / 15dk, IP bazlı) →
  Zod validate →
  DB'den user çek (Prisma) →
  bcrypt.compare() →
  Access token (jose, 15dk) →
  Refresh token (UUID, DB'ye kaydet, 7 gün) →
  httpOnly cookie set →
  /admin/dashboard'a redirect

Logout (/api/auth/logout — Node Runtime):
  Her iki cookie'yi temizle →
  DB'deki refresh token'ı sil →
  /admin/login'e redirect

##################################################
# 4. IMAGE UPLOAD SKILL
##################################################

Strateji:
- Thumbnail üretimi YAPILMAZ.
- next/image bileşeni on-the-fly optimize eder (WebP/AVIF, boyut, cache).
- sharp yalnızca: max 1920px genişlik sınırlama + webp sıkıştırma (kalite 85).
- Tek dosya kaydedilir, varyasyon next/image sizes'a bırakılır.

Upload Pipeline (Node Runtime):

POST /api/upload →
  Auth kontrolü (admin/editor) →
  Zod ile validate (altText zorunlu) →
  MIME type kontrolü →
  file-type paketi ile magic bytes doğrulaması →
  Boyut kontrolü (max: 5MB) →
  UUID v4 ile dosya adı →
  sharp: max 1920px, webp, quality 85 →
  StorageProvider.upload() →
  Prisma ile metadata kaydet →
  { url, altText } dön

Storage Abstraction:

interface StorageProvider {
  upload(file: Buffer, filename: string): Promise<string>
  delete(filename: string): Promise<void>
}

LocalStorageProvider  → /public/uploads (development)
S3StorageProvider     → AWS S3 / Cloudflare R2 (production)
ENV: STORAGE_PROVIDER=local|s3

Image Model (Prisma):

model Image {
  id           String   @id @default(cuid())
  url          String
  altText      String
  mimeType     String
  sizeBytes    Int
  uploadedById String
  createdAt    DateTime @default(now())
}

##################################################
# 5. CLIENT STATE YÖNETİMİ SKILL
##################################################

Katman bazlı standart:

  Local component state:
    useState / useReducer
    Kullanım: modal, toggle, form, geçici UI state

  URL senkronize state:
    nuqs kütüphanesi
    Kullanım: arama, sayfalama, filtre, sıralama
    Kural: useSearchParams yalnızca okuma; yazma nuqs ile yapılır.

  Global UI state:
    Zustand
    Kullanım: sidebar collapse, bildirim, mobilya sitesinde sepet/favori
    Store'lar lib/store/ altında tanımlanır.
    SSR-safe: store server'da initialize edilmez.

  Server verisi:
    Server Component'tan prop olarak aşağı akar.
    Mutasyon sonrası revalidatePath / revalidateTag ile güncellenir.
    SWR / React Query KULLANILMAZ.

YASAKLAR:
  ❌ Redux / Redux Toolkit
  ❌ Context API ile global state
  ❌ Client'ta doğrudan fetch ile DB sorgusu

##################################################
# 6. CACHING SKILL
##################################################

unstable_cache kullanım standardı:

  Kapsam: Sık okunan, nadir değişen veriler.

  Örnekler:
    getSiteSettings()     → tag: ['settings']
    getHeaderMenu()       → tag: ['settings', 'navigation']
    getLatestPosts(5)     → tag: ['posts']
    getCategories()       → tag: ['categories']

  Tag sabitleri (lib/cache/tags.ts):

    export const CACHE_TAGS = {
      posts:      'posts',
      categories: 'categories',
      settings:   'settings',
      navigation: 'navigation',
    } as const

  Cache bozma (admin Server Action'larında):
    Post oluştur/güncelle/sil → revalidateTag(CACHE_TAGS.posts)
    Kategori değiştir         → revalidateTag(CACHE_TAGS.categories)
    Site ayarı değiştir       → revalidateTag(CACHE_TAGS.settings)

  ISR ile birlikte kullanım:
    unstable_cache → DB cache (Prisma seviyesi)
    revalidate     → sayfa cache (Next.js seviyesi)
    İkisi birbirini tamamlar, çakışmaz.

##################################################
# 7. SEO AUTOMATION SKILL
##################################################

generateMetadata örüntüsü:

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageTitle} | ${siteName}`,
    description: excerpt,
    alternates: { canonical: `${baseUrl}/${slug}` },
    openGraph: {
      title, description, url: canonical,
      images: [{ url: coverImage, width: 1200, height: 630, alt: coverAlt }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description, images: [coverImage] },
  }
}

JSON-LD (site türüne göre):

  Avukatlık (ana sayfa):
    @type: LegalService
    name, url, telephone, address (PostalAddress), openingHours, areaServed

  Mobilya (ana sayfa):
    @type: FurnitureStore
    name, url, telephone, address, openingHours

  Blog yazısı (her iki site):
    @type: Article
    headline, author (Person), datePublished, dateModified, image, url

SEO kuralları:
- h1 her sayfada tek.
- Semantic HTML zorunlu (article, section, nav, main, aside).
- Alt text: tüm Image bileşenlerinde zorunlu.
- Slug Türkçe normalize + DB unique constraint.

##################################################
# 8. UI / UX SKILL
##################################################

Tasarım ilkeleri:
- Minimalist, içerik odaklı.
- Gradient: yok ya da çok subtle (max %10 opacity fark, 2 renk).
- Animasyon: Tailwind transition (150-200ms), Framer Motion KULLANILMAZ.
- Font: next/font/google (layout shift sıfır).
    Avukatlık: Playfair Display (başlık) + Inter (gövde)
    Mobilya:   Cormorant Garamond (başlık) + Lato (gövde)
- Renk paleti:
    Avukatlık: #1a2744 (lacivert), gri tonları, beyaz
    Mobilya:   #8B6914 (bronz), #F5F0E8 (krem), toprak tonları

Bileşen standardı:
- Button: varyant sistemi (primary, secondary, ghost, danger).
- Input: hata mesajı alanı dahil.
- Card: rounded-lg + shadow-sm (tutarlı).
- Loading: skeleton (spinner değil).
- Toast: Server Action { success: false } durumunda gösterilir.

Responsive:
- Mobile-first (sm: 640, md: 768, lg: 1024, xl: 1280).
- Tablet (md) özellikle optimize edilmeli.

##################################################
# 9. ADMIN PANEL SKILL
##################################################

Layout:
- (admin)/layout.tsx → auth check + sidebar wrapper.
- Sidebar state: Zustand (collapse, mobile drawer).
- Mobile: sheet/drawer pattern.

Dashboard kartları:
- Yayında post sayısı
- Taslak sayısı
- Bu ay eklenen post
- Toplam görsel sayısı

CRUD (next-safe-action + Server Actions):

  createPost: validate → sanitize → DB → revalidateTag → { success, data }
  updatePost: validate → sanitize → DB → revalidateTag → { success, data }
  deletePost: soft delete (deletedAt) → revalidateTag → { success }
  publishPost: isPublished=true, publishedAt=now() → revalidateTag → { success }

Post listesi:
- URL state: nuqs (sayfa, arama, filtre).
- Arama: debounce 300ms, Prisma where filtresi server-side.
- Filtre: Tümü / Yayında / Taslak / Silinmiş.
- Soft delete listeden filtre: deletedAt IS NULL (varsayılan).

Post editor:
- Tiptap: dynamic import (ağır, client-only).
- Görsel ekleme: /api/upload entegre.
- Preview: /preview/[slug]?token=previewToken.
- Aksiyonlar: "Taslak Kaydet" | "Yayınla" (ayrı Server Action'lar).

##################################################
# 10. PERFORMANS SKILL
##################################################

Rendering kararları:
  Statik sayfalar (hakkımızda, iletişim) → static generation
  Blog listesi                            → ISR (revalidate: 3600)
  Blog detay                             → ISR (revalidate: 3600)
  Admin panel                            → dynamic (auth zorunlu)

Image kuralları (next/image):
  - width+height veya fill+sizes zorunlu.
  - sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  - priority: sadece hero görseli (LCP optimizasyonu).
  - placeholder="blur" + blurDataURL: CLS önleme.

Dynamic import:
  - Tiptap editor
  - Ağır modal içerikleri
  - Admin grafik bileşenleri

React optimizasyon:
  - useEffect minimum.
  - useMemo/useCallback yalnızca kanıtlanmış perf sorunu için.
  - Server Action sonrası revalidatePath veya revalidateTag.

##################################################
# 11. GÜVENLİK SKILL
##################################################

- Input: Zod (server-side zorunlu, client UX için de kullanılır).
- Rich text: sanitize-html (server) + DOMPurify (client preview).
- dangerouslySetInnerHTML: YALNIZCA sanitize sonrası.
- Sensitive data (passwordHash, token): client'a ASLA gönderilmez.
- Error: generic mesaj client'a, detay server log'a.
- CSP header (next.config.js headers()):
    default-src 'self';
    img-src 'self' data: blob: [CDN_DOMAIN];
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff,
  Referrer-Policy strict-origin-when-cross-origin.

##################################################
# 12. FUTURE READY SKILL
##################################################

i18n hazırlığı:
- next-intl altyapısı bırakılır.
- UI string'leri mesaj dosyasından çekilir (hard-code YOK).
- URL: /tr/blog/[slug] (locale prefix).

RBAC:
- Role: ADMIN | EDITOR (Prisma enum, hazır).
- ADMIN: tam yetki.
- EDITOR: post CRUD, site ayarları değiştiremez.

Storage:
- S3StorageProvider implementasyonu hazır (env toggle).
- CDN prefix env ile yönetilir.

Analitik:
- next/script ile Plausible / Umami (privacy-friendly).
- GA4 opsiyonel (GDPR consent banner şartlı).