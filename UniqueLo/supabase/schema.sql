-- ====================================================================
-- UniqueLo — Complete Supabase Database Architecture & Schema
-- Haute Needlecraft Luxury E-Commerce Platform
-- ====================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Clean Drop (Optional / For Fresh Re-initialization)
-- To completely wipe and rebuild, run the following DROP block:
/*
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.reviews cascade;
drop table if exists public.newsletter_subscribers cascade;
drop table if exists public.embroidery_details cascade;
drop table if exists public.product_images cascade;
drop table if exists public.variants cascade;
drop table if exists public.products cascade;
drop table if exists public.garments cascade;
drop table if exists public.collections cascade;
drop table if exists public.motifs cascade;
drop table if exists public.universes cascade;
drop table if exists public.categories cascade;
*/

-- 3. Universes Table (Animeverse, Heroverse, Itihaas)
create table if not exists public.universes (
  slug text primary key,
  name text not null,
  tagline text not null,
  lore text not null,
  emblem_src text,
  hero_image text,
  drop_cadence text,
  is_active boolean default true,
  order_num integer default 0,
  theme_tokens jsonb default '{}'::jsonb,
  portal_title_color text,
  lore_heading text,
  hero_headline text,
  hero_headline_accent text,
  hero_lead_color text,
  hero_accent_color text,
  hero_headline_case text,
  hero_kicker text,
  hero_ornament text,
  hero_note text,
  hero_vertical_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. IP-Cleared Motifs Table
create table if not exists public.motifs (
  id text primary key,
  universe_slug text references public.universes(slug) on delete cascade not null,
  name text not null,
  meaning text not null,
  symbol_notes text,
  ip_cleared boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Categories Table
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  label text not null,
  description text not null,
  image text,
  order_num integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5b. Garments Table (Silhouette Taxonomy: Hoodies, Tees, Jackets, etc.)
create table if not exists public.garments (
  slug text primary key,
  name text not null,
  category_slug text references public.categories(slug) on delete set null,
  description text not null,
  order_num integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5c. Collections Table (Seasonal Drops & Thematic Capsules)
create table if not exists public.collections (
  slug text primary key,
  name text not null,
  tagline text,
  description text,
  universe_slug text references public.universes(slug) on delete set null,
  cover_image text,
  featured boolean default true,
  order_num integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Products Table (Fully synchronized with current TypeScript domain model)
create table if not exists public.products (
  slug text primary key,
  name text not null,
  subtitle text not null,
  foreign_tagline text,
  description text not null,
  category_slug text references public.categories(slug) on delete set null,
  universe_slug text references public.universes(slug) on delete set null,
  collection_slug text references public.collections(slug) on delete set null,
  garment_type text references public.garments(slug) on delete set null,
  gender text default 'unisex' check (gender in ('men', 'women', 'unisex')),
  motif_id text references public.motifs(id) on delete set null,
  is_mock boolean default false,
  handcrafted boolean default false,
  vibes text[] default '{}',
  moods text[] default '{}',
  intensity text default 'balanced' check (intensity in ('quiet', 'balanced', 'loud')),
  expression_score smallint default 3 check (expression_score between 1 and 5),
  expression_slug text default 'artistic',
  rating numeric(3,1),
  review_count integer default 0,
  sold_count text,
  tags text[] default '{}',
  featured boolean default false,
  customizable boolean default false,
  material text[] default '{}',
  care text[] default '{}',
  fit text,
  batch_number integer default 1,
  batch_total integer default 50,
  craft_region text,
  craft_cluster text,
  fabric_gsm text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Product Variants Table
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

-- 8. Product Images Table
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_slug text references public.products(slug) on delete cascade not null,
  src text not null,
  alt text not null,
  color text,
  sort_order integer default 0
);

-- 9. Embroidery Details Table
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

-- 10. Reviews Table
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

-- 11. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Orders & Order Items Table
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
create index if not exists idx_products_universe on public.products(universe_slug);
create index if not exists idx_products_collection on public.products(collection_slug);
create index if not exists idx_products_garment on public.products(garment_type);
create index if not exists idx_products_gender on public.products(gender);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_variants_product on public.variants(product_slug);
create index if not exists idx_product_images_product on public.product_images(product_slug);
create index if not exists idx_reviews_product on public.reviews(product_slug);

-- ====================================================================
-- Row Level Security (RLS)
-- ====================================================================
alter table public.universes enable row level security;
alter table public.motifs enable row level security;
alter table public.categories enable row level security;
alter table public.garments enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.product_images enable row level security;
alter table public.embroidery_details enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public READ policies for catalog
create policy "Allow public read universes" on public.universes for select using (true);
create policy "Allow public read motifs" on public.motifs for select using (true);
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read garments" on public.garments for select using (true);
create policy "Allow public read collections" on public.collections for select using (true);
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

-- Allow in-app Admin Studio to insert/update catalog rows
create policy "Allow admin insert garments" on public.garments for insert with check (true);
create policy "Allow admin update garments" on public.garments for update using (true);
create policy "Allow admin insert collections" on public.collections for insert with check (true);
create policy "Allow admin update collections" on public.collections for update using (true);
create policy "Allow admin insert products" on public.products for insert with check (true);
create policy "Allow admin update products" on public.products for update using (true);
create policy "Allow admin insert variants" on public.variants for insert with check (true);
create policy "Allow admin update variants" on public.variants for update using (true);
create policy "Allow admin insert product images" on public.product_images for insert with check (true);
create policy "Allow admin delete product images" on public.product_images for delete using (true);
create policy "Allow admin insert embroidery details" on public.embroidery_details for insert with check (true);
create policy "Allow admin update embroidery details" on public.embroidery_details for update using (true);

-- ====================================================================
-- Initial Seed: Garment Silhouettes (Taxonomy Definition)
-- ====================================================================
insert into public.garments (slug, name, category_slug, description, order_num) values
  ('hoodie', 'Hoodies', 'tops', 'Heavyweight fleece hoodies with back-panel and crest embroidery.', 1),
  ('tee', 'Tees', 'tops', 'Combed-cotton tees carrying chest and back threadwork.', 2),
  ('shirt', 'Shirts', 'tops', 'Oxfords, poplins and band-collar tunics with monogram detail.', 3),
  ('jacket', 'Jackets', 'outerwear', 'Chore jackets, capes and overcoats with procession-scale embroidery.', 4),
  ('cardigan', 'Cardigans', 'knitwear', 'Cashmere cardigans with crewel relief.', 5),
  ('vest', 'Vests', 'knitwear', 'Knit vests with sculpted knot texture.', 6),
  ('pants', 'Pants', 'bottoms', 'Selvedge denim and work pants with structural stitching.', 7),
  ('scarf', 'Scarves', 'accessories', 'Silk scarves with arch-jaal and flora borders.', 8),
  ('tote', 'Totes', 'accessories', 'Raw-canvas totes with sun-disc and motif hits.', 9)
on conflict (slug) do update set
  name = excluded.name,
  category_slug = excluded.category_slug,
  description = excluded.description,
  order_num = excluded.order_num;

-- ====================================================================
-- Initial Seed: Collections (Seasonal Drops & Thematic Capsules)
-- ====================================================================
insert into public.collections (slug, name, tagline, description, universe_slug, featured, order_num) values
  ('spring-sakura', 'Spring Sakura Collection', 'Japanese woodblock waves, blossom scatter, ink-line calm.', 'Inspired by spring in the floating world — flat sun discs, wave curls, and floating cherry blossom embroidery.', 'animeverse', true, 1),
  ('royal-heritage', 'Royal Heritage Collection', 'Arches, jaals and royal court processions in gold zardozi.', 'Arch lattices, elephant processions, and intricate jaal geometry drawn from royal court lineages.', 'itihaas', true, 2),
  ('midnight-atelier', 'Midnight Atelier Collection', 'No world, just pure cloth, heroic crests, and tonal needlecraft.', 'Universe-neutral and nocturnal luxury pieces — sashiko grids, crewel relief, comic noir geometry, and understated crest detailing.', 'atelier', true, 3)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  universe_slug = excluded.universe_slug,
  featured = excluded.featured,
  order_num = excluded.order_num;

-- ====================================================================
-- Storage Bucket for Product Imagery (Media CDN)
-- ====================================================================
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true) 
on conflict (id) do nothing;

create policy "Public Read Product Images" on storage.objects 
for select using (bucket_id = 'product-images');

create policy "Public Upload Product Images" on storage.objects 
for insert with check (bucket_id = 'product-images');
