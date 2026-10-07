# UniqueLo — Luxury Embroidered Apparel E-Commerce

> **The digital flagship for state-of-the-art artisanal needlecraft & luxury fashion.**  
> Built with React 19, TypeScript, Vite, Tailwind CSS v4, GSAP ScrollTrigger, Lenis Smooth Scroll, Framer Motion, and Supabase.

---

## 🌟 North Star Vision
Read the complete North Star Vision & Engineering Blueprint in **[STAR_GOAL.md](./STAR_GOAL.md)**.

## 🚀 Deployment (Vercel, Supabase & Docker Production)
Read the full step-by-step production deployment guide in **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)**.
- **Vercel**: Pre-configured with `vercel.json` for edge caching and SPA routing.
- **Supabase**: Complete SQL schema ([`supabase/schema.sql`](./supabase/schema.sql)) and seed dataset ([`supabase/seed.sql`](./supabase/seed.sql)) ready for 1-click execution.
- **Real Production Server (Docker)**: Multi-stage `Dockerfile` and `docker-compose.prod.yml` ready to deploy on any VPS or Linux host.

---

## 📚 Documentation Suite
- [01 — Stack & Architecture](./docs/01-stack-and-architecture/README.md)
- [02 — Design System](./docs/02-design-system/README.md)
- [03 — Data Contracts](./docs/03-data-contracts/README.md)
- [04 — Motion System](./docs/04-motion-system/README.md)
- [05 — Build Phases & Completion](./docs/05-phases/README.md)
- [06 — Assets & Placeholders](./docs/06-assets-and-placeholders/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Production build & type check
npm run build

# 4. Oxlint code quality verification
npm run lint

# 5. Production Docker stack
docker compose -f docker-compose.prod.yml up -d --build
```
