import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Plus, Trash2, Text, Image, Pencil, Square, Download, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface EditPDFStagingProps {
  files: File[];
  onClose: () => void;
  onProcess: (file: File) => void;
  onAddMoreFiles: () => void;
}

export const EditPDFStaging: React.FC<EditPDFStagingProps> = ({
  files,
  onClose,
  onProcess,
  onAddMoreFiles
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('');
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (files.length > 0) {
      loadPdfDocument(files[0]);
    }
  }, [files]);

  const loadPdfDocument = async (file: File) => {
    if (!file || !file.type.includes('pdf')) {
      return;
    }

    setIsLoading(true);
    try {
      // Create a preview URL for the PDF
      const previewUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(previewUrl);

      // Generate page count and thumbnails
      const arrayBuffer = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPageCount();
      setTotalPages(pages);

      // Generate thumbnails for each page (limited to first 10 pages for performance)
      const maxThumbnails = Math.min(pages, 10);
      const thumbnails: string[] = [];
      
      for (let i = 0; i < maxThumbnails; i++) {
        const thumbnailDoc = await PDFDocument.create();
        const [copiedPage] = await thumbnailDoc.copyPages(pdfDoc, [i]);
        thumbnailDoc.addPage(copiedPage);
        
        const pdfBytes = await thumbnailDoc.saveAsBase64({ dataUri: true });
        thumbnails.push(pdfBytes);
      }
      
      setPageThumbnails(thumbnails);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleToolChange = (value: string) => {
    setSelectedTool(value);
  };

  const handleProcess = () => {
    if (files.length === 0) return;
    onProcess(files[0]);
  };

  const renderPageControls = () => {
    return (
      <div className="flex items-center justify-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm">of {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
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
          <h2 className="text-2xl font-bold">Edit PDF</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcess}
            className="text-xs flex items-center gap-1 h-8 px-3"
          >
            <Save className="w-3 h-3" />
            Save Changes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1 h-8 px-3"
          >
            <Download className="w-3 h-3" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
        {/* Left Sidebar - Pages Thumbnails */}
        <div className="col-span-2 border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b">
            <h3 className="text-sm font-medium">Pages</h3>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-240px)]">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <>
                {pageThumbnails.map((thumbnail, index) => (
                  <div 
                    key={index}
                    className={`relative aspect-[3/4] rounded border cursor-pointer hover:shadow-md transition-shadow ${
                      currentPage === index + 1 ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    <iframe
                      src={thumbnail}
                      className="w-full h-full pointer-events-none"
                      title={`Page ${index + 1} thumbnail`}
                    ></iframe>
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {totalPages > 10 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    + {totalPages - 10} more pages
                  </div>
                )}
              </>
            )}
          </div>
          <div className="p-2 border-t bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="w-1/2">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
              <Button size="sm" variant="outline" className="w-1/2 text-red-500">
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Center - PDF Preview */}
        <div className="col-span-7 border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm flex flex-col">
          <div className="bg-white dark:bg-gray-900 border-b p-2 flex justify-between items-center">
            <ToggleGroup type="single" value={selectedTool} onValueChange={handleToolChange} className="justify-start">
              <ToggleGroupItem value="select" aria-label="Select tool">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pointer">
                  <path d="M22 14a8 8 0 0 1-8 8"></path>
                  <path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
                  <path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"></path>
                  <path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10"></path>
                  <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.4-5.5-1.5"></path>
                </svg>
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text tool">
                <Text className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="image" aria-label="Image tool">
                <Image className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="draw" aria-label="Draw tool">
                <Pencil className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="shape" aria-label="Shape tool">
                <Square className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            {renderPageControls()}
          </div>
          <div className="flex-grow p-4 flex items-center justify-center overflow-auto bg-gray-200 dark:bg-gray-700">
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : pdfPreviewUrl ? (
              <div className="relative bg-white shadow-lg rounded-md max-h-full" style={{ aspectRatio: '1/1.414' }}>
                <iframe
                  src={`${pdfPreviewUrl}#page=${currentPage}`}
                  className="w-full h-full rounded-md"
                  title="PDF document preview"
                ></iframe>
              </div>
            ) : (
              <div className="text-center">
                <p>No PDF selected for editing</p>
                <Button 
                  variant="outline" 
                  onClick={onAddMoreFiles} 
                  className="mt-2"
                >
                  Select PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Editing Properties */}
        <div className="col-span-3 border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b">
            <h3 className="text-sm font-medium">Properties</h3>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-240px)]">
            {selectedTool === 'select' && (
              <div className="text-center text-sm text-gray-500 py-4">
                <p>Select an element on the page to edit its properties</p>
              </div>
            )}
            
            {selectedTool === 'text' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Input id="text-content" placeholder="Enter text here..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <Input id="font-size" type="number" min={8} max={72} defaultValue={12} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <select id="font-family" className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 mt-1">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier</option>
                    <option>Helvetica</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="text-xs p-1">Bold</Button>
                  <Button variant="outline" size="sm" className="text-xs p-1">Italic</Button>
                  <Button variant="outline" size="sm" className="text-xs p-1">Underline</Button>
                </div>
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="text-color" type="color" defaultValue="#000000" className="w-12 h-8 p-0" />
                    <Input id="text-color-hex" defaultValue="#000000" className="flex-grow" />
                  </div>
                </div>
              </div>
            )}

            {selectedTool === 'image' && (
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Upload Image
                </Button>
                <div>
                  <Label htmlFor="image-width">Width</Label>
                  <Input id="image-width" type="number" min={10} defaultValue={200} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="image-height">Height</Label>
                  <Input id="image-height" type="number" min={10} defaultValue={200} className="mt-1" />
                </div>
                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Label htmlFor="image-x" className="text-xs">X</Label>
                      <Input id="image-x" type="number" min={0} defaultValue={0} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="image-y" className="text-xs">Y</Label>
                      <Input id="image-y" type="number" min={0} defaultValue={0} className="mt-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="image-opacity">Opacity</Label>
                  <Input id="image-opacity" type="range" min={0} max={100} defaultValue={100} className="mt-1" />
                </div>
              </div>
            )}

            {selectedTool === 'draw' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stroke-width">Stroke Width</Label>
                  <Input id="stroke-width" type="number" min={1} max={20} defaultValue={2} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="stroke-color">Stroke Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="stroke-color" type="color" defaultValue="#000000" className="w-12 h-8 p-0" />
                    <Input id="stroke-color-hex" defaultValue="#000000" className="flex-grow" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stroke-style">Stroke Style</Label>
                  <select id="stroke-style" className="w-full rounded-md border border-gray-300 dark:border-gray-700 p-2 mt-1">
                    <option>Solid</option>
                    <option>Dashed</option>
                    <option>Dotted</option>
                  </select>
                </div>
              </div>
            )}

            {selectedTool === 'shape' && (
              <div className="space-y-4">
                <div>
                  <Label>Shape Type</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Button variant="outline" size="sm" className="text-xs p-1">Rectangle</Button>
                    <Button variant="outline" size="sm" className="text-xs p-1">Circle</Button>
                    <Button variant="outline" size="sm" className="text-xs p-1">Line</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="shape-width">Width</Label>
                  <Input id="shape-width" type="number" min={10} defaultValue={100} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="shape-height">Height</Label>
                  <Input id="shape-height" type="number" min={10} defaultValue={100} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="shape-fill">Fill Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="shape-fill" type="color" defaultValue="#ffffff" className="w-12 h-8 p-0" />
                    <Input id="shape-fill-hex" defaultValue="#ffffff" className="flex-grow" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="shape-stroke">Stroke Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="shape-stroke" type="color" defaultValue="#000000" className="w-12 h-8 p-0" />
                    <Input id="shape-stroke-hex" defaultValue="#000000" className="flex-grow" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="shape-stroke-width">Stroke Width</Label>
                  <Input id="shape-stroke-width" type="number" min={0} max={20} defaultValue={1} className="mt-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
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
          disabled={!pdfPreviewUrl}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2"
        >
          Save Changes
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

export default EditPDFStaging;
