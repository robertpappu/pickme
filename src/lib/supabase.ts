import { createClient } from '@supabase/supabase-js';

// For demo purposes, use placeholder values if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create a mock client if no real Supabase credentials are provided
const isDemo = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = isDemo ? 
  // Mock Supabase client for demo mode
  {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null })
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signIn: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  } as any :
  createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Officer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  telegram_id?: string;
  password?: string; // For form handling only
  password_hash?: string; // Stored in database
  status: 'Active' | 'Suspended';
  department?: string;
  rank?: string;
  badge_number?: string;
  station?: string;
  credits_remaining: number;
  total_credits: number;
  total_queries: number;
  last_active: string;
  registered_on: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  officer_id: string;
  officer_name: string;
  action: 'Renewal' | 'Deduction' | 'Top-up' | 'Refund';
  credits: number;
  payment_mode: string;
  remarks?: string;
  created_at: string;
}

export interface APIKey {
  id: string;
  name: string;
  provider: string;
  api_key: string;
  status: 'Active' | 'Inactive';
  usage_count: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface Query {
  id: string;
  officer_id: string;
  officer_name: string;
  type: 'OSINT' | 'PRO';
  category: string;
  input_data: string;
  source?: string;
  result_summary?: string;
  full_result?: any;
  credits_used: number;
  status: 'Processing' | 'Success' | 'Failed' | 'Pending';
  created_at: string;
}

export interface OfficerRegistration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  station: string;
  department?: string;
  rank?: string;
  badge_number?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface LiveRequest {
  id: string;
  officer_id: string;
  officer_name: string;
  type: 'OSINT' | 'PRO';
  query_text: string;
  status: 'Processing' | 'Success' | 'Failed';
  response_time_ms?: number;
  created_at: string;
  completed_at?: string;
}

export interface API {
  id: string;
  name: string;
  type: 'FREE' | 'PRO' | 'DISABLED';
  service_provider: string;
  global_buy_price: number;
  global_sell_price: number;
  default_credit_charge: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RatePlan {
  id: string;
  plan_name: string;
  user_type: 'Police' | 'Private' | 'Custom';
  monthly_fee: number;
  default_credits: number;
  renewal_required: boolean;
  topup_allowed: boolean;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface PlanAPI {
  id: string;
  plan_id: string;
  api_id: string;
  enabled: boolean;
  credit_cost: number;
  buy_price: number;
  sell_price: number;
  created_at: string;
  updated_at: string;
}