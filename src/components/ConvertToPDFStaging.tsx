import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, ArrowLeft, FileText, Image, FileSpreadsheet, Film, File, FileType, FileImage } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ConvertToPDFStagingProps {
  files: File[];
  onClose: () => void;
  onProcess: (files: File[], options: ConvertToPDFOptions) => void;
  onAddMoreFiles: () => void;
}

export interface ConvertToPDFOptions {
  orientation: 'auto' | 'portrait' | 'landscape';
  pageSize: 'auto' | 'a4' | 'letter' | 'legal';
  mergeIntoSinglePDF: boolean;
  fileOrder: number[]; // Indices of the files in their original order
}

export const ConvertToPDFStaging: React.FC<ConvertToPDFStagingProps> = ({
  files,
  onClose,
  onProcess,
  onAddMoreFiles
}) => {
  const [options, setOptions] = useState<ConvertToPDFOptions>({
    orientation: 'auto',
    pageSize: 'auto',
    mergeIntoSinglePDF: files.length > 1,
    fileOrder: Array.from({ length: files.length }, (_, i) => i)
  });

  const handleRemoveFile = (indexToRemove: number) => {
    // Update file order by removing the index
    const updatedOrder = options.fileOrder.filter(index => index !== indexToRemove);
    
    // Adjust the indices that were greater than the removed index
    const finalOrder = updatedOrder.map(index => 
      index > indexToRemove ? index - 1 : index
    );
    
    setOptions({
      ...options,
      fileOrder: finalOrder
    });
  };

  const moveFile = (currentIndex: number, direction: 'up' | 'down') => {
    if (!options.mergeIntoSinglePDF) return;
    
    const orderIndex = options.fileOrder.findIndex(i => i === currentIndex);
    
    if (
      (direction === 'up' && orderIndex === 0) ||
      (direction === 'down' && orderIndex === options.fileOrder.length - 1)
    ) {
      return; // Can't move further in this direction
    }
    
    const newOrder = [...options.fileOrder];
    const swapIndex = direction === 'up' ? orderIndex - 1 : orderIndex + 1;
    
    // Swap positions
    [newOrder[orderIndex], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[orderIndex]];
    
    setOptions({
      ...options,
      fileOrder: newOrder
    });
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    // Images
    if (type.includes('image')) return <Image className="w-5 h-5" />;
    
    // PDFs
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    
    // Microsoft Office
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return <FileImage className="w-5 h-5 text-orange-500" />;
    
    // Other common formats
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (type.includes('video')) return <Film className="w-5 h-5 text-purple-500" />;
    if (name.endsWith('.txt')) return <FileText className="w-5 h-5 text-gray-500" />;
    if (name.endsWith('.csv')) return <FileSpreadsheet className="w-5 h-5 text-gray-500" />;
    
    // Default
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getFileColor = (file: File) => {
    const type = file.type;
    if (type.includes('image')) return 'bg-green-100 text-green-700 border-green-200';
    if (type.includes('pdf')) return 'bg-red-100 text-red-700 border-red-200';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleProcess = () => {
    // Order the files according to fileOrder before processing
    const orderedFiles = options.fileOrder.map(index => files[index]);
    onProcess(orderedFiles, options);
  };

  // Order files based on the current fileOrder
  const orderedFiles = options.fileOrder.map(index => files[index]);

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
          <h2 className="text-2xl font-bold">Convert to PDF</h2>
        </div>
      </div>

      {/* Selected Files Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddMoreFiles}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Add More Files
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {orderedFiles.length > 0 ? (
              <ul className="divide-y">
                {orderedFiles.map((file, displayIndex) => {
                  const actualIndex = options.fileOrder[displayIndex];
                  return (
                    <div 
                      key={`${file.name}-${actualIndex}`}
                      className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {options.mergeIntoSinglePDF && files.length > 1 && (
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveFile(actualIndex, 'up')}
                              disabled={displayIndex === 0}
                              className="h-5 w-5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={displayIndex === 0 ? 'text-gray-400' : 'text-gray-600'}
                              >
                                <path d="m18 15-6-6-6 6" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveFile(actualIndex, 'down')}
                              disabled={displayIndex === files.length - 1}
                              className="h-5 w-5 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={displayIndex === files.length - 1 ? 'text-gray-400' : 'text-gray-600'}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(actualIndex)}
                        className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No files selected</p>
              </div>
            )}
          </div>
        </div>
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            onClick={onAddMoreFiles}
            className="w-full text-sm py-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            Drag & drop more files here or click to add
          </Button>
        </div>
      </div>

      {/* Conversion Options */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Conversion Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Orientation Option */}
            <div className="space-y-3">
              <Label>Page Orientation</Label>
              <RadioGroup
                value={options.orientation}
                onValueChange={(value) => setOptions({ ...options, orientation: value as 'auto' | 'portrait' | 'landscape' })}
                className="flex items-center space-x-4"
              value={options.orientation}
              onValueChange={(value) => setOptions({ ...options, orientation: value as 'auto' | 'portrait' | 'landscape' })}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="orientation-auto" />
                <Label htmlFor="orientation-auto">Auto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portrait" id="orientation-portrait" />
                <Label htmlFor="orientation-portrait">Portrait</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landscape" id="orientation-landscape" />
                <Label htmlFor="orientation-landscape">Landscape</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Page Size Option */}
          <div className="space-y-3">
            <Label>Page Size</Label>
            <Select
              value={options.pageSize}
              onValueChange={(value) => setOptions({ ...options, pageSize: value as 'auto' | 'a4' | 'letter' | 'legal' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (From original content)</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Merge Option - only show if more than one file */}
        {files.length > 1 && (
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="merge-files"
              checked={options.mergeIntoSinglePDF}
              onCheckedChange={(checked) => setOptions({ ...options, mergeIntoSinglePDF: checked as boolean })}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="merge-files"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Combine all files into one PDF document
              </Label>
              {options.mergeIntoSinglePDF && (
                <p className="text-sm text-muted-foreground">
                  Files will be combined in the order shown above. Drag to reorder if needed.
                </p>
              )}
            </div>
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
          disabled={files.length === 0}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2"
        >
          Convert to PDF
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

export default ConvertToPDFStaging;
