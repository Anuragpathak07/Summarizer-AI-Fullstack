import React from 'react';
import { Card } from './ui/card';

interface LearningContent {
  concept: string;
  definition: string;
  real_world_application: string;
  latest_insight: string;
}

interface LearningInterfaceProps {
  learningContent: LearningContent[];
  isLoading?: boolean;
  error?: string | null;
}

export const LearningInterface: React.FC<LearningInterfaceProps> = ({
  learningContent,
  isLoading = false,
  error = null,
}) => {
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

  if (learningContent.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No learning content available. Please upload a PDF first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {learningContent.map((content) => (
        <Card key={content.concept} className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {content.concept}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Definition
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{content.definition}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Real-World Application
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {content.real_world_application}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Latest Insight
              </h4>
              <p className="text-gray-700 dark:text-gray-300">{content.latest_insight}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 