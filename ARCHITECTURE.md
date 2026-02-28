# Architecture & Technical Specification

## 1. Database Schema
We will use a relational database with Prisma ORM to efficiently handle our relations and SEO requirements.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // Or MySQL/SQLite depending on hosting constraints
  url      = env("DATABASE_URL")
}

model PracticeArea {
  id        String   @id @default(cuid())
  name      String   // e.g., "Boşanma Avukatı"
  slug      String   @unique // e.g., "bosanma-avukati"
  content   String   @db.Text
  seo       SEOFields?
  cities    CityPracticeArea[] // Many-to-Many through custom table if specific content needed per city, or just implicit.
  faqs      FAQ[]
  blogPosts BlogPost[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model City {
  id        String   @id @default(cuid())
  name      String   // e.g., "Diyarbakır"
  slug      String   @unique // e.g., "diyarbakir"
  areas     CityPracticeArea[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Intersect table for specific /diyarbakir-bosanma-avukati pages
model CityPracticeArea {
  id             String       @id @default(cuid())
  cityId         String
  city           City         @relation(fields: [cityId], references: [id])
  practiceAreaId String
  practiceArea   PracticeArea @relation(fields: [practiceAreaId], references: [id])
  customContent  String?      @db.Text
  seo            SEOFields?
  
  @@unique([cityId, practiceAreaId])
}

model BlogPost {
  id             String        @id @default(cuid())
  title          String
  slug           String        @unique
  content        String        @db.Text
  excerpt        String?
  seo            SEOFields?
  practiceAreaId String?       // Associates blog to Pillar Page for Cluster Model
  practiceArea   PracticeArea? @relation(fields: [practiceAreaId], references: [id])
  status         PostStatus    @default(DRAFT)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model FAQ {
  id             String        @id @default(cuid())
  question       String
  answer         String        @db.Text
  practiceAreaId String?
  practiceArea   PracticeArea? @relation(fields: [practiceAreaId], references: [id])
  order          Int           @default(0)
}

model Media {
  id        String   @id @default(cuid())
  url       String
  altText   String?
  createdAt DateTime @default(now())
}

model SEOFields {
  id                 String   @id @default(cuid())
  title              String
  description        String
  canonicalUrl       String?
  ogImage            String?
  noIndex            Boolean  @default(false)
  practiceAreaId     String?  @unique
  practiceArea       PracticeArea? @relation(fields: [practiceAreaId], references: [id])
  blogPostId         String?  @unique
  blogPost           BlogPost? @relation(fields: [blogPostId], references: [id])
  cityPracticeAreaId String?  @unique
  cityPracticeArea   CityPracticeArea? @relation(fields: [cityPracticeAreaId], references: [id])
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String // Hashed
  role     Role   @default(ADMIN)
}

enum PostStatus {
  DRAFT
  PUBLISHED
}

enum Role {
  ADMIN
  EDITOR
}
```

## 2. Folder Structure (Next.js App Router)
```
├── app
│   ├── (public)
│   │   ├── about
│   │   │   └── page.tsx (SSG)
│   │   ├── contact
│   │   │   └── page.tsx (SSG)
│   │   ├── hizmetler
│   │   │   ├── page.tsx (SSG)
│   │   │   └── [practice-area]
│   │   │       └── page.tsx (SSG using generateStaticParams)
│   │   ├── [city]-[practice-area]
│   │   │   └── page.tsx (SSG)  // E.g. /diyarbakir-bosanma-avukati
│   │   ├── blog
│   │   │   ├── page.tsx (ISR)
│   │   │   └── [slug]
│   │   │       └── page.tsx (ISR - revalidate: 3600)
│   │   ├── page.tsx (SSG)
│   │   └── layout.tsx
│   ├── (admin)
│   │   ├── admin
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (SSR / Protected)
│   │   │   ├── blog
│   │   │   ├── services
│   │   │   └── seo
│   │   └── login
│   │       └── page.tsx
│   ├── api
│   │   └── auth
│   │   └── revalidate  // Webhook to trigger on-demand ISR 
├── components
│   ├── seo
│   │   ├── DynamicMetadata.tsx
│   │   └── SchemaOrg.tsx
│   ├── layout
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui
│       ├── CallToAction.tsx (Client Component)
│       ├── WhatsAppButton.tsx (Client Component)
│       └── TrustIndicators.tsx
├── lib
│   ├── seo
│   │   ├── generateMetadata.ts
│   │   └── schemas.ts
│   ├── db
│   │   └── prisma.ts
│   └── utils
│       └── stringHelpers.ts (slugify, normalize Turkish chars)
├── public
├── sitemap.ts
├── robots.ts
└── next.config.mjs
```

## 3. SEO Metadata Strategy
1. **Dynamic Metadata API:** We will use Next.js `generateMetadata` in `page.tsx` files. It will query the `SEOFields` relation for the given entity (Practice Area, Blog Post, etc.) and naturally construct standard Meta titles, Descriptions, and OpenGraph/Twitter Cards.
2. **Schema.org Injection:**
   * **LegalService / Attorney Schema:** Loaded uniformly on Homepage and Pillar pages (`/[city]-[practice-area]`).
   * **Article Schema:** Loaded strictly on `/blog/[slug]`.
   * **FAQPage Schema:** When a practice area has linked FAQs, we automatically parse the relation and construct the schema.
   * **BreadcrumbList Schema:** Calculated automatically via the request path.
3. **URL Normalization Enforcement:** A custom `slugify` utility will strictly map Turkish chars (`ç->c`, `ı->i`, `ğ->g`, etc.) to lowercase and avoid duplicate hyphens to maintain perfect indexing structure. Canonical URLs will always be explicit.

## 4. Rendering Strategy Logic
We will avoid unnecessary server-side rendering (SSR) except for the Admin panel. Core web vitals will hit green.
1. **Homepage / General Informational:** SSG (Static Site Generation).
2. **Pillars (`/[city]-[practice-area]`):** SSG using `generateStaticParams` at build time for existing DB links. 
3. **Blog / Clusters (`/blog/[slug]`):** ISR (Incremental Static Regeneration) with an explicit revalidation time (e.g., `revalidate: 3600`) plus an on-demand revalidation trigger from the Admin panel upon post edit/save.
4. **Admin:** SSR wrapped in NextAuth or simple JWT middleware.

## 5. Internal Linking System (Content Cluster Model)
The objective is to feed "Link Juice" back to the main local conversion pages.
1. **Hubs (Pillars):** Base pages like `/diyarbakir-bosanma-avukati`.
2. **Spokes (Clusters):** The `BlogPost` model contains `practiceAreaId`. When rendering a blog post, the system will automatically inject a semantic block at the bottom: _"Diyarbakır'da boşanma davalarıyla ilgili profesyonel destek almak için [Diyarbakır Boşanma Avukatı](#) sayfamızı inceleyebilirsiniz."_
3. **Silo Structure:** Related posts will link to each other (via automatic "Related Articles" lists based on `practiceAreaId`), and all cluster articles point upwards to the primary city practice area page.
