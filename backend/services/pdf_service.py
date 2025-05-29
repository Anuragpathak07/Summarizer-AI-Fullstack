import os
import logging
from PyPDF2 import PdfReader
from typing import Optional
from utils.logger_config import setup_logger

# Configure logging
logger = setup_logger('pdf_service', 'pdf_service.log')

class PDFService:
    def __init__(self):
        logger.info("Initialized PDFService")

    def extract_text(self, filepath: str) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            filepath (str): Path to the PDF file
            
        Returns:
            str: Extracted text from the PDF
            
        Raises:
            FileNotFoundError: If the PDF file doesn't exist
            ValueError: If no text could be extracted from the PDF
        """
        try:
            logger.info(f"Starting text extraction from {filepath}")
            
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"PDF file not found: {filepath}")
            
            # Open and read the PDF
            with open(filepath, 'rb') as file:
                reader = PdfReader(file)
                total_pages = len(reader.pages)
                logger.info(f"PDF has {total_pages} pages")
                
                # Extract text from each page
                text = ""
                for page_num, page in enumerate(reader.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            # Clean up the text
                            page_text = page_text.strip()
                            # Remove excessive whitespace
                            page_text = ' '.join(page_text.split())
                            text += f"\n--- Page {page_num} ---\n{page_text}\n"
                        else:
                            logger.warning(f"No text could be extracted from page {page_num}")
                    except Exception as e:
                        logger.warning(f"Error extracting text from page {page_num}: {str(e)}")
                        continue
                
                if not text.strip():
                    logger.error("No text could be extracted from the PDF")
                    raise ValueError("No text could be extracted from the PDF")
                
                # Clean up the final text
                text = text.strip()
                # Remove excessive newlines
                text = '\n'.join(line for line in text.splitlines() if line.strip())
                
                logger.info(f"Successfully extracted {len(text)} characters from PDF")
                logger.debug(f"First 500 characters of extracted text: {text[:500]}")
                return text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
pdf_service = PDFService() 