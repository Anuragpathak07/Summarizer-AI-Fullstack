import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { FileText, Clock, Trash2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);

  const loadRecentUploads = () => {
    try {
      setIsLoading(true);
      const storedUploads = localStorage.getItem('recentUploads');
      console.log('Raw stored uploads:', storedUploads);
      
      if (!storedUploads) {
        console.log('No stored uploads found');
        setRecentUploads([]);
        return;
      }

      try {
        const parsedUploads = JSON.parse(storedUploads);
        console.log('Parsed uploads:', parsedUploads);
        
        if (!Array.isArray(parsedUploads)) {
          console.error('Stored uploads is not an array:', parsedUploads);
          setRecentUploads([]);
          return;
        }

        // Validate each upload
        const validUploads = parsedUploads.filter((upload): upload is RecentUpload => {
          const isValid = upload &&
            typeof upload === 'object' &&
            typeof upload.id === 'string' &&
            typeof upload.filename === 'string' &&
            typeof upload.timestamp === 'number' &&
            Array.isArray(upload.flashcards) &&
            Array.isArray(upload.learningContent) &&
            Array.isArray(upload.quizQuestions);

          if (!isValid) {
            console.error('Invalid upload found:', upload);
          }
          return isValid;
        });

        console.log('Valid uploads:', validUploads);
        setRecentUploads(validUploads);
      } catch (parseError) {
        console.error('Error parsing stored uploads:', parseError);
        setRecentUploads([]);
      }
    } catch (error) {
      console.error('Error loading recent uploads:', error);
      setRecentUploads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const storedUploads = localStorage.getItem('recentUploads');
      if (storedUploads) {
        const parsedUploads: RecentUpload[] = JSON.parse(storedUploads);
        const updatedUploads = parsedUploads.filter(upload => upload.id !== id);
        localStorage.setItem('recentUploads', JSON.stringify(updatedUploads));
        setRecentUploads(updatedUploads);
        
        // Dispatch storage event to notify other components/tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'recentUploads',
          newValue: JSON.stringify(updatedUploads),
          storageArea: localStorage
        }));
      }
    } catch (error) {
      console.error('Error deleting recent upload:', error);
    }
  };

  useEffect(() => {
    loadRecentUploads();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recentUploads') {
        console.log('Storage event detected:', e);
        loadRecentUploads();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  console.log('Current recentUploads state:', recentUploads);

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Uploads
        </h2>
        <div className="text-gray-500 dark:text-gray-400">Loading recent uploads...</div>
      </div>
    );
  }

  if (!recentUploads || recentUploads.length === 0) {
    console.log('No recent uploads to display');
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Recent Uploads
        </h2>
        <div className="text-gray-500 dark:text-gray-400">No recent uploads found</div>
      </div>
    );
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
            className="p-4 hover:shadow-lg transition-shadow relative"
          >
            <div 
              className="flex items-start space-x-3 cursor-pointer"
              onClick={() => {
                console.log('Selected upload:', upload);
                onSelect({
                  flashcards: upload.flashcards,
                  learningContent: upload.learningContent,
                  quizQuestions: upload.quizQuestions,
                });
              }}
            >
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
            <button
              onClick={(e) => handleDelete(e, upload.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Delete upload"
            >
              <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}; 