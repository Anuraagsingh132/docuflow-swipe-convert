
import { useState } from 'react';
import { PDFService, PDFOperationResult } from '../services/pdfService';

export const usePDFOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const executeOperation = async (
    operation: string,
    files?: FileList,
    file?: File,
    options?: any
  ): Promise<PDFOperationResult> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      let result: PDFOperationResult;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      switch (operation) {
        case 'merge-pdf':
          if (!files) throw new Error('Files required for merge operation');
          result = await PDFService.mergePDFs(files);
          break;
        case 'split-pdf':
          if (!file) throw new Error('File required for split operation');
          result = await PDFService.splitPDF(file);
          break;
        case 'compress-pdf':
          if (!file) throw new Error('File required for compress operation');
          result = await PDFService.compressPDF(file);
          break;
        case 'convert-to-pdf':
          if (!file) throw new Error('File required for convert operation');
          result = await PDFService.convertToPDF(file);
          break;
        case 'edit-pdf':
          if (!file) throw new Error('File required for edit operation');
          result = await PDFService.editPDF(
            file,
            options?.text || 'Added by DocuFlow',
            options?.x,
            options?.y
          );
          break;
        case 'pdf-to-word':
          if (!file) throw new Error('File required for PDF to Word operation');
          result = await PDFService.pdfToWord(file);
          break;
        default:
          result = { success: false, error: 'Unknown operation' };
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Handle successful results
      if (result.success && result.data) {
        if (Array.isArray(result.data) && result.filenames) {
          // Multiple files (like split operation)
          PDFService.downloadMultipleFiles(result.data, result.filenames);
        } else if (!Array.isArray(result.data) && result.filename) {
          // Single file
          PDFService.downloadFile(result.data, result.filename);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    executeOperation,
    isProcessing,
    progress
  };
};
