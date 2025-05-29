import logging
from typing import List, Dict
import json
import os
from dotenv import load_dotenv
import aiohttp
from services.copilot_service import copilot_client
from utils.logger_config import setup_logger

logger = setup_logger('enhanced_learning_service', 'enhanced_learning_service.log')

class EnhancedLearningService:
    def __init__(self):
        logger.info("Initialized EnhancedLearningService")

    async def generate_learning_content(self, text: str) -> List[Dict[str, str]]:
        """
        Generate enhanced learning content from the given text using Cohere's API.
        
        Args:
            text (str): The text to generate learning content from
            
        Returns:
            List[Dict[str, str]]: List of learning concepts, each containing:
                - concept: The main concept/topic
                - definition: Clear definition of the concept
                - real_world_application: Practical application or example
                - latest_insight: Recent research or discovery
        """
        try:
            logger.info("Starting enhanced learning content generation")
            logger.debug(f"Input text length: {len(text)} characters")

            # Prepare the message for the API
            message = f"""Create detailed learning content from the following text.
            For each key concept, provide:
            1. A clear, concise definition
            2. A real-world application or example
            3. A recent research insight or discovery (include a citation if possible)
            
            Format the response as a JSON object with an array of concepts.
            Each concept should have these fields:
            - concept: The main topic name
            - definition: A clear definition
            - real_world_application: A practical example or application
            - latest_insight: Recent research or discovery with citation
            
            Text:
            {text}"""

            logger.info("Sending request to Cohere API")
            
            # Call the Cohere API through the copilot client
            response = await copilot_client.generate_chat_completion([{"content": message}])
            logger.info("Received response from Cohere API")
            
            try:
                # Parse the response
                response_data = json.loads(response)
                learning_content = response_data.get('concepts', [])
                
                # Validate the learning content
                valid_content = []
                for concept in learning_content:
                    if (isinstance(concept, dict) and
                        'concept' in concept and
                        'definition' in concept and
                        'real_world_application' in concept and
                        'latest_insight' in concept and
                        all(isinstance(v, str) for v in concept.values())):
                        valid_content.append(concept)
                
                # Ensure we have at least 3 concepts
                if len(valid_content) < 3:
                    logger.warning(f"Received only {len(valid_content)} valid concepts, expected at least 3")
                    # If we got fewer than 3, try to generate more
                    remaining = 3 - len(valid_content)
                    additional_message = f"""Generate {remaining} more learning concepts to complement these existing ones:
                    {json.dumps(valid_content, indent=2)}
                    
                    Make sure the new concepts are different from the existing ones and cover different aspects of the text.
                    Format the response as a JSON object with an array of concepts.
                    Each concept must have: concept, definition, real_world_application, and latest_insight fields.
                    """
                    
                    additional_response = await copilot_client.generate_chat_completion([{"content": additional_message}])
                    additional_data = json.loads(additional_response)
                    additional_concepts = additional_data.get('concepts', [])
                    
                    # Validate additional concepts
                    for concept in additional_concepts:
                        if (isinstance(concept, dict) and
                            'concept' in concept and
                            'definition' in concept and
                            'real_world_application' in concept and
                            'latest_insight' in concept and
                            all(isinstance(v, str) for v in concept.values())):
                            valid_content.append(concept)
                
                logger.info(f"Successfully generated {len(valid_content)} learning concepts")
                return valid_content
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {response}")
                return []
            
        except Exception as e:
            logger.error(f"Error generating learning content: {str(e)}", exc_info=True)
            return []

# Create a singleton instance
enhanced_learning_service = EnhancedLearningService() 