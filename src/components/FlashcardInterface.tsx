import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardInterfaceProps {
  flashcards: Flashcard[];
  isLoading?: boolean;
  error?: string | null;
}

export const FlashcardInterface: React.FC<FlashcardInterfaceProps> = ({
  flashcards,
  isLoading = false,
  error = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No flashcards available. Please upload a PDF first.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        <Card
          className={`p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-transform duration-500 transform-gpu ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          <div className={`text-center ${isFlipped ? 'hidden' : 'block'}`}>
            <h3 className="text-xl font-semibold mb-4">Question</h3>
            <p className="text-lg">{currentCard.question}</p>
          </div>
          <div className={`text-center ${isFlipped ? 'block' : 'hidden'}`}>
            <h3 className="text-xl font-semibold mb-4">Answer</h3>
            <p className="text-lg">{currentCard.answer}</p>
          </div>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleFlip}
            className="flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            className="flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>
    </div>
  );
}; 