import { useState, useEffect } from 'react';
import { Officer, QueryRequest, CreditTransaction, APIKey, LiveRequest, DashboardStats } from '../types';

// Enhanced Mock Data Generators
export const generateMockOfficers = (): Officer[] => {
  return [
    {
      id: '1',
      name: 'Inspector Ramesh Kumar',
      mobile: '+91 9791103607',
      telegram_id: '@rameshcop',
      status: 'Active',
      registered_on: '2025-06-20',
      last_active: '2025-06-28 15:22',
      credits_remaining: 32,
      total_credits: 50,
      total_queries: 146,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: '2',
      name: 'ASI Priya Sharma',
      mobile: '+91 9876543210',
      telegram_id: '@priyacop',
      status: 'Active',
      registered_on: '2025-06-15',
      last_active: '2025-06-28 14:45',
      credits_remaining: 45,
      total_credits: 50,
      total_queries: 89,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: '3',
      name: 'SI Rajesh Patel',
      mobile: '+91 9123456789',
      telegram_id: '@rajeshcop',
      status: 'Suspended',
      registered_on: '2025-06-10',
      last_active: '2025-06-25 10:30',
      credits_remaining: 12,
      total_credits: 50,
      total_queries: 203,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: '4',
      name: 'Constable Anita Singh',
      mobile: '+91 9987654321',
      telegram_id: '@anitacop',
      status: 'Active',
      registered_on: '2025-06-22',
      last_active: '2025-06-28 16:10',
      credits_remaining: 38,
      total_credits: 50,
      total_queries: 67,
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: '5',
      name: 'Inspector Suresh Reddy',
      mobile: '+91 9555666777',
      telegram_id: '@sureshcop',
      status: 'Active',
      registered_on: '2025-05-15',
      last_active: '2025-06-28 17:30',
      credits_remaining: 28,
      total_credits: 50,
      total_queries: 234,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    },
    {
      id: '6',
      name: 'ASI Meera Joshi',
      mobile: '+91 9444555666',
      telegram_id: '@meeracop',
      status: 'Active',
      registered_on: '2025-05-20',
      last_active: '2025-06-28 12:15',
      credits_remaining: 41,
      total_credits: 50,
      total_queries: 112,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    }
  ];
};

export const generateMockQueries = (): QueryRequest[] => {
  const queries = [];
  const officers = generateMockOfficers();
  const queryTypes = ['OSINT', 'PRO'];
  const sources = ['Signzy API', 'Surepass API', 'Social Media Scraper', 'Phone Directory', 'Email Validator'];
  const statuses = ['Success', 'Failed', 'Pending'];
  
  for (let i = 0; i < 50; i++) {
    const officer = officers[Math.floor(Math.random() * officers.length)];
    const type = queryTypes[Math.floor(Math.random() * queryTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    queries.push({
      id: `query-${i + 1}`,
      officer_id: officer.id,
      officer_name: officer.name,
      type: type as 'OSINT' | 'PRO',
      input: type === 'PRO' ? `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}` : `user${i}@example.com`,
      source: sources[Math.floor(Math.random() * sources.length)],
      result_summary: `Mock result for query ${i + 1} - ${status.toLowerCase()} response`,
      credits_used: type === 'PRO' ? Math.floor(Math.random() * 3) + 1 : 0,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
      status: status as 'Success' | 'Failed' | 'Pending'
    });
  }
  
  return queries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockTransactions = (): CreditTransaction[] => {
  const transactions = [];
  const officers = generateMockOfficers();
  const actions = ['Renewal', 'Deduction', 'Top-up', 'Refund'];
  
  for (let i = 0; i < 30; i++) {
    const officer = officers[Math.floor(Math.random() * officers.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    transactions.push({
      id: `txn-${i + 1}`,
      officer_id: officer.id,
      officer_name: officer.name,
      action: action as 'Renewal' | 'Deduction' | 'Top-up' | 'Refund',
      credits: action === 'Deduction' ? -(Math.floor(Math.random() * 5) + 1) : Math.floor(Math.random() * 50) + 10,
      payment_mode: action === 'Deduction' ? 'Query Usage' : 'Department Budget',
      remarks: `${action} transaction for ${officer.name}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
    });
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockAPIKeys = (): APIKey[] => {
  return [
    {
      id: '1',
      name: 'Signzy Phone Verification',
      provider: 'Signzy',
      key: 'sk_test_4f8b2c1a9e3d7f6b5a8c9e2d1f4b7a3c',
      status: 'Active',
      last_used: '2025-06-28 15:22',
      usage_count: 1245
    },
    {
      id: '2',
      name: 'Surepass Identity Verification',
      provider: 'Surepass',
      key: 'sp_live_7a3c9e2d1f4b8c5a9e3d7f6b1a4c8e2d',
      status: 'Active',
      last_used: '2025-06-28 16:10',
      usage_count: 856
    },
    {
      id: '3',
      name: 'TrueCaller API',
      provider: 'TrueCaller',
      key: 'tc_api_2d1f4b8c5a9e3d7f6b1a4c8e2d7f3b9c',
      status: 'Active',
      last_used: '2025-06-28 14:30',
      usage_count: 432
    },
    {
      id: '4',
      name: 'Email Validator Pro',
      provider: 'EmailValidator',
      key: 'ev_pro_8c5a9e3d7f6b1a4c8e2d7f3b9c5a2e1f',
      status: 'Inactive',
      last_used: '2025-06-25 11:45',
      usage_count: 234
    }
  ];
};

export const generateMockLiveRequests = (): LiveRequest[] => {
  const requests = [];
  const officers = ['+91 9791103607', '+91 9876543210', '+91 9123456789', '+91 9987654321'];
  const types = ['OSINT', 'PRO'];
  const queries = ['Phone verification', 'Email check', 'Social media scan', 'Identity verification'];
  const statuses = ['Processing', 'Success', 'Failed'];
  
  for (let i = 0; i < 15; i++) {
    requests.push({
      id: `live-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toLocaleString(),
      officer: officers[Math.floor(Math.random() * officers.length)],
      type: types[Math.floor(Math.random() * types.length)] as 'OSINT' | 'PRO',
      query: queries[Math.floor(Math.random() * queries.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'Processing' | 'Success' | 'Failed'
    });
  }
  
  return requests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generateMockDashboardStats = (): DashboardStats => {
  return {
    total_officers: 0,
    active_officers: 0,
    total_queries_today: 0,
    successful_queries: 0,
    failed_queries: 0,
    total_credits_used: 0,
    revenue_today: 0,
    average_response_time: 1.8
  };
};

// Registration requests mock data
export const generateMockRegistrations = () => {
  return [
    {
      id: '1',
      name: 'Inspector Rajesh Patel',
      email: 'rajesh.patel@police.gov.in',
      mobile: '+91 9876543210',
      station: 'Central Police Station',
      department: 'Cyber Crime',
      rank: 'Inspector',
      badge_number: 'CC002',
      additional_info: 'Specialized in cybercrime investigations with 8 years experience',
      status: 'pending',
      submitted_at: '2025-01-03 14:30'
    },
    {
      id: '2',
      name: 'ASI Priya Sharma',
      email: 'priya.sharma@police.gov.in',
      mobile: '+91 9123456789',
      station: 'North District Police',
      department: 'Intelligence',
      rank: 'Assistant Sub Inspector',
      badge_number: 'INT003',
      additional_info: 'Intelligence gathering and analysis specialist',
      status: 'pending',
      submitted_at: '2025-01-03 11:15'
    },
    {
      id: '3',
      name: 'Constable Amit Kumar',
      email: 'amit.kumar@police.gov.in',
      mobile: '+91 9987654321',
      station: 'Traffic Police Station',
      department: 'Traffic',
      rank: 'Constable',
      badge_number: 'TR005',
      additional_info: 'Traffic enforcement and vehicle verification',
      status: 'approved',
      submitted_at: '2025-01-02 16:45',
      reviewed_at: '2025-01-03 09:30',
      reviewed_by: 'Admin User'
    }
  ];
};

export const useData = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [queries, setQueries] = useState<QueryRequest[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [liveRequests, setLiveRequests] = useState<LiveRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading delay
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOfficers(generateMockOfficers());
      setQueries(generateMockQueries());
      setTransactions(generateMockTransactions());
      setAPIKeys(generateMockAPIKeys());
      setLiveRequests(generateMockLiveRequests());
      setDashboardStats(generateMockDashboardStats());
      setRegistrations(generateMockRegistrations());
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Simulate live request updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRequests(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const randomIndex = Math.floor(Math.random() * updated.length);
          const statuses: ('Processing' | 'Success' | 'Failed')[] = ['Processing', 'Success', 'Failed'];
          updated[randomIndex].status = statuses[Math.floor(Math.random() * statuses.length)];
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Add new functions for data manipulation
  const addOfficer = (officer: Omit<Officer, 'id'>) => {
    const newOfficer = { ...officer, id: Date.now().toString() };
    setOfficers(prev => [...prev, newOfficer]);
    return newOfficer;
  };

  const updateOfficer = (id: string, updates: Partial<Officer>) => {
    setOfficers(prev => prev.map(officer => 
      officer.id === id ? { ...officer, ...updates } : officer
    ));
  };

  const deleteOfficer = (id: string) => {
    setOfficers(prev => prev.filter(officer => officer.id !== id));
  };

  const addTransaction = (transaction: Omit<CreditTransaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const addAPIKey = (apiKey: Omit<APIKey, 'id' | 'usage_count' | 'last_used'>) => {
    const newAPIKey = { 
      ...apiKey, 
      id: Date.now().toString(),
      usage_count: 0,
      last_used: 'Never'
    };
    setAPIKeys(prev => [...prev, newAPIKey]);
    return newAPIKey;
  };

  const updateAPIKey = (id: string, updates: Partial<APIKey>) => {
    setAPIKeys(prev => prev.map(apiKey => 
      apiKey.id === id ? { ...apiKey, ...updates } : apiKey
    ));
  };

  const deleteAPIKey = (id: string) => {
    setAPIKeys(prev => prev.filter(apiKey => apiKey.id !== id));
  };

  const updateRegistration = (id: string, updates: any) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === id ? { ...reg, ...updates } : reg
    ));
  };

  return {
    officers,
    queries,
    transactions,
    apiKeys,
    liveRequests,
    dashboardStats,
    registrations,
    isLoading,
    setOfficers,
    setQueries,
    setTransactions,
    setAPIKeys,
    setRegistrations,
    addOfficer,
    updateOfficer,
    deleteOfficer,
    addTransaction,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    updateRegistration
  };
};