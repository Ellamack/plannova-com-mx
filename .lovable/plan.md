## Planispherium Nova — bilingual cartography & GIS studio site

A professional-but-characterful bilingual (ES/EN) site that presents your serious services (GIS, remote sensing, environmental consulting, cartography) while showcasing your maps, naturalist illustration gallery, blog, and a catalog of downloadable map layers. You manage all content from a private admin area.

### Design direction
A "modern cartographer's studio" aesthetic — vintage map / botanical-engraving warmth meets clean GIS precision.
- Palette: deep forest/teal ink, warm parchment/cream backgrounds, an ochre/terracotta accent (defined as oklch tokens in `src/styles.css`).
- Typography: a characterful display serif for headings (map-label feel) + a clean, legible sans for body and data.
- Motion: one confident hero animation (e.g. an unfolding map / contour-line reveal), restrained hover states elsewhere — "Vamos, ánimo!" energy without clutter.
- Subtle map textures (contour lines, graticules) and engraving-style framing for the gallery.

### Site structure (routes)
```
/                Home — hero, who you are, service highlights, featured work
/servicios       Services — GIS, remote sensing, environmental consulting, cartography
/portafolio      Portfolio / Work — map & project showcase (grid + detail)
/galeria         Naturalist SVG illustration gallery (entomology/botany)
/capas           Map layers catalog (.shp, .kmz, etc.) — catalog only, "contact to acquire"
/blog            Blog index + /blog/$slug post pages
/sobre           About
/contacto        Contact form (saved to database + emailed to you)
/auth            Login (admin only)
/admin/*         Private admin area (manage all content + read messages)
```
Each public route gets its own SEO `head()` (title, description, og tags). Bilingual via a language switcher (ES default, EN toggle) with a lightweight translation context.

### Phasing
This is a sizable build, so I'll do it in two phases and keep the site usable after each.

**Phase 1 — Public site + contact (foundation)**
- Establish the design system and bilingual framework.
- Build all public pages with real layout and seeded placeholder content you can later replace.
- Enable Lovable Cloud and wire the Contact form: messages saved to a `contact_messages` table and emailed to you (Lovable Emails). Server-side validation with zod.
- Gallery, portfolio, and layers render from the database so admin can edit them later.

**Phase 2 — Auth + admin CMS**
- Email/password login (admin-only). Roles stored in a separate `user_roles` table with a `has_role()` security-definer function (no roles on profiles).
- Admin dashboard under `/admin` to create/edit/delete: blog posts, portfolio projects, gallery illustrations, and layer catalog entries; plus an inbox to read contact messages.
- File storage buckets for uploads: gallery SVGs/images, portfolio images, and layer source files (.shp/.kmz) — public buckets for display images, private bucket for layer files (catalog shows metadata, not public downloads).
- Each content type is bilingual (ES/EN fields).

### Technical notes
- Stack: TanStack Start (file routes in `src/routes/`), Tailwind v4 tokens in `src/styles.css`, shadcn components.
- Data access via `createServerFn`; public reads through server functions, user-scoped/admin writes via authenticated server functions with RLS scoped to `auth.uid()` / `has_role`.
- Contact form posts to a server route/function that validates, inserts, and triggers the email.
- All new tables get explicit GRANTs + RLS policies in the same migration.
- Layers are catalog-only for now (no payments); structured so a checkout can be added later.

### What I'll need from you later
- Real text/images for services, about, portfolio, gallery, and initial blog posts (placeholders used until then).
- The email address where contact submissions should be delivered.

I'll start with Phase 1 once you approve.