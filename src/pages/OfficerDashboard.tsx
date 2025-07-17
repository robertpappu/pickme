import React, { useState, useEffect } from 'react';
import { 
  Search, CreditCard, History, User, LogOut, Zap, Phone, Mail, Globe, ArrowLeft, 
  Shield, Car, Smartphone, MapPin, Link as LinkIcon, Bell, Settings, 
  Plus, Eye, Download, Filter, Calendar, Clock, CheckCircle, XCircle,
  Wifi, Database, CreditCard as CreditCardIcon, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useOfficerAuth } from '../contexts/OfficerAuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';

interface QueryResult {
  id: string;
  type: 'OSINT' | 'PRO';
  category: string;
  input: string;
  result_summary: string;
  full_result?: any;
  credits_used: number;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Processing';
}

interface TrackLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  created: string;
  status: 'Active' | 'Expired';
}

export const OfficerDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { officer, logout } = useOfficerAuth();
  const { apiKeys, getOfficerEnabledAPIs, addQuery, updateOfficer } = useSupabaseData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('mobile-check');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [trackLinks, setTrackLinks] = useState<TrackLink[]>([]);
  const [notifications, setNotifications] = useState(3);
  const [detailedResult, setDetailedResult] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Calculate real stats from user's actual data
  const todaysQueries = results.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.timestamp).toDateString() === today;
  }).length;
  
  const successfulQueries = results.filter(r => r.status === 'Success').length;
  const totalQueries = results.length;
  const successRate = totalQueries > 0 ? Math.round((successfulQueries / totalQueries) * 100) : 0;
  const creditsUsed = results.reduce((sum, r) => sum + r.credits_used, 0);
  const activeLinks = trackLinks.filter(link => link.status === 'Active').length;

  // Get officer's enabled APIs
  const enabledAPIs = officer ? getOfficerEnabledAPIs(officer.id) : [];
  
  // Check if officer has access to specific API
  const hasAPIAccess = (apiName: string) => {
    return enabledAPIs.some(api => api.name === apiName);
  };

  // Get API credit cost
  const getAPICreditCost = (apiName: string) => {
    const api = enabledAPIs.find(api => api.name === apiName);
    return api ? api.credit_cost : 0;
  };
  // Redirect if not logged in
  useEffect(() => {
    if (!officer) {
      navigate('/officer/login');
    }
  }, [officer, navigate]);

  // Initialize with empty data for new users
  useEffect(() => {
    // Initialize with empty arrays for new users
    // Data will be populated as user performs queries
    setResults([]);
    setTrackLinks([]);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = async (category: string) => {
    if (!query.trim()) return;
    
    // Check if this is a PRO query and if officer has access
    const isProQuery = ['phone-prefill', 'rc-verification', 'credit-history', 'cell-id'].includes(activeSubTab);
    
    if (isProQuery) {
      const apiName = getAPINameFromSubTab(activeSubTab);
      if (!hasAPIAccess(apiName)) {
        toast.error(`You don't have access to ${apiName}. Please contact admin to upgrade your plan.`);
        return;
      }
      
      const creditCost = getAPICreditCost(apiName);
      if (officer && officer.credits_remaining < creditCost) {
        toast.error(`Insufficient credits. Required: ${creditCost}, Available: ${officer.credits_remaining}`);
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      let apiResponse = null;
      let resultSummary = '';
      let creditsUsed = 0;
      let status: 'Success' | 'Failed' = 'Success';
      
      if (activeSubTab === 'phone-prefill' && hasAPIAccess('Phone Prefill V2')) {
        // Make actual Signzy API call
        try {
          apiResponse = await callSignzyPhonePrefillAPI(query);
          resultSummary = formatSignzyResponse(apiResponse);
          creditsUsed = getAPICreditCost('Phone Prefill V2');
        } catch (error) {
          console.error('Signzy API error:', error);
          resultSummary = 'API call failed. Please try again.';
          status = 'Failed';
        }
      } else {
        // Mock response for other APIs
        resultSummary = `Mock result for ${query} - ${category}`;
        creditsUsed = isProQuery ? Math.floor(Math.random() * 3) + 1 : 0;
      }
      
      const newResult: QueryResult = {
        id: Date.now().toString(),
        type: isProQuery ? 'PRO' : 'OSINT',
        category: category,
        input: query,
        result_summary: resultSummary,
        full_result: apiResponse,
        credits_used: creditsUsed,
        timestamp: new Date().toLocaleString(),
        status: status
      };
      
      setResults(prev => [newResult, ...prev]);
      
      // Deduct credits and log query if successful
      if (status === 'Success' && creditsUsed > 0 && officer) {
        // Update officer credits
        const newCreditsRemaining = officer.credits_remaining - creditsUsed;
        await updateOfficer(officer.id, { credits_remaining: newCreditsRemaining });
        
        // Log query in database
        await addQuery({
          officer_id: officer.id,
          officer_name: officer.name,
          type: isProQuery ? 'PRO' : 'OSINT',
          category: category,
          input_data: query,
          result_summary: resultSummary,
          full_result: apiResponse,
          credits_used: creditsUsed,
          status: status
        });
        
        toast.success(`Query successful! ${creditsUsed} credits deducted.`);
      }
      
      setQuery('');
    } catch (error) {
      console.error('Query error:', error);
      toast.error('Query failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get API name from sub-tab
  const getAPINameFromSubTab = (subTab: string) => {
    switch (subTab) {
      case 'phone-prefill':
        return 'Phone Prefill V2';
      case 'rc-verification':
        return 'RC Verification';
      case 'credit-history':
        return 'Credit History';
      case 'cell-id':
        return 'Cell ID Location';
      default:
        return '';
    }
  };

  // Signzy API call function
  const callSignzyPhonePrefillAPI = async (phoneNumber: string) => {
    // Get Signzy API key
    const signzyAPIKey = apiKeys.find(key => 
      key.name === 'Phone Prefill V2' && 
      key.provider === 'Signzy' && 
      key.status === 'Active'
    );
    
    if (!signzyAPIKey) {
      throw new Error('Signzy API key not found or inactive');
    }
    
    // Clean phone number (remove +91 if present)
    const cleanPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/\s+/g, '');
    
    const requestBody = {
      mobileNumber: cleanPhoneNumber,
      fullName: "VERIFICATION", // Placeholder as it's optional
      consent: {
        consentFlag: true,
        consentTimestamp: new Date().toISOString(),
        consentIpAddress: "127.0.0.1", // Placeholder
        consentMessageId: `consent_${Date.now()}`
      }
    };
    
    const response = await fetch('https://api-preproduction.signzy.app/api/v3/phonekyc/phone-prefill-v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${signzyAPIKey.api_key}`,
        'x-client-unique-id': 'pickme@intelligence.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  };

  // Format Signzy response for display
  const formatSignzyResponse = (response: any) => {
    if (!response || !response.result) {
      return 'No data found for this number';
    }
    
    const result = response.result;
    const parts = [];
    
    if (result.name) parts.push(`Name: ${result.name}`);
    if (result.email) parts.push(`Email: ${result.email}`);
    if (result.alternatePhone) parts.push(`Alt Phone: ${result.alternatePhone}`);
    if (result.address) parts.push(`Address: ${result.address}`);
    if (result.dob) parts.push(`DOB: ${result.dob}`);
    
    return parts.length > 0 ? parts.join(' | ') : 'Basic verification completed';
  };

  // Handle viewing detailed results
  const handleViewDetails = (result: QueryResult) => {
    setDetailedResult(result);
    setShowResultModal(true);
  };
  const mainTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Zap },
    { id: 'free-lookups', name: 'Free Lookups', icon: Search },
    { id: 'pro-lookups', name: 'PRO Lookups', icon: Shield },
    { id: 'tracklink', name: 'TrackLink', icon: LinkIcon },
    { id: 'history', name: 'History', icon: History },
    { id: 'account', name: 'Account', icon: User }
  ];

  const freeLookupTabs = [
    { id: 'mobile-check', name: 'Mobile Check', icon: Phone },
    { id: 'email-check', name: 'Email Check', icon: Mail },
    { id: 'platform-scan', name: 'Platform Scan', icon: Globe }
  ];

  // Filter PRO lookup tabs based on officer's enabled APIs
  const proLookupTabs = [
    { id: 'phone-prefill', name: 'Phone Prefill V2', icon: Phone, apiName: 'Phone Prefill V2' },
    { id: 'rc-verification', name: 'RC / IMEI / FastTag', icon: Car, apiName: 'RC Verification' },
    { id: 'credit-history', name: 'Credit History', icon: CreditCardIcon, apiName: 'Credit History' },
    { id: 'cell-id', name: 'Cell ID', icon: MapPin, apiName: 'Cell ID Location' }
  ].filter(tab => hasAPIAccess(tab.apiName));

  if (!officer) {
    return null;
  }

  const renderSearchInterface = (category: string, placeholder: string, isProQuery: boolean = false) => {
    const apiName = isProQuery ? getAPINameFromSubTab(activeSubTab) : '';
    const creditCost = isProQuery ? getAPICreditCost(apiName) : 0;
    const hasAccess = !isProQuery || hasAPIAccess(apiName);
    
    return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-muted-graphite/50 border-cyber-teal/20' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {category}
          </h3>
          {isProQuery && hasAccess && (
            <span className="text-xs px-2 py-1 rounded bg-neon-magenta/20 text-neon-magenta">
              PRO - {creditCost} Credits
            </span>
          )}
          {isProQuery && !hasAccess && (
            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
              Access Denied
            </span>
          )}
        </div>
        
        {!hasAccess && isProQuery ? (
          <div className={`p-4 rounded-lg border ${
            isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm text-red-400 mb-2`}>
              You don't have access to {apiName}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Contact your administrator to upgrade your plan and gain access to this API.
            </p>
          </div>
        ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
              isDark 
                ? 'bg-crisp-black text-white placeholder-gray-500' 
                : 'bg-white text-gray-900 placeholder-gray-400'
            }`}
          />
          
          <button
            onClick={() => handleSearch(category)}
            disabled={!query.trim() || isProcessing || !hasAccess}
            className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
        )}
      </div>
    </div>
  )};

  return (
    <div className={`min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className={`border-b border-cyber-teal/20 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 bg-cyber-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  PickMe Intelligence
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Officer Portal
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className={`relative p-2 transition-colors ${
                isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
              }`}>
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-magenta rounded-full text-xs text-white flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <button 
                onClick={handleLogout}
                className={`p-2 transition-colors ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'}`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4">
        <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-cyber-gradient rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officer.name}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {officer.mobile}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officer.credits_remaining} Credits
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                of {officer.total_credits}
              </p>
            </div>
          </div>
          
          {/* Credit Progress */}
          <div className={`w-full rounded-full h-2 ${isDark ? 'bg-crisp-black' : 'bg-gray-200'}`}>
            <div 
              className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
              style={{ width: `${(officer.credits_remaining / officer.total_credits) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4">
        <div className="flex overflow-x-auto space-x-1 mb-4 pb-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                    : isDark 
                      ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                      : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Today's Queries</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{todaysQueries}</p>
                  </div>
                  <Search className="w-6 h-6 text-cyber-teal" />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{successRate}%</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Credits Used</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{creditsUsed}</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-neon-magenta" />
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Links</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeLinks}</p>
                  </div>
                  <LinkIcon className="w-6 h-6 text-electric-blue" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {setActiveTab('free-lookups'); setActiveSubTab('mobile-check');}}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/20 text-gray-300 hover:border-cyber-teal/40' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-cyber-teal/40'
                  }`}
                >
                  <Phone className="w-6 h-6 mx-auto mb-2 text-cyber-teal" />
                  <p className="text-xs">Mobile Check</p>
                </button>
                
                <button
                  onClick={() => {setActiveTab('free-lookups'); setActiveSubTab('email-check');}}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/20 text-gray-300 hover:border-cyber-teal/40' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-cyber-teal/40'
                  }`}
                >
                  <Mail className="w-6 h-6 mx-auto mb-2 text-cyber-teal" />
                  <p className="text-xs">Email Check</p>
                </button>
                
                <button
                  onClick={() => {setActiveTab('pro-lookups'); setActiveSubTab('phone-prefill');}}
                  disabled={!hasAPIAccess('Phone Prefill V2')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    !hasAPIAccess('Phone Prefill V2')
                      ? 'bg-gray-500/10 border-gray-500/20 text-gray-500 cursor-not-allowed'
                      : isDark 
                        ? 'bg-crisp-black border-neon-magenta/20 text-gray-300 hover:border-neon-magenta/40' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-neon-magenta/40'
                  }`}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2 text-neon-magenta" />
                  <p className="text-xs">Phone Prefill</p>
                  {!hasAPIAccess('Phone Prefill V2') && (
                    <p className="text-xs text-red-400 mt-1">No Access</p>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('tracklink')}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isDark 
                      ? 'bg-crisp-black border-electric-blue/20 text-gray-300 hover:border-electric-blue/40' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-electric-blue/40'
                  }`}
                >
                  <LinkIcon className="w-6 h-6 mx-auto mb-2 text-electric-blue" />
                  <p className="text-xs">TrackLink</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${isDark ? 'bg-muted-graphite' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(0, 3).map((result) => (
                    <div key={result.id} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.type === 'PRO' 
                            ? 'bg-neon-magenta/20 text-neon-magenta' 
                            : 'bg-cyber-teal/20 text-cyber-teal'
                        }`}>
                          {result.category}
                        </span>
                        <button
                          onClick={() => handleViewDetails(result)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {result.timestamp.split(' ')[1]}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {result.input}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No recent activity. Start by performing your first query!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'free-lookups' && (
          <div className="space-y-4">
            {/* Sub Navigation */}
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {freeLookupTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      activeSubTab === tab.id
                        ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                        : isDark 
                          ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                          : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content based on sub-tab */}
            {activeSubTab === 'mobile-check' && renderSearchInterface(
              'Mobile Number Check', 
              'Enter mobile number (e.g., +91 9791103607)'
            )}
            {activeSubTab === 'email-check' && renderSearchInterface(
              'Email Address Check', 
              'Enter email address (e.g., user@example.com)'
            )}
            {activeSubTab === 'platform-scan' && renderSearchInterface(
              'Social Platform Scan', 
              'Enter username or profile URL'
            )}
          </div>
        )}

        {activeTab === 'pro-lookups' && (
          <div className="space-y-4">
            {/* Sub Navigation */}
            <div className="flex space-x-1 overflow-x-auto pb-2">
              {proLookupTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      activeSubTab === tab.id
                        ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30'
                        : isDark 
                          ? 'text-gray-400 hover:text-neon-magenta hover:bg-neon-magenta/10' 
                          : 'text-gray-600 hover:text-neon-magenta hover:bg-neon-magenta/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content based on sub-tab */}
            {activeSubTab === 'phone-prefill' && renderSearchInterface(
              'Phone Prefill V2', 
              'Enter mobile number for detailed verification',
              true
            )}
            {activeSubTab === 'rc-verification' && renderSearchInterface(
              'RC / IMEI / FastTag Verification', 
              'Enter RC number, IMEI, or FastTag ID',
              true
            )}
            {activeSubTab === 'credit-history' && renderSearchInterface(
              'Credit History Check', 
              'Enter PAN or Aadhaar number',
              true
            )}
            {activeSubTab === 'cell-id' && renderSearchInterface(
              'Cell ID Location', 
              'Enter cell tower ID or coordinates',
              true
            )}
          </div>
        )}

        {activeTab === 'tracklink' && (
          <div className="space-y-4">
            {/* TrackLink Generator */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Generate TrackLink
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter link name (e.g., Investigation #123)"
                  className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
                <input
                  type="url"
                  placeholder="Enter target URL"
                  className={`w-full px-4 py-3 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button className="w-full py-3 px-4 bg-electric-blue/20 text-electric-blue font-medium rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Generate TrackLink</span>
                </button>
              </div>
            </div>

            {/* Active TrackLinks */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Active TrackLinks
              </h3>
              {trackLinks.length > 0 ? (
                <div className="space-y-3">
                  {trackLinks.map((link) => (
                    <div key={link.id} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {link.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          link.status === 'Active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {link.status}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {link.url}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                          {link.clicks} clicks • Created {link.created}
                        </span>
                        <div className="flex space-x-2">
                          <button className={`p-1 transition-colors ${
                            isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                          }`}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className={`p-1 transition-colors ${
                            isDark ? 'text-gray-400 hover:text-electric-blue' : 'text-gray-600 hover:text-electric-blue'
                          }`}>
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <LinkIcon className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No active TrackLinks. Create your first tracking link above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <div className="flex flex-wrap gap-2">
                <button className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  isDark ? 'bg-cyber-teal/20 text-cyber-teal' : 'bg-cyber-teal/20 text-cyber-teal'
                }`}>
                  All
                </button>
                <button className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                }`}>
                  OSINT
                </button>
                <button className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-neon-magenta' : 'text-gray-600 hover:text-neon-magenta'
                }`}>
                  PRO
                </button>
                <button className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-400'
                }`}>
                  Success
                </button>
                <button className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                }`}>
                  Failed
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3">
              {results.length > 0 ? (
                results.map((result) => (
                  <div key={result.id} className={`border border-cyber-teal/20 rounded-lg p-4 ${
                    isDark ? 'bg-muted-graphite' : 'bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.type === 'PRO' 
                            ? 'bg-neon-magenta/20 text-neon-magenta' 
                            : 'bg-cyber-teal/20 text-cyber-teal'
                        }`}>
                          {result.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 'Success' 
                            ? 'bg-green-500/20 text-green-400' 
                            : result.status === 'Failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.timestamp}
                      </span>
                    </div>
                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {result.category}
                    </h4>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Query: {result.input}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.result_summary}
                    </p>
                    {result.credits_used > 0 && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        Credits used: {result.credits_used}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span></span>
                      <button
                        onClick={() => handleViewDetails(result)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                        }`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <History className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    No Query History
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your query history will appear here once you start performing searches.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            {/* Credit Balance */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Credit Balance & Top-Up
              </h3>
              <div className="text-center mb-4">
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {officer.credits_remaining}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  of {officer.total_credits} credits remaining
                </p>
              </div>
              <button className="w-full py-3 px-4 bg-neon-magenta/20 text-neon-magenta font-medium rounded-lg hover:bg-neon-magenta/30 transition-all duration-200 flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Request Credit Top-Up</span>
              </button>
            </div>

            {/* Account Settings */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Account Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notifications
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyber-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-teal"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Auto-save queries
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyber-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-teal"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Profile Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mobile:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Telegram:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.telegram_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                  <span className="text-green-400">{officer.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Result Modal */}
      {showResultModal && detailedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg p-6 max-h-[80vh] overflow-y-auto ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Query Details - {detailedResult.category}
              </h3>
              <button
                onClick={() => setShowResultModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Query Input:
                  </label>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {detailedResult.input}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Credits Used:
                  </label>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {detailedResult.credits_used}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status:
                  </label>
                  <span className={`text-sm px-2 py-1 rounded ${
                    detailedResult.status === 'Success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {detailedResult.status}
                  </span>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timestamp:
                  </label>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {detailedResult.timestamp}
                  </p>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Result Summary:
                </label>
                <p className={`text-sm mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {detailedResult.result_summary}
                </p>
              </div>

              {detailedResult.full_result && (
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full API Response:
                  </label>
                  <div className={`mt-2 p-4 rounded-lg border ${
                    isDark ? 'bg-crisp-black border-cyber-teal/20' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <pre className={`text-xs overflow-x-auto ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {JSON.stringify(detailedResult.full_result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};