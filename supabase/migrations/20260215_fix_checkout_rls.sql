-- Fix RLS Policies for Checkout Flow

-- 1. Allow Public/Guest to Insert Orders
drop policy if exists "Public Create Order" on orders;
create policy "Public Create Order" on orders for insert with check (true);

-- 2. Allow Public/Guest to Insert Order Items
drop policy if exists "Public Create Order Items" on order_items;
create policy "Public Create Order Items" on order_items for insert with check (true);

-- 3. Allow Authenticated Users to view their own orders
drop policy if exists "Users can see their own orders" on orders;
create policy "Users can see their own orders" on orders for select using (auth.uid() = user_id);

-- 4. Allow Authenticated Users to view their order items
drop policy if exists "Users can see their own order items" on order_items;
create policy "Users can see their own order items" on order_items for select using (
    exists (
        select 1 from orders
        where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
);

-- Note: For Guest users, they will strictly be able to Insert but NOT Select their order immediately via Client API 
-- if we don't implement a session-based approach. 
-- However, eliminating the 'violates row-level security' error on INSERT is the primary fix.
