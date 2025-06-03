import React, { useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Download, 
  FileText, 
  BookOpen,
  Brain,
  FileQuestion,
} from 'lucide-react';
import { toast } from './ui/use-toast';

interface ExportUtilitiesProps {
  flashcards?: Array<{ question: string; answer: string }>;
  learningContent?: Array<{
    concept: string;
    definition: string;
    real_world_application: string;
    latest_insight: string;
  }>;
  quizQuestions?: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

export const ExportUtilities: React.FC<ExportUtilitiesProps> = ({
  flashcards = [],
  learningContent = [],
  quizQuestions = [],
}) => {
  useEffect(() => {
    console.log('ExportUtilities mounted with:', {
      flashcards: flashcards.length,
      learningContent: learningContent.length,
      quizQuestions: quizQuestions.length
    });
  }, [flashcards, learningContent, quizQuestions]);

  const exportToPDF = async (data: any[], filename: string, type: 'flashcards' | 'learning' | 'quiz') => {
    try {
      // Create a formatted HTML content
      let content = '';
      
      if (type === 'flashcards') {
        content = data.map((card, index) => `
          <div style="page-break-after: always; margin-bottom: 20px;">
            <h3 style="color: #2563eb;">Flashcard ${index + 1}</h3>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Question:</p>
              <p>${card.question}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #e0f2fe; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Answer:</p>
              <p>${card.answer}</p>
            </div>
          </div>
        `).join('');
      } else if (type === 'learning') {
        content = data.map((item, index) => `
          <div style="page-break-after: always; margin-bottom: 20px;">
            <h3 style="color: #16a34a;">Learning Concept ${index + 1}</h3>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Concept:</p>
              <p>${item.concept}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Definition:</p>
              <p>${item.definition}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Real World Application:</p>
              <p>${item.real_world_application}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Latest Insight:</p>
              <p>${item.latest_insight}</p>
            </div>
          </div>
        `).join('');
      } else if (type === 'quiz') {
        content = data.map((question, index) => `
          <div style="page-break-after: always; margin-bottom: 20px;">
            <h3 style="color: #9333ea;">Quiz Question ${index + 1}</h3>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Question:</p>
              <p>${question.question}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Options:</p>
              <ul style="list-style-type: none; padding: 0;">
                ${question.options.map((option: string, i: number) => `
                  <li style="margin: 5px 0;">${String.fromCharCode(65 + i)}. ${option}</li>
                `).join('')}
              </ul>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #e0f2fe; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Correct Answer:</p>
              <p>${question.correct_answer}</p>
            </div>
            <div style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="font-weight: bold; margin-bottom: 10px;">Explanation:</p>
              <p>${question.explanation}</p>
            </div>
          </div>
        `).join('');
      }

      // Create a new window with the content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      // Write the content to the window
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);

      // Wait for content to load
      printWindow.document.close();
      printWindow.focus();

      // Print to PDF
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({
        title: 'Export Successful',
        description: `${filename} has been generated.`,
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error generating the PDF.',
        variant: 'destructive',
      });
    }
  };

  const exportToWord = async (data: any[], filename: string, type: 'flashcards' | 'learning' | 'quiz') => {
    try {
      // Create a formatted HTML content
      let content = '';
      
      if (type === 'flashcards') {
        content = data.map((card, index) => `
          <h3>Flashcard ${index + 1}</h3>
          <p><strong>Question:</strong><br>${card.question}</p>
          <p><strong>Answer:</strong><br>${card.answer}</p>
          <hr>
        `).join('');
      } else if (type === 'learning') {
        content = data.map((item, index) => `
          <h3>Learning Concept ${index + 1}</h3>
          <p><strong>Concept:</strong><br>${item.concept}</p>
          <p><strong>Definition:</strong><br>${item.definition}</p>
          <p><strong>Real World Application:</strong><br>${item.real_world_application}</p>
          <p><strong>Latest Insight:</strong><br>${item.latest_insight}</p>
          <hr>
        `).join('');
      } else if (type === 'quiz') {
        content = data.map((question, index) => `
          <h3>Quiz Question ${index + 1}</h3>
          <p><strong>Question:</strong><br>${question.question}</p>
          <p><strong>Options:</strong></p>
          <ul>
            ${question.options.map((option: string, i: number) => `
              <li>${String.fromCharCode(65 + i)}. ${option}</li>
            `).join('')}
          </ul>
          <p><strong>Correct Answer:</strong><br>${question.correct_answer}</p>
          <p><strong>Explanation:</strong><br>${question.explanation}</p>
          <hr>
        `).join('');
      }

      // Create a blob with the content
      const blob = new Blob([`
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `], { type: 'application/msword' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error generating the Word document.',
        variant: 'destructive',
      });
    }
  };

  const exportToTXT = (data: any[], filename: string) => {
    try {
      const textContent = data.map(item => {
        return Object.entries(item)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}:\n${value.map(v => `- ${v}`).join('\n')}`;
            }
            return `${key}: ${value}`;
          })
          .join('\n\n');
      }).join('\n\n---\n\n');

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      console.error('Error exporting to TXT:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data.',
        variant: 'destructive',
      });
    }
  };

  const hasContent = flashcards.length > 0 || learningContent.length > 0 || quizQuestions.length > 0;

  console.log('Rendering ExportUtilities, hasContent:', hasContent);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Export Your Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">
            Download your generated content in various formats
          </p>
        </div>

        {!hasContent ? (
          <Card className="p-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                No Content to Export
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Upload a PDF and generate content to enable export options.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {flashcards.length > 0 && (
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                      Flashcards ({flashcards.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => exportToPDF(flashcards, 'flashcards.pdf', 'flashcards')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
                        Export as PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => exportToWord(flashcards, 'flashcards.doc', 'flashcards')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                        Export as Word
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => exportToTXT(flashcards, 'flashcards.txt')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                        Export as TXT
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {learningContent.length > 0 && (
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-xl">
                    <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                      Learning Content ({learningContent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => exportToPDF(learningContent, 'learning_content.pdf', 'learning')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
                        Export as PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => exportToWord(learningContent, 'learning_content.doc', 'learning')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                        Export as Word
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => exportToTXT(learningContent, 'learning_content.txt')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                        Export as TXT
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {quizQuestions.length > 0 && (
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <FileQuestion className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                      Quiz Questions ({quizQuestions.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => exportToPDF(quizQuestions, 'quiz_questions.pdf', 'quiz')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
                        Export as PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => exportToWord(quizQuestions, 'quiz_questions.doc', 'quiz')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
                        Export as Word
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 text-base justify-start hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => exportToTXT(quizQuestions, 'quiz_questions.txt')}
                      >
                        <FileText className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                        Export as TXT
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
