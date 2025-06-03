
import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, FileSpreadsheet } from 'lucide-react';

interface DragDropZoneProps {
  onFilesDrop: (files: FileList) => void;
  className?: string;
  children?: React.ReactNode;
  acceptedTypes?: string[];
  toolName?: string;
  style?: React.CSSProperties;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ 
  onFilesDrop, 
  className = '', 
  children, 
  acceptedTypes = [],
  toolName,
  style 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDrop(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesDrop(e.target.files);
    }
  };

  const getIcon = () => {
    if (acceptedTypes.includes('.pdf')) return FileText;
    if (acceptedTypes.includes('.jpg') || acceptedTypes.includes('.png')) return Image;
    if (acceptedTypes.includes('.xlsx') || acceptedTypes.includes('.csv')) return FileSpreadsheet;
    return Upload;
  };

  const Icon = getIcon();

  return (
    <div
      className={`relative transition-all duration-300 cursor-pointer ${
        isDragOver 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 scale-105 shadow-lg' 
          : 'hover:border-blue-300 dark:hover:border-blue-600'
      } ${className}`}
      style={style}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
      />
      
      {isDragOver && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center z-10 animate-scale-in">
          <div className="text-center">
            <Icon className="w-12 h-12 text-blue-500 mx-auto mb-2 animate-bounce" />
            <p className="text-blue-600 dark:text-blue-400 font-semibold">
              {toolName ? `Drop files to ${toolName}` : 'Drop files here'}
            </p>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default DragDropZone;
