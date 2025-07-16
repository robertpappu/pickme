import React, { useState } from 'react';
import { CreditCard, Plus, Minus, RefreshCw, DollarSign, TrendingUp, Calendar, Filter, Download, X } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Credits: React.FC = () => {
  const { transactions, officers, isLoading, addTransaction } = useSupabaseData();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    officer_id: '',
    action: 'Top-up' as 'Renewal' | 'Deduction' | 'Top-up' | 'Refund',
    credits: 0,
    payment_mode: 'Department Budget',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || transaction.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const handleAddCredits = () => {
    setFormData({
      officer_id: '',
      action: 'Top-up',
      credits: 0,
      payment_mode: 'Department Budget',
      remarks: ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      const selectedOfficer = officers.find(o => o.id === formData.officer_id);
      if (!selectedOfficer) {
        toast.error('Please select an officer');
        return;
      }

      await addTransaction({
        officer_id: formData.officer_id,
        officer_name: selectedOfficer.name,
        action: formData.action,
        credits: formData.action === 'Deduction' ? -Math.abs(formData.credits) : Math.abs(formData.credits),
        payment_mode: formData.payment_mode,
        remarks: formData.remarks || `${formData.action} for ${selectedOfficer.name}`
      });

      setShowAddModal(false);
      setFormData({
        officer_id: '',
        action: 'Top-up',
        credits: 0,
        payment_mode: 'Department Budget',
        remarks: ''
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCreditsIssued = transactions
    .filter(t => t.action === 'Renewal' || t.action === 'Top-up')
    .reduce((sum, t) => sum + t.credits, 0);

  const totalCreditsUsed = transactions
    .filter(t => t.action === 'Deduction')
    .reduce((sum, t) => sum + Math.abs(t.credits), 0);

  const totalRevenue = totalCreditsUsed * 2; // Assuming ₹2 per credit

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Renewal':
        return <RefreshCw className="w-4 h-4 text-green-400" />;
      case 'Deduction':
        return <Minus className="w-4 h-4 text-red-400" />;
      case 'Top-up':
        return <Plus className="w-4 h-4 text-blue-400" />;
      case 'Refund':
        return <RefreshCw className="w-4 h-4 text-yellow-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Renewal':
      case 'Top-up':
        return 'text-green-400';
      case 'Deduction':
        return 'text-red-400';
      case 'Refund':
        return 'text-yellow-400';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
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
            Credits & Billing
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage credit transactions and billing operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-electric-blue/20 text-electric-blue px-4 py-2 rounded-lg hover:bg-electric-blue/30 transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={handleAddCredits}
            className="bg-cyber-gradient text-white px-4 py-2 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credits</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Fixed Theme Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Credits Issued
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalCreditsIssued.toLocaleString()}
              </p>
              <p className="text-xs mt-1 text-green-400">
                +15% this month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border-green-500/30 text-green-400">
              <Plus className="w-6 h-6" />
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
                {totalCreditsUsed.toLocaleString()}
              </p>
              <p className="text-xs mt-1 text-red-400">
                85% utilization
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border-red-500/30 text-red-400">
              <Minus className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`border border-cyber-teal/20 rounded-lg p-6 hover:shadow-cyber transition-all duration-300 ${
          isDark ? 'bg-muted-graphite' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Revenue Generated
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ₹{totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs mt-1 text-green-400">
                +22% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyber-teal/10 border-cyber-teal/30 text-cyber-teal">
              <DollarSign className="w-6 h-6" />
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
                {officers.filter(o => o.status === 'Active').length}
              </p>
              <p className="text-xs mt-1 text-green-400">
                91% retention rate
              </p>
            </div>
            <div className="p-3 rounded-lg bg-electric-blue/10 border-electric-blue/30 text-electric-blue">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Credit Distribution Chart */}
      <div className={`border border-cyber-teal/20 rounded-lg p-6 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Credit Distribution by Officer
          </h3>
          <Calendar className="w-5 h-5 text-cyber-teal" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officers.slice(0, 6).map((officer) => (
            <div key={officer.id} className={`p-4 rounded-lg border ${
              isDark ? 'bg-crisp-black/50 border-cyber-teal/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {officer.name}
                </h4>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {officer.credits_remaining}/{officer.total_credits}
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                isDark ? 'bg-crisp-black' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-cyber-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(officer.credits_remaining / officer.total_credits) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Used: {officer.total_credits - officer.credits_remaining}
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {Math.round((officer.credits_remaining / officer.total_credits) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={`border border-cyber-teal/20 rounded-lg p-4 ${
        isDark ? 'bg-muted-graphite' : 'bg-white'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent ${
                isDark 
                  ? 'bg-crisp-black text-white placeholder-gray-500' 
                  : 'bg-white text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
              isDark 
                ? 'bg-crisp-black text-white' 
                : 'bg-white text-gray-900'
            }`}
          >
            <option value="all">All Actions</option>
            <option value="Renewal">Renewal</option>
            <option value="Deduction">Deduction</option>
            <option value="Top-up">Top-up</option>
            <option value="Refund">Refund</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
              isDark 
                ? 'bg-crisp-black text-white' 
                : 'bg-white text-gray-900'
            }`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
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
                }`}>
                  Officer
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Action
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Credits
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Payment Mode
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Remarks
                </th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className={`border-b border-cyber-teal/10 transition-colors ${
                    isDark ? 'hover:bg-crisp-black/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transaction.officer_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(transaction.action)}
                      <span className={`text-sm font-medium ${getActionColor(transaction.action)}`}>
                        {transaction.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${
                      transaction.credits > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {transaction.payment_mode}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {transaction.remarks || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${
            isDark ? 'bg-muted-graphite border border-cyber-teal/20' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Credit Transaction
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
                  Select Officer
                </label>
                <select
                  required
                  value={formData.officer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, officer_id: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="">Choose an officer</option>
                  {officers.map(officer => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} ({officer.credits_remaining}/{officer.total_credits} credits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Transaction Type
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as any }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="Top-up">Top-up</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Refund">Refund</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Credits Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.credits}
                  onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Enter credit amount"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Mode
                </label>
                <select
                  value={formData.payment_mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_mode: e.target.value }))}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal ${
                    isDark 
                      ? 'bg-crisp-black text-white' 
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <option value="Department Budget">Department Budget</option>
                  <option value="Government Fund">Government Fund</option>
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Query Usage">Query Usage</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remarks (Optional)
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border border-cyber-teal/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal resize-none ${
                    isDark 
                      ? 'bg-crisp-black text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Add any additional notes..."
                />
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
                  {isSubmitting ? 'Processing...' : 'Process Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};