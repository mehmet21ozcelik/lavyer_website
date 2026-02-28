---
trigger: manual
---

# NEXTJS MODERN SECURE CODING RULES
# Stack: Next.js (App Router) + TypeScript + Tailwind + Prisma + JWT
# Amaç: Güvenli, performanslı, SEO uyumlu ve production-ready kod üretmek

##################################################
# 1. GENEL YAZIM PRENSİPLERİ
##################################################

- Varsayılan olarak Server Component kullan.
- Client Component yalnızca gerçekten interaktif UI gerekiyorsa yaz.
- "use client" minimum seviyede kullanılmalı.
- Default export kullanma, named export kullan.
- Fonksiyonel component yaz.
- Gereksiz abstraction yapma.
- Tek sorumluluk prensibine uy.
- DRY prensibini uygula ancak aşırı soyutlama yapma.

##################################################
# 2. TYPESCRIPT KURALLARI
##################################################

- TypeScript strict mode varsay.
- any kullanma.
- Fonksiyonların dönüş tipi açıkça belirtilmeli.
- Props tipleri interface ile tanımlanmalı.
- Nullable alanlar açıkça belirtilmeli.
- Prisma model tipleri doğrudan UI katmanına taşınmamalı.

##################################################
# 3. VERİ VE PRISMA KULLANIMI
##################################################

- Component içinde doğrudan prisma çağrısı yapma.
- Tüm DB işlemleri server-side yapılmalı.
- Validation olmadan DB işlemine izin verme.
- Raw SQL kullanma.
- Silme işlemleri soft delete mantığıyla tasarlanmalı.
- Sensitive alanlar client'a gönderilmemeli.

##################################################
# 4. JWT AUTH KURALLARI
##################################################

- JWT yalnızca httpOnly cookie içinde saklanmalı.
- localStorage kullanma.
- Token doğrulama sadece server-side yapılmalı.
- Admin route’lar korumalı olmalı.
- Şifreler hashlenmeden saklanamaz.
- Login brute-force riskine karşı basit rate limit uygulanmalı.

##################################################
# 5. IMAGE UPLOAD KURALLARI
##################################################

- Upload işlemi yalnızca server route üzerinden yapılmalı.
- Dosya tipi kontrolü zorunlu (png, jpeg, webp).
- Maksimum dosya boyutu kontrol edilmeli.
- Dosya isimleri benzersiz olmalı (UUID).
- Dosya yolu doğrudan kullanıcıdan alınamaz.
- Upload klasörü dışına yazılamaz (path traversal koruması).
- Yüklenen görseller next/image ile render edilmeli.

##################################################
# 6. SEO KURALLARI
##################################################

- Her sayfa metadata üretmeli.
- Title ve description dinamik olmalı.
- Blog içeriklerinde slug SEO uyumlu olmalı.
- h1 etiketi sayfa başına bir adet olmalı.
- Semantic HTML kullanılmalı.
- Canonical URL eklenmeli.
- Structured data (Article / LocalBusiness) desteklenmeli.

##################################################
# 7. PERFORMANS KURALLARI
##################################################

- Gereksiz client state kullanma.
- useEffect yalnızca zorunluysa kullan.
- Büyük bağımlılıklar ekleme.
- next/image zorunlu.
- Dinamik render sadece gerektiğinde.
- Static üretilebilecek içerik static üretilmeli.

##################################################
# 8. TASARIM KALİTESİ
##################################################

- Mobile-first tasarım.
- Responsive breakpoint’ler düzgün kullanılmalı.
- Aşırı animasyon, glow, neon, gradient karmaşası yok.
- Spacing tutarlı olmalı.
- Görsel hiyerarşi net olmalı.
- AI template hissi veren jenerik hero tasarımlarından kaçınılmalı.
- Placeholder lorem ipsum bırakılmamalı.

##################################################
# 9. GÜVENLİK
##################################################

- Input validation zorunlu.
- XSS riskine karşı dangerouslySetInnerHTML kullanma.
- ENV değişkenleri client’a expose edilmemeli.
- Error mesajları hassas bilgi içermemeli.
- Stack trace production’da gösterilmemeli.