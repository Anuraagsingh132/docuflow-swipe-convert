import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Upload, ArrowLeft, FileText, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface MergePDFsStagingProps {
  files: File[];
  onClose: () => void;
  onProcess: (files: File[], outputFilename: string) => void;
  onAddMoreFiles: () => void;
}

export const MergePDFsStaging: React.FC<MergePDFsStagingProps> = ({
  files,
  onClose,
  onProcess,
  onAddMoreFiles
}) => {
  const [fileOrder, setFileOrder] = useState<number[]>(Array.from({ length: files.length }, (_, i) => i));
  const [outputFilename, setOutputFilename] = useState<string>('Merged_Document.pdf');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  
  // Reset file order when files change
  useEffect(() => {
    setFileOrder(Array.from({ length: files.length }, (_, i) => i));
  }, [files.length]);

  const handleRemoveFile = (indexToRemove: number) => {
    // Update file order by removing the index
    const updatedOrder = fileOrder.filter(index => index !== indexToRemove);
    
    // Adjust the indices that were greater than the removed index
    const finalOrder = updatedOrder.map(index => 
      index > indexToRemove ? index - 1 : index
    );
    
    setFileOrder(finalOrder);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === overIndex) return;
    
    // Reorder the fileOrder array
    const newOrder = [...fileOrder];
    const draggedItem = newOrder[dragIndex];
    
    // Remove the dragged item
    newOrder.splice(dragIndex, 1);
    // Insert it at the new position
    newOrder.splice(overIndex, 0, draggedItem);
    
    setFileOrder(newOrder);
    setDragIndex(overIndex);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const getPageCount = async (file: File): Promise<number> => {
    try {
      if (!file.type.includes('pdf')) return 0;
      
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  };

  const handleProcess = () => {
    // Order the files according to fileOrder before processing
    const orderedFiles = fileOrder.map(index => files[index]);
    onProcess(orderedFiles, outputFilename);
  };

  // Order files based on the current fileOrder
  const orderedFiles = fileOrder.map(index => files[index]);

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
          <h2 className="text-2xl font-bold">Merge PDFs</h2>
        </div>
      </div>

      {/* File List */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              PDFs to Merge ({files.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddMoreFiles}
              className="text-xs flex items-center gap-1 h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Upload className="w-3 h-3" />
              Add More PDFs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orderedFiles.map((file, index) => {
              // Using state to store page counts would be better in a real implementation
              const [pageCount, setPageCount] = useState<number>(0);
              
              // Get page count when component mounts
              useEffect(() => {
                const fetchPageCount = async () => {
                  const count = await getPageCount(file);
                  setPageCount(count);
                };
                fetchPageCount();
              }, [file]);

              return (
                <div 
                  key={`${file.name}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow ${
                    dragIndex === index ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center justify-center cursor-move">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB • {pageCount > 0 ? `${pageCount} pages` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(index)}
                    className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            
            {files.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No PDFs selected. Add PDFs to merge.</p>
              </div>
            )}
            
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                onClick={onAddMoreFiles}
                className="w-full text-sm py-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Drag & drop more PDFs here or click to add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merge Options */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Merge Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="Enter filename for merged PDF"
            />
          </div>
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
          disabled={files.length < 2}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2"
        >
          Merge PDFs
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

export default MergePDFsStaging;
