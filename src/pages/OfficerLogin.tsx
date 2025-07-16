import React, { useState } from 'react';
import { Shield, Zap, Phone, User, ArrowLeft, Mail, Building, UserPlus, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useOfficerAuth } from '../contexts/OfficerAuthContext';
import toast from 'react-hot-toast';

export const OfficerLogin: React.FC = () => {
  const { isDark } = useTheme();
  const { login } = useOfficerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({
    identifier: '', // email or mobile
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    station: '',
    email: '',
    mobile: '',
    department: '',
    rank: '',
    badge_number: '',
    additional_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.identifier.trim() || !loginData.password.trim()) {
      toast.error('Please enter both email/mobile and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(loginData.identifier, loginData.password);
      toast.success('Login successful!');
      navigate('/officer/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Please check your email/mobile and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.name.trim() || !registerData.station.trim() || 
        !registerData.email.trim() || !registerData.mobile.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      toast.success('Registration submitted successfully! You will be notified once approved by admin.');
      setActiveTab('login');
      setRegisterData({
        name: '',
        station: '',
        email: '',
        mobile: '',
        department: '',
        rank: '',
        badge_number: '',
        additional_info: ''
      });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-dark-gradient' : 'bg-gradient-to-br from-soft-white to-gray-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home */}
        <div className="flex items-center">
          <Link
            to="/"
            className={`flex items-center space-x-2 text-sm transition-colors ${
              isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-cyber-gradient rounded-xl flex items-center justify-center shadow-cyber">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Officer Portal
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            PickMe Intelligence - Law Enforcement Access
          </p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Zap className="w-4 h-4 text-electric-blue" />
            <span className="text-xs text-electric-blue">Secure Officer Access</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={`rounded-xl shadow-xl border ${
          isDark 
            ? 'bg-muted-graphite border-cyber-teal/20' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tl-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-cyber-teal/20 text-cyber-teal border-b-2 border-cyber-teal'
                  : isDark 
                    ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                    : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-tr-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'register'
                  ? 'bg-cyber-teal/20 text-cyber-teal border-b-2 border-cyber-teal'
                  : isDark 
                    ? 'text-gray-400 hover:text-cyber-teal hover:bg-cyber-teal/10' 
                    : 'text-gray-600 hover:text-cyber-teal hover:bg-cyber-teal/10'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'login' ? (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                      placeholder="ramesh@police.gov.in or +91 9791103607"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Demo Credentials */}
                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-crisp-black/50 border-cyber-teal/20' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Demo Credentials:
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Email: <span className="text-cyber-teal">ramesh@police.gov.in</span>
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Mobile: <span className="text-cyber-teal">+91 9791103607</span>
                    </p>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Password: <span className="text-cyber-teal">officer123</span>
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Inspector Ramesh Kumar"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Police Station *
                    </label>
                    <div className="relative">
                      <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        required
                        value={registerData.station}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, station: e.target.value }))}
                        placeholder="Central Police Station"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                          isDark 
                            ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ramesh.kumar@police.gov.in"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="tel"
                      required
                      value={registerData.mobile}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, mobile: e.target.value }))}
                      placeholder="+91 9791103607"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department
                    </label>
                    <select
                      value={registerData.department}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, department: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-crisp-black border-cyber-teal/30 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
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
                      value={registerData.rank}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, rank: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                        isDark 
                          ? 'bg-crisp-black border-cyber-teal/30 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
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
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Badge Number
                  </label>
                  <input
                    type="text"
                    value={registerData.badge_number}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, badge_number: e.target.value }))}
                    placeholder="CC001"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                      isDark 
                        ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Additional Information
                  </label>
                  <textarea
                    value={registerData.additional_info}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, additional_info: e.target.value }))}
                    placeholder="Any additional information for verification..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 resize-none ${
                      isDark 
                        ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-electric-blue/10 border-electric-blue/30' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-electric-blue mt-0.5" />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Registration Process
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Your registration will be reviewed by admin. You'll receive an email notification once approved.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-cyber-gradient text-white font-medium rounded-lg hover:shadow-cyber transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 PickMe Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};