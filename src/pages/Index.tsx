import React, { useState, useRef, useEffect } from 'react';
import { FileText, Image, FileSpreadsheet, Brain, Upload, Search, Settings, Moon, Sun, File, FolderOpen, Star, Clock, Grid3X3, List, Download, Share2, Edit3, Merge, Scissors, Archive, Sparkles, Command, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommandPalette from '@/components/CommandPalette';
import QuickActions from '@/components/QuickActions';
import DragDropZone from '@/components/DragDropZone';
import FileFilters from '@/components/FileFilters';
import ToastNotification from '@/components/ToastNotification';
import EnhancedFileList from '@/components/EnhancedFileList';
import RecentSearches from '@/components/RecentSearches';
import EnhancedSettingsPanel from '@/components/EnhancedSettingsPanel';
// import SettingsPanel from '@/components/SettingsPanel'; // Using EnhancedSettingsPanel instead
import { usePDFOperations } from '@/hooks/usePDFOperations';
import { Progress } from '@/components/ui/progress';
import PremiumBanner from '@/components/PremiumBanner';
import ConvertToPDFStaging, { ConvertToPDFOptions } from '@/components/ConvertToPDFStaging';
import { useSettings } from '@/contexts/SettingsContext';
import { UnifiedPDFService } from '@/services/unifiedPdfService';

type ViewMode = 'grid' | 'list';

const Index = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [focusMode, setFocusMode] = useState<{ active: boolean; toolId?: string }>({ active: false });
  const [stagingState, setStagingState] = useState<{
    active: boolean;
    toolId?: string;
    files: File[];
  }>({ active: false, files: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState(['project proposal', 'budget analysis', 'meeting notes']);
  const [toasts, setToasts] = useState<any[]>([]);
  const { executeOperation, isProcessing, progress } = usePDFOperations();
  
  // Get settings from context
  const { usePdfApi, togglePdfApi, pdfApiKey } = useSettings();
  
  // Initialize the UnifiedPDFService with the current API setting
  useEffect(() => {
    UnifiedPDFService.initialize(usePdfApi);
  }, [usePdfApi]);

  const formatTabs = [
    { id: 'all', label: 'All Files', icon: FolderOpen },
    { id: 'workspaces', label: 'Workspaces', icon: FolderOpen },
    { id: 'pdf', label: 'PDF Tools', icon: FileText },
    { id: 'word', label: 'Word Tools', icon: FileText },
    { id: 'image', label: 'Image Tools', icon: Image },
    { id: 'excel', label: 'Excel Tools', icon: FileSpreadsheet },
    { id: 'ai', label: 'AI Hub', icon: Brain },
  ];

  const pdfTools = [
    { id: 'convert-to-pdf', label: 'Convert to PDF', icon: Download, description: 'Convert any document to PDF format', subtext: 'Supports Word, Excel, PowerPoint & Images' },
    { id: 'edit-pdf', label: 'Edit PDF', icon: Edit3, description: 'Add text, annotations, and signatures', subtext: 'Professional editing tools included' },
    { id: 'merge-pdf', label: 'Merge PDFs', icon: Merge, description: 'Combine multiple PDFs into one', subtext: 'Supports reordering pages before merging' },
    { id: 'split-pdf', label: 'Split PDF', icon: Scissors, description: 'Extract pages or split documents', subtext: 'Precise page range selection' },
    { id: 'compress-pdf', label: 'Compress PDF', icon: Archive, description: 'Reduce file size while maintaining quality', subtext: 'Up to 90% size reduction' },
    { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText, description: 'Convert PDF to editable Word document', subtext: 'Preserves formatting and layout' },
  ];

  const recentFiles = [
    { id: 1, name: 'Project Proposal.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', created: '1 week ago', location: 'Documents/Projects', tags: ['work', 'important'] },
    { id: 2, name: 'Budget Analysis.xlsx', type: 'excel', size: '1.8 MB', modified: '1 day ago', created: '3 days ago', location: 'Documents/Finance', tags: ['finance', 'quarterly'] },
    { id: 3, name: 'Meeting Notes.docx', type: 'word', size: '456 KB', modified: '3 days ago', created: '3 days ago', location: 'Documents/Notes', tags: ['meeting', 'team'] },
    { id: 4, name: 'Design Mockup.png', type: 'image', size: '3.2 MB', modified: '1 week ago', created: '1 week ago', location: 'Documents/Design', tags: ['design', 'ui'] },
  ];

  const pinnedFiles = [
    { id: 5, name: 'Annual Report.pdf', type: 'pdf', size: '5.2 MB', modified: '1 week ago', created: '2 weeks ago', location: 'Documents/Reports' },
    { id: 6, name: 'Client Contract.docx', type: 'word', size: '892 KB', modified: '3 days ago', created: '1 month ago', location: 'Documents/Legal' },
  ];

  const aiFeatures = [
    { 
      label: 'Summarize Document', 
      desc: 'Get key insights instantly with AI-powered summaries',
      gradient: 'from-blue-500 to-cyan-500',
      subtext: 'Works with PDFs, Word docs, and text files'
    },
    { 
      label: 'Extract Key Info', 
      desc: 'Pull out important data, names, dates, and entities',
      gradient: 'from-purple-500 to-pink-500',
      subtext: 'Intelligent entity recognition'
    },
    { 
      label: 'Ask Questions', 
      desc: 'Chat with your documents and get instant answers',
      gradient: 'from-green-500 to-emerald-500',
      subtext: 'Context-aware responses with source links'
    },
    { 
      label: 'Generate Content', 
      desc: 'Create new documents based on existing content',
      gradient: 'from-orange-500 to-red-500',
      subtext: 'Templates and content suggestions'
    },
  ];

  const addToast = (toast: any) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
    addToast({
      type: 'info',
      title: 'Search Initiated',
      message: `Searching for "${query}"`
    });
  };

  const handleFilesDrop = (files: FileList) => {
    console.log('Files dropped:', Array.from(files).map(f => f.name));
    addToast({
      type: 'success',
      title: 'Files Uploaded',
      message: `Successfully uploaded ${files.length} file(s)`
    });
  };

  const handleToolFilesDrop = (toolId: string, files: FileList) => {
    const tool = pdfTools.find(t => t.id === toolId);
    
    if (!tool) return;

    // Convert FileList to File array
    const fileArray = Array.from(files);

    // For tools with staging areas
    if (toolId === 'convert-to-pdf') {
      console.log('Activating Convert to PDF staging area');
      // Don't use focus mode for staging area (prevents blur effect)
      setFocusMode({ active: false });
      // Show staging area for Convert to PDF
      setStagingState({
        active: true,
        toolId,
        files: fileArray
      });
    } else {
      // Activate focus mode for direct processing tools
      setFocusMode({ active: true, toolId });
      // For other tools, use the direct processing path for now
      processToolOperation(toolId, fileArray);
    }
  };

  const handleStagingAddMore = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAdditionalFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (!newFiles || newFiles.length === 0 || !stagingState.active) return;

    // Add new files to existing files in staging
    setStagingState(prev => ({
      ...prev,
      files: [...prev.files, ...Array.from(newFiles)]
    }));

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStagingClose = () => {
    // Close staging area and deactivate focus mode
    setStagingState({ active: false, files: [] });
    setFocusMode({ active: false });
  };

  // Function to process PDF tool operations
  const processToolOperation = async (toolId: string, files: File[]) => {
    const tool = pdfTools.find(t => t.id === toolId);
    if (!tool || files.length === 0) return;

    addToast({ type: 'info', title: 'Processing Started', message: `${tool.label} - Processing ${files.length} file(s)${usePdfApi ? ' using PDF.co API' : ' locally'}` });

    try {
      let result;
      const firstFile = files[0];

      switch (toolId) {
        case 'merge-pdf':
          result = await UnifiedPDFService.mergePDFs(files as unknown as FileList);
          break;
        case 'split-pdf':
          result = await UnifiedPDFService.splitPDF(firstFile);
          break;
        case 'compress-pdf':
          result = await UnifiedPDFService.compressPDF(firstFile);
          break;
        case 'edit-pdf':
          result = await UnifiedPDFService.editPDF(firstFile, 'Edited with DocuFlow', 50, 750);
          break;
        case 'pdf-to-word':
          result = await UnifiedPDFService.pdfToWord(firstFile);
          break;
        default:
          result = { success: false, error: 'Unknown tool' };
      }

      if (result.success) {
        if (result.data && result.filename) {
          // Single file result
          UnifiedPDFService.downloadFile(result.data as Uint8Array, result.filename);
        } else if (result.data && result.filenames) {
          // Multiple files result
          UnifiedPDFService.downloadMultipleFiles(result.data as Uint8Array[], result.filenames);
        }
        addToast({ type: 'success', title: 'Processing Complete', message: `${tool.label} completed successfully` });
      } else {
        addToast({ type: 'error', title: 'Processing Failed', message: result.error || 'Unknown error occurred' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Processing Failed', message: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      setFocusMode({ active: false });
    }
  };

  const handleConvertToPDFProcess = async (files: File[], options: ConvertToPDFOptions) => {
    if (files.length === 0) return;

    try {
      addToast({ type: 'info', title: 'Processing Started', message: `Converting ${files.length} file(s) to PDF locally` });

      let result;

      if (options.mergeIntoSinglePDF && files.length > 1) {
        const pdfFiles: Uint8Array[] = [];
        const filenames: string[] = [];

        for (const file of files) {
          const singleResult = await UnifiedPDFService.convertToPDF(file);

          if (singleResult.success && singleResult.data) {
            pdfFiles.push(singleResult.data as Uint8Array);
            filenames.push(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
          }
        }

        if (pdfFiles.length > 0) {
          // Convert Uint8Array PDFs into File objects
          // Convert Uint8Array PDFs into File objects
          const pdfFileObjects: File[] = [];
          
          // Process each PDF to create File objects
          for (let i = 0; i < pdfFiles.length; i++) {
            const pdfData = pdfFiles[i];
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const filename = filenames[i] || 'document.pdf';
            
            // Create file without explicit constructor to avoid TypeScript error
            const file = new Blob([blob], { type: 'application/pdf' }) as any;
            file.name = filename;
            file.lastModified = Date.now();
            
            pdfFileObjects.push(file as File);
          }
          
          // Create a FileList-like object for the merge operation
          const fileListForMerge = {
            length: pdfFileObjects.length,
            item: (index: number) => pdfFileObjects[index],
            [Symbol.iterator]: function* () {
              for (let i = 0; i < this.length; i++) yield this[i];
            }
          } as unknown as FileList;
          
          // Add indexed access to the FileList
          pdfFileObjects.forEach((file, index) => {
            Object.defineProperty(fileListForMerge, index, {
              value: file,
              writable: false
            });
          });
          
          // Merge the PDFs
          const mergeResult = await UnifiedPDFService.mergePDFs(fileListForMerge);
          if (mergeResult.success && mergeResult.data) {
            UnifiedPDFService.downloadFile(mergeResult.data as Uint8Array, 'combined_document.pdf');
            result = { success: true };
            addToast({ type: 'success', title: 'Processing Complete', message: `Combined PDF created successfully` });
          } else {
            throw new Error(mergeResult.error || 'Failed to combine converted PDFs');
          }
        } else {
          result = { success: false, error: 'Failed to convert files' };
        }
      } else {
        for (const file of files) {
          result = await UnifiedPDFService.convertToPDF(file);

          if (result.success && result.data && result.filename) {
            UnifiedPDFService.downloadFile(result.data as Uint8Array, result.filename);
          } else if (!result.success) {
            throw new Error(result.error || `Failed to convert ${file.name}`);
          }
        }

        if (result.success) {
          addToast({ type: 'success', title: 'Processing Complete', message: `${files.length} file(s) converted successfully` });
        }
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Processing Failed', message: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      setStagingState({ active: false, files: [] });
      setFocusMode({ active: false });
    }
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    addToast({
      type: 'info',
      title: 'Filters Applied',
      message: 'File list updated with new filters'
    });
  };

  const handleAIFeatureClick = (feature: any) => {
    // Activate focus mode for AI features
    setFocusMode({ active: true, toolId: 'ai-' + feature.label.toLowerCase().replace(' ', '-') });
    
    addToast({
      type: 'info',
      title: feature.label,
      message: 'AI feature activated'
    });

    // Simulate processing time
    setTimeout(() => {
      setFocusMode({ active: false });
      addToast({
        type: 'success',
        title: 'AI Processing Complete',
        message: `${feature.label} finished successfully`
      });
    }, 3000);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'word': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': return <Image className="w-8 h-8 text-purple-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getAuroraClass = () => {
    switch (activeTab) {
      case 'ai': return 'aurora-bg-warm';
      case 'pdf': return 'aurora-bg-cool';
      default: return 'aurora-bg';
    }
  };

  const handleUpgrade = () => {
    addToast({
      type: 'info',
      title: 'DocuFlow Pro',
      message: 'Upgrade feature coming soon!'
    });
  };

  const renderTabContent = () => {
    if (activeTab === 'all') {
      return (
        <div className="space-y-8">
          {/* Premium Banner */}
          <PremiumBanner onUpgrade={handleUpgrade} />

          {/* Personalized Greeting Area */}
          <div className="card-glass dark:card-glass-dark rounded-2xl p-6 interactive-lift">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold gradient-text mb-2">Good morning! ☀️</h2>
                <p className="text-gray-600 dark:text-gray-300">Ready to tackle your documents today?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                    💡 Tip: Try "Convert to PDF" for your Word documents
                  </div>
                  <div className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                    🤖 New: AI document summarization available
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Last active: 2 hours ago
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  4 files processed today
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar with Recent Searches */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <Input 
              placeholder="Search your documents... (Ctrl+K for command palette)" 
              className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl glass-effect dark:glass-effect-dark focus:border-blue-500 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                  setSearchFocused(false);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCommandPalette(true)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 button-press"
            >
              <Command className="w-5 h-5" />
            </Button>
            
            {searchFocused && (
              <RecentSearches
                searches={recentSearches}
                onSelectSearch={(search) => {
                  setSearchQuery(search);
                  handleSearch(search);
                  setSearchFocused(false);
                }}
                onRemoveSearch={(search) => {
                  setRecentSearches(prev => prev.filter(s => s !== search));
                }}
                onClearAll={() => setRecentSearches([])}
              />
            )}
          </div>

          {/* Pinned Files Section */}
          {pinnedFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 animate-pulse-slow" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pinned Files</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {pinnedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex-shrink-0 w-64 card-glass dark:card-glass-dark rounded-xl p-4 interactive-lift cursor-pointer relative"
                    onMouseEnter={() => setHoveredFile(file.id)}
                    onMouseLeave={() => setHoveredFile(null)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <QuickActions 
                      fileName={file.name}
                      fileType={file.type}
                      isVisible={hoveredFile === file.id}
                    />
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{file.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Toggle and Filters */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Files</h2>
            <div className="flex items-center gap-3">
              <FileFilters onFiltersChange={handleFiltersChange} />
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl transition-all duration-200 interactive-scale ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl transition-all duration-200 interactive-scale ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced File List */}
          <EnhancedFileList
            files={recentFiles}
            viewMode={viewMode}
            hoveredFile={hoveredFile}
            onHover={setHoveredFile}
          />

          {/* Enhanced Upload Area */}
          <DragDropZone onFilesDrop={handleFilesDrop}>
            <div className="card-glass dark:card-glass-dark border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-3xl p-12 text-center group hover:border-blue-500 transition-all duration-300 cursor-pointer">
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce-gentle" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Drop files here or click to upload</h3>
              <p className="text-gray-600 dark:text-gray-400">Support for PDF, Word, Excel, PowerPoint, Images and more</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Command className="w-4 h-4" />
                <span>Press Ctrl+K for quick actions</span>
              </div>
            </div>
          </DragDropZone>
        </div>
      );
    }

    if (activeTab === 'workspaces') {
      return (
        <div className="space-y-8">
          {/* Workspaces Overview */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-bounce-gentle">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">Workspaces</h2>
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Organize your projects and collaborate with your team</p>
          </div>

          {/* Quick Workspace Access */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass dark:card-glass-dark rounded-2xl p-6 text-center interactive-lift cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Client Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">24 files • 8 tasks</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">Last activity: 2 hours ago</div>
            </div>

            <div className="card-glass dark:card-glass-dark rounded-2xl p-6 text-center interactive-lift cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Marketing Campaign</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">18 files • 5 tasks</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">Last activity: 1 day ago</div>
            </div>

            <div className="card-glass dark:card-glass-dark rounded-2xl p-6 text-center interactive-lift cursor-pointer border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create New</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start a new workspace</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => window.location.href = '/workspaces'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 interactive-scale"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              View All Workspaces
            </Button>
          </div>
        </div>
      );
    }

    if (activeTab === 'pdf') {
      return (
        <div className="space-y-8">
          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="card-glass dark:card-glass-dark rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Processing PDF...
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                {progress < 100 ? `${progress}% complete` : 'Finalizing...'}
              </p>
            </div>
          )}

          {/* Enhanced Interactive Hero Area */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center animate-bounce-gentle">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text">PDF Tools</h2>
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to work with PDF documents</p>
            <div className="card-glass dark:card-glass-dark rounded-xl p-4 inline-block">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Pro Tip:</strong> All processing happens locally in your browser - your files never leave your computer!
              </p>
            </div>
          </div>

          {/* Premium Banner for PDF Tools */}
          <PremiumBanner
            onUpgrade={handleUpgrade}
          />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">PDF Tools</h2>
            <Input
              type="search"
              placeholder="Search PDF tools..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Conditionally render staging area or tools grid */}
          {stagingState.active && stagingState.toolId === 'convert-to-pdf' ? (
            // Staging area for Convert to PDF
            <div className="w-full card-glass dark:card-glass-dark rounded-2xl p-8 shadow-lg animate-fade-in">
              <ConvertToPDFStaging
                files={stagingState.files}
                onClose={handleStagingClose}
                onProcess={handleConvertToPDFProcess}
                onAddMoreFiles={handleStagingAddMore}
              />
              {/* Hidden file input for adding more files */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleAdditionalFiles}
              />
            </div>
          ) : (
            // Standard PDF Tools Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfTools.map((tool, index) => {
                const Icon = tool.icon;
                const isActiveTool = focusMode.active && focusMode.toolId === tool.id;
                let acceptedTypes;
                
                // Define accepted file types based on the tool
                switch (tool.id) {
                  case 'convert-to-pdf':
                    acceptedTypes = ['.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
                    break;
                  default:
                    acceptedTypes = ['.pdf'];
                    break;
                }
                
                return (
                  <DragDropZone
                    key={tool.id}
                    onFilesDrop={(files) => handleToolFilesDrop(tool.id, files)}
                    toolName={tool.label}
                    acceptedTypes={acceptedTypes}
                    className={`group cursor-pointer interactive-lift animate-fade-in card-glass dark:card-glass-dark rounded-2xl p-8 text-center space-y-4 transition-all duration-300 ${
                      isProcessing ? 'opacity-50 pointer-events-none' : ''
                    } ${isActiveTool ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-6 transition-transform duration-300 ${
                      isActiveTool ? 'animate-pulse' : ''
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tool.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tool.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{tool.subtext}</p>
                    </div>
                  </DragDropZone>
                );
              })}
            </div>
          )}

          {/* Enhanced File Selection Area */}
          <DragDropZone onFilesDrop={handleFilesDrop} acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}>
            <div className="card-glass dark:card-glass-dark border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-3xl p-12 text-center">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select files to get started</h3>
              <p className="text-gray-600 dark:text-gray-400">Drop PDF files or images here, or choose from the tools above</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">All processing happens locally - your files stay private!</p>
            </div>
          </DragDropZone>
        </div>
      );
    }

    if (activeTab === 'ai') {
      return (
        <div className="space-y-8">
          {/* Enhanced Interactive AI Hero */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold gradient-text-warm">AI Hub</h2>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">POWERED BY AI</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Intelligent document processing powered by advanced AI</p>
          </div>

          {/* Enhanced AI Features Grid with subtexts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => {
              const isActiveFeature = focusMode.active && focusMode.toolId === 'ai-' + feature.label.toLowerCase().replace(' ', '-');
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 text-white card-glass interactive-lift cursor-pointer group animate-fade-in transition-all duration-300 ${
                    isActiveFeature ? 'ring-2 ring-white shadow-2xl scale-105' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => handleAIFeatureClick(feature)}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                      isActiveFeature ? 'animate-pulse' : ''
                    }`}>
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{feature.label}</h3>
                      <p className="text-white/90 text-sm mb-2">{feature.desc}</p>
                      <p className="text-white/70 text-xs">{feature.subtext}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Upload Area */}
          <DragDropZone onFilesDrop={handleFilesDrop}>
            <div className="card-glass dark:card-glass-dark border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-12 text-center">
              <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload documents for AI processing</h3>
              <p className="text-gray-600 dark:text-gray-400">Get insights, summaries, and answers from your documents</p>
            </div>
          </DragDropZone>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }}>
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon</h2>
        <p className="text-gray-600 dark:text-gray-400">This section is under development</p>
        <div className="mt-8">
          <Button 
            onClick={() => setShowCommandPalette(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 interactive-scale"
          >
            <Command className="w-4 h-4 mr-2" />
            Open Command Palette
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Dynamic Aurora Background */}
      <div className={`fixed inset-0 ${getAuroraClass()}`} />
      
      {/* Focus Mode Overlay */}
      {focusMode.active && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 pointer-events-none animate-fade-in" />
      )}
      
      <div className="relative min-h-screen">
        {/* Enhanced Header with Glassmorphism */}
        <header className={`sticky top-0 z-40 ${isDarkMode ? 'glass-header-dark' : 'glass-header'} border-b border-gray-200 dark:border-gray-700`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center logo-hover">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">
                  DocuFlow
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCommandPalette(true)}
                  className="rounded-xl interactive-scale hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300"
                  title="Command Palette (Ctrl+K)"
                >
                  <Command className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    addToast({
                      type: 'success',
                      title: `${!isDarkMode ? 'Dark' : 'Light'} Mode Activated`,
                      message: 'Theme updated successfully'
                    });
                  }}
                  className="rounded-xl interactive-scale hover:bg-blue-100 dark:hover:bg-blue-900/30 icon-theme text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="rounded-xl interactive-scale hover:bg-blue-100 dark:hover:bg-blue-900/30 icon-settings text-gray-600 dark:text-gray-300"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Format Navigation Tabs with Glassmorphism */}
        <div className={`sticky top-[73px] z-30 ${isDarkMode ? 'glass-header-dark' : 'glass-header'} border-b border-gray-200 dark:border-gray-700`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
              {formatTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap interactive-scale ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg tab-active'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content with Focus Mode Support */}
        <main className={`max-w-7xl mx-auto px-6 py-8 relative z-10 transition-all duration-300 ${
          focusMode.active ? 'brightness-110 contrast-110' : ''
        }`}>
          {renderTabContent()}
        </main>

        {/* Command Palette */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onSelectTab={setActiveTab}
        />

        {/* Settings Panel with PDF API toggle */}
        <EnhancedSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={setIsDarkMode}
          onToast={addToast}
          usePdfApi={usePdfApi}
          togglePdfApi={togglePdfApi}
          pdfApiKey={pdfApiKey}
        />

        {/* Toast Notifications */}
        <ToastNotification
          toasts={toasts}
          onRemove={removeToast}
        />
      </div>
    </div>
  );
};

export default Index;

