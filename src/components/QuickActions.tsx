
import React from 'react';
import { Share2, Download, Brain, Edit3, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  fileName: string;
  fileType: string;
  isVisible: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ fileName, fileType, isVisible }) => {
  const getQuickActions = (type: string) => {
    const baseActions = [
      { icon: Share2, label: 'Share', action: () => console.log('Share:', fileName) },
      { icon: Star, label: 'Favorite', action: () => console.log('Favorite:', fileName) },
    ];

    if (type === 'pdf') {
      return [
        ...baseActions,
        { icon: Edit3, label: 'Edit', action: () => console.log('Edit PDF:', fileName) },
        { icon: Brain, label: 'AI Summary', action: () => console.log('AI Summary:', fileName) },
      ];
    }

    return [
      ...baseActions,
      { icon: Download, label: 'Convert', action: () => console.log('Convert:', fileName) },
      { icon: Brain, label: 'AI Process', action: () => console.log('AI Process:', fileName) },
    ];
  };

  const actions = getQuickActions(fileType);

  if (!isVisible) return null;

  return (
    <div className="absolute top-2 right-2 flex gap-1 animate-fade-in">
      {actions.slice(0, 3).map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-lg border border-gray-200/50 dark:border-gray-600/50"
            onClick={(e) => {
              e.stopPropagation();
              action.action();
            }}
            title={action.label}
          >
            <Icon className="w-4 h-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;
