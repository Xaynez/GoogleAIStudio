import React from 'react';
import { ShieldCheck, ShieldAlert, Flag } from 'lucide-react';
import { Card } from '../common/Card';

interface VerificationPanelProps {
  status: 'Verified' | 'Unverified' | 'Requires Review';
  flags: string[];
}

const statusConfig = {
  Verified: {
    icon: <ShieldCheck className="h-6 w-6 text-green-400" />,
    text: 'Verified',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  'Requires Review': {
    icon: <ShieldAlert className="h-6 w-6 text-yellow-400" />,
    text: 'Requires Review',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  Unverified: {
    icon: <ShieldAlert className="h-6 w-6 text-red-400" />,
    text: 'Unverified',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
};

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ status, flags }) => {
  const config = statusConfig[status];

  return (
    <Card title="Verification & Risk Analysis" icon={<ShieldCheck className="h-6 w-6" />}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">Verification Status</h4>
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${config.bgColor}`}>
            {config.icon}
            <span className={`font-bold ${config.color}`}>{config.text}</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-300 mb-2">AI Flags</h4>
          {flags.length > 0 ? (
            <ul className="space-y-2">
              {flags.map((flag, index) => (
                <li key={index} className="flex items-start space-x-2 text-slate-400">
                  <Flag className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic">No significant risks detected.</p>
          )}
        </div>
      </div>
    </Card>
  );
};