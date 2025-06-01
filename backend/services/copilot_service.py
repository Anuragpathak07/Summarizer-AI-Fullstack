import logging
import os
from typing import List, Dict
import json
import aiohttp
from dotenv import load_dotenv
from utils.logger_config import setup_logger

logger = setup_logger('copilot_service', 'copilot_service.log')

class CopilotClient:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('COHERE_API_KEY')
        if not self.api_key:
            error_msg = "COHERE_API_KEY not found in environment variables. Please set it in the .env file."
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        self.endpoint = "https://api.cohere.ai/v1/chat"
        self.model = "command-a-03-2025"
        logger.info(f"Initialized CopilotClient with model: {self.model}")

    async def generate_chat_completion(self, messages: List[Dict[str, str]]) -> str:
        """Generate a chat completion using Cohere's API with structured JSON output."""
        try:
            if not self.api_key:
                raise ValueError("API key not configured. Please set COHERE_API_KEY in .env file.")

            logger.info("Starting chat completion request")
            logger.debug(f"Messages received: {json.dumps(messages, indent=2)}")
            
            # Determine the response format based on the message content
            message_content = messages[0]["content"].lower()
            if "flashcard" in message_content:
                schema = {
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
            elif "quiz" in message_content:
                schema = {
                    "type": "object",
                    "properties": {
                        "quiz": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "question": {"type": "string"},
                                    "options": {
                                        "type": "array",
                                        "items": {"type": "string"}
                                    },
                                    "correct_answer": {"type": "string"},
                                    "explanation": {"type": "string"}
                                },
                                "required": ["question", "options", "correct_answer", "explanation"]
                            }
                        }
                    },
                    "required": ["quiz"]
                }
            else:
                schema = {
                    "type": "object",
                    "properties": {
                        "concepts": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "concept": {"type": "string"},
                                    "definition": {"type": "string"},
                                    "real_world_application": {"type": "string"},
                                    "latest_insight": {"type": "string"}
                                },
                                "required": ["concept", "definition", "real_world_application", "latest_insight"]
                            }
                        }
                    },
                    "required": ["concepts"]
                }

            # Prepare the request payload
            payload = {
                "model": self.model,
                "message": messages[0]["content"],
                "response_format": {
                    "type": "json_object",
                    "schema": schema
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
                        error_msg = f"API request failed with status {response.status}: {response_text}"
                        logger.error(error_msg)
                        raise Exception(error_msg)

                    response_data = json.loads(response_text)
                    logger.debug(f"Parsed response: {json.dumps(response_data, indent=2)}")

                    # Extract the content from the response
                    content = response_data.get('text', '{}')
                    logger.debug(f"Extracted content: {content}")
                    
                    try:
                        # Parse the JSON response
                        parsed_content = json.loads(content)
                        
                        # Log the content based on type
                        if "flashcards" in parsed_content:
                            flashcards = parsed_content.get('flashcards', [])
                            logger.info("=== Generated Flashcards ===")
                            for i, card in enumerate(flashcards):
                                logger.info(f"\nFlashcard {i+1}:")
                                logger.info(f"Question: {card.get('question', 'No question')}")
                                logger.info(f"Answer: {card.get('answer', 'No answer')}")
                                logger.info("-" * 50)
                            logger.info(f"\nTotal flashcards generated: {len(flashcards)}")
                        elif "quiz" in parsed_content:
                            quiz_questions = parsed_content.get('quiz', [])
                            logger.info("=== Generated Quiz Questions ===")
                            for i, question in enumerate(quiz_questions):
                                logger.info(f"\nQuestion {i+1}:")
                                logger.info(f"Question: {question.get('question', 'No question')}")
                                logger.info("Options:")
                                for j, option in enumerate(question.get('options', [])):
                                    logger.info(f"{chr(65+j)}. {option}")
                                logger.info(f"Correct Answer: {question.get('correct_answer', 'No answer')}")
                                logger.info(f"Explanation: {question.get('explanation', 'No explanation')}")
                                logger.info("-" * 50)
                            logger.info(f"\nTotal quiz questions generated: {len(quiz_questions)}")
                        elif "concepts" in parsed_content:
                            concepts = parsed_content.get('concepts', [])
                            logger.info("=== Generated Learning Concepts ===")
                            for i, concept in enumerate(concepts):
                                logger.info(f"\nConcept {i+1}:")
                                logger.info(f"Name: {concept.get('concept', 'No concept')}")
                                logger.info(f"Definition: {concept.get('definition', 'No definition')}")
                                logger.info(f"Application: {concept.get('real_world_application', 'No application')}")
                                logger.info(f"Insight: {concept.get('latest_insight', 'No insight')}")
                                logger.info("-" * 50)
                            logger.info(f"\nTotal concepts generated: {len(concepts)}")
                        
                        return json.dumps(parsed_content)
                    except json.JSONDecodeError as e:
                        error_msg = f"Failed to parse JSON response: {e}"
                        logger.error(error_msg)
                        raise Exception(error_msg)

        except Exception as e:
            error_msg = f"Error in generate_chat_completion: {str(e)}"
            logger.error(error_msg, exc_info=True)
            raise Exception(error_msg)

# Create a singleton instance
copilot_client = CopilotClient() 