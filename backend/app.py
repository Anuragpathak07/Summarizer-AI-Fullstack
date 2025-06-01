from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import asyncio
import logging
import traceback
import json
from services.pdf_service import pdf_service
from services.flashcard_service import flashcard_service
from services.enhanced_learning_service import enhanced_learning_service
from services.copilot_service import copilot_client
from werkzeug.utils import secure_filename
from utils.logger_config import setup_logger

# Set up main application logger
logger = setup_logger('app', 'app.log')

# Load environment variables from .env file
logger.info("Loading environment variables...")
load_dotenv(override=True)

app = Flask(__name__)

# Configure CORS with more permissive settings
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://192.168.31.10:8080", "http://192.168.31.10:8081"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": False,
        "max_age": 3600,
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Add error handlers
@app.errorhandler(500)
def handle_500_error(e):
    logger.error(f"Internal server error: {str(e)}", exc_info=True)
    return jsonify({'error': 'Internal server error occurred'}), 500

@app.errorhandler(404)
def handle_404_error(e):
    logger.error(f"Not found error: {str(e)}")
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(408)
def handle_408_error(e):
    logger.error(f"Timeout error: {str(e)}")
    return jsonify({'error': 'Request timeout'}), 408

@app.errorhandler(413)
def handle_413_error(e):
    logger.error(f"File too large: {str(e)}")
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

# Add a test route
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Backend server is running!'})

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'API is working!'})

@app.route('/api/flashcards/generate', methods=['POST'])
async def generate_flashcards():
    try:
        logger.info("Received request to generate flashcards")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request files: {request.files}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            logger.error("Invalid file type")
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"Saved file to {filepath}")

        try:
            # Extract text from PDF with increased timeout
            logger.info("Starting PDF text extraction")
            text = await asyncio.wait_for(
                asyncio.to_thread(pdf_service.extract_text, filepath),
                timeout=30  # 30 seconds for PDF extraction
            )
            logger.info(f"Extracted {len(text)} characters from PDF")

            if len(text) > 10000:  # If text is too long, truncate it
                logger.warning(f"Text too long ({len(text)} chars), truncating to 10000 chars")
                text = text[:10000]

            # Generate flashcards with increased timeout
            logger.info("Starting flashcard generation")
            try:
                flashcards = await asyncio.wait_for(
                    flashcard_service.generate_flashcards(text),
                    timeout=60  # 60 seconds for flashcard generation
                )
                logger.info(f"Generated {len(flashcards)} flashcards")

                # Clean up the file
                os.remove(filepath)
                logger.info(f"Removed temporary file {filepath}")

                return jsonify({
                    'flashcards': flashcards,
                    'message': 'PDF processed successfully'
                })

            except asyncio.TimeoutError:
                logger.error("Flashcard generation timed out")
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({
                    'error': 'Request timed out. The PDF might be too large or complex. Please try with a smaller file.'
                }), 408

        except asyncio.TimeoutError:
            logger.error("PDF text extraction timed out")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                'error': 'PDF text extraction timed out. The file might be too large or complex.'
            }), 408
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            # Clean up the file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning/enhanced', methods=['POST'])
async def generate_enhanced_learning():
    try:
        logger.info("Received request to generate enhanced learning content")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request files: {request.files}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            logger.error("Invalid file type")
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"Saved file to {filepath}")

        try:
            # Extract text from PDF with increased timeout
            logger.info("Starting PDF text extraction")
            text = await asyncio.wait_for(
                asyncio.to_thread(pdf_service.extract_text, filepath),
                timeout=30  # 30 seconds for PDF extraction
            )
            logger.info(f"Extracted {len(text)} characters from PDF")

            if len(text) > 10000:  # If text is too long, truncate it
                logger.warning(f"Text too long ({len(text)} chars), truncating to 10000 chars")
                text = text[:10000]

            # Generate enhanced learning content with increased timeout
            logger.info("Starting enhanced learning content generation")
            try:
                learning_content = await asyncio.wait_for(
                    enhanced_learning_service.generate_learning_content(text),
                    timeout=60  # 60 seconds for content generation
                )
                logger.info(f"Generated {len(learning_content)} learning concepts")

                # Clean up the file
                os.remove(filepath)
                logger.info(f"Removed temporary file {filepath}")

                return jsonify({
                    'learning_content': learning_content,
                    'message': 'PDF processed successfully'
                })

            except asyncio.TimeoutError:
                logger.error("Content generation timed out")
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({
                    'error': 'Request timed out. The PDF might be too large or complex. Please try with a smaller file.'
                }), 408

        except asyncio.TimeoutError:
            logger.error("PDF text extraction timed out")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                'error': 'PDF text extraction timed out. The file might be too large or complex.'
            }), 408
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            # Clean up the file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
async def chat():
    try:
        logger.info("Received chat request")
        data = request.get_json()
        
        if not data or 'messages' not in data:
            logger.error("Invalid request format")
            return jsonify({'error': 'Invalid request format'}), 400

        messages = data['messages']
        logger.debug(f"Received messages: {json.dumps(messages, indent=2)}")

        try:
            # Generate response using copilot service
            response = await copilot_client.generate_chat_completion(messages)
            logger.info("Successfully generated response")
            
            return jsonify({
                'response': response,
                'message': 'Chat completion generated successfully'
            })

        except Exception as e:
            logger.error(f"Error generating chat completion: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/generate', methods=['POST'])
async def generate_quiz():
    try:
        logger.info("Received request to generate quiz questions")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request files: {request.files}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            logger.error("Invalid file type")
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"Saved file to {filepath}")

        try:
            # Extract text from PDF with increased timeout
            logger.info("Starting PDF text extraction")
            text = await asyncio.wait_for(
                asyncio.to_thread(pdf_service.extract_text, filepath),
                timeout=60  # 60 seconds for PDF extraction
            )
            logger.info(f"Extracted {len(text)} characters from PDF")

            if len(text) > 5000:  # Reduced from 10000 to 5000 for faster processing
                logger.warning(f"Text too long ({len(text)} chars), truncating to 5000 chars")
                text = text[:5000]

            # Generate quiz questions with increased timeout
            logger.info("Starting quiz question generation")
            try:
                prompt = f"""Based on the following text, generate a quiz with 3 multiple choice questions. Each question should:
1. Test understanding of key concepts
2. Have exactly 4 options labeled A, B, C, and D
3. Include a clear explanation for the correct answer

Text to use for generating questions:
{text}

Format the response as a JSON object with a 'quiz' array containing objects with:
- question: string
- options: array of 4 strings
- correct_answer: string (one of the options)
- explanation: string explaining why the answer is correct"""

                response = await asyncio.wait_for(
                    copilot_client.generate_chat_completion([
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]),
                    timeout=120  # 120 seconds for quiz generation
                )
                
                quiz_data = json.loads(response)
                logger.info(f"Generated quiz questions")

                # Clean up the file
                os.remove(filepath)
                logger.info(f"Removed temporary file {filepath}")

                return jsonify({
                    'quiz': quiz_data.get('quiz', []),
                    'message': 'PDF processed successfully'
                })

            except asyncio.TimeoutError:
                logger.error("Quiz generation timed out")
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({
                    'error': 'Request timed out. The PDF might be too large or complex. Please try with a smaller file.'
                }), 408

        except asyncio.TimeoutError:
            logger.error("PDF text extraction timed out")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                'error': 'PDF text extraction timed out. The file might be too large or complex.'
            }), 408
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            # Clean up the file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in ["http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://192.168.31.10:8080", "http://192.168.31.10:8081"]:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    logger.info("Starting Flask application on port 5000")
    app.run(debug=True, port=5000, host='0.0.0.0', threaded=True) 