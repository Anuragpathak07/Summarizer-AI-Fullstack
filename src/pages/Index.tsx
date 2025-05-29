import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';
import { PDFUploader } from '@/components/PDFUploader';
import { FlashcardGrid } from '@/components/FlashcardGrid';
import { LearningTab } from '@/components/LearningTab';
import { QuizInterface } from '@/components/QuizInterface';
import { ExportUtilities } from '@/components/ExportUtilities';

interface Flashcard {
  question: string;
  answer: string;
}

interface LearningContent {
  concept: string;
  definition: string;
  real_world_application: string;
  latest_insight: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [hasUploadedPDF, setHasUploadedPDF] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);

  const handleUploadComplete = (flashcards: Flashcard[], learningContent: LearningContent[]) => {
    console.log('PDF Upload Complete:', { flashcards, learningContent });
    setFlashcards(flashcards);
    setLearningContent(learningContent);
    setHasUploadedPDF(true);
    setActiveTab('flashcards');
  };

  const renderTabContent = () => {
    if (!hasUploadedPDF && activeTab !== 'upload') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Upload a PDF to get started
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your academic chapter PDF to unlock flashcards, quizzes, and enhanced learning features.
            </p>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-6 py-2 bg-indigo text-white rounded-lg hover:bg-indigo/90 transition-colors"
            >
              Go to Upload
            </button>
          </div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'upload':
        return <PDFUploader onUploadComplete={handleUploadComplete} />;
      case 'flashcards':
        return <FlashcardGrid flashcards={flashcards} />;
      case 'learning':
        return <LearningTab learningContent={learningContent} />;
      case 'quiz':
        return <QuizInterface />;
      case 'export':
        return <ExportUtilities />;
      default:
        return <PDFUploader onUploadComplete={handleUploadComplete} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* AI Assistant (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform z-50"
        >
          <span className="text-white text-xl">🤖</span>
        </motion.div>

        {/* Background Decorations */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-light rounded-full opacity-50" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-cyan/20 rounded-full opacity-50" />
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-soft-yellow/30 rounded-full opacity-50" />
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-green-light rounded-full opacity-50" />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
