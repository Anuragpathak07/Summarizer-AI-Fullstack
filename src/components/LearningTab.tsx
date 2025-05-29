import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Pin, TrendingUp, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LearningConcept {
  id: string;
  title: string;
  category: string;
  definition: string;
  realWorldExample: {
    title: string;
    description: string;
    emoji: string;
  };
  latestInsight: {
    quote: string;
    source: string;
  };
  isPinned: boolean;
}

const mockConcepts: LearningConcept[] = [
  {
    id: '1',
    title: 'Machine Learning',
    category: 'Computer Science',
    definition: 'A subset of artificial intelligence that enables computer systems to automatically learn and improve from experience without being explicitly programmed.',
    realWorldExample: {
      title: 'Netflix Recommendations',
      description: 'Netflix uses machine learning algorithms to analyze your viewing history and preferences to suggest movies and shows you might enjoy.',
      emoji: '🎬'
    },
    latestInsight: {
      quote: 'Recent advances in transformer architectures have revolutionized natural language processing, achieving human-level performance on many tasks.',
      source: 'Nature Machine Intelligence, 2024'
    },
    isPinned: false
  },
  {
    id: '2',
    title: 'Photosynthesis',
    category: 'Biology',
    definition: 'The process by which plants and other organisms convert light energy into chemical energy that can be later released to fuel cellular activities.',
    realWorldExample: {
      title: 'Solar Panel Inspiration',
      description: 'Scientists study photosynthesis to develop more efficient solar panels and artificial leaf technologies for renewable energy.',
      emoji: '🌱'
    },
    latestInsight: {
      quote: 'New research reveals that quantum effects play a crucial role in the efficiency of photosynthetic energy transfer.',
      source: 'Science, 2024'
    },
    isPinned: true
  },
  {
    id: '3',
    title: 'Blockchain',
    category: 'Technology',
    definition: 'A distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography.',
    realWorldExample: {
      title: 'Supply Chain Tracking',
      description: 'Walmart uses blockchain to track food products from farm to store, enabling rapid identification of contamination sources.',
      emoji: '🔗'
    },
    latestInsight: {
      quote: 'Central bank digital currencies (CBDCs) are reshaping how we think about blockchain applications in traditional finance.',
      source: 'MIT Technology Review, 2024'
    },
    isPinned: false
  }
];

export const LearningTab: React.FC = () => {
  const [concepts, setConcepts] = useState<LearningConcept[]>(mockConcepts);
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());

  const togglePin = (conceptId: string) => {
    setConcepts(prev => 
      prev.map(concept => 
        concept.id === conceptId 
          ? { ...concept, isPinned: !concept.isPinned }
          : concept
      )
    );
  };

  const toggleExpanded = (conceptId: string) => {
    setExpandedConcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conceptId)) {
        newSet.delete(conceptId);
      } else {
        newSet.add(conceptId);
      }
      return newSet;
    });
  };

  const categoryColors = {
    'Computer Science': 'bg-purple-light text-purple-800',
    'Biology': 'bg-green-light text-green-800',
    'Technology': 'bg-cyan/20 text-cyan-800',
    'Physics': 'bg-blue-100 text-blue-800'
  };

  // Sort concepts with pinned ones first
  const sortedConcepts = [...concepts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enhanced Learning</h2>
        <p className="text-gray-600 dark:text-gray-400">Deep dive into concepts with research-backed insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedConcepts.map((concept, index) => (
          <motion.div
            key={concept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`p-6 card-hover glassmorphism relative ${concept.isPinned ? 'ring-2 ring-indigo' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={categoryColors[concept.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}>
                      {concept.category}
                    </Badge>
                    {concept.isPinned && (
                      <Badge variant="outline" className="text-indigo border-indigo">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(concept.id)}
                    className={`p-2 ${concept.isPinned ? 'text-indigo' : 'text-gray-400'}`}
                  >
                    <Pin className={`w-4 h-4 ${concept.isPinned ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {concept.title}
                  </h3>
                </div>

                {/* Definition Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Definition</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-6">
                    {concept.definition}
                  </p>
                </div>

                {/* Real World Example */}
                <div className="bg-soft-yellow/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{concept.realWorldExample.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Real-World Application
                    </span>
                  </div>
                  <div className="pl-7">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {concept.realWorldExample.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {concept.realWorldExample.description}
                    </p>
                  </div>
                </div>

                {/* Latest Insight */}
                <div className="border border-cyan/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-cyan" />
                    <Badge variant="outline" className="text-cyan border-cyan text-xs">
                      Latest Insight
                    </Badge>
                  </div>
                  <blockquote className="text-sm text-gray-700 dark:text-gray-300 pl-6 border-l-2 border-cyan/30">
                    "{concept.latestInsight.quote}"
                  </blockquote>
                  <p className="text-xs text-gray-500 pl-6">
                    — {concept.latestInsight.source}
                  </p>
                </div>

                {/* Expand for more details */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(concept.id)}
                  className="w-full flex items-center justify-center space-x-2 text-indigo hover:text-indigo"
                >
                  <Globe className="w-4 h-4" />
                  <span>Explore Further</span>
                  {expandedConcepts.has(concept.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                <AnimatePresence>
                  {expandedConcepts.has(concept.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" className="justify-start">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Wikipedia Article
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <Globe className="w-4 h-4 mr-2" />
                          Research Papers
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          💡 <strong>Study Tip:</strong> Connect this concept to {concept.realWorldExample.title.toLowerCase()} 
                          when reviewing to strengthen memory retention.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
