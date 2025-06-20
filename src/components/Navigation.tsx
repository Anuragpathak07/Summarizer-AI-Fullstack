import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, BookOpen, Target, Download, Moon, Sun, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'flashcards', label: 'Flashcards', icon: FileText },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: Target },
  { id: 'export', label: 'Export', icon: Download },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 font-poppins">
              CogniPrep
            </span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo text-white shadow-lg' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-indigo hover:bg-indigo/10'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">{item.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-xl"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};
