import logging
from typing import List, Dict
import json
import os
from dotenv import load_dotenv
import aiohttp
from services.copilot_service import copilot_client

logger = logging.getLogger(__name__)

class FlashcardService:
    def __init__(self):
        logger.info("Initialized FlashcardService")

    async def generate_flashcards(self, text: str) -> List[Dict[str, str]]:
        """
        Generate flashcards from the given text using Cohere's API.
        
        Args:
            text (str): The text to generate flashcards from
            
        Returns:
            List[Dict[str, str]]: List of flashcards, each containing 'question' and 'answer'
        """
        try:
            # Prepare the message for the API
            message = f"""Create educational flashcards from the following text. 
            Generate clear, concise questions and detailed answers.
            Focus on key concepts and important details.
            
            Text:
            {text}"""

            # Call the Cohere API through the copilot client
            response = await copilot_client.generate_chat_completion([{"content": message}])
            
            # Parse the response
            response_data = json.loads(response)
            flashcards = response_data.get('flashcards', [])
            
            logger.info(f"Generated {len(flashcards)} flashcards")
            return flashcards
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
flashcard_service = FlashcardService() 