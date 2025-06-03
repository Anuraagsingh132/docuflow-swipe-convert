
import React, { useState } from 'react';
import { Filter, Calendar, FileType, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface FileFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const FileFilters: React.FC<FileFiltersProps> = ({ onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    fileTypes: [] as string[],
    dateRange: '',
    sizeRange: '',
    tags: [] as string[]
  });

  const fileTypes = [
    { id: 'pdf', label: 'PDF Documents', icon: '📄' },
    { id: 'word', label: 'Word Documents', icon: '📝' },
    { id: 'excel', label: 'Excel Sheets', icon: '📊' },
    { id: 'image', label: 'Images', icon: '🖼️' },
    { id: 'powerpoint', label: 'Presentations', icon: '📋' }
  ];

  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Past Week' },
    { id: 'month', label: 'Past Month' },
    { id: 'year', label: 'Past Year' }
  ];

  const sizeRanges = [
    { id: 'small', label: 'Small (< 1MB)' },
    { id: 'medium', label: 'Medium (1-10MB)' },
    { id: 'large', label: 'Large (> 10MB)' }
  ];

  const handleFilterChange = (category: string, value: string, checked: boolean) => {
    const newFilters = { ...activeFilters };
    
    if (category === 'fileTypes') {
      if (checked) {
        newFilters.fileTypes = [...newFilters.fileTypes, value];
      } else {
        newFilters.fileTypes = newFilters.fileTypes.filter(type => type !== value);
      }
    }
    
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const activeFilterCount = activeFilters.fileTypes.length + 
    (activeFilters.dateRange ? 1 : 0) + 
    (activeFilters.sizeRange ? 1 : 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="relative rounded-xl border-2 hover:border-blue-300 transition-all duration-200"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </div>
          )}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">Filter Files</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setActiveFilters({ fileTypes: [], dateRange: '', sizeRange: '', tags: [] });
                onFiltersChange({ fileTypes: [], dateRange: '', sizeRange: '', tags: [] });
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">File Type</Label>
              <div className="space-y-2">
                {fileTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={activeFilters.fileTypes.includes(type.id)}
                      onCheckedChange={(checked) => 
                        handleFilterChange('fileTypes', type.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={type.id} className="text-sm flex items-center gap-2 cursor-pointer">
                      <span>{type.icon}</span>
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">Date Modified</Label>
              <div className="space-y-2">
                {dateRanges.map((range) => (
                  <div key={range.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.id}
                      checked={activeFilters.dateRange === range.id}
                      onCheckedChange={(checked) => {
                        const newFilters = { ...activeFilters, dateRange: checked ? range.id : '' };
                        setActiveFilters(newFilters);
                        onFiltersChange(newFilters);
                      }}
                    />
                    <Label htmlFor={range.id} className="text-sm cursor-pointer">
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium mb-2 block">File Size</Label>
              <div className="space-y-2">
                {sizeRanges.map((range) => (
                  <div key={range.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.id}
                      checked={activeFilters.sizeRange === range.id}
                      onCheckedChange={(checked) => {
                        const newFilters = { ...activeFilters, sizeRange: checked ? range.id : '' };
                        setActiveFilters(newFilters);
                        onFiltersChange(newFilters);
                      }}
                    />
                    <Label htmlFor={range.id} className="text-sm cursor-pointer">
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FileFilters;
