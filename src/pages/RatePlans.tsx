import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, DollarSign, Users, Key, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import toast from 'react-hot-toast';

import { API, RatePlan, PlanAPI } from '../lib/supabase';

export const RatePlans: React.FC = () => {
  const { isDark } = useTheme();
  const { 
    apis, 
    ratePlans, 
    planAPIs, 
    isLoading,
    addRatePlan, 
    updateRatePlan, 
    deleteRatePlan,
    addAPI,
    updateAPI,
    deleteAPI
  } = useSupabaseData();
  const [activeTab, setActiveTab] = useState<'plans' | 'apis'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingAPI, setEditingAPI] = useState<API | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [planFormData, setPlanFormData] = useState({
    plan_name: '',
    user_type: 'Police' as 'Police' | 'Private' | 'Custom',
    monthly_fee: 0,
    renewal_required: true,
    topup_allowed: true,
    apis: [] as any[]
  });

  const [apiFormData, setAPIFormData] = useState({
    name: '',
    type: 'PRO' as 'FREE' | 'PRO' | 'DISABLED',
    service_provider: 'RapidAPI',
    global_buy_price: 0,
    global_sell_price: 0,
    default_credit_charge: 0,
    description: ''
  });

  // Get plan APIs for a specific plan
  const getPlanAPIs = (planId: string) => {
    return planAPIs.filter(pa => pa.plan_id === planId);
  };

  const handleCreatePlan = () => {
    const defaultAPIs = apis.map(api => ({
      api_id: api.id,
      enabled: api.type === 'FREE',
      credit_cost: api.default_credit_charge,
      buy_price: api.global_buy_price,
      sell_price: api.global_sell_price
    }));

    setPlanFormData({
      plan_name: '',
      user_type: 'Police',
      monthly_fee: 0,
      renewal_required: true,
      topup_allowed: true,
      apis: defaultAPIs
    });
    setEditingPlan(null);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: any) => {
    // Get existing plan APIs for this plan
    const existingPlanAPIs = getPlanAPIs(plan.id);
    
    // Create API configuration array that includes ALL available APIs
    const allAPIsConfig = apis.map(api => {
      // Check if this API is already configured for this plan
      const existingConfig = existingPlanAPIs.find(pa => pa.api_id === api.id);
      
      if (existingConfig) {
        // Use existing configuration
        return {
          api_id: api.id,
          enabled: existingConfig.enabled,
          credit_cost: existingConfig.credit_cost,
          buy_price: existingConfig.buy_price,
          sell_price: existingConfig.sell_price
        };
      } else {
        // Use default configuration for new APIs
        return {
          api_id: api.id,
          enabled: api.type === 'FREE', // Enable FREE APIs by default, disable PRO APIs
          credit_cost: api.default_credit_charge,
          buy_price: api.global_buy_price,
          sell_price: api.global_sell_price
        };
      }
    });

    setPlanFormData({
      plan_name: plan.plan_name,
      user_type: plan.user_type,
      monthly_fee: plan.monthly_fee,
      renewal_required: plan.renewal_required,
      topup_allowed: plan.topup_allowed,
      apis: allAPIsConfig
    });
    setEditingPlan(plan);
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    if (!planFormData.plan_name.trim() || planFormData.monthly_fee <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const defaultCredits = Math.floor(planFormData.monthly_fee / 10);
      
      // Separate APIs data from plan data
      const { apis, ...planData } = planFormData;
      const planDataWithCredits = {
        ...planData,
        default_credits: defaultCredits
      };
      
      if (editingPlan) {
        await updateRatePlan(editingPlan.id, planDataWithCredits, apis);
      } else {
        await addRatePlan(planDataWithCredits, apis);
      }

      setShowPlanModal(false);
    } catch (error) {
      toast.error('Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan? This will also remove all API configurations for this plan.')) {
      deleteRatePlan(planId);
    }
  };

  const handleCreateAPI = () => {
    setAPIFormData({
      name: '',
      type: 'PRO',
      service_provider: 'RapidAPI',
      global_buy_price: 0,
      global_sell_price: 0,
      default_credit_charge: 0,
      description: ''
    });
    setEditingAPI(null);
    setShowAPIModal(true);
  };

  const handleEditAPI = (api: API) => {
    setAPIFormData({
      name: api.name,
      type: api.type,
      service_provider: api.service_provider,
      global_buy_price: api.global_buy_price,
      global_sell_price: api.global_sell_price,
      default_credit_charge: api.default_credit_charge,
      description: api.description
    });
    setEditingAPI(api);
    setShowAPIModal(true);
  };

  const handleSaveAPI = async () => {
    if (!apiFormData.name.trim()) {
      toast.error('Please enter API name');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAPI) {
        await updateAPI(editingAPI.id, apiFormData);
      } else {
        await addAPI(apiFormData);
      }

      setShowAPIModal(false);
    } catch (error) {
      toast.error('Failed to save API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAPI = (apiId: string) => {
    if (window.confirm('Are you sure you want to delete this API? This will remove it from all plans.')) {
      deleteAPI(apiId);
    }
  };

  const updatePlanAPI = (planIndex: number, apiId: string, field: keyof PlanAPI, value: any) => {
    setPlanFormData(prev => ({
      ...prev,
      apis: prev.apis.map(api => 
        api.api_id === apiId 
          ? { ...api, [field]: value }
          : api
      )
    }));
  };

  const getAPIName = (apiId: string) => {
    return apis.find(api => api.id === apiId)?.name || 'Unknown API';
  };

  const getAPIType = (apiId: string) => {
    return apis.find(api => api.id === apiId)?.type || 'PRO';
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
            Rate Plan Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage subscription plans with API access control
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
            activeTab === 'plans'
              ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
              : isDark 
                ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="font-medium">Subscription Plans</span>
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-all duration-200 ${
            activeTab === 'apis'
              ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
              : isDark 
                ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
          }`}
        >
          <Key className="w-4 h-4" />
          <span className="font-medium">API Management</span>
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Create Plan Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleCreatePlan}
              className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ratePlans.map((plan) => (
              <div key={plan.id} className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
                isDark ? 'bg-muted-graphite' : 'bg-white'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.plan_name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      plan.user_type === 'Police' ? 'bg-cyber-teal/20 text-cyber-teal' :
                      plan.user_type === 'Private' ? 'bg-neon-magenta/20 text-neon-magenta' :
                      'bg-electric-blue/20 text-electric-blue'
                    }`}>
                      {plan.user_type}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    plan.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {plan.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monthly Fee:</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{plan.monthly_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Default Credits:</span>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.default_credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Renewal Required:</span>
                    <span className={`text-sm ${plan.renewal_required ? 'text-green-400' : 'text-red-400'}`}>
                      {plan.renewal_required ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Top-up Allowed:</span>
                    <span className={`text-sm ${plan.topup_allowed ? 'text-green-400' : 'text-red-400'}`}>
                      {plan.topup_allowed ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enabled APIs: {getPlanAPIs(plan.id).filter(api => api.enabled).length} of {getPlanAPIs(plan.id).length}
                  </p>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-crisp-black' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getPlanAPIs(plan.id).length > 0 ? (getPlanAPIs(plan.id).filter(api => api.enabled).length / getPlanAPIs(plan.id).length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-cyber-teal/20">
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditPlan(plan)}
                      className={`p-2 rounded transition-colors ${
                        isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className={`p-2 rounded transition-colors ${
                        isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APIs Tab */}
      {activeTab === 'apis' && (
        <div className="space-y-6">
          {/* Create API Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleCreateAPI}
              className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add API</span>
            </button>
          </div>

          {/* APIs Table */}
          <div className={`border border-cyber-teal/20 rounded-lg overflow-hidden ${
            isDark ? 'bg-muted-graphite' : 'bg-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b border-cyber-teal/20 ${
                  isDark ? 'bg-crisp-black/50' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>API Name</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Service Provider</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Type</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Buy Price</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Sell Price</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Credits</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apis.map((api) => (
                    <tr key={api.id} className={`border-b border-cyber-teal/10 transition-colors ${
                      isDark ? 'hover:bg-crisp-black/50' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {api.name}
                          </span>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {api.description}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          api.service_provider === 'RapidAPI' ? 'bg-blue-500/20 text-blue-400' :
                          api.service_provider === 'Direct' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {api.service_provider}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          api.type === 'FREE' ? 'bg-green-500/20 text-green-400' :
                          api.type === 'PRO' ? 'bg-neon-magenta/20 text-neon-magenta' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {api.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ₹{api.global_buy_price}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ₹{api.global_sell_price}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {api.default_credit_charge}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditAPI(api)}
                            className={`p-2 rounded transition-colors ${
                              isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAPI(api.id)}
                            className={`p-2 rounded transition-colors ${
                              isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-4xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={planFormData.plan_name}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, plan_name: e.target.value }))}
                  placeholder="e.g., Police 500"
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  User Type
                </label>
                <select
                  value={planFormData.user_type}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, user_type: e.target.value as any }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="Police">Police</option>
                  <option value="Private">Private</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monthly Fee (₹) *
                </label>
                <input
                  type="number"
                  value={planFormData.monthly_fee}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, monthly_fee: parseInt(e.target.value) || 0 }))}
                  placeholder="500"
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Default Credits: {Math.floor(planFormData.monthly_fee / 10)} (₹10 = 1 credit)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Renewal Required (30 days)
                  </span>
                  <button
                    onClick={() => setPlanFormData(prev => ({ ...prev, renewal_required: !prev.renewal_required }))}
                    className="flex items-center"
                  >
                    {planFormData.renewal_required ? (
                      <ToggleRight className="w-8 h-8 text-cyber-teal" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Top-up Allowed
                  </span>
                  <button
                    onClick={() => setPlanFormData(prev => ({ ...prev, topup_allowed: !prev.topup_allowed }))}
                    className="flex items-center"
                  >
                    {planFormData.topup_allowed ? (
                      <ToggleRight className="w-8 h-8 text-cyber-teal" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="mb-6">
              <h4 className={`text-md font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Access Configuration
              </h4>
              <div className="space-y-4">
                {planFormData.apis.map((planAPI, index) => {
                  const api = apis.find(a => a.id === planAPI.api_id);
                  if (!api) return null;

                  return (
                    <div key={planAPI.api_id} className={`p-4 rounded-lg border ${
                      isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {api.name}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            api.type === 'FREE' ? 'bg-green-500/20 text-green-400' :
                            api.type === 'PRO' ? 'bg-neon-magenta/20 text-neon-magenta' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {api.type}
                          </span>
                        </div>
                        <button
                          onClick={() => updatePlanAPI(index, planAPI.api_id, 'enabled', !planAPI.enabled)}
                          className="flex items-center"
                        >
                          {planAPI.enabled ? (
                            <ToggleRight className="w-8 h-8 text-cyber-teal" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {planAPI.enabled && api.type === 'PRO' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Credit Cost
                            </label>
                            <input
                              type="number"
                              value={planAPI.credit_cost}
                              onChange={(e) => updatePlanAPI(index, planAPI.api_id, 'credit_cost', parseInt(e.target.value) || 0)}
                              className={`w-full px-2 py-1 text-sm border border-cyber-teal/30 rounded focus:outline-none focus:ring-1 focus:ring-cyber-teal ${
                                isDark 
                                  ? 'bg-crisp-black text-white' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Buy Price (₹)
                            </label>
                            <input
                              type="number"
                              value={planAPI.buy_price}
                              onChange={(e) => updatePlanAPI(index, planAPI.api_id, 'buy_price', parseInt(e.target.value) || 0)}
                              className={`w-full px-2 py-1 text-sm border border-cyber-teal/30 rounded focus:outline-none focus:ring-1 focus:ring-cyber-teal ${
                                isDark 
                                  ? 'bg-crisp-black text-white' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Sell Price (₹)
                            </label>
                            <input
                              type="number"
                              value={planAPI.sell_price}
                              onChange={(e) => updatePlanAPI(index, planAPI.api_id, 'sell_price', parseInt(e.target.value) || 0)}
                              className={`w-full px-2 py-1 text-sm border border-cyber-teal/30 rounded focus:outline-none focus:ring-1 focus:ring-cyber-teal ${
                                isDark 
                                  ? 'bg-crisp-black text-white' 
                                  : 'bg-white text-gray-900'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={isSubmitting}
                className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Modal */}
      {showAPIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingAPI ? 'Edit API' : 'Add New API'}
              </h3>
              <button
                onClick={() => setShowAPIModal(false)}
                className={`p-2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Name *
                </label>
                <input
                  type="text"
                  value={apiFormData.name}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Phone Prefill V2"
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Service Provider
                </label>
                <input
                  type="text"
                  value={apiFormData.service_provider}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, service_provider: e.target.value }))}
                  placeholder="e.g., RapidAPI, Signzy, Surepass, TrueCaller"
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Type
                </label>
                <select
                  value={apiFormData.type}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    value={apiFormData.global_buy_price}
                    onChange={(e) => setAPIFormData(prev => ({ ...prev, global_buy_price: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Sell Price (₹)
                  </label>
                  <input
                    type="number"
                    value={apiFormData.global_sell_price}
                    onChange={(e) => setAPIFormData(prev => ({ ...prev, global_sell_price: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Default Credit Charge
                </label>
                <input
                  type="number"
                  value={apiFormData.default_credit_charge}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, default_credit_charge: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </label>
                <textarea
                  value={apiFormData.description}
                  onChange={(e) => setAPIFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Brief description of the API service"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAPIModal(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAPI}
                disabled={isSubmitting}
                className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : editingAPI ? 'Update API' : 'Add API'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};