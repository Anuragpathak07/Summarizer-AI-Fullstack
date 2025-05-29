import os
import logging
from PyPDF2 import PdfReader
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        logger.info("Initialized PDFService")

    def extract_text(self, filepath: str) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            filepath: Path to the PDF file
            
        Returns:
            Extracted text as a string
            
        Raises:
            Exception: If file cannot be read or is not a valid PDF
        """
        try:
            logger.info(f"Extracting text from PDF: {filepath}")
            
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"PDF file not found: {filepath}")
            
            # Open and read the PDF
            with open(filepath, 'rb') as file:
                reader = PdfReader(file)
                
                # Extract text from each page
                text = ""
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                if not text.strip():
                    logger.warning("No text could be extracted from the PDF")
                    raise ValueError("No text could be extracted from the PDF")
                
                logger.info(f"Successfully extracted {len(text)} characters from PDF")
                return text
                
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
pdf_service = PDFService() 