import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top', className }) => {
  const [isVisible, setIsVisible] = useState(false);
  // Fix: Changed NodeJS.Timeout to ReturnType<typeof setTimeout> for browser compatibility. The NodeJS namespace is not available in browser environments, and this change uses the correct return type for setTimeout in the browser.
  let timeout: ReturnType<typeof setTimeout>;

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300); // 300ms delay
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };
  
  const getTooltipPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      case 'top':
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div 
          role="tooltip"
          className={`absolute z-50 px-3 py-1.5 text-sm font-semibold text-text-primary bg-surface-elevated rounded-md shadow-lg whitespace-nowrap animate-fade-in ${getTooltipPositionClasses()}`}
        >
          {text}
        </div>
      )}
    </div>
  );
};