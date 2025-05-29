import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';

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

interface PDFUploaderProps {
  onUploadComplete: (flashcards: Flashcard[], learningContent: LearningContent[]) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Process flashcards first
      console.log('Sending PDF to backend for flashcard generation...');
      const flashcardsResponse = await fetch('http://192.168.31.10:5000/api/flashcards/generate', {
        method: 'POST',
        body: formData,
      });

      if (!flashcardsResponse.ok) {
        const errorText = await flashcardsResponse.text();
        console.error('Flashcards backend error:', errorText);
        throw new Error(`Failed to generate flashcards: ${errorText}`);
      }

      const flashcardsData = await flashcardsResponse.json();
      console.log('Flashcards response:', flashcardsData);

      // Validate flashcards
      if (!flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
        console.error('Invalid flashcards response format:', flashcardsData);
        throw new Error('Invalid flashcards response format from backend');
      }

      const validFlashcards = flashcardsData.flashcards.filter((card: any) => 
        card && 
        typeof card === 'object' && 
        typeof card.question === 'string' && 
        typeof card.answer === 'string' &&
        card.question.trim() !== '' &&
        card.answer.trim() !== ''
      );

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards could be generated from the PDF');
      }

      // Create a new FormData for the learning content request
      const learningFormData = new FormData();
      learningFormData.append('file', file);

      let validLearningContent: LearningContent[] = [];

      // Process learning content with increased timeout
      console.log('Sending PDF to backend for learning content generation...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      try {
        const learningResponse = await fetch('http://192.168.31.10:5000/api/learning/enhanced', {
          method: 'POST',
          body: learningFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!learningResponse.ok) {
          const errorText = await learningResponse.text();
          console.error('Learning content backend error:', errorText);
          // Don't throw, just log and continue
          console.log('Continuing with flashcards only due to learning content error');
          return;
        }

        const learningData = await learningResponse.json();
        console.log('Learning content response:', learningData);

        // Validate learning content
        if (!learningData.learning_content || !Array.isArray(learningData.learning_content)) {
          console.error('Invalid learning content response format:', learningData);
          // Don't throw, just log and continue
          console.log('Continuing with flashcards only due to invalid learning content format');
          return;
        }

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

        // If no valid learning content, show a warning but continue with flashcards
        if (validLearningContent.length === 0) {
          toast({
            title: 'Limited Content',
            description: 'Could not generate enhanced learning content, but flashcards are available.',
            variant: 'warning',
          });
        }
      } catch (error) {
        // Handle all learning content errors gracefully
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            toast({
              title: 'Processing Timeout',
              description: 'The learning content generation is taking longer than expected. You can still use the flashcards while we process the learning content.',
              variant: 'warning',
            });
          } else {
            console.error('Error generating learning content:', error);
            toast({
              title: 'Limited Content',
              description: 'Could not generate enhanced learning content, but flashcards are available.',
              variant: 'warning',
            });
          }
        }
      } finally {
        // Always complete with whatever content we have
        onUploadComplete(validFlashcards, validLearningContent);
        
        toast({
          title: 'Success',
          description: `Generated ${validFlashcards.length} flashcards${validLearningContent.length > 0 ? ` and ${validLearningContent.length} learning concepts` : ''}`,
        });
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
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

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          {isDragActive ? (
            <p className="text-lg">Drop the PDF here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">Drag and drop your PDF here, or click to select</p>
              <Button variant="outline">Select PDF</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
