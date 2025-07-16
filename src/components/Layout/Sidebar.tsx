import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Search, 
  CreditCard, 
  Key, 
  Activity, 
  Settings, 
  LogOut,
  Zap,
  UserPlus,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Shield },
  { name: 'Officers', href: '/admin/officers', icon: Users },
  { name: 'Registrations', href: '/admin/registrations', icon: UserPlus },
  { name: 'Query History', href: '/admin/queries', icon: Search },
  { name: 'Credits & Billing', href: '/admin/credits', icon: CreditCard },
  { name: 'Rate Plans', href: '/admin/rate-plans', icon: DollarSign },
  { name: 'API Management', href: '/admin/apis', icon: Key },
  { name: 'Live Requests', href: '/admin/live', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { isDark } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`h-screen w-64 border-r border-cyber-teal/20 flex flex-col ${
      isDark ? 'bg-muted-graphite' : 'bg-white'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-cyber-teal/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-gradient rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyber-teal">PickMe</h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30 shadow-cyber'
                  : `${isDark ? 'text-gray-300 hover:bg-cyber-teal/10' : 'text-gray-700 hover:bg-cyber-teal/10'} hover:text-cyber-teal`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-cyber-teal/20">
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isDark ? 'text-gray-300 hover:bg-red-500/10' : 'text-gray-700 hover:bg-red-500/10'
          } hover:text-red-400`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};