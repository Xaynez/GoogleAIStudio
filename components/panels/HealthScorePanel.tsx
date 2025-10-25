

import React from 'react';
import { Award } from 'lucide-react';
import { Card } from '../common/Card';
import type { HealthScoreDetail } from '../../types';

interface HealthScorePanelProps {
  score: number;
  details: HealthScoreDetail[];
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const HealthScorePanel: React.FC<HealthScorePanelProps> = ({ score, details }) => {
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card title="Listing Health Score" icon={<Award className="h-6 w-6" />}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            <circle
              className="text-slate-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={getScoreColor(score)}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
        
        {/* Score Breakdown */}
        <div className="w-full">
          <ul className="space-y-2">
            {details.map((item) => (
              <li key={item.metric} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{item.metric}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`${getScoreColor(item.score * 100)} h-full rounded-full`} 
                      style={{ width: `${item.score * 100}%`}}
                    />
                  </div>
                  <span className="font-semibold text-slate-100 w-8 text-right">
                    {(item.score * 100).toFixed(0)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
