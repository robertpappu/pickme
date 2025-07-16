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

interface QueryResult {
  id: string;
  type: 'OSINT' | 'PRO';
  category: string;
  input: string;
  result_summary: string;
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('mobile-check');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [trackLinks, setTrackLinks] = useState<TrackLink[]>([]);
  const [notifications, setNotifications] = useState(3);
  
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
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const isProQuery = ['phone-prefill', 'rc-verification', 'credit-history', 'cell-id'].includes(activeSubTab);
      const newResult: QueryResult = {
        id: Date.now().toString(),
        type: isProQuery ? 'PRO' : 'OSINT',
        category: category,
        input: query,
        result_summary: `Mock result for ${query} - ${category}`,
        credits_used: isProQuery ? Math.floor(Math.random() * 3) + 1 : 0,
        timestamp: new Date().toLocaleString(),
        status: Math.random() > 0.1 ? 'Success' : 'Failed'
      };
      
      setResults(prev => [newResult, ...prev]);
      setQuery('');
      setIsProcessing(false);
    }, 2000);
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

  const proLookupTabs = [
    { id: 'phone-prefill', name: 'Phone Prefill V2', icon: Phone },
    { id: 'rc-verification', name: 'RC / IMEI / FastTag', icon: Car },
    { id: 'credit-history', name: 'Credit History', icon: CreditCardIcon },
    { id: 'cell-id', name: 'Cell ID', icon: MapPin }
  ];

  if (!officer) {
    return null;
  }

  const renderSearchInterface = (category: string, placeholder: string, isProQuery: boolean = false) => (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-muted-graphite/50 border-cyber-teal/20' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {category}
          </h3>
          {isProQuery && (
            <span className="text-xs px-2 py-1 rounded bg-neon-magenta/20 text-neon-magenta">
              PRO - {Math.floor(Math.random() * 3) + 1} Credits
            </span>
          )}
        </div>
        
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
            disabled={!query.trim() || isProcessing}
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
      </div>
    </div>
  );

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
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isDark 
                      ? 'bg-crisp-black border-neon-magenta/20 text-gray-300 hover:border-neon-magenta/40' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-neon-magenta/40'
                  }`}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2 text-neon-magenta" />
                  <p className="text-xs">Phone Prefill</p>
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
    </div>
  );
};