import { PDFService, PDFOperationResult } from './pdfService';
import { PDFCoService } from './pdfCoService';

/**
 * UnifiedPDFService provides a single interface for PDF operations,
 * offering both local processing and PDF.co API processing.
 */
export class UnifiedPDFService {
  private static useApi: boolean = false;
  
  /**
   * Initialize the PDF service and set the processing mode
   * @param useApi Whether to use the PDF.co API (true) or local processing (false)
   */
  static initialize(useApi: boolean) {
    this.useApi = useApi;
    console.log(`PDF Service initialized: Using ${useApi ? 'PDF.co API' : 'local'} processing`);
  }
  
  /**
   * Set whether to use the PDF.co API for processing
   * @param useApi Whether to use the PDF.co API (true) or local processing (false)
   */
  static setUseApiProcessing(useApi: boolean) {
    this.useApi = useApi;
    console.log(`PDF Service mode changed: Using ${useApi ? 'PDF.co API' : 'local'} processing`);
  }
  
  /**
   * Get the current processing mode
   * @returns Whether the service is using PDF.co API (true) or local processing (false)
   */
  static isUsingApiProcessing(): boolean {
    return this.useApi;
  }

  // PDF Operation Methods
  static async mergePDFs(files: FileList): Promise<PDFOperationResult> {
    try {
      let data: Uint8Array;
      
      if (this.useApi) {
        data = await PDFCoService.mergePDFs(files);
      } else {
        const result = await PDFService.mergePDFs(files);
        data = result.data;
      }
      
      return {
        success: true,
        data,
        filename: 'merged.pdf'
      };
    } catch (error) {
      console.error('Error in mergePDFs:', error);
      return {
        success: false,
        error: error.message || 'Failed to merge PDFs'
      };
    }
  }

  static async splitPDF(file: File): Promise<PDFOperationResult> {
    try {
      if (this.useApi) {
        const dataArray = await PDFCoService.splitPDF(file);
        return {
          success: true,
          dataArray,
          filename: file.name.replace('.pdf', '') + '_split.pdf'
        };
      } else {
        return PDFService.splitPDF(file);
      }
    } catch (error) {
      console.error('Error in splitPDF:', error);
      return {
        success: false,
        error: error.message || 'Failed to split PDF'
      };
    }
  }

  static async compressPDF(file: File): Promise<PDFOperationResult> {
    try {
      let data: Uint8Array;
      
      if (this.useApi) {
        data = await PDFCoService.compressPDF(file);
      } else {
        const result = await PDFService.compressPDF(file);
        data = result.data;
      }
      
      return {
        success: true,
        data,
        filename: file.name.replace('.pdf', '') + '_compressed.pdf'
      };
    } catch (error) {
      console.error('Error in compressPDF:', error);
      return {
        success: false,
        error: error.message || 'Failed to compress PDF'
      };
    }
  }

  static async convertToPDF(file: File): Promise<PDFOperationResult> {
    try {
      let data: Uint8Array;
      
      if (this.useApi) {
        data = await PDFCoService.convertToPDF(file);
      } else {
        const result = await PDFService.convertToPDF(file);
        data = result.data;
      }
      
      return {
        success: true,
        data,
        filename: file.name.split('.')[0] + '.pdf'
      };
    } catch (error) {
      console.error('Error in convertToPDF:', error);
      return {
        success: false,
        error: error.message || 'Failed to convert to PDF'
      };
    }
  }

  static async editPDF(file: File, text: string, x: number = 50, y: number = 750): Promise<PDFOperationResult> {
    return PDFService.editPDF(file, text, x, y);
  }

  static async pdfToWord(file: File): Promise<PDFOperationResult> {
    return PDFService.pdfToWord(file);
  }

  // Download helper methods
  static downloadFile(data: Uint8Array, filename: string) {
    return PDFService.downloadFile(data, filename);
  }

  static downloadMultipleFiles(dataArray: Uint8Array[], filenames: string[]) {
    return PDFService.downloadMultipleFiles(dataArray, filenames);
  }
}
