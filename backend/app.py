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
import PyPDF2

# Set up main application logger
logger = setup_logger('app', 'app.log')

# Load environment variables from .env file
logger.info("Loading environment variables...")
load_dotenv(override=True)

app = Flask(__name__)

# Configure CORS with specific settings
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:8080",
            "http://localhost:8081",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081",
            "http://192.168.31.10:8080",
            "http://192.168.31.10:8081"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Chunk-Number", "X-Total-Chunks"],
        "supports_credentials": False,
        "max_age": 3600
    }
})

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

LARGE_FILE_THRESHOLD = 5 * 1024 * 1024  # 5MB in bytes

def get_pdf_metadata(filepath: str) -> dict:
    """Get metadata about the PDF file."""
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            return {
                'total_pages': len(pdf_reader.pages),
                'file_size': os.path.getsize(filepath)
            }
    except Exception as e:
        logger.error(f"Error getting PDF metadata: {str(e)}")
        raise

def extract_text_chunk(filepath: str, chunk_number: int, total_chunks: int) -> str:
    """Extract text from a specific chunk of the PDF."""
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            pages_per_chunk = max(1, total_pages // total_chunks)
            start_page = (chunk_number - 1) * pages_per_chunk
            end_page = min(start_page + pages_per_chunk, total_pages)
            
            text = ""
            for page_num in range(start_page, end_page):
                page_text = pdf_reader.pages[page_num].extract_text()
                if page_text:
                    text += page_text + "\n"
            
            return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text chunk: {str(e)}")
        raise

def extract_full_text(filepath: str) -> str:
    """Extract text from the entire PDF."""
    try:
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
    except Exception as e:
        logger.error(f"Error extracting full text: {str(e)}")
        raise

@app.route('/api/metadata', methods=['POST'])
async def get_metadata():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            metadata = get_pdf_metadata(filepath)
            return jsonify(metadata)
        finally:
            # Clean up the temporary file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        logger.error(f"Error in metadata endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/flashcards/generate', methods=['POST'])
async def generate_flashcards():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Check if we need to process in chunks
            chunk_number = request.headers.get('X-Chunk-Number')
            total_chunks = request.headers.get('X-Total-Chunks')
            
            if chunk_number and total_chunks:
                # Process chunk
                text = extract_text_chunk(filepath, int(chunk_number), int(total_chunks))
            else:
                # Process entire file
                text = extract_full_text(filepath)
            
            if len(text) > 5000:  # Limit text length
                text = text[:5000]

            # Generate flashcards
            flashcards = await asyncio.wait_for(
                flashcard_service.generate_flashcards(text),
                timeout=60
            )

            return jsonify({
                'flashcards': flashcards,
                'message': 'Generated flashcards successfully'
            })

        finally:
            # Clean up the file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        logger.error(f"Error in flashcard generation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning/enhanced', methods=['POST'])
async def generate_enhanced_learning():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Check if we need to process in chunks
            chunk_number = request.headers.get('X-Chunk-Number')
            total_chunks = request.headers.get('X-Total-Chunks')
            
            if chunk_number and total_chunks:
                # Process chunk
                text = extract_text_chunk(filepath, int(chunk_number), int(total_chunks))
            else:
                # Process entire file
                text = extract_full_text(filepath)
            
            # Instead of truncating, we'll process the text in overlapping segments
            # to ensure we don't miss concepts that might span across the 5000 character limit
            if len(text) > 5000:
                # Process the first 5000 characters
                first_segment = text[:5000]
                # Process the next 5000 characters with 1000 character overlap
                second_segment = text[4000:9000] if len(text) > 9000 else text[4000:]
                
                # Generate content for both segments
                first_content = await asyncio.wait_for(
                    enhanced_learning_service.generate_learning_content(first_segment),
                    timeout=60
                )
                
                second_content = []
                if len(text) > 5000:
                    second_content = await asyncio.wait_for(
                        enhanced_learning_service.generate_learning_content(second_segment),
                        timeout=60
                    )
                
                # Combine and deduplicate content
                all_content = first_content + second_content
                unique_content = []
                seen_concepts = set()
                
                for content in all_content:
                    if content['concept'] not in seen_concepts:
                        seen_concepts.add(content['concept'])
                        unique_content.append(content)
                
                learning_content = unique_content
            else:
                # Process the entire text if it's under 5000 characters
                learning_content = await asyncio.wait_for(
                    enhanced_learning_service.generate_learning_content(text),
                    timeout=60
                )

            return jsonify({
                'learning_content': learning_content,
                'message': 'Generated learning content successfully'
            })

        finally:
            # Clean up the file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        logger.error(f"Error in learning content generation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/generate', methods=['POST'])
async def generate_quiz():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Check if we need to process in chunks
            chunk_number = request.headers.get('X-Chunk-Number')
            total_chunks = request.headers.get('X-Total-Chunks')
            
            if chunk_number and total_chunks:
                # Process chunk
                text = extract_text_chunk(filepath, int(chunk_number), int(total_chunks))
            else:
                # Process entire file
                text = extract_full_text(filepath)
            
            # Process text in segments to generate more questions
            if len(text) > 5000:
                # Process the first 5000 characters
                first_segment = text[:5000]
                # Process the next 5000 characters with 1000 character overlap
                second_segment = text[4000:9000] if len(text) > 9000 else text[4000:]
                
                # Generate questions for both segments
                first_prompt = f"""Based on the following text, generate a quiz with 5 multiple choice questions. Each question should:
1. Test understanding of key concepts
2. Have exactly 4 options labeled A, B, C, and D
3. Include a clear explanation for the correct answer

Text to use for generating questions:
{first_segment}

Format the response as a JSON object with a 'quiz' array containing objects with:
- question: string
- options: array of 4 strings
- correct_answer: string (one of the options)
- explanation: string explaining why the answer is correct"""

                second_prompt = f"""Based on the following text, generate a quiz with 5 multiple choice questions. Each question should:
1. Test understanding of key concepts
2. Have exactly 4 options labeled A, B, C, and D
3. Include a clear explanation for the correct answer

Text to use for generating questions:
{second_segment}

Format the response as a JSON object with a 'quiz' array containing objects with:
- question: string
- options: array of 4 strings
- correct_answer: string (one of the options)
- explanation: string explaining why the answer is correct"""

                # Generate questions for both segments
                first_response = await asyncio.wait_for(
                    copilot_client.generate_chat_completion([
                        {
                            "role": "user",
                            "content": first_prompt
                        }
                    ]),
                    timeout=120
                )
                
                second_response = []
                if len(text) > 5000:
                    second_response = await asyncio.wait_for(
                        copilot_client.generate_chat_completion([
                            {
                                "role": "user",
                                "content": second_prompt
                            }
                        ]),
                        timeout=120
                    )
                
                # Parse and combine responses
                first_quiz_data = json.loads(first_response)
                second_quiz_data = json.loads(second_response) if second_response else {"quiz": []}
                
                # Combine and deduplicate questions
                all_questions = first_quiz_data.get('quiz', []) + second_quiz_data.get('quiz', [])
                unique_questions = []
                seen_questions = set()
                
                for question in all_questions:
                    # Create a unique key for each question
                    question_key = question['question'].lower().strip()
                    if question_key not in seen_questions:
                        seen_questions.add(question_key)
                        unique_questions.append(question)
                
                quiz_data = {"quiz": unique_questions}
            else:
                # Process the entire text if it's under 5000 characters
                prompt = f"""Based on the following text, generate a quiz with 8 multiple choice questions. Each question should:
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
                    timeout=120
                )
                
                quiz_data = json.loads(response)

            return jsonify({
                'quiz': quiz_data.get('quiz', []),
                'message': 'Generated quiz questions successfully'
            })

        finally:
            # Clean up the file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        logger.error(f"Error in quiz generation: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Remove any existing after_request handlers
@app.after_request
def after_request(response):
    # Only add CORS headers if they're not already present
    if 'Access-Control-Allow-Origin' not in response.headers:
        origin = request.headers.get('Origin')
        if origin in [
            "http://localhost:8080",
            "http://localhost:8081",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081",
            "http://192.168.31.10:8080",
            "http://192.168.31.10:8081"
        ]:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-Chunk-Number, X-Total-Chunks'
    return response

if __name__ == '__main__':
    logger.info("Starting Flask application on port 5000")
    app.run(debug=True, port=5000, host='0.0.0.0', threaded=True) 