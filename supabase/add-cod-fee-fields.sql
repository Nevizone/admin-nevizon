-- Add ALL missing fields to settings table (General + COD)
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS enable_cod_fee boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cod_fee_type text DEFAULT 'percentage' CHECK (cod_fee_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS cod_fee_percentage numeric DEFAULT 2,
ADD COLUMN IF NOT EXISTS cod_fee_fixed numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cod_fee_min_order numeric DEFAULT 0;

-- Ensure row exists (safe insert)
INSERT INTO settings (id, store_name, is_cod_enabled) 
VALUES (1, 'Nevizon', true)
ON CONFLICT (id) DO NOTHING;
