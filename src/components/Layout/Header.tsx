import React from 'react';
import { Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className={`h-16 border-b border-cyber-teal/20 flex items-center justify-between px-6 ${
      isDark ? 'bg-muted-graphite' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-4">
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Admin Control Panel
        </h2>
        <div className="h-6 w-px bg-cyber-teal/30" />
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-electric-blue rounded-full animate-pulse" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            System Online
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className={`relative p-2 transition-colors ${
          isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
        }`}>
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-magenta rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 transition-colors ${
            isDark ? 'text-gray-300 hover:text-cyber-teal' : 'text-gray-600 hover:text-cyber-teal'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-4 border-l border-cyber-teal/20">
          <div className="w-8 h-8 bg-cyber-gradient rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.name}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};