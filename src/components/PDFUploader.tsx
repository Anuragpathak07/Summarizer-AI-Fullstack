import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import { Progress } from './ui/progress';
import { Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

interface PDFUploaderProps {
  onUploadComplete: (flashcards: Flashcard[], learningContent: LearningContent[], quizQuestions: QuizQuestion[]) => void;
}

type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'generating_flashcards' | 'generating_learning' | 'generating_quiz' | 'complete' | 'error';

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB in bytes

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const updateProgress = (newStatus: ProcessingStatus, newProgress: number) => {
    setStatus(newStatus);
    setProgress(newProgress);
  };

  const processChunk = async (
    formData: FormData,
    endpoint: string,
    chunkNumber: number,
    totalChunks: number,
    type: 'flashcards' | 'learning' | 'quiz'
  ) => {
    const chunkProgress = (chunkNumber / totalChunks) * 100;
    const baseProgress = type === 'flashcards' ? 0 : type === 'learning' ? 33 : 66;
    const progressIncrement = 33 / totalChunks;

    updateProgress(
      type === 'flashcards' ? 'generating_flashcards' :
      type === 'learning' ? 'generating_learning' : 'generating_quiz',
      baseProgress + (chunkProgress * progressIncrement)
    );

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/${
      type === 'flashcards'
        ? 'flashcards/generate'
        : type === 'learning'
        ? 'learning/enhanced'
        : 'quiz/generate'
    }`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Chunk-Number': chunkNumber.toString(),
        'X-Total-Chunks': totalChunks.toString(),
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ${type} for chunk ${chunkNumber}`);
    }

    return response.json();
  };

  const processSmallFile = async (formData: FormData) => {
    // Generate flashcards
    updateProgress('generating_flashcards', 33);
    const flashcardResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/flashcards/generate`,  {
      method: 'POST',
      body: formData,
    });

    if (!flashcardResponse.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const flashcardData = await flashcardResponse.json();
    const validFlashcards = flashcardData.flashcards.filter((card: any) =>
      card && typeof card === 'object' &&
      typeof card.question === 'string' &&
      typeof card.answer === 'string' &&
      card.question.trim() !== '' &&
      card.answer.trim() !== ''
    );

    // Generate learning content
    updateProgress('generating_learning', 66);
    const learningResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/learning/enhanced`,{
      method: 'POST',
      body: formData,
    });

    let validLearningContent: LearningContent[] = [];
    if (learningResponse.ok) {
      const learningData = await learningResponse.json();
      validLearningContent = learningData.learning_content.filter((content: any) =>
        content &&
        typeof content === 'object' &&
        typeof content.concept === 'string' &&
        typeof content.definition === 'string' &&
        typeof content.real_world_application === 'string' &&
        typeof content.latest_insight === 'string' &&
        content.concept.trim() !== '' &&
        content.definition.trim() !== ''
      );
    }

    // Generate quiz questions
    updateProgress('generating_quiz', 90);
    const quizResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/quiz/generate`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    let validQuizQuestions: QuizQuestion[] = [];
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      validQuizQuestions = quizData.quiz.filter((question: any) =>
        question &&
        typeof question === 'object' &&
        typeof question.question === 'string' &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        typeof question.correct_answer === 'string' &&
        typeof question.explanation === 'string' &&
        question.question.trim() !== '' &&
        question.correct_answer.trim() !== '' &&
        question.explanation.trim() !== ''
      );
    }

    return { validFlashcards, validLearningContent, validQuizQuestions };
  };

  const saveToRecents = (filename: string, flashcards: Flashcard[], learningContent: LearningContent[], quizQuestions: QuizQuestion[]) => {
    try {
      console.log('Saving to recents:', { filename, flashcards, learningContent, quizQuestions });
      
      // Validate data before saving
      if (!filename || !Array.isArray(flashcards) || !Array.isArray(learningContent) || !Array.isArray(quizQuestions)) {
        console.error('Invalid data provided to saveToRecents');
        return;
      }

      const newUpload = {
        id: uuidv4(),
        filename,
        timestamp: Date.now(),
        flashcards: flashcards.filter(card => 
          card && 
          typeof card.question === 'string' && 
          typeof card.answer === 'string' &&
          card.question.trim() !== '' &&
          card.answer.trim() !== ''
        ),
        learningContent: learningContent.filter(content =>
          content &&
          typeof content.concept === 'string' &&
          typeof content.definition === 'string' &&
          typeof content.real_world_application === 'string' &&
          typeof content.latest_insight === 'string' &&
          content.concept.trim() !== '' &&
          content.definition.trim() !== ''
        ),
        quizQuestions: quizQuestions.filter(question =>
          question &&
          typeof question.question === 'string' &&
          Array.isArray(question.options) &&
          question.options.length === 4 &&
          typeof question.correct_answer === 'string' &&
          typeof question.explanation === 'string' &&
          question.question.trim() !== '' &&
          question.correct_answer.trim() !== '' &&
          question.explanation.trim() !== ''
        ),
      };

      // Get existing recents
      const storedRecents = localStorage.getItem('recentUploads');
      console.log('Existing recents:', storedRecents);
      
      let recents: any[] = [];
      if (storedRecents) {
        try {
          recents = JSON.parse(storedRecents);
          if (!Array.isArray(recents)) {
            console.error('Stored recents is not an array, resetting...');
            recents = [];
          }
        } catch (error) {
          console.error('Error parsing stored recents:', error);
          recents = [];
        }
      }

      // Add new upload to the beginning
      const updatedRecents = [newUpload, ...recents].slice(0, 10); // Keep only last 10 uploads
      console.log('Updated recents:', updatedRecents);

      // Save to localStorage
      localStorage.setItem('recentUploads', JSON.stringify(updatedRecents));
      console.log('Saved to localStorage');

      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'recentUploads',
        newValue: JSON.stringify(updatedRecents),
        storageArea: localStorage
      }));

      // Verify the save
      const verifyData = localStorage.getItem('recentUploads');
      console.log('Verification - Stored data:', verifyData);
    } catch (error) {
      console.error('Error saving to recents:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    updateProgress('uploading', 10);
    setCurrentChunk(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let validFlashcards: Flashcard[] = [];
      let validLearningContent: LearningContent[] = [];
      let validQuizQuestions: QuizQuestion[] = [];

      // Check if file is large enough to require chunking
      if (file.size > LARGE_FILE_THRESHOLD) {
        // Get metadata for chunking
        const metadataResponse = await fetch('http://192.168.31.10:5000/api/metadata', {
          method: 'POST',
          body: formData,
        });

        if (!metadataResponse.ok) {
          throw new Error('Failed to get PDF metadata');
        }

        const metadata = await metadataResponse.json();
        const totalChunks = Math.ceil(metadata.total_pages / 5); // Assuming 5 pages per chunk
        setTotalChunks(totalChunks);

        // Process flashcards in chunks
        for (let i = 0; i < totalChunks; i++) {
          setCurrentChunk(i + 1);
          const flashcardData = await processChunk(formData, 'flashcards/generate', i + 1, totalChunks, 'flashcards');
          const chunkFlashcards = flashcardData.flashcards.filter((card: any) =>
            card && typeof card === 'object' &&
            typeof card.question === 'string' &&
            typeof card.answer === 'string' &&
            card.question.trim() !== '' &&
            card.answer.trim() !== ''
          );
          validFlashcards = [...validFlashcards, ...chunkFlashcards];
        }

        // Process learning content in chunks
        for (let i = 0; i < totalChunks; i++) {
          setCurrentChunk(i + 1);
          const learningData = await processChunk(formData, 'learning/enhanced', i + 1, totalChunks, 'learning');
          const chunkLearningContent = learningData.learning_content.filter((content: any) =>
            content &&
            typeof content === 'object' &&
            typeof content.concept === 'string' &&
            typeof content.definition === 'string' &&
            typeof content.real_world_application === 'string' &&
            typeof content.latest_insight === 'string' &&
            content.concept.trim() !== '' &&
            content.definition.trim() !== ''
          );
          validLearningContent = [...validLearningContent, ...chunkLearningContent];
        }

        // Process quiz questions in chunks
        for (let i = 0; i < totalChunks; i++) {
          setCurrentChunk(i + 1);
          const quizData = await processChunk(formData, 'quiz/generate', i + 1, totalChunks, 'quiz');
          const chunkQuizQuestions = quizData.quiz.filter((question: any) =>
            question &&
            typeof question === 'object' &&
            typeof question.question === 'string' &&
            Array.isArray(question.options) &&
            question.options.length === 4 &&
            typeof question.correct_answer === 'string' &&
            typeof question.explanation === 'string' &&
            question.question.trim() !== '' &&
            question.correct_answer.trim() !== '' &&
            question.explanation.trim() !== ''
          );
          validQuizQuestions = [...validQuizQuestions, ...chunkQuizQuestions];
        }
      } else {
        // Process small file directly
        const result = await processSmallFile(formData);
        validFlashcards = result.validFlashcards;
        validLearningContent = result.validLearningContent;
        validQuizQuestions = result.validQuizQuestions;
      }

      updateProgress('complete', 100);
      onUploadComplete(validFlashcards, validLearningContent, validQuizQuestions);

      // Save to recents
      saveToRecents(file.name, validFlashcards, validLearningContent, validQuizQuestions);

      toast({
        title: 'Success',
        description: `Generated ${validFlashcards.length} flashcards${validLearningContent.length > 0 ? `, ${validLearningContent.length} learning concepts` : ''}${validQuizQuestions.length > 0 ? `, and ${validQuizQuestions.length} quiz questions` : ''}`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to process PDF');
      updateProgress('error', 0);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process PDF. Please try again.',
        variant: 'destructive',
      });
    }
  }, [onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const getStatusMessage = () => {
    if (status === 'generating_flashcards' || status === 'generating_learning' || status === 'generating_quiz') {
      if (totalChunks > 0) {
        return `${getStatusMessageForType(status)} (Chunk ${currentChunk} of ${totalChunks})`;
      }
      return getStatusMessageForType(status);
    }
    
    switch (status) {
      case 'uploading':
        return 'Uploading PDF...';
      case 'processing':
        return 'Processing PDF...';
      case 'complete':
        return 'Processing complete!';
      case 'error':
        return 'Error processing PDF';
      default:
        return 'Drop your PDF here or click to browse';
    }
  };

  const getStatusMessageForType = (status: ProcessingStatus) => {
    switch (status) {
      case 'generating_flashcards':
        return 'Generating flashcards...';
      case 'generating_learning':
        return 'Generating learning content...';
      case 'generating_quiz':
        return 'Generating quiz questions...';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'generating_flashcards':
      case 'generating_learning':
      case 'generating_quiz':
        return <Loader2 className="w-8 h-8 animate-spin text-indigo" />;
      case 'complete':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-indigo bg-indigo/5' : 'border-gray-300 dark:border-gray-700'}
            ${status === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            {getStatusIcon()}
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {getStatusMessage()}
            </p>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {status !== 'idle' && status !== 'error' && (
              <div className="w-full max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
              </div>
            )}
            {status === 'idle' && (
              <p className="text-sm text-gray-500">
                Drag and drop your PDF here, or click to select a file
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
