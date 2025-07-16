/*
  # Add plan_id to officers table

  1. Changes
    - Add `plan_id` column to `officers` table
    - Add foreign key constraint to `rate_plans` table
    - Update existing officers to have null plan_id initially

  2. Security
    - No changes to existing RLS policies
*/

-- Add plan_id column to officers table
ALTER TABLE officers ADD COLUMN IF NOT EXISTS plan_id uuid;

-- Add foreign key constraint
ALTER TABLE officers 
ADD CONSTRAINT officers_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES rate_plans(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_officers_plan_id ON officers(plan_id);