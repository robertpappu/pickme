/*
  # Rate Plans and API Management System

  1. New Tables
    - `rate_plans` - Store subscription plans (Police 500, Police 1000, etc.)
    - `apis` - Master list of available APIs with global settings
    - `plan_apis` - Junction table linking plans to APIs with specific settings
  
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
  
  3. Features
    - Plan creation with user types and pricing
    - API management with FREE/PRO types
    - Per-plan API configuration with custom pricing
    - Credit system integration
*/

-- Create APIs table (master list)
CREATE TABLE IF NOT EXISTS apis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('FREE', 'PRO', 'DISABLED')),
  global_buy_price decimal(10,2) DEFAULT 0,
  global_sell_price decimal(10,2) DEFAULT 0,
  default_credit_charge integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rate_plans table
CREATE TABLE IF NOT EXISTS rate_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('Police', 'Private', 'Custom')),
  monthly_fee decimal(10,2) NOT NULL,
  default_credits integer NOT NULL,
  renewal_required boolean DEFAULT true,
  topup_allowed boolean DEFAULT true,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plan_apis junction table (links plans to APIs with specific settings)
CREATE TABLE IF NOT EXISTS plan_apis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES rate_plans(id) ON DELETE CASCADE,
  api_id uuid REFERENCES apis(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false,
  credit_cost integer DEFAULT 0,
  buy_price decimal(10,2) DEFAULT 0,
  sell_price decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, api_id)
);

-- Enable RLS
ALTER TABLE apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_apis ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage APIs"
  ON apis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage rate plans"
  ON rate_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage plan APIs"
  ON plan_apis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apis_updated_at BEFORE UPDATE ON apis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rate_plans_updated_at BEFORE UPDATE ON rate_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_apis_updated_at BEFORE UPDATE ON plan_apis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default APIs
INSERT INTO apis (name, type, global_buy_price, global_sell_price, default_credit_charge, description) VALUES
('Phone Prefill V2', 'PRO', 6.00, 10.00, 1, 'Advanced phone number verification and details'),
('RC Verification', 'PRO', 15.00, 20.00, 2, 'Vehicle registration certificate verification'),
('OSINT Social Scan', 'FREE', 0.00, 0.00, 0, 'Open source intelligence social media scanning'),
('Cell ID Location', 'PRO', 25.00, 30.00, 3, 'Cell tower location tracking'),
('PAN Verification', 'PRO', 8.00, 12.00, 1, 'PAN card verification service')
ON CONFLICT DO NOTHING;