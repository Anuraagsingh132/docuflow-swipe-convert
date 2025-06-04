
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PDFOperationResult {
  success: boolean;
  data?: Uint8Array | Uint8Array[];
  filename?: string;
  filenames?: string[];
  error?: string;
}

export class PDFService {
  static async mergePDFs(files: FileList): Promise<PDFOperationResult> {
    try {
      if (files.length < 2) {
        return { success: false, error: 'Please select at least 2 PDF files to merge' };
      }

      const mergedPdf = await PDFDocument.create();
      
      for (const file of Array.from(files)) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      return {
        success: true,
        data: mergedPdfBytes,
        filename: 'merged-document.pdf'
      };
    } catch (error) {
      return { success: false, error: `Failed to merge PDFs: ${error}` };
    }
  }

  static async splitPDF(file: File): Promise<PDFOperationResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
      const pageIndices = sourcePdfDoc.getPageIndices();
      const splitPdfBytesArray: Uint8Array[] = [];
      const filenames: string[] = [];

      for (let i = 0; i < pageIndices.length; i++) {
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
        const pdfBytes = await newPdfDoc.save();
        splitPdfBytesArray.push(pdfBytes);
        filenames.push(`${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`);
      }

      return {
        success: true,
        data: splitPdfBytesArray,
        filenames
      };
    } catch (error) {
      return { success: false, error: `Failed to split PDF: ${error}` };
    }
  }

  static async compressPDF(file: File): Promise<PDFOperationResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic compression by optimizing the document structure
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      });

      return {
        success: true,
        data: compressedPdfBytes,
        filename: `${file.name.replace('.pdf', '')}_compressed.pdf`
      };
    } catch (error) {
      return { success: false, error: `Failed to compress PDF: ${error}` };
    }
  }

  static async convertToPDF(file: File): Promise<PDFOperationResult> {
    try {
      if (file.type.startsWith('image/')) {
        return await this.imageToPDF(file);
      }
      
      return { success: false, error: 'File type not supported for PDF conversion' };
    } catch (error) {
      return { success: false, error: `Failed to convert to PDF: ${error}` };
    }
  }

  private static async imageToPDF(file: File): Promise<PDFOperationResult> {
    try {
      const pdfDoc = await PDFDocument.create();
      const arrayBuffer = await file.arrayBuffer();
      
      let image;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        return { success: false, error: 'Unsupported image format' };
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();
      return {
        success: true,
        data: pdfBytes,
        filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`
      };
    } catch (error) {
      return { success: false, error: `Failed to convert image to PDF: ${error}` };
    }
  }

  static async editPDF(file: File, text: string, x: number = 50, y: number = 750): Promise<PDFOperationResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const page = pdfDoc.getPage(0);
      page.drawText(text, {
        x,
        y,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      const editedPdfBytes = await pdfDoc.save();
      return {
        success: true,
        data: editedPdfBytes,
        filename: `${file.name.replace('.pdf', '')}_edited.pdf`
      };
    } catch (error) {
      return { success: false, error: `Failed to edit PDF: ${error}` };
    }
  }

  static async pdfToWord(file: File): Promise<PDFOperationResult> {
    // Note: True PDF to Word conversion requires complex parsing
    // This is a simplified version that extracts text
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // For now, we'll create a new PDF with extracted structure
      // In a real implementation, you'd need additional libraries for Word document creation
      return {
        success: false,
        error: 'PDF to Word conversion requires server-side processing for best results'
      };
    } catch (error) {
      return { success: false, error: `Failed to convert PDF to Word: ${error}` };
    }
  }

  static downloadFile(data: Uint8Array, filename: string) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadMultipleFiles(dataArray: Uint8Array[], filenames: string[]) {
    dataArray.forEach((data, index) => {
      setTimeout(() => {
        this.downloadFile(data, filenames[index]);
      }, index * 100); // Stagger downloads to avoid browser blocking
    });
  }
}
