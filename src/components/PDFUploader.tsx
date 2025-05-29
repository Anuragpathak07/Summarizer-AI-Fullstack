import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';

interface Flashcard {
  question: string;
  answer: string;
}

interface PDFUploaderProps {
  onUploadComplete: (flashcards: Flashcard[]) => void;
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

      console.log('Sending PDF to backend...');
      const response = await fetch('http://192.168.31.10:5000/api/flashcards/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Failed to process PDF: ${errorText}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      // Check if the response has the expected structure
      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from backend');
      }

      // Validate each flashcard has the required fields
      const validFlashcards = data.flashcards.filter((card: any) => 
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

      onUploadComplete(validFlashcards);
      
      toast({
        title: 'Success',
        description: `${data.message || `Generated ${validFlashcards.length} flashcards`}`,
      });
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
