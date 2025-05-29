import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Target, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-choice',
    difficulty: 'easy',
    question: 'What is the primary function of chlorophyll in plants?',
    options: ['Water absorption', 'Light absorption', 'Nutrient storage', 'Gas exchange'],
    correctAnswer: 'Light absorption',
    explanation: 'Chlorophyll is the green pigment that absorbs light energy for photosynthesis.',
    points: 10
  },
  {
    id: '2',
    type: 'true-false',
    difficulty: 'medium',
    question: 'Photosynthesis only occurs during daylight hours.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Photosynthesis requires light energy, so it primarily occurs during daylight hours.',
    points: 15
  },
  {
    id: '3',
    type: 'multiple-choice',
    difficulty: 'hard',
    question: 'Which enzyme is crucial for the Calvin cycle in photosynthesis?',
    options: ['RuBisCO', 'ATP synthase', 'Cytochrome oxidase', 'Hexokinase'],
    correctAnswer: 'RuBisCO',
    explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase) is the key enzyme in carbon fixation.',
    points: 20
  }
];

export const QuizInterface: React.FC = () => {
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const filteredQuestions = mockQuestions.filter(q => q.difficulty === currentDifficulty);
  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    setShowResult(true);

    // Check if quiz is complete
    if (currentQuestionIndex === filteredQuestions.length - 1) {
      const finalScore = isCorrect ? score + currentQuestion.points : score;
      if (finalScore === filteredQuestions.reduce((sum, q) => sum + q.points, 0)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
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
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300'
  };

  useEffect(() => {
    resetQuiz();
  }, [currentDifficulty]);

  const isCorrectAnswer = selectedAnswer === currentQuestion?.correctAnswer;

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
        
        {/* Difficulty Selector */}
        <div className="flex justify-center space-x-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
            <Button
              key={difficulty}
              variant={currentDifficulty === difficulty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentDifficulty(difficulty)}
              className={`capitalize ${
                currentDifficulty === difficulty
                  ? 'bg-indigo text-white'
                  : 'hover:bg-indigo/10'
              }`}
            >
              {difficulty}
            </Button>
          ))}
        </div>

        {/* Progress and Score */}
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{score} pts</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo" />
            <span className="text-sm">{currentQuestionIndex + 1}/{filteredQuestions.length}</span>
          </div>
        </div>

        <Progress value={progress} className="max-w-md mx-auto" />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 glassmorphism">
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <Badge className={difficultyColors[currentQuestion.difficulty]}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.points}
                </Badge>
              </div>

              {/* Question */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {currentQuestion.question}
                </h3>

                {/* Answer Options */}
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
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
                            ${showResult && option === currentQuestion.correctAnswer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : ''
                            }
                            ${showResult && selectedAnswer === option && option !== currentQuestion.correctAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : ''
                            }
                          `}
                        >
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <span className="text-gray-900 dark:text-gray-100">{option}</span>
                          {showResult && (
                            <div className="ml-auto">
                              {option === currentQuestion.correctAnswer && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              {selectedAnswer === option && option !== currentQuestion.correctAnswer && (
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

              {/* Result and Explanation */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className={`
                      p-4 rounded-lg border-l-4
                      ${isCorrectAnswer
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }
                    `}>
                      <div className="flex items-center space-x-2 mb-2">
                        {isCorrectAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-semibold ${
                          isCorrectAnswer ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {isCorrectAnswer ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetQuiz}>
                  Restart Quiz
                </Button>
                
                {!showResult ? (
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="bg-indigo hover:bg-indigo/90"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    className="bg-indigo hover:bg-indigo/90"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Final Score */}
      {currentQuestionIndex === filteredQuestions.length - 1 && showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 glassmorphism text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Quiz Complete!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Final Score: <span className="font-bold text-indigo">{score}</span> / {filteredQuestions.reduce((sum, q) => sum + q.points, 0)} points
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={resetQuiz} variant="outline">
                Try Again
              </Button>
              <Button
                onClick={() => setCurrentDifficulty(
                  currentDifficulty === 'easy' ? 'medium' : 
                  currentDifficulty === 'medium' ? 'hard' : 'easy'
                )}
                className="bg-indigo hover:bg-indigo/90"
              >
                Next Difficulty
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
