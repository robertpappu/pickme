import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface OfficerUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  telegram_id?: string;
  plan_id?: string;
  credits_remaining: number;
  total_credits: number;
  status: string;
  department?: string;
  rank?: string;
  badge_number?: string;
}

interface OfficerAuthContextType {
  officer: OfficerUser | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const OfficerAuthContext = createContext<OfficerAuthContextType | undefined>(undefined);

export const useOfficerAuth = () => {
  const context = useContext(OfficerAuthContext);
  if (!context) {
    throw new Error('useOfficerAuth must be used within an OfficerAuthProvider');
  }
  return context;
};

interface OfficerAuthProviderProps {
  children: ReactNode;
}

// Mock officer database
const mockOfficers = [
  {
    id: '1',
    name: 'Inspector Ramesh Kumar',
    mobile: '+91 9791103607',
    email: 'ramesh@police.gov.in',
    password: 'officer123',
    telegram_id: '@rameshcop',
    plan_id: null, // Will be set when plans are assigned
    credits_remaining: 32,
    total_credits: 50,
    status: 'Active',
    department: 'Cyber Crime',
    rank: 'Inspector',
    badge_number: 'CC001'
  },
  {
    id: '2',
    name: 'ASI Priya Sharma',
    mobile: '+91 9876543210',
    email: 'priya@police.gov.in',
    password: 'officer123',
    telegram_id: '@priyacop',
    plan_id: null,
    credits_remaining: 45,
    total_credits: 50,
    status: 'Active',
    department: 'Intelligence',
    rank: 'Assistant Sub Inspector',
    badge_number: 'INT002'
  },
  {
    id: '3',
    name: 'SI Rajesh Patel',
    mobile: '+91 9123456789',
    email: 'rajesh@police.gov.in',
    password: 'officer123',
    telegram_id: '@rajeshcop',
    plan_id: null,
    credits_remaining: 12,
    total_credits: 50,
    status: 'Active',
    department: 'Crime Branch',
    rank: 'Sub Inspector',
    badge_number: 'CB003'
  }
];

// Function to authenticate officer with Supabase
const authenticateWithSupabase = async (identifier: string, password: string) => {
  try {
    // First, try to find the officer by email or mobile
    const { data: officers, error } = await supabase
      .from('officers')
      .select('*')
      .or(`email.eq.${identifier},mobile.eq.${identifier}`)
      .eq('status', 'Active')
      .limit(1);

    if (error) throw error;
    
    if (!officers || officers.length === 0) {
      throw new Error('Officer not found');
    }

    const officer = officers[0];
    
    // Verify password hash
    // Check if the password hash contains the base64 encoded password (our simple hashing method)
    const expectedHash = `$2b$10$${btoa(password).slice(0, 53)}`;
    const passwordMatch = officer.password_hash === expectedHash;
    
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    return {
      id: officer.id,
      name: officer.name,
      mobile: officer.mobile,
      email: officer.email,
      telegram_id: officer.telegram_id,
      plan_id: officer.plan_id,
      credits_remaining: officer.credits_remaining,
      total_credits: officer.total_credits,
      status: officer.status,
      department: officer.department,
      rank: officer.rank,
      badge_number: officer.badge_number
    };
  } catch (error) {
    console.error('Supabase authentication error:', error);
    throw error;
  }
};

export const OfficerAuthProvider: React.FC<OfficerAuthProviderProps> = ({ children }) => {
  const [officer, setOfficer] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedOfficer = localStorage.getItem('officer_auth_user');
    if (storedOfficer) {
      try {
        const officerData = JSON.parse(storedOfficer);
        setOfficer(officerData);
      } catch (error) {
        localStorage.removeItem('officer_auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Try Supabase authentication first
      const officerData = await authenticateWithSupabase(identifier, password);
      setOfficer(officerData);
      localStorage.setItem('officer_auth_user', JSON.stringify(officerData));
      toast.success(`Welcome back, ${officerData.name}!`);
      setIsLoading(false);
      return;
    } catch (supabaseError) {
      console.log('Supabase auth failed, trying mock data:', supabaseError);
    }
    
    // Find officer in mock database
    const foundOfficer = mockOfficers.find(o => 
      (o.email === identifier || o.mobile === identifier || o.mobile.replace('+91 ', '') === identifier) && 
      o.password === password
    );
    
    if (foundOfficer) {
      const officerData: OfficerUser = {
        id: foundOfficer.id,
        name: foundOfficer.name,
        mobile: foundOfficer.mobile,
        email: foundOfficer.email,
        telegram_id: foundOfficer.telegram_id,
        plan_id: foundOfficer.plan_id,
        credits_remaining: foundOfficer.credits_remaining,
        total_credits: foundOfficer.total_credits,
        status: foundOfficer.status,
        department: foundOfficer.department,
        rank: foundOfficer.rank,
        badge_number: foundOfficer.badge_number
      };
      
      setOfficer(officerData);
      localStorage.setItem('officer_auth_user', JSON.stringify(officerData));
      toast.success(`Welcome back, ${officerData.name}!`);
    } else {
      toast.error('Invalid credentials');
      throw new Error('Invalid credentials');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setOfficer(null);
    localStorage.removeItem('officer_auth_user');
    toast.success('Logged out successfully');
  };

  return (
    <OfficerAuthContext.Provider value={{ officer, login, logout, isLoading }}>
      {children}
    </OfficerAuthContext.Provider>
  );
};