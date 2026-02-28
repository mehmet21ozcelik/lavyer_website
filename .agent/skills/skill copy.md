# NEXTJS ENTERPRISE SKILL
# Amaç: Modern Kurumsal Site + Blog + Admin Panel Üretmek
# Kapsam: Avukatlık ve Mobilya siteleri (ayrı projeler, ortak skill)

##################################################
# 1. PROJE GENERATION SKILL
##################################################

Yeni feature üretirken:
- Feature bazlı modül oluştur (modules/ altında).
- Her modül içinde:
    - components/   → UI katmanı
    - services/     → business logic
    - schemas/      → Zod validation şemaları
    - hooks/        → custom React hooks (client)
    - types/        → TypeScript tipleri

Kod üretme sırasında:
- Business logic → services layer (async fonksiyonlar, DB erişimi burada)
- Validation → schemas layer (Zod, hem server hem client kullanır)
- UI → components layer (Server Component varsayılan)
- Tip tanımları → types layer (Prisma generate tiplerinden türetilir)

Servis fonksiyonları:
- Her fonksiyon tek sorumluluk taşır.
- Hata durumunda throw eder, null dönmez (çağıran katman handle eder).
- Return tipi explicit olarak belirtilir.

##################################################
# 2. BLOG MODÜLÜ ÜRETME SKILL
##################################################

Blog içerikleri Prisma üzerinden PostgreSQL'de saklanır.

Post Model (Prisma):

model Post {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  content      String    @db.Text        // HTML (sanitize edilmiş)
  excerpt      String?
  coverImage   String?                   // URL
  coverAlt     String?                   // alt text (SEO + erişilebilirlik)
  isPublished  Boolean   @default(false)
  publishedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?                 // soft delete
  author       User      @relation(fields: [authorId], references: [id])
  authorId     String
  category     Category? @relation(fields: [categoryId], references: [id])
  categoryId   String?
  tags         Tag[]
}

Slug üretimi:
- Başlıktan otomatik üretilir (slugify, Türkçe karakter dönüşümü dahil).
- Çakışma durumunda sonuna -2, -3 eklenir (DB unique constraint kontrol edilir).
- Fonksiyon: generateUniqueSlug(title: string, prisma: PrismaClient)

Blog işlemleri:
- Pagination: cursor-based (performans) veya offset (admin panelde yeterli).
- ISR: revalidate = 3600 (1 saat) — avukatlık sitesi için daha uzun olabilir.
- SEO metadata: generateMetadata ile (title, description, OG, Twitter, canonical).
- JSON-LD Article schema: her blog sayfasında zorunlu.
- Draft sistemi: isPublished=false post'lar sadece admin preview URL'inden görünür.

Rich text:
- Editor: Tiptap (admin panelde).
- Çıktı: sanitize-html ile sunucu tarafında sanitize edilmiş HTML olarak saklanır.
- Render: dangerouslySetInnerHTML (YALNIZCA sanitize sonrası).

##################################################
# 3. AUTH SKILL (JWT ADMIN LOGIN)
##################################################

Kullanıcı modeli:

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(EDITOR)
  refreshTokens RefreshToken[]
  posts         Post[]
  createdAt     DateTime  @default(now())
}

enum Role {
  ADMIN
  EDITOR
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

Auth Flow:

Login Request →
  Rate limit kontrol (IP bazlı, 5 deneme / 15dk) →
  Email + password Zod validate →
  DB'den user çek →
  bcrypt.compare(password, passwordHash) →
  Access token üret (JWT, 15dk, jose) →
  Refresh token üret (UUID, DB'ye kaydet, 7 gün) →
  Her iki token'ı httpOnly cookie'ye yaz →
  Admin dashboard'a yönlendir

Token Refresh Flow:
  Refresh token cookie okunur →
  DB'de geçerli mi kontrol edilir →
  Rotation: eski token silinir, yeni token üretilir →
  Cookie güncellenir

Logout:
  Her iki cookie silinir →
  DB'deki refresh token silinir

Middleware (middleware.ts):
  matcher: ['/admin/:path*', '/api/admin/:path*']
  Access token verify → geçersizse refresh token ile yenile → hâlâ geçersizse login'e yönlendir

Password hash:
  bcrypt (saltRounds: 12)

##################################################
# 4. IMAGE UPLOAD SKILL
##################################################

Upload Pipeline:

POST /api/upload →
  Auth middleware (sadece giriş yapmış admin/editor) →
  Zod ile request validate →
  MIME type kontrolü (image/jpeg | image/png | image/webp) →
  Magic bytes kontrolü (file-type paketi ile gerçek format doğrulaması) →
  Boyut kontrolü (max: 5MB) →
  UUID v4 ile dosya adı üret →
  sharp ile işle:
    - Orijinal → webp'e çevir, kaydet
    - Thumbnail 800px → webp
    - Thumbnail 300px → webp
  Storage provider'a kaydet (local veya S3) →
  DB'ye metadata kaydet →
  { originalUrl, thumb800Url, thumb300Url, altText } dön

Storage Abstraction Interface:

interface StorageProvider {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>
  delete(filename: string): Promise<void>
}

Implementasyonlar:
- LocalStorageProvider  → /public/uploads (development)
- S3StorageProvider     → AWS S3 / Cloudflare R2 (production)

ENV ile seçim:
  STORAGE_PROVIDER=local | s3

DB Image metadata modeli:

model Image {
  id           String   @id @default(cuid())
  originalUrl  String
  thumb800Url  String?
  thumb300Url  String?
  altText      String
  mimeType     String
  sizeBytes    Int
  uploadedById String
  createdAt    DateTime @default(now())
}

##################################################
# 5. SEO AUTOMATION SKILL
##################################################

Her sayfa için generateMetadata:

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `${pageTitle} | ${siteName}`,
    description: excerpt,
    alternates: { canonical: `${baseUrl}/${slug}` },
    openGraph: {
      title, description,
      url: canonical,
      images: [{ url: coverImage, width: 1200, height: 630, alt: coverAlt }],
      type: 'article',  // blog için
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
      images: [coverImage],
    },
  }
}

JSON-LD Schema (site türüne göre):

Avukatlık sitesi (ana sayfa / hakkımızda):
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "...",
  "url": "...",
  "telephone": "...",
  "address": { "@type": "PostalAddress", ... },
  "openingHours": "...",
  "areaServed": "..."
}

Mobilya sitesi (ana sayfa):
{
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "name": "...",
  "url": "...",
  ...
}

Blog yazısı (her iki site):
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Person", "name": "..." },
  "datePublished": "...",
  "dateModified": "...",
  "image": "...",
  "url": "..."
}

SEO Rules:
- h1 her sayfada tek olmalı.
- Semantic HTML zorunlu.
- Alt text: tüm img/Image bileşenlerinde zorunlu (boş string kabul edilmez).
- Slug: Türkçe normalize (ş→s, ı→i, ç→c, ğ→g, ö→o, ü→u).

##################################################
# 6. UI / UX SKILL
##################################################

Tasarım ilkeleri:
- Minimalist, içerik odaklı layout.
- Renk paleti site türüne göre:
    - Avukatlık → koyu lacivert (#1a2744), gri tonları, beyaz. Güven + otorite.
    - Mobilya → toprak tonları (#8B6914, #F5F0E8), ahşap görselleri. Sıcaklık + kalite.
- Tutarlı spacing: 8px grid (Tailwind'in spacing scale ile birebir uyumlu).
- Gradient: yok ya da çok subtle (max 2 renk arası %10 opacity fark).
- Animasyonlar: Tailwind transition-colors, transition-transform (150-200ms).
- Font: Google Fonts → next/font/google ile (layout shift yok).
    - Avukatlık: Playfair Display (başlık) + Inter (gövde).
    - Mobilya: Cormorant Garamond (başlık) + Lato (gövde).

Responsive Breakpoints (Tailwind):
- sm: 640px  → mobil landscape
- md: 768px  → tablet (özellikle optimize edilmeli)
- lg: 1024px → desktop
- xl: 1280px → geniş desktop

Bileşen Kuralları:
- Button: varyant sistemi (primary, secondary, ghost, danger).
- Input: hata mesajı alanı dahil tasarlanmalı.
- Card: tutarlı shadow ve radius (rounded-lg, shadow-sm).
- Loading state: skeleton (spinner değil, layout shift azaltır).

##################################################
# 7. PERFORMANS SKILL
##################################################

Rendering stratejisi:
- Statik içerik → generateStaticParams + static generation.
- Blog listesi → ISR (revalidate: 3600).
- Blog detay → ISR (revalidate: 3600).
- Admin panel → dynamic (authentication zorunlu).
- API route'lar → dynamic.

Image:
- next/image zorunlu (width+height veya fill+sizes zorunlu).
- sizes prop: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
- priority: sadece above-the-fold hero görseli için.

Kod bölme:
- Admin panel bileşenleri dynamic import.
- Rich text editor (Tiptap) dynamic import.
- Ağır kütüphaneler client bundle'a girmemeli.

React optimizasyon:
- useEffect minimum.
- useMemo/useCallback: yalnızca profiling sonrası, kanıtlanmış perf sorunu için.
- Server Action sonrası revalidatePath veya revalidateTag ile cache temizlenir.

##################################################
# 8. GÜVENLİK SKILL
##################################################

Zorunlu güvenlik kuralları:
- Input: Zod ile server-side validate (API route ve Server Action).
- Rich text: sanitize-html (sunucu) + DOMPurify (client preview).
- dangerouslySetInnerHTML: YALNIZCA sanitize edilmiş içerik.
- Sensitive data (passwordHash, token, env): client'a gönderilmez.
- Error response: generic mesaj (detay server log'da).
- SQL: Prisma parametrik query (raw query yasak).
- ENV: NEXT_PUBLIC_ prefix olmayan her şey server-only.
- CSP Header (next.config.js):
    default-src 'self';
    script-src 'self' (nonce veya hash ile inline);
    img-src 'self' data: blob: (upload CDN domain);

##################################################
# 9. ADMIN PANEL SKILL
##################################################

Layout yapısı:
- (admin)/layout.tsx → auth kontrol + sidebar layout.
- Sidebar: collapse destekli (localStorage state, client component).
- Mobile: drawer/sheet pattern (Tailwind + state).

Dashboard kartları (ana sayfa):
- Toplam yayınlanmış post.
- Bu ay eklenen post.
- Taslak sayısı.
- Toplam görsel sayısı.

CRUD Pattern (Server Actions):
- createPost(formData) → validate → DB → revalidatePath
- updatePost(id, formData) → validate → DB → revalidatePath
- deletePost(id) → soft delete (deletedAt = now()) → revalidatePath
- publishPost(id) → isPublished=true, publishedAt=now() → revalidatePath

Post listesi:
- Arama: URL search params (?q=) + server-side Prisma where filtresi.
- Debounce: client-side (300ms), URL'e yansıtılır.
- Pagination: offset-based (admin için yeterli, sayfa numarası URL'de).
- Filtre: Tümü / Yayında / Taslak / Silinmiş.

Post editor:
- Tiptap rich text editor (client component, dynamic import).
- Görsel ekleme: upload API ile entegre.
- Önizleme: draft URL (/preview/[slug]?token=previewToken).
- Kaydet (taslak) / Yayınla ayrı aksiyonlar.

##################################################
# 10. FUTURE READY SKILL
##################################################

Çok dil (i18n) hazırlığı:
- next-intl altyapısı hazır bırakılır.
- Tüm UI string'leri hard-code değil, mesaj dosyasından çekilir.
- URL yapısı: /tr/blog/[slug] (locale prefix).

RBAC altyapısı:
- Role enum: ADMIN | EDITOR (Prisma'da mevcut).
- Middleware role kontrolü: admin-only sayfalar için.
- Editor: post CRUD yapabilir, ayarları değiştiremez.
- Admin: tam yetki.

External storage:
- S3StorageProvider implementasyonu hazır (env toggle ile aktif edilir).
- CDN prefix: env değişkeni ile yönetilir.

Analitik hazırlığı:
- next/script ile Plausible veya Umami entegrasyonu (privacy-friendly).
- Google Analytics opsiyonel (GDPR consent banner ile birlikte).