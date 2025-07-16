import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const LoadingSpinner: React.FC = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-center min-h-screen ${
      isDark ? 'bg-crisp-black' : 'bg-soft-white'
    }`}>
      <div className="relative">
        <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
          isDark 
            ? 'border-muted-graphite border-t-cyber-teal' 
            : 'border-gray-300 border-t-cyber-teal'
        }`}></div>
        <div className={`absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-pulse ${
          isDark 
            ? 'border-t-neon-magenta' 
            : 'border-t-electric-blue'
        }`}></div>
      </div>
    </div>
  );
};