import React from 'react';
import { Users, Search, CreditCard, Activity, TrendingUp, Clock, Shield, Zap } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { dashboardStats, officers, queries, liveRequests, isLoading } = useSupabaseData();
  const { isDark } = useTheme();

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
            Intelligence Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time overview of system operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Updated</p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div className="w-3 h-3 bg-electric-blue rounded-full animate-pulse" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats?.total_officers || 0}
              </p>
              <p className="text-xs mt-1 text-green-400">
                +12% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyber-teal/10 border-cyber-teal/30 text-cyber-teal">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats?.active_officers || 0}
              </p>
              <p className="text-xs mt-1 text-green-400">
                91% online rate
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border-green-500/30 text-green-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Queries Today
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats?.total_queries_today || 0}
              </p>
              <p className="text-xs mt-1 text-green-400">
                +8% from yesterday
              </p>
            </div>
            <div className="p-3 rounded-lg bg-electric-blue/10 border-electric-blue/30 text-electric-blue">
              <Search className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Success Rate
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats ? Math.round((dashboardStats.successful_queries / dashboardStats.total_queries_today) * 100) : 0}%
              </p>
              <p className="text-xs mt-1 text-green-400">
                95.3% accuracy
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border-green-500/30 text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Credits Used
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats?.total_credits_used || 0}
              </p>
              <p className="text-xs mt-1 text-green-400">
                ₹48,760 revenue
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neon-magenta/10 border-neon-magenta/30 text-neon-magenta">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Avg Response Time
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {dashboardStats?.average_response_time || 0}s
              </p>
              <p className="text-xs mt-1 text-green-400">
                15% faster
              </p>
            </div>
            <div className="p-3 rounded-lg bg-electric-blue/10 border-electric-blue/30 text-electric-blue">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active APIs
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                12
              </p>
              <p className="text-xs mt-1 text-green-400">
                All operational
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyber-teal/10 border-cyber-teal/30 text-cyber-teal">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                System Status
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Optimal
              </p>
              <p className="text-xs mt-1 text-green-400">
                99.9% uptime
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border-green-500/30 text-green-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Officers */}
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Officers
            </h3>
            <Users className="w-5 h-5 text-cyber-teal" />
          </div>
          {officers.length > 0 ? (
            <div className="space-y-3">
              {officers.slice(0, 4).map((officer) => (
                <div key={officer.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-crisp-black/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyber-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {officer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {officer.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {officer.mobile}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={officer.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No officers registered yet
              </p>
            </div>
          )}
        </div>

        {/* Live Requests */}
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Live Requests
            </h3>
            <Activity className="w-5 h-5 text-electric-blue animate-pulse" />
          </div>
          {liveRequests.length > 0 ? (
            <div className="space-y-3">
              {liveRequests.map((request) => (
                <div key={request.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? 'bg-crisp-black/50' : 'bg-gray-50'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {request.officer_name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        request.type === 'PRO' ? 'bg-neon-magenta/20 text-neon-magenta' : 'bg-cyber-teal/20 text-cyber-teal'
                      }`}>
                        {request.type}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {request.query_text}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={request.status} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No live requests at the moment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Queries */}
      <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Queries
          </h3>
          <Search className="w-5 h-5 text-cyber-teal" />
        </div>
        {queries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left border-b border-cyber-teal/20`}>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Officer
                  </th>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Type
                  </th>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Query
                  </th>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Source
                  </th>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Status
                  </th>
                  <th className={`pb-3 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {queries.slice(0, 10).map((query) => (
                  <tr key={query.id} className={`border-b border-cyber-teal/10 transition-colors ${
                    isDark ? 'hover:bg-crisp-black/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {query.officer_name}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        query.type === 'PRO' ? 'bg-neon-magenta/20 text-neon-magenta' : 'bg-cyber-teal/20 text-cyber-teal'
                      }`}>
                        {query.type}
                      </span>
                    </td>
                    <td className={`py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {query.input_data}
                    </td>
                    <td className={`py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {query.source || 'N/A'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={query.status} size="sm" />
                    </td>
                    <td className={`py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(query.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No queries performed yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};