import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { GOOGLE_APPS } from '../constants';
import { Tooltip } from './common/Tooltip';

export const GoogleAppsLauncher: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const launcherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (launcherRef.current && !launcherRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={launcherRef}>
            <Tooltip text="Google Apps" position="bottom">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open Google Apps launcher"
                    className="p-2 rounded-full bg-surface-input hover:bg-surface-elevated transition-colors border border-border-input"
                >
                    <LayoutGrid className="h-6 w-6 text-text-secondary" />
                </button>
            </Tooltip>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-modal border border-border-subtle rounded-lg shadow-2xl z-50 animate-dropdown-enter origin-top-right">
                    <div className="p-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {GOOGLE_APPS.map(app => (
                                <a
                                    key={app.id}
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-elevated transition-colors"
                                >
                                    <app.icon className="h-8 w-8" />
                                    <span className="text-xs text-text-primary">{app.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};