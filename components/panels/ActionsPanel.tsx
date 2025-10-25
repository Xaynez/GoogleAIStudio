

import React from 'react';
import { Card } from '../common/Card';
import { Activity, Calendar, Video, Share2, Notebook } from 'lucide-react';

interface ActionsPanelProps {
  onOpenCalendar: () => void;
  onOpenMeet: () => void;
  onOpenNoteTaker: () => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ onOpenCalendar, onOpenMeet, onOpenNoteTaker }) => {
  
  const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; title: string; }> = ({ icon, label, onClick, title }) => (
    <button 
      onClick={onClick}
      title={title}
      className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/80 transition-colors duration-200 space-y-2 group"
    >
      <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">{icon}</div>
      <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </button>
  );

  return (
    <Card title="Actions" icon={<Activity className="h-6 w-6" />}>
      <div className="grid grid-cols-2 gap-4">
        <ActionButton icon={<Calendar className="h-7 w-7" />} label="Sync Events" title="Sync with your calendar" onClick={onOpenCalendar} />
        <ActionButton icon={<Video className="h-7 w-7" />} label="Schedule Meeting" title="Schedule a video meeting" onClick={onOpenMeet} />
        <ActionButton icon={<Notebook className="h-7 w-7" />} label="AI Assistant Note Taker" title="Start a meeting with the AI Note Taker" onClick={onOpenNoteTaker} />
        <ActionButton icon={<Share2 className="h-7 w-7" />} label="Share Analysis" title="Share this AI analysis with a colleague" />
      </div>
    </Card>
  );
};