import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { X, Upload, ArrowLeft, FileText, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PDFtoWordStagingProps {
  files: File[];
  onClose: () => void;
  onProcess: (files: File[], options: ConversionOptions) => void;
  onAddMoreFiles: () => void;
}

export interface ConversionOptions {
  preserveLayout: boolean;
  enableOcr: boolean;
  includeImages: boolean;
}

export const PDFtoWordStaging: React.FC<PDFtoWordStagingProps> = ({
  files,
  onClose,
  onProcess,
  onAddMoreFiles
}) => {
  const [options, setOptions] = useState<ConversionOptions>({
    preserveLayout: true,
    enableOcr: false,
    includeImages: true
  });

  const handleRemoveFile = (indexToRemove: number) => {
    // This would need to be handled by the parent component
    // For this example, we'll just show how it would be called
    console.log('Remove file at index:', indexToRemove);
  };

  const handleProcess = () => {
    onProcess(files, options);
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
          <h2 className="text-2xl font-bold">PDF to Word</h2>
        </div>
      </div>

      {/* File List */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              PDFs to Convert ({files.length})
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
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
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
            ))}
            
            {files.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>No PDFs selected. Add PDFs to convert to Word.</p>
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

      {/* Conversion Options */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Conversion Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Preserve Layout Option */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preserve-layout" className="text-base">Preserve Layout</Label>
              <p className="text-sm text-muted-foreground">
                Maintain original document formatting and layout
              </p>
            </div>
            <Switch
              id="preserve-layout"
              checked={options.preserveLayout}
              onCheckedChange={(checked) => setOptions({ ...options, preserveLayout: checked })}
            />
          </div>
          
          <Separator className="my-2" />
          
          {/* OCR Option */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-ocr" className="text-base">Enable OCR</Label>
              <p className="text-sm text-muted-foreground">
                Extract text from scanned documents or images
              </p>
            </div>
            <Switch
              id="enable-ocr"
              checked={options.enableOcr}
              onCheckedChange={(checked) => setOptions({ ...options, enableOcr: checked })}
            />
          </div>
          
          <Separator className="my-2" />
          
          {/* Include Images Option */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-images" className="text-base">Include Images</Label>
              <p className="text-sm text-muted-foreground">
                Preserve images from the original PDF in the Word document
              </p>
            </div>
            <Switch
              id="include-images"
              checked={options.includeImages}
              onCheckedChange={(checked) => setOptions({ ...options, includeImages: checked })}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
              <FileType className="w-4 h-4 mr-2" />
              Output format: DOCX (Microsoft Word)
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {options.enableOcr 
                ? 'OCR processing may take longer but improves text extraction from scanned documents' 
                : 'For scanned documents, consider enabling OCR for better text extraction'}
            </p>
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
          disabled={files.length === 0}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2"
        >
          Convert to Word
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

export default PDFtoWordStaging;
