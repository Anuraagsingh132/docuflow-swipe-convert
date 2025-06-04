import React, { useState, useRef, useEffect } from 'react';
import { FileText, Image, FileSpreadsheet, Brain, Upload, Search, Settings, Moon, Sun, File, FolderOpen, Star, Clock, Grid3X3, List, Download, Edit3, Merge, Scissors, Archive, Sparkles, Command, Plus } from 'lucide-react';
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
import { usePDFOperations } from '@/hooks/usePDFOperations';
import { Progress } from '@/components/ui/progress';
import PremiumBanner from '@/components/PremiumBanner';
import ConvertToPDFStaging from '@/components/ConvertToPDFStaging';
import { useSettings } from '@/contexts/SettingsContext';
import { UnifiedPDFService } from '@/services/unifiedPdfService';
import MergePDFStaging from '@/components/MergePDFStaging';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// ... keep existing code (types and interfaces)

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [focusMode, setFocusMode] = useState<{
    active: boolean;
    toolId?: string;
  }>({
    active: false
  });
  const [stagingState, setStagingState] = useState<{
    active: boolean;
    files: File[];
    toolId?: string;
  }>({
    active: false,
    files: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState([
    'project proposal',
    'budget analysis', 
    'meeting notes'
  ]);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    variant: 'default' | 'destructive';
    title: string;
    description: string;
  }>>([]);
  const { executeOperation, isProcessing, progress } = usePDFOperations();
  
  // Get settings from context
  const { usePdfApi, togglePdfApi, pdfApiKey } = useSettings();

  // Initialize the UnifiedPDFService with the current API setting
  useEffect(() => {
    UnifiedPDFService.initialize(usePdfApi);
  }, [usePdfApi]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // ... keep existing code (formatTabs, pdfTools, recentFiles, etc.)

  const formatTabs = [
    { id: 'all', label: 'All Files', icon: FolderOpen },
    { id: 'workspaces', label: 'Workspaces', icon: FolderOpen },
    { id: 'pdf', label: 'PDF Tools', icon: FileText },
    { id: 'word', label: 'Word Tools', icon: FileText },
    { id: 'image', label: 'Image Tools', icon: Image },
    { id: 'excel', label: 'Excel Tools', icon: FileSpreadsheet },
    { id: 'ai', label: 'AI Hub', icon: Brain }
  ];

  const pdfTools = [
    {
      id: 'convert-to-pdf',
      label: 'Convert to PDF',
      icon: Download,
      description: 'Convert any document to PDF format',
      subtext: 'Supports Word, Excel, PowerPoint & Images'
    },
    {
      id: 'edit-pdf',
      label: 'Edit PDF',
      icon: Edit3,
      description: 'Add text, annotations, and signatures',
      subtext: 'Professional editing tools included'
    },
    {
      id: 'merge-pdf',
      label: 'Merge PDFs',
      icon: Merge,
      description: 'Combine multiple PDFs into one',
      subtext: 'Supports reordering pages before merging'
    },
    {
      id: 'split-pdf',
      label: 'Split PDF',
      icon: Scissors,
      description: 'Extract pages or split documents',
      subtext: 'Precise page range selection'
    },
    {
      id: 'compress-pdf',
      label: 'Compress PDF',
      icon: Archive,
      description: 'Reduce file size while maintaining quality',
      subtext: 'Up to 90% size reduction'
    },
    {
      id: 'pdf-to-word',
      label: 'PDF to Word',
      icon: FileText,
      description: 'Convert PDF to editable Word document',
      subtext: 'Preserves formatting and layout'
    }
  ];

  // ... keep existing code (recentFiles, pinnedFiles, aiFeatures arrays)

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
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
      variant: 'default',
      title: 'Search Initiated',
      description: `Searching for "${query}"`
    });
  };

  const handleFilesDrop = (files: FileList) => {
    console.log('Files dropped:', Array.from(files).map(f => f.name));
    addToast({
      variant: 'default',
      title: 'Files Uploaded',
      description: `Successfully uploaded ${files.length} file(s)`
    });
  };

  const handleToolFilesDrop = (toolId: string, files: FileList) => {
    const tool = pdfTools.find(t => t.id === toolId);
    if (!tool) return;

    const fileArray = Array.from(files);

    // For tools with staging areas
    if (['convert-to-pdf', 'merge-pdf', 'split-pdf', 'compress-pdf', 'edit-pdf', 'pdf-to-word'].includes(toolId)) {
      console.log(`Activating ${tool.label} staging area`);
      setFocusMode({ active: false });
      setStagingState({
        active: true,
        toolId,
        files: fileArray
      });
    } else {
      setFocusMode({ active: true, toolId });
      processToolOperation(toolId, fileArray);
    }
  };

  // ... keep existing code (other handler functions, processToolOperation, etc.)

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    } ${focusMode.active ? 'overflow-hidden' : ''}`}>
      
      {/* User Profile Section */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Keep existing layout structure... */}
      <div className="relative">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          {/* ... keep existing header code */}
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* ... keep existing main content structure */}
        </main>

        {/* Staging Areas */}
        {stagingState.active && stagingState.toolId === 'convert-to-pdf' && (
          <ConvertToPDFStaging
            files={stagingState.files}
            onClose={() => setStagingState({ active: false, files: [] })}
            onAddMore={() => fileInputRef.current?.click()}
          />
        )}

        {stagingState.active && stagingState.toolId === 'merge-pdf' && (
          <MergePDFStaging
            files={stagingState.files}
            onClose={() => setStagingState({ active: false, files: [] })}
            onAddMore={() => fileInputRef.current?.click()}
          />
        )}

        {/* Other Components */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
        />

        <EnhancedSettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={setIsDarkMode}
          usePdfApi={usePdfApi}
          togglePdfApi={togglePdfApi}
          onToast={addToast}
        />

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
            onClose={() => removeToast(toast.id)}
          />
        ))}

        {/* Hidden file input for adding more files */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && stagingState.active) {
              setStagingState(prev => ({
                ...prev,
                files: [...prev.files, ...Array.from(e.target.files!)]
              }));
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};

export default Index;
