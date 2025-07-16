/*
  # Officer Registration Requests Table
  
  1. New Table
    - `officer_registration_requests` - Stores officer registration requests for admin approval
    
  2. Security
    - Enable RLS on the table
    - Add policies for admin management
    
  3. Indexes
    - Performance optimization for status and date queries
*/

-- Officer Registration Requests Table
CREATE TABLE IF NOT EXISTS officer_registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  station text NOT NULL,
  department text,
  rank text,
  badge_number text,
  additional_info text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES admin_users(id),
  approved_at timestamptz,
  rejected_by uuid REFERENCES admin_users(id),
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE officer_registration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage registration requests"
  ON officer_registration_requests
  FOR ALL
  TO authenticated
  USING (true);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_officer_registration_status ON officer_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_officer_registration_created_at ON officer_registration_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_officer_registration_email ON officer_registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_officer_registration_mobile ON officer_registration_requests(mobile);

-- Trigger for updated_at
CREATE TRIGGER update_officer_registration_requests_updated_at 
  BEFORE UPDATE ON officer_registration_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();