
import React, { useState } from 'react';
import { Settings, X, Palette, Bell, HardDrive, Shield, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

interface EnhancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: (value: boolean) => void;
  onToast: (toast: any) => void;
}

const EnhancedSettingsPanel: React.FC<EnhancedSettingsPanelProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  onToast
}) => {
  const [notifications, setNotifications] = useState({
    fileUpload: true,
    aiTasks: true,
    systemAnnouncements: false,
    emailNotifications: true
  });
  
  const [appearance, setAppearance] = useState({
    accentColor: 'purple',
    reduceMotion: false,
    fontSize: 'default'
  });

  const accentColors = [
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' }
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    onToast({
      type: 'success',
      title: 'Settings Updated',
      message: `${key} notifications ${value ? 'enabled' : 'disabled'}`
    });
  };

  const handleAccentColorChange = (color: string) => {
    setAppearance(prev => ({ ...prev, accentColor: color }));
    onToast({
      type: 'success',
      title: 'Accent Color Changed',
      message: `Switched to ${color} theme`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl transform animate-slide-in-right overflow-y-auto border-l border-gray-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Appearance</h4>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Dark Mode</span>
                <Switch checked={isDarkMode} onCheckedChange={onToggleDarkMode} />
              </div>
              
              <div className="space-y-2">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Accent Color</span>
                <div className="flex gap-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleAccentColorChange(color.value)}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all duration-200 ${
                        appearance.accentColor === color.value 
                          ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-gray-400 dark:ring-gray-300' 
                          : 'border-gray-300 dark:border-gray-500 hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Reduce Motion</span>
                <Switch 
                  checked={appearance.reduceMotion} 
                  onCheckedChange={(value) => setAppearance(prev => ({ ...prev, reduceMotion: value }))} 
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h4>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">File Upload Complete</span>
                <Switch 
                  checked={notifications.fileUpload} 
                  onCheckedChange={(value) => handleNotificationChange('fileUpload', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">AI Task Finished</span>
                <Switch 
                  checked={notifications.aiTasks} 
                  onCheckedChange={(value) => handleNotificationChange('aiTasks', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">System Announcements</span>
                <Switch 
                  checked={notifications.systemAnnouncements} 
                  onCheckedChange={(value) => handleNotificationChange('systemAnnouncements', value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">Email Notifications</span>
                <Switch 
                  checked={notifications.emailNotifications} 
                  onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)} 
                />
              </div>
            </div>
          </div>

          {/* Storage Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Storage Management</h4>
            </div>
            
            <div className="space-y-4 pl-7">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">4.5 GB of 10 GB used</span>
                  <span className="text-gray-600 dark:text-gray-300">45%</span>
                </div>
                <Progress value={45} className="h-3" />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Files</span>
                  <span>3.0 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Cache</span>
                  <span>1.0 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Versions</span>
                  <span>500 MB</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600"
                onClick={() => onToast({
                  type: 'info',
                  title: 'Storage Analysis',
                  message: 'Analyzing storage usage...'
                })}
              >
                <HardDrive className="w-4 h-4 mr-2" />
                Manage Storage
              </Button>
            </div>
          </div>

          {/* Account Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Account</h4>
            </div>
            
            <div className="space-y-3 pl-7">
              <Button variant="outline" size="sm" className="w-full justify-start bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600">
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              
              <Button variant="destructive" size="sm" className="w-full justify-start text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 pl-7">
              <div className="flex justify-between">
                <span>Command Palette</span>
                <kbd className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Toggle Dark Mode</span>
                <kbd className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">Ctrl+D</kbd>
              </div>
              <div className="flex justify-between">
                <span>Focus Search</span>
                <kbd className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">Ctrl+F</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsPanel;
