import logging
from typing import List, Dict
import json
import os
from dotenv import load_dotenv
import aiohttp
from services.copilot_service import copilot_client
from utils.logger_config import setup_logger

logger = setup_logger('flashcard_service', 'flashcard_service.log')

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
            logger.info("Starting flashcard generation")
            logger.debug(f"Input text length: {len(text)} characters")

            # Prepare the message for the API with explicit request for 10 flashcards
            message = f"""Create exactly 10 educational flashcards from the following text.
            Each flashcard should:
            1. Have a clear, concise question
            2. Include a detailed, accurate answer
            3. Cover different key concepts from the text
            4. Be suitable for studying and review
            
            Format the response as a JSON object with exactly 10 flashcards.
            Each flashcard must have both a question and answer field.
            
            Text:
            {text}"""

            logger.info("Sending request to Cohere API")
            
            # Call the Cohere API through the copilot client
            response = await copilot_client.generate_chat_completion([{"content": message}])
            logger.info("Received response from Cohere API")
            
            # Parse the response
            response_data = json.loads(response)
            flashcards = response_data.get('flashcards', [])
            
            # Ensure we have exactly 10 flashcards
            if len(flashcards) < 10:
                logger.warning(f"Received only {len(flashcards)} flashcards, expected 10")
                # If we got fewer than 10, try to generate more
                remaining = 10 - len(flashcards)
                additional_message = f"""Generate {remaining} more flashcards to complement these existing ones:
                {json.dumps(flashcards, indent=2)}
                
                Make sure the new flashcards are different from the existing ones and cover different aspects of the text.
                """
                
                additional_response = await copilot_client.generate_chat_completion([{"content": additional_message}])
                additional_data = json.loads(additional_response)
                additional_flashcards = additional_data.get('flashcards', [])
                
                flashcards.extend(additional_flashcards)
                flashcards = flashcards[:10]  # Ensure we don't exceed 10
            
            logger.info(f"Successfully generated {len(flashcards)} flashcards")
            return flashcards
            
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
flashcard_service = FlashcardService() 