import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiError {
  error: string;
  message?: string;
}

export const useCopilot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChatCompletion = async (messages: Message[]): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data.response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateChatCompletion,
    isLoading,
    error,
  };
}; 