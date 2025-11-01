import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-surface-card/70 dark:bg-surface-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border-subtle overflow-hidden transition-all duration-300 ease-in-out hover:border-border-input dark:hover:border-border-interactive hover:-translate-y-1 hover:shadow-cyan-500/10 ${className}`}>
      <div className="p-4 bg-surface-elevated/50 dark:bg-surface-elevated/50 border-b border-border-subtle">
        <div className="flex items-center space-x-3">
          <div className="text-brand-cyan">{icon}</div>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};