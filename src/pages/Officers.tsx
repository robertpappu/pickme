import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, UserCheck, UserX, X } from 'lucide-react';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Officers: React.FC = () => {
  const { officers, ratePlans, isLoading, addOfficer, updateOfficer, deleteOfficer } = useSupabaseData();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    telegram_id: '',
    password: '',
    department: '',
    rank: '',
    badge_number: '',
    station: '',
    plan_id: '',
    status: 'Active' as 'Active' | 'Suspended',
    credits_remaining: 50,
    total_credits: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.mobile.includes(searchTerm) ||
                         (officer.telegram_id && officer.telegram_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddOfficer = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      telegram_id: '',
      password: '',
      department: '',
      rank: '',
      badge_number: '',
      station: '',
      plan_id: '',
      status: 'Active',
      credits_remaining: 50,
      total_credits: 50
    });
    setEditingOfficer(null);
    setShowAddModal(true);
  };

  const handleEditOfficer = (officer: any) => {
    setFormData({
      name: officer.name,
      email: officer.email,
      mobile: officer.mobile,
      telegram_id: officer.telegram_id || '',
      password: '', // Don't pre-fill password for security
      department: officer.department || '',
      rank: officer.rank || '',
      badge_number: officer.badge_number || '',
      station: officer.station || '',
      plan_id: officer.plan_id || '',
      status: officer.status,
      credits_remaining: officer.credits_remaining,
      total_credits: officer.total_credits
    });
    setEditingOfficer(officer);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingOfficer) {
        await updateOfficer(editingOfficer.id, formData);
        toast.success('Officer updated successfully!');
      } else {
        await addOfficer(formData);
        toast.success('Officer added successfully!');
      }

      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        telegram_id: '',
        password: '',
        department: '',
        rank: '',
        badge_number: '',
        station: '',
        plan_id: '',
        status: 'Active',
        credits_remaining: 50,
        total_credits: 50
      });
    } catch (error) {
      console.error('Error saving officer:', error);
      toast.error('Failed to save officer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOfficer = (officer: any) => {
    if (window.confirm(`Are you sure you want to delete ${officer.name}?`)) {
      deleteOfficer(officer.id);
    }
  };

  const handleToggleStatus = async (officer: any) => {
    const newStatus = officer.status === 'Active' ? 'Suspended' : 'Active';
    
    try {
      await updateOfficer(officer.id, { status: newStatus });
      toast.success(`Officer ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating officer status:', error);
      toast.error('Failed to update officer status');
    }
  };

  const handlePlanChange = (planId: string) => {
    setFormData(prev => ({ ...prev, plan_id: planId }));
    
    if (planId) {
      const selectedPlan = ratePlans.find(plan => plan.id === planId);
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          credits_remaining: selectedPlan.default_credits,
          total_credits: selectedPlan.default_credits
        }));
      }
    }
  };

  const getPlanName = (planId: string) => {
    const plan = ratePlans.find(p => p.id === planId);
    return plan ? plan.plan_name : 'No Plan';
  };

  const handleExportCSV = () => {
    if (officers.length === 0) {
      toast.error('No officers to export');
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Mobile', 'Telegram ID', 'Department', 'Rank', 'Badge Number', 'Station', 'Plan', 'Status', 'Credits Remaining', 'Total Credits', 'Registered On'].join(','),
      ...filteredOfficers.map(officer => [
        officer.name,
        officer.email,
        officer.mobile,
        officer.telegram_id || '',
        officer.department || '',
        officer.rank || '',
        officer.badge_number || '',
        officer.station || '',
        getPlanName(officer.plan_id || ''),
        officer.status,
        officer.credits_remaining,
        officer.total_credits,
        new Date(officer.registered_on || officer.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `officers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Officers data exported successfully!');
  };

  // Show loading spinner only during initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyber-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isDark ? 'bg-crisp-black' : 'bg-soft-white'}`}>
      {/* Header - ALWAYS SHOW */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Officer Management
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage law enforcement personnel and their access
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            disabled={officers.length === 0}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              officers.length === 0 
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' 
                : 'bg-electric-blue/20 text-electric-blue hover:bg-electric-blue/30'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleAddOfficer}
            className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Officer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - ALWAYS SHOW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-cyber-teal" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.filter(o => o.status === 'Active').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Suspended Officers
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.filter(o => o.status === 'Suspended').length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Credits
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {officers.reduce((sum, o) => sum + o.credits_remaining, 0)}
              </p>
            </div>
            <Download className="w-8 h-8 text-electric-blue" />
          </div>
        </div>
      </div>

      {/* Filters - ALWAYS SHOW */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search officers by name, mobile, or telegram..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                isDark 
                  ? 'bg-crisp-black text-white placeholder-gray-500' 
                  : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
              isDark 
                ? 'bg-crisp-black text-white' 
                : 'bg-white text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button className="px-3 py-2 bg-cyber-teal/20 text-cyber-teal rounded-lg hover:bg-cyber-teal/30 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Officers Grid OR Empty State */}
      {officers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOfficers.map((officer) => (
            <div key={officer.id} className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
              isDark ? 'bg-muted-graphite' : 'bg-white'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyber-gradient rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {officer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {officer.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {officer.mobile}
                    </p>
                  </div>
                </div>
                <StatusBadge status={officer.status} />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Telegram:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.telegram_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Department:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Rank:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{officer.rank || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Plan:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{getPlanName(officer.plan_id || '')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credits:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {officer.credits_remaining}/{officer.total_credits}
                  </span>
                </div>
              </div>

              {/* Credit Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Credit Usage</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {Math.round((officer.credits_remaining / officer.total_credits) * 100)}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-crisp-black' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(officer.credits_remaining / officer.total_credits) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-cyber-teal/20">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditOfficer(officer)}
                    className={`p-2 rounded transition-colors ${
                      isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteOfficer(officer)}
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
      ) : (
        /* Empty State - Show when no officers */
        <div className="text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-muted-graphite' : 'bg-gray-100'
          }`}>
            <UserCheck className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            No Officers Found
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get started by adding your first officer to the system.
          </p>
          <button 
            onClick={handleAddOfficer}
            className="bg-cyber-gradient text-white px-6 py-3 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Officer</span>
          </button>
        </div>
      )}

      {/* Add/Edit Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required={!editingOfficer}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder={editingOfficer ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {editingOfficer && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Leave blank to keep the current password
                    </p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Telegram ID
                  </label>
                  <input
                    type="text"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, telegram_id: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Select Department</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Intelligence">Intelligence</option>
                    <option value="Crime Branch">Crime Branch</option>
                    <option value="Traffic">Traffic</option>
                    <option value="Special Branch">Special Branch</option>
                    <option value="Anti-Terrorism">Anti-Terrorism</option>
                    <option value="Narcotics">Narcotics</option>
                    <option value="Economic Offences">Economic Offences</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Rank
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">Select Rank</option>
                    <option value="Constable">Constable</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Assistant Sub Inspector">Assistant Sub Inspector</option>
                    <option value="Sub Inspector">Sub Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Deputy Superintendent">Deputy Superintendent</option>
                    <option value="Superintendent">Superintendent</option>
                    <option value="Deputy Inspector General">Deputy Inspector General</option>
                    <option value="Inspector General">Inspector General</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={formData.badge_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_number: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter badge number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Plan Type
                  </label>
                  <select
                    value={formData.plan_id}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="">No Plan Selected</option>
                    {ratePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.plan_name} ({plan.user_type}) - ₹{plan.monthly_fee}/month
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selecting a plan will automatically set the default credits
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Station
                  </label>
                  <input
                    type="text"
                    value={formData.station}
                    onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter station name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Suspended' }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white' 
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className={formData.plan_id ? 'opacity-50' : ''}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Credits Remaining
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!formData.plan_id}
                    value={formData.credits_remaining}
                    onChange={(e) => setFormData(prev => ({ ...prev, credits_remaining: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter credits remaining"
                  />
                  {formData.plan_id && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Credits are automatically set based on selected plan
                    </p>
                  )}
                </div>

                <div className={formData.plan_id ? 'opacity-50' : ''}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Total Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!formData.plan_id}
                    value={formData.total_credits}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_credits: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                      isDark 
                        ? 'bg-crisp-black text-white placeholder-gray-500' 
                        : 'bg-white text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter total credits"
                  />
                  {formData.plan_id && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Credits are automatically set based on selected plan
                    </p>
                  )}
                </div>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyber-gradient text-white rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingOfficer ? 'Update Officer' : 'Add Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};