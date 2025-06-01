import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Target, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizInterfaceProps {
  questions: Question[];
  isLoading?: boolean;
  error?: string | null;
  onNewQuiz?: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ 
  questions: initialQuestions = [], 
  isLoading = false,
  error = null,
  onNewQuiz
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Set());
  }, [initialQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
    setShowResult(true);

    // Check if quiz is complete
    if (currentQuestionIndex === questions.length - 1) {
      const finalScore = isCorrect ? score + 10 : score;
      if (finalScore === questions.length * 10) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    if (onNewQuiz) {
      onNewQuiz();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
        {onNewQuiz && <Button onClick={onNewQuiz}>Try Again</Button>}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">No questions available</p>
        {onNewQuiz && <Button onClick={onNewQuiz}>Generate New Quiz</Button>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded"
              style={{
                left: Math.random() * window.innerWidth,
                top: window.innerHeight,
              }}
              animate={{
                y: -window.innerHeight - 100,
                rotate: 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Interactive Quiz</h2>

        {/* Progress and Score */}
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{score} pts</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo" />
            <span className="text-sm">{currentQuestionIndex + 1}/{questions.length}</span>
          </div>
        </div>

        <Progress value={progress} className="max-w-md mx-auto" />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 glassmorphism">
          <div className="space-y-6">
            {/* Question */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {currentQuestion.question}
              </h3>

              {/* Answer Options */}
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Label
                        htmlFor={`option-${index}`}
                        className={`
                          flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer
                          transition-all duration-200
                          ${selectedAnswer === option
                            ? 'border-indigo bg-indigo/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo/50'
                          }
                          ${showResult && option === currentQuestion.correct_answer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : ''
                          }
                          ${showResult && selectedAnswer === option && option !== currentQuestion.correct_answer
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : ''
                          }
                        `}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <span className="text-gray-900 dark:text-gray-100">{option}</span>
                        {showResult && (
                          <div className="ml-auto">
                            {option === currentQuestion.correct_answer && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {selectedAnswer === option && option !== currentQuestion.correct_answer && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Explanation */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p className="text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {showResult ? (
                currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNextQuestion} className="ml-auto">
                    Next Question <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={resetQuiz} className="ml-auto">
                    Start New Quiz
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="ml-auto"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
