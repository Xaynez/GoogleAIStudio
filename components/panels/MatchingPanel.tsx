

import React from 'react';
import type { SuggestedMatch } from '../../types';
import { Users, MapPin, Building2, MessageSquare } from 'lucide-react';
import { Card } from '../common/Card';

interface MatchingPanelProps {
  matches: SuggestedMatch[];
  onStartConversation: (participant: { id: string; name: string; title: string; }) => void;
}

export const MatchingPanel: React.FC<MatchingPanelProps> = ({ matches, onStartConversation }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-400';
    if (score >= 0.6) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <Card title="Suggested Matches" icon={<Users className="h-6 w-6" />}>
      {matches.length > 0 ? (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li key={match.userID} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-100">{match.userName}</p>
                  <p className="text-xs text-slate-400">{match.profile.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">{ (match.matchScore * 100).toFixed(0) }%</span>
                    <div className={`w-3 h-3 rounded-full ${getScoreColor(match.matchScore)}`}></div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mt-2 italic">"{match.reason}"</p>
              <div className="mt-3 flex space-x-4 text-xs text-slate-400 items-center">
                <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{match.profile.location}</span>
                </div>
                <div className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span>{match.profile.industry}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onStartConversation({
                            id: match.userID,
                            name: match.userName,
                            title: match.profile.title,
                        });
                    }}
                    className="ml-auto text-cyan-400 hover:underline flex items-center gap-1"
                >
                    <MessageSquare size={14} /> Message
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No suitable matches found.</p>
      )}
    </Card>
  );
};