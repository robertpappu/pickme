/*
  # Complete PickMe Intelligence Database Schema

  This migration creates the complete database schema for the PickMe Intelligence platform
  with explicit linking between APIs and API keys for enhanced security and data integrity.

  ## New Tables Created:
  1. `admin_users` - Admin user accounts
  2. `apis` - API service definitions
  3. `rate_plans` - Subscription plans
  4. `plan_apis` - Many-to-many relationship between plans and APIs
  5. `api_keys` - Secure API key storage with explicit API linking
  6. `officers` - Officer accounts
  7. `officer_registrations` - Officer registration requests
  8. `queries` - Query history and logging
  9. `credit_transactions` - Credit management
  10. `live_requests` - Real-time request monitoring
  11. `system_settings` - System configuration

  ## Security Features:
  - Row Level Security (RLS) enabled on all tables
  - Proper foreign key constraints
  - Explicit API-to-API-key linking
  - Secure credential storage
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
    last_login timestamptz,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 2. APIs Table (Service Definitions)
CREATE TABLE IF NOT EXISTS apis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    type text NOT NULL CHECK (type IN ('FREE', 'PRO', 'DISABLED')),
    service_provider text DEFAULT 'Direct',
    global_buy_price numeric(10,2) DEFAULT 0,
    global_sell_price numeric(10,2) DEFAULT 0,
    default_credit_charge integer DEFAULT 0,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE apis ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_apis_updated_at
    BEFORE UPDATE ON apis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Rate Plans Table
CREATE TABLE IF NOT EXISTS rate_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name text NOT NULL,
    user_type text NOT NULL CHECK (user_type IN ('Police', 'Private', 'Custom')),
    monthly_fee numeric(10,2) NOT NULL,
    default_credits integer NOT NULL,
    renewal_required boolean DEFAULT true,
    topup_allowed boolean DEFAULT true,
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_rate_plans_updated_at
    BEFORE UPDATE ON rate_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Plan APIs Junction Table
CREATE TABLE IF NOT EXISTS plan_apis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid REFERENCES rate_plans(id) ON DELETE CASCADE,
    api_id uuid REFERENCES apis(id) ON DELETE CASCADE,
    enabled boolean DEFAULT false,
    credit_cost integer DEFAULT 0,
    buy_price numeric(10,2) DEFAULT 0,
    sell_price numeric(10,2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(plan_id, api_id)
);

ALTER TABLE plan_apis ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_plan_apis_updated_at
    BEFORE UPDATE ON plan_apis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. API Keys Table (Explicit Linking to APIs)
CREATE TABLE IF NOT EXISTS api_keys (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id uuid NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    api_key text NOT NULL,
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    usage_count integer DEFAULT 0,
    last_used timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(api_id) -- One key per API
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Officers Table
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
    plan_id uuid REFERENCES rate_plans(id) ON DELETE SET NULL,
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

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_officers_updated_at
    BEFORE UPDATE ON officers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for officers
CREATE INDEX idx_officers_status ON officers(status);
CREATE INDEX idx_officers_plan_id ON officers(plan_id);
CREATE INDEX idx_officers_created_at ON officers(created_at);

-- 7. Officer Registrations Table
CREATE TABLE IF NOT EXISTS officer_registrations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    mobile text UNIQUE NOT NULL,
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

ALTER TABLE officer_registrations ENABLE ROW LEVEL SECURITY;

-- 8. Queries Table
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

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Create indexes for queries
CREATE INDEX idx_queries_officer_id ON queries(officer_id);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_queries_created_at ON queries(created_at);

-- 9. Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id uuid REFERENCES officers(id) ON DELETE CASCADE,
    officer_name text NOT NULL,
    action text NOT NULL CHECK (action IN ('Renewal', 'Deduction', 'Top-up', 'Refund')),
    credits integer NOT NULL,
    payment_mode text DEFAULT 'Department Budget',
    remarks text,
    processed_by uuid,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes for credit transactions
CREATE INDEX idx_credit_transactions_officer_id ON credit_transactions(officer_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- 10. Live Requests Table
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

ALTER TABLE live_requests ENABLE ROW LEVEL SECURITY;

-- 11. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_by text,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Insert default APIs
INSERT INTO apis (name, type, service_provider, global_buy_price, global_sell_price, default_credit_charge, description) VALUES
('Phone Prefill V2', 'PRO', 'Signzy', 5.00, 10.00, 2, 'Advanced phone number verification with user data prefill'),
('RC Verification', 'PRO', 'Surepass', 3.00, 6.00, 1, 'Vehicle registration certificate verification'),
('Credit History', 'PRO', 'CIBIL', 15.00, 25.00, 5, 'Credit history and score verification'),
('Cell ID Location', 'PRO', 'TelecomAPI', 8.00, 15.00, 3, 'Cell tower location and coverage mapping'),
('Email Validator', 'FREE', 'Internal', 0.00, 0.00, 0, 'Basic email address validation and verification'),
('Social Media Scan', 'FREE', 'Internal', 0.00, 0.00, 0, 'Social media platform username scanning'),
('Phone Number Lookup', 'FREE', 'TrueCaller', 0.00, 0.00, 0, 'Basic phone number information lookup')
ON CONFLICT (name) DO NOTHING;

-- Insert default rate plans
INSERT INTO rate_plans (plan_name, user_type, monthly_fee, default_credits) VALUES
('Police Basic', 'Police', 500.00, 50),
('Police Pro', 'Police', 1500.00, 200),
('Police Enterprise', 'Police', 5000.00, 1000),
('Private Investigator', 'Private', 2000.00, 100),
('Corporate Security', 'Custom', 10000.00, 500)
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
INSERT INTO admin_users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@pickme.intel', '$2b$10$YWRtaW4xMjM=', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Row Level Security Policies

-- Admin Users Policies
CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- APIs Policies
CREATE POLICY "Admins can manage APIs" ON apis
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Rate Plans Policies
CREATE POLICY "Admins can manage rate plans" ON rate_plans
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Plan APIs Policies
CREATE POLICY "Admins can manage plan APIs" ON plan_apis
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- API Keys Policies (Admin only - never expose to officers)
CREATE POLICY "Admins can manage API keys" ON api_keys
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Officers Policies
CREATE POLICY "Admins can select all officers" ON officers
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert officers" ON officers
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update officers" ON officers
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can delete officers" ON officers
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Officers can read own profile" ON officers
    FOR SELECT TO authenticated
    USING (auth.uid()::text = id::text);

CREATE POLICY "Officers can update own profile" ON officers
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Queries Policies
CREATE POLICY "Officers can view own queries" ON queries
    FOR SELECT TO public
    USING (auth.uid()::text = officer_id::text);

CREATE POLICY "Officers can insert own queries" ON queries
    FOR INSERT TO public
    WITH CHECK (auth.uid()::text = officer_id::text);

CREATE POLICY "Admins can view all queries" ON queries
    FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text));

-- Credit Transactions Policies
CREATE POLICY "Admins can manage credit transactions" ON credit_transactions
    FOR ALL TO public
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id::text = auth.uid()::text));

-- Live Requests Policies (Admin only for monitoring)
CREATE POLICY "Admins can view live requests" ON live_requests
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "System can insert live requests" ON live_requests
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "System can update live requests" ON live_requests
    FOR UPDATE TO public
    USING (true);