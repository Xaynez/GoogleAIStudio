import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ease-in-out hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 hover:shadow-cyan-500/10 ${className}`}>
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="text-cyan-500 dark:text-cyan-400">{icon}</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};