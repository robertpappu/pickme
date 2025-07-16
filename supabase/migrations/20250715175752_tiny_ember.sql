/*
  # PickMe Intelligence Database Schema

  1. New Tables
    - `officers` - Store officer information and credentials
    - `credit_transactions` - Track all credit operations
    - `api_keys` - Manage API keys and configurations
    - `queries` - Log all OSINT and PRO queries
    - `officer_registrations` - Handle new officer registration requests
    - `system_settings` - Store system configuration
    - `live_requests` - Track real-time query processing

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure admin and officer role separation

  3. Functions
    - Auto-generate UUIDs
    - Timestamp management
    - Credit calculation functions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  mobile text UNIQUE NOT NULL,
  telegram_id text UNIQUE,
  password_hash text NOT NULL,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  department text,
  rank text,
  badge_number text,
  station text,
  credits_remaining integer DEFAULT 50,
  total_credits integer DEFAULT 50,
  total_queries integer DEFAULT 0,
  device_fingerprint text,
  session_token text,
  last_active timestamptz DEFAULT now(),
  registered_on timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id uuid REFERENCES officers(id) ON DELETE CASCADE,
  officer_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('Renewal', 'Deduction', 'Top-up', 'Refund')),
  credits integer NOT NULL,
  payment_mode text DEFAULT 'Department Budget',
  remarks text,
  processed_by uuid, -- Admin who processed this
  created_at timestamptz DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  provider text NOT NULL,
  api_key text NOT NULL,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id uuid REFERENCES officers(id) ON DELETE CASCADE,
  officer_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('OSINT', 'PRO')),
  category text NOT NULL,
  input_data text NOT NULL,
  source text,
  result_summary text,
  full_result jsonb,
  credits_used integer DEFAULT 0,
  status text DEFAULT 'Processing' CHECK (status IN ('Processing', 'Success', 'Failed', 'Pending')),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Officer registrations table
CREATE TABLE IF NOT EXISTS officer_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  station text NOT NULL,
  department text,
  rank text,
  badge_number text,
  additional_info text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by text,
  updated_at timestamptz DEFAULT now()
);

-- Live requests table (for real-time monitoring)
CREATE TABLE IF NOT EXISTS live_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id uuid REFERENCES officers(id) ON DELETE CASCADE,
  officer_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('OSINT', 'PRO')),
  query_text text NOT NULL,
  status text DEFAULT 'Processing' CHECK (status IN ('Processing', 'Success', 'Failed')),
  response_time_ms integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Admin users table (separate from officers)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Officers
CREATE POLICY "Officers can read own data" ON officers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Officers can update own data" ON officers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for Admin (full access)
CREATE POLICY "Admins can manage officers" ON officers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage credit transactions" ON credit_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can manage API keys" ON api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Admins can view all queries" ON queries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Officers can view own queries" ON queries
  FOR SELECT USING (auth.uid()::text = officer_id::text);

CREATE POLICY "Officers can insert own queries" ON queries
  FOR INSERT WITH CHECK (auth.uid()::text = officer_id::text);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_officers_updated_at BEFORE UPDATE ON officers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update officer credits
CREATE OR REPLACE FUNCTION update_officer_credits(
  officer_uuid uuid,
  credit_change integer,
  transaction_type text,
  processed_by_name text DEFAULT 'System'
)
RETURNS void AS $$
BEGIN
  -- Update officer credits
  UPDATE officers 
  SET 
    credits_remaining = GREATEST(0, credits_remaining + credit_change),
    total_credits = CASE 
      WHEN transaction_type IN ('Renewal', 'Top-up') THEN total_credits + ABS(credit_change)
      ELSE total_credits
    END,
    updated_at = now()
  WHERE id = officer_uuid;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    officer_id, 
    officer_name, 
    action, 
    credits, 
    remarks,
    created_at
  )
  SELECT 
    officer_uuid,
    o.name,
    transaction_type,
    credit_change,
    'Processed by ' || processed_by_name,
    now()
  FROM officers o WHERE o.id = officer_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (name, email, password_hash, role) VALUES
('Admin User', 'admin@pickme.intel', '$2b$10$rQZ9vKKQZ9vKKQZ9vKKQZOeJ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vKKQ', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('max_concurrent_queries', '100', 'Maximum concurrent queries allowed'),
('default_officer_credits', '50', 'Default credits for new officers'),
('session_timeout_minutes', '30', 'Session timeout in minutes'),
('rate_limit_per_hour', '1000', 'Rate limit per officer per hour')
ON CONFLICT (key) DO NOTHING;

-- Insert sample API keys
INSERT INTO api_keys (name, provider, api_key, status) VALUES
('Signzy Phone Verification', 'Signzy', 'sk_test_4f8b2c1a9e3d7f6b5a8c9e2d1f4b7a3c', 'Active'),
('Surepass Identity Verification', 'Surepass', 'sp_live_7a3c9e2d1f4b8c5a9e3d7f6b1a4c8e2d', 'Active'),
('TrueCaller API', 'TrueCaller', 'tc_api_2d1f4b8c5a9e3d7f6b1a4c8e2d7f3b9c', 'Active')
ON CONFLICT DO NOTHING;