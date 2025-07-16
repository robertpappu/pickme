import { useState, useEffect } from 'react';
import { supabase, Officer, CreditTransaction, APIKey, Query, OfficerRegistration, LiveRequest, API, RatePlan, PlanAPI } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useSupabaseData = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [registrations, setRegistrations] = useState<OfficerRegistration[]>([]);
  const [liveRequests, setLiveRequests] = useState<LiveRequest[]>([]);
  const [apis, setAPIs] = useState<API[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [planAPIs, setPlanAPIs] = useState<PlanAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Load all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadOfficers(),
        loadTransactions(),
        loadAPIKeys(),
        loadQueries(),
        loadRegistrations(),
        loadLiveRequests(),
        loadAPIs(),
        loadRatePlans(),
        loadPlanAPIs()
      ]);
      calculateDashboardStats();
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfficers = async () => {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setOfficers(data || []);
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setTransactions(data || []);
  };

  const loadAPIKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setAPIKeys(data || []);
  };

  const loadQueries = async () => {
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    setQueries(data || []);
  };

  const loadRegistrations = async () => {
    const { data, error } = await supabase
      .from('officer_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setRegistrations(data || []);
  };

  const loadLiveRequests = async () => {
    const { data, error } = await supabase
      .from('live_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    setLiveRequests(data || []);
  };

  const loadAPIs = async () => {
    const { data, error } = await supabase
      .from('apis')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setAPIs(data || []);
  };

  const loadRatePlans = async () => {
    const { data, error } = await supabase
      .from('rate_plans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setRatePlans(data || []);
  };

  const loadPlanAPIs = async () => {
    const { data, error } = await supabase
      .from('plan_apis')
      .select('*');
    
    if (error) throw error;
    setPlanAPIs(data || []);
  };

  const calculateDashboardStats = () => {
    const stats = {
      total_officers: officers.length,
      active_officers: officers.filter(o => o.status === 'Active').length,
      total_queries_today: queries.filter(q => {
        const today = new Date().toDateString();
        return new Date(q.created_at).toDateString() === today;
      }).length,
      successful_queries: queries.filter(q => q.status === 'Success').length,
      failed_queries: queries.filter(q => q.status === 'Failed').length,
      total_credits_used: transactions
        .filter(t => t.action === 'Deduction')
        .reduce((sum, t) => sum + Math.abs(t.credits), 0),
      revenue_today: 0,
      average_response_time: 1.8
    };
    setDashboardStats(stats);
  };

  // CRUD Operations for Officers
  const addOfficer = async (officerData: Omit<Officer, 'id' | 'created_at' | 'updated_at' | 'registered_on' | 'last_active' | 'total_queries'>) => {
    try {
      // Extract password and remove it from the data object
      const { password, ...officerDataWithoutPassword } = officerData as any;
      
      // Hash the password before storing (in a real app, this should be done on the server)
      const passwordHash = `$2b$10$${btoa(password || 'defaultpass').slice(0, 53)}`;
      
      const { data, error } = await supabase
        .from('officers')
        .insert([{
          ...officerDataWithoutPassword,
          password_hash: passwordHash,
          total_queries: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      await loadOfficers();
      toast.success('Officer added successfully!');
      return data;
    } catch (error: any) {
      toast.error(`Failed to add officer: ${error.message}`);
      throw error;
    }
  };

  const updateOfficer = async (id: string, updates: Partial<Officer>) => {
    try {
      // Extract password and remove it from the updates object
      const { password, ...updatesWithoutPassword } = updates as any;
      
      // Prepare the update data
      const updateData = { ...updatesWithoutPassword };
      
      // If password is being updated, hash it
      if (password && password.trim()) {
        updateData.password_hash = `$2b$10$${btoa(password).slice(0, 53)}`;
      }
      
      const { error } = await supabase
        .from('officers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await loadOfficers();
      toast.success('Officer updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update officer: ${error.message}`);
      throw error;
    }
  };

  const deleteOfficer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('officers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadOfficers();
      toast.success('Officer deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete officer: ${error.message}`);
      throw error;
    }
  };

  // CRUD Operations for Credit Transactions
  const addTransaction = async (transactionData: Omit<CreditTransaction, 'id' | 'created_at'>) => {
    try {
      // First, add the transaction
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      // Then update officer credits
      const officer = officers.find(o => o.id === transactionData.officer_id);
      if (officer) {
        const creditChange = transactionData.action === 'Deduction' 
          ? -Math.abs(transactionData.credits)
          : Math.abs(transactionData.credits);

        const newCreditsRemaining = Math.max(0, officer.credits_remaining + creditChange);
        const newTotalCredits = ['Renewal', 'Top-up'].includes(transactionData.action)
          ? officer.total_credits + Math.abs(transactionData.credits)
          : officer.total_credits;

        await updateOfficer(transactionData.officer_id, {
          credits_remaining: newCreditsRemaining,
          total_credits: newTotalCredits
        });
      }

      await loadTransactions();
      return data;
    } catch (error: any) {
      toast.error(`Failed to add transaction: ${error.message}`);
      throw error;
    }
  };

  // CRUD Operations for API Keys
  const addAPIKey = async (apiKeyData: Omit<APIKey, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used'>) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          ...apiKeyData,
          usage_count: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      await loadAPIKeys();
      toast.success('API key added successfully!');
      return data;
    } catch (error: any) {
      toast.error(`Failed to add API key: ${error.message}`);
      throw error;
    }
  };

  const updateAPIKey = async (id: string, updates: Partial<APIKey>) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await loadAPIKeys();
      toast.success('API key updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update API key: ${error.message}`);
      throw error;
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadAPIKeys();
      toast.success('API key deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete API key: ${error.message}`);
      throw error;
    }
  };

  // Registration Management
  const updateRegistration = async (id: string, updates: Partial<OfficerRegistration>) => {
    try {
      const { error } = await supabase
        .from('officer_registrations')
        .update({
          ...updates,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      await loadRegistrations();
      
      // If approved, create officer account
      if (updates.status === 'approved') {
        const registration = registrations.find(r => r.id === id);
        if (registration) {
          await addOfficer({
            name: registration.name,
            email: registration.email,
            mobile: registration.mobile,
            telegram_id: `@${registration.name.toLowerCase().replace(/\s+/g, '')}`,
            status: 'Active',
            department: registration.department,
            rank: registration.rank,
            badge_number: registration.badge_number,
            station: registration.station,
            credits_remaining: 50,
            total_credits: 50
          });
        }
      }
      
      toast.success(`Registration ${updates.status} successfully!`);
    } catch (error: any) {
      toast.error(`Failed to update registration: ${error.message}`);
      throw error;
    }
  };

  // Rate Plan Management
  const addRatePlan = async (planData: Omit<RatePlan, 'id' | 'created_at' | 'updated_at'>, apiSettings: any[]) => {
    try {
      // Create the rate plan
      const { data: plan, error: planError } = await supabase
        .from('rate_plans')
        .insert([planData])
        .select()
        .single();

      if (planError) throw planError;

      // Create plan-API relationships
      if (apiSettings.length > 0) {
        const planAPIData = apiSettings.map(api => ({
          plan_id: plan.id,
          api_id: api.api_id,
          enabled: api.enabled,
          credit_cost: api.credit_cost,
          buy_price: api.buy_price,
          sell_price: api.sell_price
        }));

        const { error: planAPIError } = await supabase
          .from('plan_apis')
          .insert(planAPIData);

        if (planAPIError) throw planAPIError;
      }

      await Promise.all([loadRatePlans(), loadPlanAPIs()]);
      toast.success('Rate plan created successfully!');
      return plan;
    } catch (error: any) {
      toast.error(`Failed to create rate plan: ${error.message}`);
      throw error;
    }
  };

  const updateRatePlan = async (id: string, updates: Partial<RatePlan>, apiSettings?: any[]) => {
    try {
      const { error: planError } = await supabase
        .from('rate_plans')
        .update(updates)
        .eq('id', id);

      if (planError) throw planError;

      // Update API settings if provided
      if (apiSettings) {
        // Delete existing plan-API relationships
        await supabase
          .from('plan_apis')
          .delete()
          .eq('plan_id', id);

        // Insert new relationships
        if (apiSettings.length > 0) {
          const planAPIData = apiSettings.map(api => ({
            plan_id: id,
            api_id: api.api_id,
            enabled: api.enabled,
            credit_cost: api.credit_cost,
            buy_price: api.buy_price,
            sell_price: api.sell_price
          }));

          const { error: planAPIError } = await supabase
            .from('plan_apis')
            .insert(planAPIData);

          if (planAPIError) throw planAPIError;
        }
      }

      await Promise.all([loadRatePlans(), loadPlanAPIs()]);
      toast.success('Rate plan updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update rate plan: ${error.message}`);
      throw error;
    }
  };

  const deleteRatePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rate_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await Promise.all([loadRatePlans(), loadPlanAPIs()]);
      toast.success('Rate plan deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete rate plan: ${error.message}`);
      throw error;
    }
  };

  // API Management
  const addAPI = async (apiData: Omit<API, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('apis')
        .insert([apiData])
        .select()
        .single();

      if (error) throw error;
      
      await loadAPIs();
      toast.success('API added successfully!');
      return data;
    } catch (error: any) {
      toast.error(`Failed to add API: ${error.message}`);
      throw error;
    }
  };

  const updateAPI = async (id: string, updates: Partial<API>) => {
    try {
      const { error } = await supabase
        .from('apis')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await loadAPIs();
      toast.success('API updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update API: ${error.message}`);
      throw error;
    }
  };

  const deleteAPI = async (id: string) => {
    try {
      const { error } = await supabase
        .from('apis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadAPIs();
      toast.success('API deleted successfully!');
    } catch (error: any) {
      toast.error(`Failed to delete API: ${error.message}`);
      throw error;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate stats when data changes
  useEffect(() => {
    if (!isLoading) {
      calculateDashboardStats();
    }
  }, [officers, queries, transactions, isLoading]);

  return {
    // Data
    officers,
    transactions,
    apiKeys,
    queries,
    registrations,
    liveRequests,
    apis,
    ratePlans,
    planAPIs,
    dashboardStats,
    isLoading,
    
    // Actions
    loadData,
    addOfficer,
    updateOfficer,
    deleteOfficer,
    addTransaction,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    updateRegistration,
    addRatePlan,
    updateRatePlan,
    deleteRatePlan,
    addAPI,
    updateAPI,
    deleteAPI,
    
    // Setters for local updates
    setOfficers,
    setTransactions,
    setAPIKeys,
    setQueries,
    setRegistrations,
    setLiveRequests,
    setAPIs,
    setRatePlans,
    setPlanAPIs
  };
};