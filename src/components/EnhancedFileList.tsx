
import React, { useState } from 'react';
import { FileText, Image, FileSpreadsheet, File, Calendar, HardDrive, MapPin, Eye } from 'lucide-react';
import QuickActions from './QuickActions';

interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  modified: string;
  created?: string;
  location?: string;
  tags?: string[];
}

interface EnhancedFileListProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  hoveredFile: number | null;
  onHover: (id: number | null) => void;
}

const EnhancedFileList: React.FC<EnhancedFileListProps> = ({ 
  files, 
  viewMode, 
  hoveredFile, 
  onHover 
}) => {
  const [sortBy, setSortBy] = useState('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'word': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': return <Image className="w-8 h-8 text-purple-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'size':
        // Simple size comparison (would need more sophisticated parsing in real app)
        aValue = parseFloat(a.size);
        bValue = parseFloat(b.size);
        break;
      default:
        aValue = a.modified;
        bValue = b.modified;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300">
          <div className="col-span-5 cursor-pointer hover:text-gray-900 dark:hover:text-white flex items-center gap-2" onClick={() => handleSort('name')}>
            Name
            {sortBy === 'name' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          </div>
          <div className="col-span-2 cursor-pointer hover:text-gray-900 dark:hover:text-white flex items-center gap-2" onClick={() => handleSort('type')}>
            Type
            {sortBy === 'type' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          </div>
          <div className="col-span-2 cursor-pointer hover:text-gray-900 dark:hover:text-white flex items-center gap-2" onClick={() => handleSort('size')}>
            Size
            {sortBy === 'size' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          </div>
          <div className="col-span-3 cursor-pointer hover:text-gray-900 dark:hover:text-white flex items-center gap-2" onClick={() => handleSort('modified')}>
            Modified
            {sortBy === 'modified' && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedFiles.map((file, index) => (
            <div
              key={file.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group"
              onMouseEnter={() => onHover(file.id)}
              onMouseLeave={() => onHover(null)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <QuickActions 
                fileName={file.name}
                fileType={file.type}
                isVisible={hoveredFile === file.id}
              />
              
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </h3>
                  {file.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {file.location}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {file.type}
                </span>
              </div>
              
              <div className="col-span-2 flex items-center">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <HardDrive className="w-3 h-3" />
                  {file.size}
                </div>
              </div>
              
              <div className="col-span-3 flex items-center">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-3 h-3" />
                  {file.modified}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid view (existing implementation with enhancements)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedFiles.map((file, index) => (
        <div
          key={file.id}
          className="group cursor-pointer transform transition-all duration-300 hover:scale-105 animate-fade-in relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700"
          style={{ animationDelay: `${index * 0.1}s` }}
          onMouseEnter={() => onHover(file.id)}
          onMouseLeave={() => onHover(null)}
        >
          <QuickActions 
            fileName={file.name}
            fileType={file.type}
            isVisible={hoveredFile === file.id}
          />
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex-shrink-0">
              {getFileIcon(file.type)}
            </div>
            <div className="space-y-1 min-w-0 w-full">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{file.size}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{file.modified}</p>
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {file.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 2 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      +{file.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedFileList;
