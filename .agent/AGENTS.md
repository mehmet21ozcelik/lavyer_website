Must-follow constraints
All components must be React Server Components by default. Use 'use client' strictly and only for interactive UI.
Business logic is strictly prohibited inside components. Extract data access and logic to modules/*/services/ or lib/.
Direct database queries within UI components are forbidden. Always use the Prisma singleton at lib/db/.
All inputs (Server Actions and API routes) must be validated with Zod.
The use of $queryRaw in Prisma is banned. Use parameterized queries exclusively.
JWT verification runs only on the server. Never read/write tokens in localStorage or sessionStorage (use httpOnly cookies).
Image uploads must exclusively go through /api/upload, strictly validate MIME types/magic bytes, and generate thumbnails via sharp.
Raw server error details must never be exposed to the client interface.
Validation before finishing
Any new public application page MUST export a generateMetadata function containing OpenGraph parameters.
Any new image MUST use next/image, include an alt attribute, and define strict dimensions (width/height or fill+sizes).
Any rich-text rendered via dangerouslySetInnerHTML MUST first be sanitized using sanitize-html (server) or DOMPurify (client).
Repo-specific conventions
The application splits app/(public) and app/(admin) into fully independent layouts. Do not mix their components.
Admin routes must be explicitly protected by middleware.ts using the matcher configuration.
UI styling must adhere to an 8px grid system (Tailwind default scale).
Standard Tailwind transitions (150-200ms ease) are required for interactions. Do not use Framer Motion for basic UI micro-animations.
Change safety rules
Admin list views must always account for soft-deleted records (filter out rows where deletedAt is not null).
Server Actions are the strongly preferred pattern for Admin CRUD operations over traditional REST endpoints.
Environment variables must never be sent to the client bundle unless explicitly intended (using the NEXT_PUBLIC_ prefix).
