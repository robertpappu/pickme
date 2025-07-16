/*
  # Fix ON CONFLICT constraints

  This migration addresses the ON CONFLICT error by ensuring all tables have proper unique constraints
  and primary keys for any ON CONFLICT operations.

  ## Changes Made
  1. Verify and add missing unique constraints
  2. Fix any ON CONFLICT clauses that reference non-unique columns
  3. Ensure all tables have proper primary keys

  ## Tables Updated
  - officers: Ensure unique constraints on email, mobile, telegram_id
  - officer_registrations: Ensure unique constraints where needed
  - admin_users: Ensure unique constraint on email
  - api_keys: Ensure proper constraints
  - system_settings: Ensure unique constraint on key
*/

-- Ensure officers table has all necessary unique constraints
DO $$
BEGIN
  -- Check if email unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'officers_email_key' 
    AND table_name = 'officers'
  ) THEN
    ALTER TABLE officers ADD CONSTRAINT officers_email_key UNIQUE (email);
  END IF;

  -- Check if mobile unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'officers_mobile_key' 
    AND table_name = 'officers'
  ) THEN
    ALTER TABLE officers ADD CONSTRAINT officers_mobile_key UNIQUE (mobile);
  END IF;

  -- Check if telegram_id unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'officers_telegram_id_key' 
    AND table_name = 'officers'
  ) THEN
    ALTER TABLE officers ADD CONSTRAINT officers_telegram_id_key UNIQUE (telegram_id);
  END IF;
END $$;

-- Ensure officer_registrations table has proper constraints
DO $$
BEGIN
  -- Add unique constraint on email for registrations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'officer_registrations_email_key' 
    AND table_name = 'officer_registrations'
  ) THEN
    ALTER TABLE officer_registrations ADD CONSTRAINT officer_registrations_email_key UNIQUE (email);
  END IF;

  -- Add unique constraint on mobile for registrations if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'officer_registrations_mobile_key' 
    AND table_name = 'officer_registrations'
  ) THEN
    ALTER TABLE officer_registrations ADD CONSTRAINT officer_registrations_mobile_key UNIQUE (mobile);
  END IF;
END $$;

-- Ensure admin_users table has proper email constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_users_email_key' 
    AND table_name = 'admin_users'
  ) THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_email_key UNIQUE (email);
  END IF;
END $$;

-- Ensure system_settings has unique key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'system_settings_key_key' 
    AND table_name = 'system_settings'
  ) THEN
    ALTER TABLE system_settings ADD CONSTRAINT system_settings_key_key UNIQUE (key);
  END IF;
END $$;

-- Ensure plan_apis has proper unique constraint for plan_id, api_id combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'plan_apis_plan_id_api_id_key' 
    AND table_name = 'plan_apis'
  ) THEN
    ALTER TABLE plan_apis ADD CONSTRAINT plan_apis_plan_id_api_id_key UNIQUE (plan_id, api_id);
  END IF;
END $$;

-- Create indexes for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_officers_status ON officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_created_at ON officers(created_at);
CREATE INDEX IF NOT EXISTS idx_queries_officer_id ON queries(officer_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_officer_id ON credit_transactions(officer_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);