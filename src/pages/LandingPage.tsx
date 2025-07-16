import React from 'react';
import { Shield, Zap, Users, Search, CreditCard, Activity, ArrowRight, Phone, User, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const features = [
    {
      icon: Search,
      title: 'OSINT Intelligence',
      description: 'Free open-source intelligence gathering from social media, public records, and web sources.',
      color: 'cyber-teal'
    },
    {
      icon: Shield,
      title: 'PRO Verification',
      description: 'Premium API-based verification services for phone numbers, identity documents, and more.',
      color: 'neon-magenta'
    },
    {
      icon: CreditCard,
      title: 'Credit System',
      description: 'Transparent credit-based billing for premium services with detailed usage tracking.',
      color: 'electric-blue'
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Live request tracking and comprehensive audit logs for compliance and oversight.',
      color: 'cyber-teal'
    }
  ];

  const stats = [
    { label: 'Active Officers', value: '500+', icon: Users },
    { label: 'Queries Processed', value: '1M+', icon: Search },
    { label: 'Success Rate', value: '99.9%', icon: Shield },
    { label: 'Response Time', value: '<2s', icon: Activity }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-gradient' : 'bg-gradient-to-br from-soft-white to-gray-100'}`}>
      {/* Header */}
      <header className={`border-b ${isDark ? 'border-cyber-teal/20 bg-muted-graphite/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyber-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  PickMe Intelligence
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Law Enforcement OSINT Platform
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-cyber-gradient rounded-2xl flex items-center justify-center shadow-cyber animate-pulse-slow">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Advanced <span className="text-transparent bg-clip-text bg-cyber-gradient">Intelligence</span>
              <br />Platform for Law Enforcement
            </h1>
            
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Secure, scalable OSINT and premium verification services designed specifically for law enforcement agencies. 
              Access real-time intelligence with comprehensive audit trails and compliance features.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/officer/login"
                className="w-full sm:w-auto bg-cyber-gradient text-white px-8 py-4 rounded-lg hover:shadow-cyber transition-all duration-200 flex items-center justify-center space-x-3 text-lg font-medium"
              >
                <User className="w-6 h-6" />
                <span>Officer Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/admin/login"
                className={`w-full sm:w-auto px-8 py-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-3 text-lg font-medium ${
                  isDark 
                    ? 'border-cyber-teal text-cyber-teal hover:bg-cyber-teal/10' 
                    : 'border-cyber-teal text-cyber-teal hover:bg-cyber-teal/10'
                }`}
              >
                <Shield className="w-6 h-6" />
                <span>Admin Panel</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-muted-graphite/50 border-cyber-teal/20' : 'bg-white/50 border-gray-200'
                  } backdrop-blur-sm`}>
                    <Icon className="w-6 h-6 text-cyber-teal mx-auto mb-2" />
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDark ? 'bg-muted-graphite/30' : 'bg-white/30'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Powerful Intelligence Tools
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive suite of investigation and verification capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-cyber ${
                  isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'
                }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    feature.color === 'cyber-teal' ? 'bg-cyber-teal/20 text-cyber-teal' :
                    feature.color === 'neon-magenta' ? 'bg-neon-magenta/20 text-neon-magenta' :
                    'bg-electric-blue/20 text-electric-blue'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Access Methods Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Multiple Access Methods
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Choose the most convenient way to access intelligence services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-xl border text-center transition-all duration-300 hover:shadow-cyber ${
              isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'
            }`}>
              <Globe className="w-16 h-16 text-cyber-teal mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Web Portal
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Full-featured web interface with advanced search capabilities and detailed reporting
              </p>
              <Link
                to="/officer/login"
                className="inline-flex items-center space-x-2 text-cyber-teal hover:text-electric-blue transition-colors"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className={`p-8 rounded-xl border text-center transition-all duration-300 hover:shadow-cyber ${
              isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'
            }`}>
              <Phone className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Telegram Bot
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Quick queries via Telegram with natural language processing and instant results
              </p>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Coming Soon
              </span>
            </div>

            <div className={`p-8 rounded-xl border text-center transition-all duration-300 hover:shadow-cyber ${
              isDark ? 'bg-muted-graphite border-cyber-teal/20' : 'bg-white border-gray-200'
            }`}>
              <User className="w-16 h-16 text-electric-blue mx-auto mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                WhatsApp Bot
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Secure WhatsApp integration for field operations and mobile access
              </p>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 ${isDark ? 'border-cyber-teal/20 bg-muted-graphite/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-cyber-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  PickMe Intelligence
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Secure • Compliant • Reliable
                </p>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 PickMe Intelligence. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};