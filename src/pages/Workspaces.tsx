
import React, { useState } from 'react';
import { FolderOpen, Plus, Users, Calendar, FileText, CheckSquare, StickyNote, Settings, Star, MoreVertical, Edit3, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import WorkspaceCard from '@/components/WorkspaceCard';

interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  coverImage?: string;
  filesCount: number;
  tasksCount: number;
  notesCount: number;
  members: number;
  lastActivity: string;
  isStarred: boolean;
}

const Workspaces = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Client Projects',
      description: 'All client-related documents and project files',
      color: 'blue',
      filesCount: 24,
      tasksCount: 8,
      notesCount: 12,
      members: 3,
      lastActivity: '2 hours ago',
      isStarred: true
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Q4 marketing materials and campaign assets',
      color: 'purple',
      filesCount: 18,
      tasksCount: 5,
      notesCount: 7,
      members: 5,
      lastActivity: '1 day ago',
      isStarred: false
    },
    {
      id: '3',
      name: 'Team Resources',
      description: 'Shared templates, guides, and team documentation',
      color: 'green',
      filesCount: 31,
      tasksCount: 2,
      notesCount: 15,
      members: 8,
      lastActivity: '3 days ago',
      isStarred: true
    }
  ]);

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const starredWorkspaces = filteredWorkspaces.filter(w => w.isStarred);
  const otherWorkspaces = filteredWorkspaces.filter(w => !w.isStarred);

  const handleCreateWorkspace = (workspaceData: any) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      ...workspaceData,
      filesCount: 0,
      tasksCount: 0,
      notesCount: 0,
      members: 1,
      lastActivity: 'Just created',
      isStarred: false
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Aurora Background */}
      <div className="fixed inset-0 aurora-bg opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Workspaces</h1>
            <p className="text-gray-600 dark:text-gray-400">Organize your projects and collaborate with your team</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 interactive-scale"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mb-8">
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-xl glass-effect dark:glass-effect-dark"
          />
        </div>

        {/* Starred Workspaces */}
        {starredWorkspaces.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Starred Workspaces</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starredWorkspaces.map((workspace, index) => (
                <WorkspaceCard 
                  key={workspace.id} 
                  workspace={workspace} 
                  index={index}
                  onToggleStar={(id) => {
                    setWorkspaces(prev => prev.map(w => 
                      w.id === id ? { ...w, isStarred: !w.isStarred } : w
                    ));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Workspaces */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Workspaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherWorkspaces.map((workspace, index) => (
              <WorkspaceCard 
                key={workspace.id} 
                workspace={workspace} 
                index={index + starredWorkspaces.length}
                onToggleStar={(id) => {
                  setWorkspaces(prev => prev.map(w => 
                    w.id === id ? { ...w, isStarred: !w.isStarred } : w
                  ));
                }}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkspaces.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No workspaces found' : 'No workspaces yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first workspace to get started'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            )}
          </div>
        )}

        {/* Create Workspace Modal */}
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateWorkspace={handleCreateWorkspace}
        />
      </div>
    </div>
  );
};

export default Workspaces;
