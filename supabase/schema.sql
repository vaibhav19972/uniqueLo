-- ====================================================================
-- UniqueLo — Supabase Database Architecture & Schema
-- Haute Needlecraft Luxury E-Commerce Platform
-- ====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Categories Table
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  label text not null,
  description text not null,
  image text,
  order_num integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table if not exists public.products (
  slug text primary key,
  name text not null,
  subtitle text not null,
  description text not null,
  category_slug text references public.categories(slug) on delete set null,
  tags text[] default '{}',
  featured boolean default false,
  customizable boolean default false,
  material text[] default '{}',
  care text[] default '{}',
  fit text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Product Variants Table
create table if not exists public.variants (
  sku text primary key,
  product_slug text references public.products(slug) on delete cascade not null,
  color text not null,
  color_hex text not null,
  size text not null,
  price_cents integer not null,
  compare_at_price_cents integer,
  status text default 'in-stock' check (status in ('in-stock', 'low-stock', 'out-of-stock')),
  quantity integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Product Images Table
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_slug text references public.products(slug) on delete cascade not null,
  src text not null,
  alt text not null,
  color text,
  sort_order integer default 0
);

-- 6. Embroidery Details Table
create table if not exists public.embroidery_details (
  id uuid primary key default uuid_generate_v4(),
  product_slug text references public.products(slug) on delete cascade not null unique,
  technique text not null,
  technique_label text not null,
  artisan_hours integer default 0,
  placement text[] default '{}',
  thread_composition text not null,
  motif_story text not null,
  macro_image_src text,
  macro_image_alt text
);

-- 7. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Customer Reviews Table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_slug text references public.products(slug) on delete cascade not null,
  author text not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  title text not null,
  comment text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Orders & Order Items
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_email text not null,
  status text default 'confirmed',
  subtotal_cents integer not null,
  discount_cents integer default 0,
  shipping_cents integer default 0,
  total_cents integer not null,
  coupon_code text,
  gift_note text,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_slug text not null,
  variant_sku text not null,
  product_name text not null,
  color text not null,
  size text not null,
  quantity integer not null,
  price_cents integer not null,
  customization jsonb
);

-- ====================================================================
-- Indexes for High Performance
-- ====================================================================
create index if not exists idx_products_category on public.products(category_slug);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_variants_product on public.variants(product_slug);
create index if not exists idx_reviews_product on public.reviews(product_slug);

-- ====================================================================
-- Row Level Security (RLS)
-- ====================================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.product_images enable row level security;
alter table public.embroidery_details enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public READ policies for catalog
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read products" on public.products for select using (true);
create policy "Allow public read variants" on public.variants for select using (true);
create policy "Allow public read product images" on public.product_images for select using (true);
create policy "Allow public read embroidery details" on public.embroidery_details for select using (true);
create policy "Allow public read reviews" on public.reviews for select using (true);

-- Public WRITE policies for storefront operations
create policy "Allow public newsletter subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Allow public submit review" on public.reviews for insert with check (true);
create policy "Allow public create orders" on public.orders for insert with check (true);
create policy "Allow public create order items" on public.order_items for insert with check (true);
