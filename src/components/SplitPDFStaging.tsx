import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { X, Upload, ArrowLeft, FileText, SplitSquareVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SplitPDFStagingProps {
  files: File[];
  onClose: () => void;
  onProcess: (file: File, splitMode: string, pageRanges?: string) => void;
  onAddMoreFiles: () => void;
}

export type SplitMode = 'all' | 'ranges' | 'extract';

export const SplitPDFStaging: React.FC<SplitPDFStagingProps> = ({
  files,
  onClose,
  onProcess,
  onAddMoreFiles
}) => {
  const [splitMode, setSplitMode] = useState<SplitMode>('all');
  const [pageRanges, setPageRanges] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [previewThumbnails, setPreviewThumbnails] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  useEffect(() => {
    if (files.length > 0) {
      loadPdfPreview(files[0]);
    }
  }, [files]);

  const loadPdfPreview = async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      return;
    }

    setIsLoadingPreview(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the total page count
      const totalPages = pdfDoc.getPageCount();
      setPageCount(totalPages);

      // Generate thumbnails for the first few pages (limit to 5 for performance)
      const maxPreviewPages = Math.min(totalPages, 5);
      const thumbnails: string[] = [];
      
      for (let i = 0; i < maxPreviewPages; i++) {
        const page = pdfDoc.getPage(i);
        
        // Create a new document with just this page
        const thumbnailDoc = await PDFDocument.create();
        const [copiedPage] = await thumbnailDoc.copyPages(pdfDoc, [i]);
        thumbnailDoc.addPage(copiedPage);
        
        // Convert to base64 for display
        const pdfBytes = await thumbnailDoc.saveAsBase64({ dataUri: true });
        thumbnails.push(pdfBytes);
      }
      
      setPreviewThumbnails(thumbnails);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleProcess = () => {
    if (files.length === 0) return;
    onProcess(files[0], splitMode, splitMode === 'ranges' ? pageRanges : undefined);
  };

  const renderPageRangeExample = () => {
    if (pageCount === 0) return 'Loading page information...';
    
    if (pageCount === 1) {
      return 'This PDF has only 1 page and cannot be split.';
    }
    
    if (pageCount <= 5) {
      return `Example: "1,3" to extract pages 1 and 3 of ${pageCount}`;
    }
    
    return `Example: "1-3,5,7-9" to extract pages 1-3, 5, and 7-9 of ${pageCount}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Split PDF</h2>
        </div>
      </div>

      {/* File List */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              PDF to Split
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMoreFiles}
              className="text-xs flex items-center gap-1 h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Upload className="w-3 h-3" />
              Choose Another PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.length > 0 ? (
              <div 
                key={files[0].name}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{files[0].name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(files[0].size / 1024 / 1024).toFixed(2)} MB • {pageCount > 0 ? `${pageCount} pages` : 'Loading...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => console.log('Remove file')}
                  className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No PDF selected. Add a PDF to split.</p>
              </div>
            )}
            
            {files.length === 0 && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  onClick={onAddMoreFiles}
                  className="w-full text-sm py-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Drag & drop a PDF here or click to add
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {files.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPreview ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {previewThumbnails.map((thumbnail, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <iframe
                      src={thumbnail}
                      className="w-full h-full"
                      title={`Page ${index + 1} preview`}
                    ></iframe>
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {pageCount > 5 && (
                  <div className="flex items-center justify-center aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-2">
                      +{pageCount - 5} more pages
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Split Options */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Split Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base">Split Mode</Label>
            <RadioGroup
              value={splitMode}
              onValueChange={(value) => setSplitMode(value as SplitMode)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="all" id="split-all" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="split-all" className="font-medium cursor-pointer">
                    Split into individual pages
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Creates a separate PDF for each page in the document
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="ranges" id="split-ranges" className="mt-1" />
                <div className="grid gap-1.5 leading-none w-full">
                  <Label htmlFor="split-ranges" className="font-medium cursor-pointer">
                    Extract specific pages
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Specify page numbers or ranges to extract
                  </p>
                  
                  {splitMode === 'ranges' && (
                    <div className="mt-2">
                      <Input
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="e.g., 1-3,5,7-9"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {renderPageRangeExample()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="extract" id="split-extract" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="split-extract" className="font-medium cursor-pointer">
                    Advanced splitting (in editor)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Opens interactive page selection interface for more control
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {pageCount > 0 && splitMode !== 'ranges' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                <SplitSquareVertical className="w-4 h-4 mr-2" />
                {splitMode === 'all' 
                  ? `This will create ${pageCount} individual PDF files`
                  : 'You will be able to select specific pages in the interactive editor'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> 
          Back
        </Button>
        
        <Button 
          onClick={handleProcess}
          disabled={files.length === 0 || (splitMode === 'ranges' && pageRanges.trim() === '')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2"
        >
          Split PDF
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default SplitPDFStaging;
