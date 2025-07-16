import React, { useState } from 'react';
import { Shield, Zap, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('admin@pickme.intel');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-dark-gradient' : 'bg-gradient-to-br from-soft-white to-gray-100'
    }`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-cyber-gradient rounded-xl flex items-center justify-center shadow-cyber">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            PickMe Intelligence
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Law Enforcement OSINT Platform
          </p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Zap className="w-4 h-4 text-electric-blue" />
            <span className="text-xs text-electric-blue">Secure Admin Access</span>
          </div>
        </div>

        {/* Login Form */}
        <div className={`rounded-xl shadow-xl p-8 border ${
          isDark 
            ? 'bg-muted-graphite border-cyber-teal/20' 
            : 'bg-white border-gray-200'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 ${
                  isDark 
                    ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-teal focus:border-transparent transition-all duration-200 pr-12 ${
                    isDark 
                      ? 'bg-crisp-black border-cyber-teal/30 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    isDark ? 'text-gray-400 hover:text-cyber-teal' : 'text-gray-500 hover:text-cyber-teal'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded focus:ring-cyber-teal text-cyber-teal border-cyber-teal/30"
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-cyber-teal hover:text-electric-blue transition-colors">
                  Forgot password?
                </a>
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-cyber-teal hover:text-electric-blue transition-colors font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className={`mt-6 p-4 rounded-lg border ${
            isDark 
              ? 'bg-crisp-black/50 border-cyber-teal/20' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Demo Credentials:
            </p>
            <div className="space-y-1 text-xs">
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Email: <span className="text-cyber-teal">admin@pickme.intel</span>
              </p>
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Password: <span className="text-cyber-teal">admin123</span>
              </p>
            </div>
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