import React from 'react';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

interface LearningContent {
  concept: string;
  definition: string;
  real_world_application: string;
  latest_insight: string;
}

interface LearningTabProps {
  learningContent: LearningContent[];
}

export const LearningTab: React.FC<LearningTabProps> = ({ learningContent }) => {
  if (!learningContent || learningContent.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400">
          No learning content available. Please upload a PDF first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Deep dive into concepts with research-backed insights
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {learningContent.map((content, index) => (
          <motion.div
            key={content.concept}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {content.concept}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Definition
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {content.definition}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Real-world Application
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {content.real_world_application}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Latest Research Insight
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {content.latest_insight}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
