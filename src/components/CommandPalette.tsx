
import React, { useState, useEffect } from 'react';
import { Search, FileText, Image, FileSpreadsheet, Brain, Download, Edit3, Merge, Scissors, Archive, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const commands = [
    { id: 'pdf-tools', label: 'PDF Tools', category: 'Navigation', icon: FileText, action: () => onSelectTab('pdf') },
    { id: 'word-tools', label: 'Word Tools', category: 'Navigation', icon: FileText, action: () => onSelectTab('word') },
    { id: 'image-tools', label: 'Image Tools', category: 'Navigation', icon: Image, action: () => onSelectTab('image') },
    { id: 'excel-tools', label: 'Excel Tools', category: 'Navigation', icon: FileSpreadsheet, action: () => onSelectTab('excel') },
    { id: 'ai-hub', label: 'AI Hub', category: 'Navigation', icon: Brain, action: () => onSelectTab('ai') },
    { id: 'all-files', label: 'All Files', category: 'Navigation', icon: FileText, action: () => onSelectTab('all') },
    { id: 'convert-pdf', label: 'Convert to PDF', category: 'Tools', icon: Download, action: () => {} },
    { id: 'edit-pdf', label: 'Edit PDF', category: 'Tools', icon: Edit3, action: () => {} },
    { id: 'merge-pdf', label: 'Merge PDFs', category: 'Tools', icon: Merge, action: () => {} },
    { id: 'split-pdf', label: 'Split PDF', category: 'Tools', icon: Scissors, action: () => {} },
    { id: 'compress-pdf', label: 'Compress PDF', category: 'Tools', icon: Archive, action: () => {} },
    { id: 'upload-file', label: 'Upload File', category: 'Actions', icon: Upload, action: () => {} },
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          setSearchQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, navigate to pages..."
                className="pl-10 border-0 focus:ring-0 bg-transparent text-lg"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category}
                </div>
                {commands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{command.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No commands found for "{searchQuery}"
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↵</kbd> to select</span>
              <span><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
