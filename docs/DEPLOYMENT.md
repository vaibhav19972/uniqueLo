# UniqueLo — Production & Cloud Deployment Guide

> **Deploy to Vercel & Supabase for testing, and self-host on Linux/Docker production servers at scale.**

---

## 1. Architecture Overview

UniqueLo is engineered with a **headless, decoupled architecture** identical to the standards used in production platforms like TMS:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND TIER (Vercel / VPS)                     │
│  • Vite + React 19 + TypeScript + Tailwind CSS v4                           │
│  • Client-Side Routing (React Router v7) with vercel.json SPA rewrites      │
│  • TanStack Query caching + Lenis inertia scroll momentum                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     SUPABASE MANAGED CLOUD TIER      │  │      BUNDLED SEED FALLBACK        │
│  • PostgreSQL DB (12+ products,      │  │  • src/data/products.json         │
│    categories, variants, reviews)    │  │  • src/data/categories.json       │
│  • Auto-generated REST (PostgREST)   │  │  • Zero-config instant demo       │
│  • Row-Level Security (RLS) enabled  │  │    when credentials omitted       │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 2. Deploying to Vercel

### Step 2.1 — Import Repository to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
2. Connect your Git repository (GitHub/GitLab/Bitbucket) containing `UniqueLo`.
3. Vercel automatically detects Vite:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (or `UniqueLo` if part of a monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 2.2 — Configure Environment Variables in Vercel
In the Vercel project configuration screen, expand **Environment Variables** and add:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase public anonymous API key |

*(Note: If you leave these blank, UniqueLo automatically boots using the bundled high-fidelity seed catalog.)*

### Step 2.3 — Deploy
Click **Deploy**. Vercel will run `tsc -b && vite build` and deploy the static assets to their global edge CDN. Client-side routing is handled seamlessly by `vercel.json`.

---

## 3. Setting Up Supabase Database

### Step 3.1 — Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project (e.g. `uniquelo-db`).
2. Note your database password and choose your nearest region.

### Step 3.2 — Execute Database Schema
1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New Query**, paste the contents of [`supabase/schema.sql`](file:///Users/apple/MySpace/UniqueLo/supabase/schema.sql), and click **Run**.
3. This creates:
   - `categories`, `products`, `variants`, `product_images`, `embroidery_details`
   - `newsletter_subscribers`, `reviews`, `orders`, `order_items`
   - High-performance indexes and Row-Level Security (RLS) policies.

### Step 3.3 — Seed Initial Needlecraft Catalog
1. In the Supabase SQL Editor, open a **New Query**.
2. Paste the contents of [`supabase/seed.sql`](file:///Users/apple/MySpace/UniqueLo/supabase/seed.sql) and click **Run**.
3. All 12 artisanal products, 6 categories, and variant inventories are immediately populated into your Supabase database!

### Step 3.4 — Copy API Keys
In Supabase, navigate to **Project Settings** > **API**:
- Copy **Project URL** -> `VITE_SUPABASE_URL`
- Copy **anon public key** -> `VITE_SUPABASE_ANON_KEY`

---

## 4. Deploying to Real Production Servers (Self-Hosted / VPS Docker)

Just like the TMS project deployment (`docker-compose.prod.yml`), UniqueLo can be hosted on any Linux server (AWS EC2, DigitalOcean Droplet, Hetzner, etc.):

### Step 4.1 — Requirements
- Docker Engine 20.10+
- Docker Compose v2.0+

### Step 4.2 — Build and Launch Containers
From the `UniqueLo/` root directory:

```bash
# Build multi-stage image with Nginx Alpine and start on port 3000
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 4.3 — Verify Status
```bash
docker compose -f docker-compose.prod.yml ps
```

The container includes:
- Automated gzip compression for JavaScript, CSS, and fonts
- One-year immutable caching for `/assets/*` and `/fonts/*`
- SPA history routing fallback (`try_files $uri /index.html`)
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`)

---

## 5. Local Verification Commands

```bash
# Type check and build bundle
npm run build

# Code health & linting check
npm run lint

# Preview built production bundle locally
npm run preview
```
