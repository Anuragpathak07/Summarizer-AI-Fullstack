import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';
import { PDFUploader } from '@/components/PDFUploader';
import { FlashcardInterface } from '@/components/FlashcardInterface';
import { LearningInterface } from '@/components/LearningInterface';
import { QuizInterface } from '@/components/QuizInterface';
import { ExportUtilities } from '@/components/ExportUtilities';
import { RecentUploads } from '@/components/RecentUploads';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [hasUploadedPDF, setHasUploadedPDF] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (
    newFlashcards: Flashcard[],
    newLearningContent: LearningContent[],
    newQuizQuestions: QuizQuestion[]
  ) => {
    console.log('PDF Upload Complete:', { newFlashcards, newLearningContent, newQuizQuestions });
    setFlashcards(newFlashcards);
    setLearningContent(newLearningContent);
    setQuizQuestions(newQuizQuestions);
    setHasUploadedPDF(true);
    setActiveTab('flashcards');
    setIsLoading(false);
    setError(null);
  };

  const handleRecentSelect = (data: {
    flashcards: Flashcard[];
    learningContent: LearningContent[];
    quizQuestions: QuizQuestion[];
  }) => {
    setFlashcards(data.flashcards);
    setLearningContent(data.learningContent);
    setQuizQuestions(data.quizQuestions);
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
        return (
          <div className="space-y-8">
            <PDFUploader onUploadComplete={handleUploadComplete} />
            <RecentUploads onSelect={handleRecentSelect} />
          </div>
        );
      case 'flashcards':
        return (
          <FlashcardInterface
            flashcards={flashcards}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'learning':
        return (
          <LearningInterface
            learningContent={learningContent}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'quiz':
        return (
          <QuizInterface
            questions={quizQuestions}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'export':
        return <ExportUtilities />;
      default:
        return null;
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
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
