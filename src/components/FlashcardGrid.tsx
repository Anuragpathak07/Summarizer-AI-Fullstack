import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardGridProps {
  flashcards?: Flashcard[];
}

export const FlashcardGrid: React.FC<FlashcardGridProps> = ({ flashcards = [] }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            No flashcards available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a PDF to generate flashcards.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  
  // Check if currentCard is valid
  if (!currentCard || !currentCard.question || !currentCard.answer) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invalid Flashcard Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This flashcard is missing question and answer data.
          </p>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Flashcard {currentCardIndex + 1} of {flashcards.length}
        </h2>
      </div>

      <div className="relative perspective-1000">
          <motion.div
          className="relative w-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card (Question) */}
          <Card 
            className={`p-8 min-h-[400px] flex flex-col justify-between absolute w-full backface-hidden
              ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Question</h3>
              <p className="text-lg">{currentCard.question}</p>
                </div>

            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="rounded-full"
                    >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFlip}
                className="rounded-full"
                      >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full"
                            >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Back of card (Answer) */}
          <Card 
            className={`p-8 min-h-[400px] flex flex-col justify-between absolute w-full backface-hidden
              ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
                            >
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Answer</h3>
              <p className="text-lg">{currentCard.answer}</p>
                </div>

            <div className="flex justify-center space-x-4 mt-8">
                <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="rounded-full"
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFlip}
                className="rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="rounded-full"
                          >
                <ChevronRight className="h-4 w-4" />
              </Button>
              </div>
            </Card>
          </motion.div>
      </div>
    </div>
  );
};
