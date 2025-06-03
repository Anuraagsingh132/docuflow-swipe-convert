
import React, { useState } from 'react';
import { X, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumBannerProps {
  onUpgrade: () => void;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onUpgrade }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 p-4 mb-6 animate-fade-in">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-2 left-4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-6 right-8 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-3 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white">Unlock DocuFlow Pro</h3>
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-white/90 text-sm">
              Get 10x more AI credits, unlimited storage, and advanced collaboration features
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onUpgrade}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Go Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;
