import os
import json
import logging
import aiohttp
from typing import List, Dict, Any
from dotenv import load_dotenv

# Create logs directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for more detailed logs
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/copilot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Add file handler for detailed logging
file_handler = logging.FileHandler('logs/copilot.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

logger.info("Initializing CopilotClient logging...")
logger.info("CopilotClient logs will be saved to logs/copilot.log")

class CopilotClient:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('COHERE_API_KEY')
        if not self.api_key:
            logger.error("COHERE_API_KEY not found in environment variables")
            raise ValueError("COHERE_API_KEY not found in environment variables")
        
        self.endpoint = "https://api.cohere.ai/v1/chat"
        self.model = "command-a-03-2025"
        logger.info(f"Initialized CopilotClient with model: {self.model}")

    async def generate_chat_completion(self, messages: List[Dict[str, str]]) -> str:
        """Generate a chat completion using Cohere's API with structured JSON output."""
        try:
            logger.info("Starting chat completion request")
            logger.debug(f"Messages received: {json.dumps(messages, indent=2)}")
            
            # Prepare the request payload
            payload = {
                "model": self.model,
                "message": messages[0]["content"],  # Use the content directly
                "response_format": {
                    "type": "json_object",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "flashcards": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "question": {"type": "string"},
                                        "answer": {"type": "string"}
                                    },
                                    "required": ["question", "answer"]
                                }
                            }
                        },
                        "required": ["flashcards"]
                    }
                }
            }

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            logger.debug(f"Request payload: {json.dumps(payload, indent=2)}")
            logger.debug(f"Request headers: {json.dumps({k: v if k != 'Authorization' else '***' for k, v in headers.items()}, indent=2)}")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload, headers=headers) as response:
                    response_text = await response.text()
                    logger.debug(f"Response status: {response.status}")
                    logger.debug(f"Response headers: {dict(response.headers)}")
                    logger.debug(f"Response body: {response_text}")

                    if response.status != 200:
                        logger.error(f"API request failed with status {response.status}: {response_text}")
                        raise Exception(f"API request failed: {response_text}")

                    response_data = json.loads(response_text)
                    logger.debug(f"Parsed response: {json.dumps(response_data, indent=2)}")

                    # Extract the content from the response
                    content = response_data.get('text', '{}')
                    logger.debug(f"Extracted content: {content}")
                    
                    try:
                        # Parse the JSON response
                        parsed_content = json.loads(content)
                        flashcards = parsed_content.get('flashcards', [])
                        
                        # Log each flashcard's question and answer
                        logger.info("=== Generated Flashcards ===")
                        for i, card in enumerate(flashcards):
                            logger.info(f"\nFlashcard {i+1}:")
                            logger.info(f"Question: {card.get('question', 'No question')}")
                            logger.info(f"Answer: {card.get('answer', 'No answer')}")
                            logger.info("-" * 50)
                        
                        logger.info(f"\nTotal flashcards generated: {len(flashcards)}")
                        return json.dumps(parsed_content)
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse JSON response: {e}")
                        raise Exception(f"Invalid JSON response: {content}")

        except Exception as e:
            logger.error(f"Error in generate_chat_completion: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
copilot_client = CopilotClient() 