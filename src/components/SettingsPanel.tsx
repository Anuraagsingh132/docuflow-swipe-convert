import React from 'react';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { usePdfApi, setUsePdfApi } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Processing Mode Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">PDF Processing</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pdf-api-toggle">Use API Processing</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between local browser processing and the apdf.io API
                  </p>
                </div>
                <Switch
                  id="pdf-api-toggle"
                  checked={usePdfApi}
                  onCheckedChange={setUsePdfApi}
                />
              </div>

              {usePdfApi && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm">
                  <p className="text-blue-800 dark:text-blue-300">
                    Using apdf.io API for PDF processing. Files will be uploaded to the service 
                    for processing. API Key: 
                    <span className="font-mono text-xs ml-1 opacity-70">
                      yiRQMrSmYW00RMEeBJmBlwiZcaGLqnv91vhAMNYm6ce1e0d1
                    </span>
                  </p>
                </div>
              )}

              {!usePdfApi && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
                  <p className="text-green-800 dark:text-green-300">
                    Using local browser processing. All files remain on your device and 
                    are not uploaded to any server.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Other settings sections can be added here */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            {/* Theme settings, etc. */}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy</h3>
            {/* Privacy settings */}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          DocuFlow v1.0.0 • Built with privacy in mind
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
