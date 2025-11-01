import React from 'react';
import { Card } from '../common/Card';
import { Activity, Calendar, Video, Share2, Notebook } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface ActionsPanelProps {
  onOpenCalendar: () => void;
  onOpenMeet: () => void;
  onOpenNoteTaker: () => void;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ onOpenCalendar, onOpenMeet, onOpenNoteTaker }) => {
  
  const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; tooltipText: string; }> = ({ icon, label, onClick, tooltipText }) => (
    <Tooltip text={tooltipText} position="top">
      <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-lg text-center hover:bg-slate-700/80 transition-colors duration-200 space-y-2 group w-full h-full"
      >
        <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors">{icon}</div>
        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </button>
    </Tooltip>
  );

  return (
    <Card title="Actions" icon={<Activity className="h-6 w-6" />}>
      <div className="grid grid-cols-2 gap-4">
        <ActionButton icon={<Calendar className="h-7 w-7" />} label="Sync Events" tooltipText="Sync with your calendar" onClick={onOpenCalendar} />
        <ActionButton icon={<Video className="h-7 w-7" />} label="Schedule Meeting" tooltipText="Schedule a video meeting" onClick={onOpenMeet} />
        <ActionButton icon={<Notebook className="h-7 w-7" />} label="AI Assistant Note Taker" tooltipText="Start a meeting with the AI Note Taker" onClick={onOpenNoteTaker} />
        <ActionButton icon={<Share2 className="h-7 w-7" />} label="Share Analysis" tooltipText="Share this AI analysis with a colleague" />
      </div>
    </Card>
  );
};
