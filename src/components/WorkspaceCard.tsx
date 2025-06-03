
import React, { useState } from 'react';
import { FileText, CheckSquare, StickyNote, Users, Star, MoreVertical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    color: string;
    filesCount: number;
    tasksCount: number;
    notesCount: number;
    members: number;
    lastActivity: string;
    isStarred: boolean;
  };
  index: number;
  onToggleStar: (id: string) => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, index, onToggleStar }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    teal: 'from-teal-500 to-blue-500'
  };

  const handleCardClick = () => {
    navigate(`/workspace/${workspace.id}`);
  };

  return (
    <div
      className="card-glass dark:card-glass-dark rounded-2xl p-6 cursor-pointer interactive-lift animate-fade-in relative group"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Header with gradient */}
      <div className={`h-20 rounded-xl bg-gradient-to-r ${colorClasses[workspace.color as keyof typeof colorClasses]} mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(workspace.id);
            }}
            className={`w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 ${
              workspace.isStarred ? 'text-yellow-400' : 'text-white/70'
            }`}
          >
            <Star className={`w-4 h-4 ${workspace.isStarred ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {workspace.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {workspace.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{workspace.filesCount}</div>
            <div className="text-xs text-gray-500">Files</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{workspace.tasksCount}</div>
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <StickyNote className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{workspace.notesCount}</div>
            <div className="text-xs text-gray-500">Notes</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{workspace.members} member{workspace.members !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{workspace.lastActivity}</span>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default WorkspaceCard;
