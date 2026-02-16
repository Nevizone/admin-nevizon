-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Admins & Customers)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text default 'customer' check (role in ('admin', 'customer')),
  phone text,
  -- CRM Fields
  coins integer default 0,
  notes text,
  tags text[], -- e.g. ['VIP', 'Wholesale']
  total_spent numeric default 0,
  orders_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references categories(id),
  is_featured boolean default false,
  -- SEO
  meta_title text,
  meta_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null,
  sale_price numeric,
  inventory_count integer default 0,
  low_stock_threshold integer default 5,
  category_id uuid references categories(id),
  images text[], -- Array of image URLs
  
  -- Details
  brand text,
  sku text,
  barcode text,
  
  -- Specs
  dimensions text,
  weight text,
  material text,
  colors text, -- e.g. "Red, Blue"
  sizes text, -- e.g. "S, M, L"
  
  -- Dynamic Specs & Highlights
  specs jsonb, -- [{"key": "Movement", "value": "Quartz"}]
  highlights text[], -- ["Bullet point 1", "Bullet point 2"]
  
  -- Compliance
  origin text,
  manufacturer text,
  warranty text,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Flags
  is_featured boolean default false,
  is_new boolean default false,
  age_group text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Nullable for guest checkout if needed
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null, -- { line1, city, state, zip }
  billing_address jsonb,
  gstin text, -- for business customers
  
  total_amount numeric not null,
  payment_method text, -- 'COD' or 'Prepaid'
  status text default 'Pending' check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  payment_status text default 'Unpaid' check (payment_status in ('Paid', 'Unpaid', 'Refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDER ITEMS
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity integer not null,
  price_at_purchase numeric not null,
  variant_color text,
  variant_size text
);

-- 6. PROMOTIONS
create table promotions (
  id uuid default uuid_generate_v4() primary key,
  title text not null, -- Internal name
  type text not null, -- 'Banner', 'Popup'
  status text default 'Draft' check (status in ('Active', 'Scheduled', 'Ended', 'Draft')),
  start_date date,
  end_date date,
  
  -- Content
  heading text,
  subheading text,
  image_url text,
  btn_text text,
  btn_link text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  user_name text not null, -- Can be guest or linked user
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. COMMUNICATIONS
create table subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table inquiries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'New' check (status in ('New', 'Read', 'Replied')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. SETTINGS (Singleton)
create table settings (
  id integer primary key default 1 check (id = 1),
  store_name text default 'Nevizon',
  support_email text,
  support_phone text,
  store_description text,
  
  -- Shipping
  pincodes text[], 
  free_shipping_threshold numeric default 999,
  shipping_charge numeric default 100,
  
  -- Payment Config
  is_cod_enabled boolean default true,
  is_stripe_enabled boolean default true,
  razorpay_key text,
  
  -- Fees
  gift_wrap_fee numeric default 50,
  loyalty_rate numeric default 1,
  
  -- Notifications
  email_alerts boolean default true,
  sms_alerts boolean default false,

  -- Media (Cloudinary)
  cloudinary_cloud_name text,
  cloudinary_upload_preset text
);

-- RLS POLICIES
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table promotions enable row level security;
alter table reviews enable row level security;
alter table subscribers enable row level security;
alter table inquiries enable row level security;
alter table settings enable row level security;

-- Public Read Access
create policy "Public products" on products for select using (true);
create policy "Public categories" on categories for select using (true);
create policy "Public settings" on settings for select using (true);
create policy "Public promotions" on promotions for select using (status = 'Active');
create policy "Public reviews" on reviews for select using (status = 'Approved');

-- HELPER: Check if user is admin (Bypass RLS to avoid recursion)
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- DROP EXISTING POLICIES (To avoid conflicts during updates)
drop policy if exists "Users can see their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Admins All Profiles" on profiles;
drop policy if exists "Admins All Categories" on categories;
drop policy if exists "Admins All Products" on products;
drop policy if exists "Admins All Orders" on orders;
drop policy if exists "Admins All Order Items" on order_items;
drop policy if exists "Admins All Promotions" on promotions;
drop policy if exists "Admins All Reviews" on reviews;
drop policy if exists "Admins All Subscribers" on subscribers;
drop policy if exists "Admins All Inquiries" on inquiries;
drop policy if exists "Admins All Settings" on settings;

-- Admin Full Access (Using is_admin function)
create policy "Users can see their own profile" on profiles for select using (auth.uid() = id);
create policy "Admins All Profiles" on profiles using (is_admin());
create policy "Admins All Categories" on categories using (is_admin());
create policy "Admins All Products" on products using (is_admin());
create policy "Admins All Orders" on orders using (is_admin());
create policy "Admins All Order Items" on order_items using (is_admin());
create policy "Admins All Promotions" on promotions using (is_admin());
create policy "Admins All Reviews" on reviews using (is_admin());
create policy "Admins All Subscribers" on subscribers using (is_admin());
create policy "Admins All Inquiries" on inquiries using (is_admin());
create policy "Admins All Settings" on settings using (is_admin());

-- Allow Insert for Public (e.g. Checkout, Contact Form)
create policy "Public Create Order" on orders for insert with check (true); 
create policy "Public Create Order Items" on order_items for insert with check (true);
create policy "Public Create Review" on reviews for insert with check (true);
create policy "Public Create Subscriber" on subscribers for insert with check (true);
create policy "Public Create Inquiry" on inquiries for insert with check (true);

-- Allow Users to create their own profile (Self-Registration)
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Allow Users to update their own profile
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- AUTOMATION: Trigger to create Profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
