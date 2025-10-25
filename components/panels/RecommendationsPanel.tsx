import React from 'react';
import { ListChecks } from 'lucide-react';
import { Card } from '../common/Card';

interface RecommendationsPanelProps {
  actions: string[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ actions }) => {
  return (
    <Card title="Recommended Actions" icon={<ListChecks className="h-6 w-6" />}>
      {actions.length > 0 ? (
        <ul className="space-y-3">
          {actions.map((action, index) => (
            <li key={index} className="flex items-start space-x-3 text-slate-300">
              <div className="flex-shrink-0 mt-1 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900"></div>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">No specific actions recommended at this time.</p>
      )}
    </Card>
  );
};