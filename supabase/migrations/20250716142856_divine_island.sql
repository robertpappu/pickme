/*
  # Add Service Provider column to APIs table

  1. Changes
    - Add `service_provider` column to `apis` table
    - Set default value as 'Direct' for existing records
    - Update existing APIs to use 'RapidAPI' as service provider

  2. Security
    - No RLS changes needed as this is just adding a column
*/

-- Add service_provider column to apis table
ALTER TABLE apis ADD COLUMN IF NOT EXISTS service_provider text DEFAULT 'Direct';

-- Update existing APIs to use RapidAPI as service provider
UPDATE apis 
SET service_provider = 'RapidAPI' 
WHERE name IN ('Signzy Phone Verification', 'Surepass Identity Verification', 'TrueCaller API');

-- Add comment to the column
COMMENT ON COLUMN apis.service_provider IS 'The platform or provider through which this API is accessed (e.g., RapidAPI, Direct, AWS Marketplace)';