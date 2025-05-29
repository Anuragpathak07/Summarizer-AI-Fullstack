
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, Share2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  color: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'flashcards-pdf',
    title: 'Flashcards PDF',
    description: 'Beautiful printable flashcards with Q&A format',
    icon: <FileText className="w-6 h-6" />,
    format: 'PDF',
    color: 'bg-red-500'
  },
  {
    id: 'flashcards-anki',
    title: 'Anki Deck',
    description: 'Import directly into Anki for spaced repetition',
    icon: <Share2 className="w-6 h-6" />,
    format: 'APKG',
    color: 'bg-blue-500'
  },
  {
    id: 'quiz-results',
    title: 'Quiz Performance',
    description: 'Detailed analytics and performance charts',
    icon: <BarChart3 className="w-6 h-6" />,
    format: 'PDF',
    color: 'bg-green-500'
  },
  {
    id: 'study-notes',
    title: 'Study Notes',
    description: 'Comprehensive notes with concepts and examples',
    icon: <FileText className="w-6 h-6" />,
    format: 'DOCX',
    color: 'bg-purple-500'
  }
];

export const ExportUtilities: React.FC = () => {
  const [exportingItems, setExportingItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleExport = async (optionId: string, title: string) => {
    setExportingItems(prev => new Set([...prev, optionId]));

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setExportingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(optionId);
      return newSet;
    });

    toast({
      title: "Export Complete!",
      description: `${title} has been downloaded successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Export & Share</h2>
        <p className="text-gray-600 dark:text-gray-400">Download your learning materials for offline study</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option, index) => {
          const isExporting = exportingItems.has(option.id);
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 card-hover glassmorphism relative overflow-hidden">
                {/* Gradient Background */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${option.color} opacity-10 rounded-full transform translate-x-6 -translate-y-6`} />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center text-white`}>
                      {option.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.format}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleExport(option.id, option.title)}
                    disabled={isExporting}
                    className="w-full neumorphism hover:shadow-lg transition-all duration-200"
                    variant="outline"
                  >
                    {isExporting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-4 h-4 border-2 border-indigo border-t-transparent rounded-full" />
                        <span>Exporting...</span>
                      </motion.div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </div>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Export Summary
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-indigo">24</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards Ready</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Average</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Concepts Learned</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="p-6 glassmorphism bg-soft-yellow/20">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Pro Tips</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Export Anki decks for spaced repetition learning</li>
                <li>• Print flashcards for offline study sessions</li>
                <li>• Review quiz analytics to identify weak areas</li>
                <li>• Share study notes with classmates</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
