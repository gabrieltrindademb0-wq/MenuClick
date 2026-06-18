-- MenuClick: modelo profissional futuro (opcional)
-- NÃO precisa rodar agora para usar este ZIP.
-- Use quando for trocar do modo iniciante app_state para tabelas separadas.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  cpf text,
  role text not null default 'customer' check (role in ('customer','restaurant_owner','creator_admin')),
  restaurant_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  name text not null,
  legal_name text,
  cnpj text,
  description text,
  category text,
  cover_url text,
  open boolean not null default true,
  min_order numeric not null default 0,
  delivery_fee numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  category text,
  description text,
  image_url text,
  price numeric not null default 0,
  promo_price numeric default 0,
  stock integer default 0,
  available boolean not null default true,
  featured boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id),
  customer_id uuid references auth.users(id),
  code text not null,
  status text not null default 'received',
  customer jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  customer_id uuid references auth.users(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
