import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, CheckCircle, XCircle, AlertCircle, Pause, Play, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const LiveRequests: React.FC = () => {
  const { liveRequests, isLoading, loadData } = useSupabaseData();
  const { isDark } = useTheme();
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filteredRequests = liveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleRefresh = () => {
    setLastRefresh(new Date());
    loadData();
    toast.success('Live requests refreshed');
  };

  const handleToggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
    toast.success(isAutoRefresh ? 'Auto-refresh paused' : 'Auto-refresh resumed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusCount = (status: string) => {
    return liveRequests.filter(req => req.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Live Requests
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time monitoring of incoming queries and requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleAutoRefresh}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isAutoRefresh 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoRefresh ? 'Pause' : 'Resume'} Auto-refresh</span>
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Requests
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {liveRequests.length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-cyber-teal animate-pulse" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Processing
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getStatusCount('Processing')}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Successful
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getStatusCount('Success')}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Failed
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getStatusCount('Failed')}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="flex items-center space-x-4">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Filter by status:
          </span>
          <div className="flex space-x-2">
            {['all', 'Processing', 'Success', 'Failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  filter === status
                    ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                    : isDark 
                      ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                      : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
                }`}
              >
                {status === 'all' ? 'All' : status} 
                {status !== 'all' && (
                  <span className="ml-1 text-xs">({getStatusCount(status)})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Requests Feed */}
      <div className={`border border-cyber-teal/20 rounded-lg ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className={`px-6 py-4 border-b border-cyber-teal/20 ${
          isDark ? 'bg-crisp-black/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Request Feed
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Activity className={`w-12 h-12 mx-auto mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                No Active Requests
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Waiting for incoming queries...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cyber-teal/10">
              {filteredRequests.map((request) => (
                <div key={request.id} className={`p-6 transition-colors ${
                  isDark ? 'hover:bg-crisp-black/50' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {request.officer}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.type === 'PRO' 
                            ? 'bg-neon-magenta/20 text-neon-magenta' 
                            : 'bg-cyber-teal/20 text-cyber-teal'
                        }`}>
                          {request.type}
                        </span>
                        <StatusBadge status={request.status} size="sm" />
                      </div>
                      <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {request.query_text}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'Processing' && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Response Time Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Response Time
              </span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                1.8s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Fastest Response
              </span>
              <span className={`font-bold text-green-400`}>
                0.3s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Slowest Response
              </span>
              <span className={`font-bold text-red-400`}>
                5.2s
              </span>
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                API Uptime
              </span>
              <span className={`font-bold text-green-400`}>
                99.9%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Queue Length
              </span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getStatusCount('Processing')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Error Rate
              </span>
              <span className={`font-bold ${
                (getStatusCount('Failed') / liveRequests.length * 100) > 5 ? 'text-red-400' : 'text-green-400'
              }`}>
                {Math.round((getStatusCount('Failed') / liveRequests.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};