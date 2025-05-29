import pdfParse from 'pdf-parse';

export interface PDFProcessingResult {
  text: string;
  error?: string;
}

export const processPDF = async (file: File): Promise<PDFProcessingResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return { text: data.text };
  } catch (error) {
    console.error('Error processing PDF:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Failed to process PDF' 
    };
  }
}; 