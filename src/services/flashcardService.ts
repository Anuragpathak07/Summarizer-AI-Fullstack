interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardGenerationRequest {
  text: string;
  numCards?: number;
}

export const generateFlashcards = async (
  request: FlashcardGenerationRequest
): Promise<Flashcard[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates educational flashcards from text. Create clear, concise questions and answers.'
          },
          {
            role: 'user',
            content: `Create ${request.numCards || 5} flashcards from the following text:\n\n${request.text}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response into flashcards
    const flashcards: Flashcard[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i += 2) {
      if (i + 1 < lines.length) {
        const question = lines[i].replace(/^Q:|^Question:/, '').trim();
        const answer = lines[i + 1].replace(/^A:|^Answer:/, '').trim();
        
        if (question && answer) {
          flashcards.push({ question, answer });
        }
      }
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}; 