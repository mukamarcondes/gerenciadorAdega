create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key,
  name text not null,
  category text not null,
  brand text not null,
  ncm text,
  cfop text,
  tax_code text,
  tax_rate numeric(6,2) not null default 0,
  price numeric(12,2) not null default 0,
  cost numeric(12,2) not null default 0,
  quantity integer not null default 0,
  minimum_quantity integer not null default 0,
  expiry_date date,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists expiry_date date;

alter table public.products
  add column if not exists ncm text;

alter table public.products
  add column if not exists cfop text;

alter table public.products
  add column if not exists tax_code text;

alter table public.products
  add column if not exists tax_rate numeric(6,2) not null default 0;

create table if not exists public.suppliers (
  id uuid primary key,
  name text not null,
  document text,
  contact_name text,
  phone text,
  email text,
  status text not null default 'ativo',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists supplier_id uuid references public.suppliers(id);

create table if not exists public.cash_sessions (
  id uuid primary key,
  opening_amount numeric(12,2) not null default 0,
  sales_total numeric(12,2) not null default 0,
  sales_count integer not null default 0,
  expected_balance numeric(12,2) not null default 0,
  actual_closing_amount numeric(12,2),
  difference numeric(12,2),
  note text,
  close_note text,
  opened_by text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by text
);

create table if not exists public.sales (
  id uuid primary key,
  item_count integer not null default 0,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  cost_total numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  sale_channel text not null default 'fisica',
  payment_method text not null,
  customer_name text,
  delivery_address text,
  delivery_fee numeric(12,2) not null default 0,
  note text,
  seller_name text,
  cash_session_id uuid references public.cash_sessions(id),
  created_at timestamptz not null default now()
);

alter table public.sales
  add column if not exists sale_channel text not null default 'fisica';

alter table public.sales
  add column if not exists customer_name text;

alter table public.sales
  add column if not exists delivery_address text;

alter table public.sales
  add column if not exists delivery_fee numeric(12,2) not null default 0;

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null default 0,
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  line_cost numeric(12,2) not null default 0
);

create table if not exists public.stock_movements (
  id uuid primary key,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  type text not null,
  quantity integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_invoices (
  id uuid primary key,
  supplier_id uuid references public.suppliers(id),
  supplier_name text not null,
  invoice_number text not null,
  issued_at date not null,
  item_count integer not null default 0,
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_invoice_items (
  id uuid primary key default gen_random_uuid(),
  purchase_invoice_id uuid not null references public.purchase_invoices(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null default 0,
  unit_cost numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0
);

create table if not exists public.supplier_returns (
  id uuid primary key,
  supplier_id uuid references public.suppliers(id),
  supplier_name text not null,
  reference_number text not null,
  returned_at date not null,
  item_count integer not null default 0,
  total_amount numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_return_items (
  id uuid primary key default gen_random_uuid(),
  supplier_return_id uuid not null references public.supplier_returns(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null default 0,
  unit_cost numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0
);
