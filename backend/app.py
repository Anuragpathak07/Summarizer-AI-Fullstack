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
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create logs directory if it doesn't exist
if not os.path.exists('logs'):
    os.makedirs('logs')

# Add file handler for detailed logging
file_handler = logging.FileHandler('logs/app.log')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

logger.info("Starting application...")
logger.info("Logs will be saved to logs/app.log")

# Load environment variables from .env file
logger.info("Loading environment variables...")
load_dotenv(override=True)

# Debug: Print all environment variables (excluding sensitive data)
logger.debug("Environment variables loaded:")
for key in os.environ:
    if 'TOKEN' not in key:  # Don't log actual token values
        logger.debug(f"{key}: {'*' * len(os.environ[key])}")

app = Flask(__name__)
# Configure CORS to allow requests from the frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8080", "http://localhost:8081", "http://127.0.0.1:8080", "http://127.0.0.1:8081"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Ensure upload directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
            # Extract text from PDF
            text = pdf_service.extract_text(filepath)
            logger.info(f"Extracted {len(text)} characters from PDF")

            # Generate flashcards
            flashcards = await flashcard_service.generate_flashcards(text)
            logger.info(f"Generated {len(flashcards)} flashcards")

            # Clean up the file
            os.remove(filepath)
            logger.info(f"Removed temporary file {filepath}")

            return jsonify({
                'flashcards': flashcards,
                'message': 'PDF processed successfully'
            })

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            # Clean up the file in case of error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application on port 5000")
    app.run(debug=True, port=5000, host='0.0.0.0') 