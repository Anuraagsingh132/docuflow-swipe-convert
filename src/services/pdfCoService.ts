import axios from 'axios';

/**
 * PDFCoService - Service for handling PDF operations using PDF.co API
 * Provides functionality for merging, splitting, compressing, and converting PDFs
 */
export class PDFCoService {
  private static readonly API_KEY = 'rockinitesh77@gmail.com_092yozuR6VffeyE0EZbXXJOwsFKsqVSD5vUGuF585IrCiPLTZAW9TmB1xvjO7DUU';
  private static readonly BASE_URL = 'https://api.pdf.co/v1';

  /**
   * Merges multiple PDF files into a single PDF
   * @param files Files to be merged
   * @returns Promise with the URL of the merged PDF
   */
  public static async mergePDFs(files: FileList | File[]): Promise<Uint8Array> {
    try {
      // We need to upload the files first to get URLs
      const fileUrls = await Promise.all(Array.from(files).map(file => this.uploadFile(file)));
      
      // Make the merge API call
      const response = await axios.post(`${this.BASE_URL}/pdf/merge`, {
        urls: fileUrls,
        async: false,
        name: 'merged.pdf'
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Download the merged file
      if (response.data && response.data.url) {
        const pdfData = await this.downloadFile(response.data.url);
        return pdfData;
      } else {
        throw new Error('Failed to merge PDFs: No URL returned from API');
      }
    } catch (error) {
      console.error('Error merging PDFs with PDF.co:', error);
      throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
  }

  /**
   * Splits a PDF file into multiple PDFs based on page ranges
   * @param file File to be split
   * @returns Promise with an array of Uint8Arrays representing each split PDF
   */
  public static async splitPDF(file: File): Promise<Uint8Array[]> {
    try {
      // Upload the file first
      const fileUrl = await this.uploadFile(file);
      
      // Make the split API call
      const response = await axios.post(`${this.BASE_URL}/pdf/split`, {
        url: fileUrl,
        async: false
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Download each of the split files
      if (response.data && response.data.urls && response.data.urls.length > 0) {
        const splitPdfs = await Promise.all(
          response.data.urls.map((url: string) => this.downloadFile(url))
        );
        return splitPdfs;
      } else {
        throw new Error('Failed to split PDF: No URLs returned from API');
      }
    } catch (error) {
      console.error('Error splitting PDF with PDF.co:', error);
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
  }

  /**
   * Compresses a PDF file to reduce its size
   * @param file File to be compressed
   * @returns Promise with the compressed PDF as a Uint8Array
   */
  public static async compressPDF(file: File): Promise<Uint8Array> {
    try {
      // Upload the file first
      const fileUrl = await this.uploadFile(file);
      
      // Make the compress API call
      const response = await axios.post(`${this.BASE_URL}/pdf/optimize`, {
        url: fileUrl,
        async: false,
        name: 'compressed.pdf'
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Download the compressed file
      if (response.data && response.data.url) {
        const pdfData = await this.downloadFile(response.data.url);
        return pdfData;
      } else {
        throw new Error('Failed to compress PDF: No URL returned from API');
      }
    } catch (error) {
      console.error('Error compressing PDF with PDF.co:', error);
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
  }

  /**
   * Converts a document to PDF format
   * @param file File to be converted
   * @returns Promise with the converted PDF as a Uint8Array
   */
  public static async convertToPDF(file: File): Promise<Uint8Array> {
    try {
      // Upload the file first
      const fileUrl = await this.uploadFile(file);
      
      // Determine the correct API endpoint based on file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      let endpoint = '';
      
      switch (fileExtension) {
        case 'doc':
        case 'docx':
        case 'rtf':
        case 'txt':
        case 'xps':
          endpoint = '/pdf/convert/from/doc';
          break;
        case 'xls':
        case 'xlsx':
        case 'csv':
          endpoint = '/pdf/convert/from/xls';
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'tiff':
        case 'tif':
        case 'bmp':
        case 'gif':
          endpoint = '/pdf/convert/from/image';
          break;
        case 'html':
        case 'htm':
          endpoint = '/pdf/convert/from/html';
          break;
        default:
          throw new Error(`Unsupported file format: .${fileExtension}`);
      }
      
      // Make the conversion API call
      const response = await axios.post(`${this.BASE_URL}${endpoint}`, {
        url: fileUrl,
        async: false,
        name: 'converted.pdf'
      }, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      // Download the converted file
      if (response.data && response.data.url) {
        const pdfData = await this.downloadFile(response.data.url);
        return pdfData;
      } else {
        throw new Error('Failed to convert to PDF: No URL returned from API');
      }
    } catch (error) {
      console.error('Error converting to PDF with PDF.co:', error);
      throw new Error(`Failed to convert to PDF: ${error.message}`);
    }
  }

  /**
   * Uploads a file to PDF.co to get a URL for use in other API calls
   * @param file File to be uploaded
   * @returns Promise with the URL of the uploaded file
   */
  private static async uploadFile(file: File): Promise<string> {
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const response = await axios.post(`${this.BASE_URL}/file/upload`, formData, {
        headers: {
          'x-api-key': this.API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('Failed to upload file: No URL returned from API');
      }
    } catch (error) {
      console.error('Error uploading file to PDF.co:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Downloads a file from a URL and returns it as a Uint8Array
   * @param url URL of the file to download
   * @returns Promise with the file data as a Uint8Array
   */
  private static async downloadFile(url: string): Promise<Uint8Array> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });
      
      return new Uint8Array(response.data);
    } catch (error) {
      console.error('Error downloading file from PDF.co:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Checks the status of an asynchronous job
   * @param jobId Job ID to check
   * @returns Promise with the job status and result URL if complete
   */
  private static async checkJobStatus(jobId: string): Promise<{ status: string, url?: string }> {
    try {
      const response = await axios.get(`${this.BASE_URL}/job/check`, {
        params: {
          jobid: jobId
        },
        headers: {
          'x-api-key': this.API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error checking job status with PDF.co:', error);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }
}

export default PDFCoService;
