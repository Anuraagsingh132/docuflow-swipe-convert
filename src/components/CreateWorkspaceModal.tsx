
import React, { useState } from 'react';
import { X, FolderOpen, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (workspace: { name: string; description: string; color: string }) => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkspace
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  const colors = [
    { name: 'Blue', value: 'blue', class: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { name: 'Purple', value: 'purple', class: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { name: 'Green', value: 'green', class: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { name: 'Orange', value: 'orange', class: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { name: 'Teal', value: 'teal', class: 'bg-gradient-to-r from-teal-500 to-blue-500' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateWorkspace({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor
      });
      setName('');
      setDescription('');
      setSelectedColor('blue');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-effect dark:glass-effect-dark rounded-2xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Workspace</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-white font-medium">
              Workspace Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workspace name..."
              className="h-12 rounded-xl"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 dark:text-white font-medium">
              Description (Optional)
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-gray-900 dark:text-white font-medium">Color Theme</Label>
            </div>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-xl ${color.class} border-2 transition-all duration-200 hover:scale-105 ${
                    selectedColor === color.value 
                      ? 'border-gray-900 dark:border-white scale-110' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!name.trim()}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
