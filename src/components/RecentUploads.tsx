import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { FileText, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentUpload {
  id: string;
  filename: string;
  timestamp: number;
  flashcards: Array<{ question: string; answer: string }>;
  learningContent: Array<{
    concept: string;
    definition: string;
    real_world_application: string;
    latest_insight: string;
  }>;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

interface RecentUploadsProps {
  onSelect: (data: {
    flashcards: RecentUpload['flashcards'];
    learningContent: RecentUpload['learningContent'];
    quizQuestions: RecentUpload['quizQuestions'];
  }) => void;
}

export const RecentUploads: React.FC<RecentUploadsProps> = ({ onSelect }) => {
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);

  useEffect(() => {
    // Load recent uploads from localStorage
    const storedUploads = localStorage.getItem('recentUploads');
    console.log('Stored uploads:', storedUploads);
    if (storedUploads) {
      try {
        const parsedUploads = JSON.parse(storedUploads);
        console.log('Parsed uploads:', parsedUploads);
        setRecentUploads(parsedUploads);
      } catch (error) {
        console.error('Error parsing stored uploads:', error);
      }
    }
  }, []);

  // Add a debug log for the current state
  console.log('Current recentUploads state:', recentUploads);

  if (recentUploads.length === 0) {
    console.log('No recent uploads found');
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Recent Uploads
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentUploads.map((upload) => (
          <Card
            key={upload.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect({
              flashcards: upload.flashcards,
              learningContent: upload.learningContent,
              quizQuestions: upload.quizQuestions,
            })}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {upload.filename}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {formatDistanceToNow(upload.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{upload.flashcards.length} flashcards</span>
                  <span>{upload.learningContent.length} concepts</span>
                  <span>{upload.quizQuestions.length} questions</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 