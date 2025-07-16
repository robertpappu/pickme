/*
  # Add existing API keys to APIs table

  1. New API Entries
    - `Signzy Phone Verification` (PRO, ₹8 buy, ₹12 sell, 1 credit)
    - `Surepass Identity Verification` (PRO, ₹8 buy, ₹12 sell, 1 credit)
    - `TrueCaller API` (PRO, ₹8 buy, ₹12 sell, 1 credit)

  2. Purpose
    - Migrate existing API key names from api_keys table to apis table
    - Ensure these APIs appear in Rate Plans → API Management tab
    - Enable proper interconnection between API definitions and API keys
*/

-- Insert the three existing API services into the apis table
INSERT INTO public.apis (name, type, global_buy_price, global_sell_price, default_credit_charge, description)
VALUES 
  ('Signzy Phone Verification', 'PRO', 8.00, 12.00, 1, 'Phone number verification and validation service'),
  ('Surepass Identity Verification', 'PRO', 8.00, 12.00, 1, 'Identity verification and KYC service'),
  ('TrueCaller API', 'PRO', 8.00, 12.00, 1, 'Caller identification and phone lookup service')
ON CONFLICT (name) DO NOTHING;