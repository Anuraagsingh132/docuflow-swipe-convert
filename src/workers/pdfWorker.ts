
import { PDFService, PDFOperationResult } from '../services/pdfService';

self.onmessage = async function(e) {
  const { type, files, file, text, x, y } = e.data;
  let result: PDFOperationResult;

  try {
    switch (type) {
      case 'merge':
        result = await PDFService.mergePDFs(files);
        break;
      case 'split':
        result = await PDFService.splitPDF(file);
        break;
      case 'compress':
        result = await PDFService.compressPDF(file);
        break;
      case 'convert':
        result = await PDFService.convertToPDF(file);
        break;
      case 'edit':
        result = await PDFService.editPDF(file, text, x, y);
        break;
      case 'pdfToWord':
        result = await PDFService.pdfToWord(file);
        break;
      default:
        result = { success: false, error: 'Unknown operation type' };
    }

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: `Worker error: ${error}` 
    });
  }
};
