
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { X, Download, FileDown, Archive } from 'lucide-react';
import { PDFOperationResult } from '@/services/pdfService';
import { UnifiedPDFService } from '@/services/unifiedPdfService';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

interface SplitPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

interface PageData {
  pageNumber: number;
  thumbnail?: string;
  selected: boolean;
}

export const SplitPDFModal: React.FC<SplitPDFModalProps> = ({ isOpen, onClose, file }) => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [progress, setProgress] = useState(0);
  const [allSelected, setAllSelected] = useState(false);
  const { toast } = useToast();
  const { usePdfApi } = useSettings();

  useEffect(() => {
    if (isOpen && file) {
      initializePagesFromPDF();
    }
  }, [isOpen, file]);

  const initializePagesFromPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingText('Analyzing PDF...');
    setProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      setProgress(50);
      setProcessingText('Preparing pages...');

      const pageData: PageData[] = Array.from({ length: pageCount }, (_, index) => ({
        pageNumber: index + 1,
        selected: false,
      }));

      setPages(pageData);
      setProgress(100);
      setProcessingText('Ready!');
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to analyze PDF. Please try again.",
        variant: "destructive",
      });
      onClose();
    }
  };

  const handleSelectAll = () => {
    const newSelectState = !allSelected;
    setAllSelected(newSelectState);
    setPages(pages.map(page => ({ ...page, selected: newSelectState })));
  };

  const handlePageSelect = (pageNumber: number) => {
    setPages(pages.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, selected: !page.selected }
        : page
    ));
    
    // Update allSelected state
    const updatedPages = pages.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, selected: !page.selected }
        : page
    );
    setAllSelected(updatedPages.every(page => page.selected));
  };

  const getSelectedPages = () => pages.filter(page => page.selected);
  const selectedCount = getSelectedPages().length;

  const downloadSelectedIndividual = async () => {
    if (!file || selectedCount === 0) return;

    setIsProcessing(true);
    setProcessingText(`Creating ${selectedCount} individual PDFs...`);
    setProgress(0);

    try {
      const selectedPages = getSelectedPages();
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer);

      for (let i = 0; i < selectedPages.length; i++) {
        const pageData = selectedPages[i];
        const pageIndex = pageData.pageNumber - 1;

        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
        
        const pdfBytes = await newPdfDoc.save();
        const filename = `${file.name.replace('.pdf', '')}_page_${pageData.pageNumber}.pdf`;
        
        UnifiedPDFService.downloadFile(pdfBytes, filename);
        
        setProgress(((i + 1) / selectedPages.length) * 100);
        
        // Small delay between downloads to prevent browser blocking
        if (i < selectedPages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      toast({
        title: "Success",
        description: `Downloaded ${selectedCount} individual PDFs`,
      });

    } catch (error) {
      console.error('Error creating individual PDFs:', error);
      toast({
        title: "Error",
        description: "Failed to create individual PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadSelectedAsSingle = async () => {
    if (!file || selectedCount === 0) return;

    setIsProcessing(true);
    setProcessingText('Merging selected pages...');
    setProgress(0);

    try {
      const selectedPages = getSelectedPages().sort((a, b) => a.pageNumber - b.pageNumber);
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
      
      const mergedPdf = await PDFDocument.create();
      const pageIndices = selectedPages.map(page => page.pageNumber - 1);
      
      setProgress(30);
      
      const copiedPages = await mergedPdf.copyPages(sourcePdfDoc, pageIndices);
      copiedPages.forEach(page => mergedPdf.addPage(page));
      
      setProgress(70);
      
      const mergedPdfBytes = await mergedPdf.save();
      const filename = `${file.name.replace('.pdf', '')}_selected_pages.pdf`;
      
      UnifiedPDFService.downloadFile(mergedPdfBytes, filename);
      setProgress(100);

      toast({
        title: "Success",
        description: `Downloaded merged PDF with ${selectedCount} pages`,
      });

    } catch (error) {
      console.error('Error merging selected pages:', error);
      toast({
        title: "Error",
        description: "Failed to merge selected pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadAllAsZip = async () => {
    if (!file || pages.length === 0) return;

    setIsProcessing(true);
    setProcessingText('Creating ZIP archive...');
    setProgress(0);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const sourcePdfDoc = await PDFDocument.load(arrayBuffer);

      for (let i = 0; i < pages.length; i++) {
        const pageIndex = i;
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDoc, [pageIndex]);
        newPdfDoc.addPage(copiedPage);
        
        const pdfBytes = await newPdfDoc.save();
        const filename = `page_${i + 1}.pdf`;
        
        zip.file(filename, pdfBytes);
        setProgress(((i + 1) / pages.length) * 90);
      }

      setProgress(95);
      setProcessingText('Finalizing ZIP...');
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipFilename = `${file.name.replace('.pdf', '')}_all_pages.zip`;
      
      // Create a download using the UnifiedPDFService helper method
      // This ensures we're following the same download pattern across the app
      const zipArray = await zipBlob.arrayBuffer();
      UnifiedPDFService.downloadFile(new Uint8Array(zipArray), zipFilename);
      
      setProgress(100);

      toast({
        title: "Success",
        description: `Downloaded ZIP archive with ${pages.length} pages`,
      });

    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Error",
        description: "Failed to create ZIP archive. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Split PDF: {file?.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          {file && (
            <p className="text-sm text-muted-foreground">
              Original file: {file.name} • {pages.length} pages
            </p>
          )}
        </DialogHeader>

        {isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <Progress value={progress} className="w-64 mb-4" />
            <p className="text-sm text-muted-foreground">{processingText}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All ({pages.length} pages)
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedCount} of {pages.length} pages selected
              </p>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      page.selected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePageSelect(page.pageNumber)}
                  >
                    <div className="aspect-[3/4] bg-gray-100 rounded flex items-center justify-center mb-2">
                      <FileDown className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-xs text-center font-medium">Page {page.pageNumber}</p>
                    <Checkbox
                      className="absolute top-1 right-1"
                      checked={page.selected}
                      onCheckedChange={() => handlePageSelect(page.pageNumber)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 border-t pt-4">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={downloadSelectedIndividual}
                  disabled={selectedCount === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Selected ({selectedCount})
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadSelectedAsSingle}
                  disabled={selectedCount === 0}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Merge Selected
                </Button>
                <Button
                  onClick={downloadAllAsZip}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Download All as ZIP
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
