import React, { useState } from 'react';
import { Key, Plus, Edit2, Trash2, Eye, EyeOff, Activity, AlertTriangle, CheckCircle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const APIManagement: React.FC = () => {
  const { apiKeys, apis, isLoading, addAPIKey, updateAPIKey, deleteAPIKey } = useSupabaseData();
  const { isDark } = useTheme();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAPI, setEditingAPI] = useState<any>(null);
  const [formData, setFormData] = useState({
    api_id: '',
    api_key: '',
    status: 'Active' as 'Active' | 'Inactive'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleAddAPI = () => {
    setFormData({
      api_id: '',
      api_key: '',
      status: 'Active'
    });
    setEditingAPI(null);
    setShowAddModal(true);
  };

  const handleEditAPI = (apiKey: any) => {
    setFormData({
      api_id: apiKey.api_id,
      api_key: apiKey.api_key,
      status: apiKey.status
    });
    setEditingAPI(apiKey);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      if (editingAPI) {
        await updateAPIKey(editingAPI.id, formData);
      } else {
        await addAPIKey(formData);
      }

      setShowAddModal(false);
      setFormData({
        name: '',
        provider: '',
        key: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAPI = (apiKey: any) => {
    if (window.confirm(`Are you sure you want to delete ${apiKey.name}?`)) {
      deleteAPIKey(apiKey.id);
    }
  };

  const handleToggleStatus = (apiKey: any) => {
    const newStatus = apiKey.status === 'Active' ? 'Inactive' : 'Active';
    updateAPIKey(apiKey.id, { status: newStatus });
  };

  const filteredAPIKeys = apiKeys.filter(apiKey => 
    (apiKey.apis?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apiKey.apis?.service_provider || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskAPIKey = (key: string) => {
    const visiblePart = key.substring(0, 8);
    const maskedPart = '*'.repeat(24);
    return `${visiblePart}${maskedPart}`;
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
            API Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage API keys and integrations for PRO services
          </p>
        </div>
        <button 
          onClick={handleAddAPI}
          className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add API Key</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total API Keys
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apiKeys.length}
              </p>
            </div>
            <Key className="w-8 h-8 text-cyber-teal" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Keys
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apiKeys.filter(api => api.status === 'Active').length}
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
                API Services
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apis.length}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Defined in Rate Plans
              </p>
            </div>
            <Activity className="w-8 h-8 text-neon-magenta" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Usage
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {apiKeys.reduce((sum, api) => sum + api.usage_count, 0).toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-electric-blue" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <input
          type="text"
          placeholder="Search API keys by name or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
            isDark 
              ? 'bg-crisp-black text-white placeholder-gray-500' 
              : 'bg-white text-gray-900 placeholder-gray-400'
          }`}
        />
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAPIKeys.map((apiKey) => (
          <div key={apiKey.id} className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
            isDark ? 'bg-muted-graphite' : 'bg-white'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyber-gradient rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {apiKey.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {apiKey.provider}
                  </p>
                </div>
              </div>
              <StatusBadge status={apiKey.status} />
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  API Key
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className={`flex-1 px-3 py-2 text-sm rounded border font-mono ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/30 text-gray-300' 
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    required
                    value={formData.api_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_id: e.target.value }))}
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                    }`}
                  >
                    <option value="">Select API Service</option>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Used:</span>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {apiKey.last_used ? new Date(apiKey.last_used).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Usage Count:</span>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {apiKey.usage_count.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Usage Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Monthly Usage
                  </span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {Math.round((apiKey.usage_count / 10000) * 100)}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDark ? 'bg-crisp-black' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((apiKey.usage_count / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-cyber-teal/20">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditAPI(apiKey)}
                  className={`p-2 rounded transition-colors ${
                  isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                }`}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteAPI(apiKey)}
                  className={`p-2 rounded transition-colors ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                }`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleToggleStatus(apiKey)}
                className="flex items-center space-x-2 transition-colors hover:opacity-80"
              >
                <div className={`w-2 h-2 rounded-full ${
                  apiKey.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`} />
                <span className={`text-xs ${
                  apiKey.status === 'Active' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {apiKey.status === 'Active' ? 'Operational' : 'Inactive'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit API Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAPI ? 'Edit API Key' : 'Add New API Key'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Name *
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select API Name</option>
                  {apis.map((api) => (
                    <option key={api.id} value={api.name}>
                      {api.name}
                    </option>
                  ))}
                </select>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select the API service for this key
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Service Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="">Select Service Provider</option>
                  {[...new Set(apis.map(api => api.service_provider))].map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select the service provider for this API key
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Key *
                </label>
                <input
                  type="text"
                  required
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal font-mono ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Enter the actual API key from the service provider"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is the actual API key you received from the service provider
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.api_id || !formData.api_key}
                  className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingAPI ? 'Update API Key' : 'Add API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredAPIKeys.length === 0 && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-muted-graphite' : 'bg-gray-100'
          }`}>
            <Key className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {searchTerm ? 'No API Keys Found' : 'No API Keys Added Yet'}
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm 
              ? 'Try adjusting your search criteria or add a new API key.'
              : apis.length > 0 
                ? 'Add API keys for the services defined in your APIs.'
                : 'Please define APIs in Rate Plans → API Management first, then add their keys here.'
            }
          </p>
          {apis.length === 0 && (
            <div className="mt-4">
              <Link
                to="/admin/rate-plans"
                className="inline-flex items-center space-x-2 text-cyber-teal hover:text-electric-blue transition-colors"
              >
                <span>Go to Rate Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};