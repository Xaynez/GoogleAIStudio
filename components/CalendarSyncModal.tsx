import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, X, CheckCircle, Mail, MessageSquare } from 'lucide-react';
import type { CalendarEvent } from '../../types';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_EVENTS: CalendarEvent[] = [
    { id: 'evt1', title: 'Q3 Strategy Review with ACME Corp', time: 'Tomorrow at 10:00 AM', attendees: ['john.doe@acme.com', 'jane.smith@evolve.net'] },
    { id: 'evt2', title: 'Follow-up on FinTech SaaS Listing', time: 'Tomorrow at 2:00 PM', attendees: ['investor@vcfirm.com'] },
    { id: 'evt3', title: 'Project Phoenix - Due Diligence Kick-off', time: 'Friday at 9:30 AM', attendees: ['legal.team@acme.com', 'm.jones@evolve.net'] },
    { id: 'evt4', title: 'Coffee with Potential Partner', time: 'Monday at 8:00 AM', attendees: ['s.chen@startup.io'] },
];

const AnimatedCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void; }) => {
    // Use a key to re-trigger the animation on each check
    const [animationKey, setAnimationKey] = useState(0);
    useEffect(() => {
        if (checked) {
            setAnimationKey(prev => prev + 1);
        }
    }, [checked]);

    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={onChange}
            className="mt-1 h-5 w-5 rounded bg-slate-700 border border-slate-600 flex-shrink-0 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors"
        >
            {checked && (
                <svg key={animationKey} width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
                </svg>
            )}
        </button>
    );
};

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({ isOpen, onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<Record<string, { email: boolean, sms: boolean }>>({});
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleConnect = () => {
        // Simulate API call
        setTimeout(() => {
            setIsConnected(true);
        }, 500);
    };
    
    const handleSync = () => {
        setIsSyncing(true);
        // Simulate API call
        setTimeout(() => {
            setIsSyncing(false);
            setIsSynced(true);
            setTimeout(() => {
                triggerClose();
            }, 2000);
        }, 1500);
    };

    const handleToggleEvent = (eventId: string) => {
        setSelectedEvents(prev => {
            const newSelection = {...prev};
            if (newSelection[eventId]) {
                delete newSelection[eventId];
            } else {
                newSelection[eventId] = { email: true, sms: false }; // Default selection
            }
            return newSelection;
        });
    };

    const handleToggleReminder = (eventId: string, type: 'email' | 'sms') => {
        setSelectedEvents(prev => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [type]: !prev[eventId][type],
            }
        }));
    };

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsConnected(false);
            setIsSynced(false);
            setSelectedEvents({});
            onClose();
        }, 300); // Match animation duration
    };

    const numSelected = useMemo(() => Object.keys(selectedEvents).length, [selectedEvents]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (!isConnected) {
            return (
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white">Connect Your Calendar</h3>
                    <p className="mt-2 text-slate-400 max-w-md mx-auto">Allow EVOLVE to access your Google Calendar to sync important events and set AI-powered reminders.</p>
                    <button onClick={handleConnect} className="mt-6 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                        Connect to Google Calendar
                    </button>
                </div>
            );
        }
        if (isSynced) {
             return (
                <div className="text-center animate-scale-in">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white">Sync Complete!</h3>
                    <p className="mt-2 text-slate-400">Your selected events have been synced.</p>
                </div>
            );
        }
        return (
            <div>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white">Select events to sync</h3>
                    <p className="mt-1 text-slate-400">Choose which events to import and set AI reminder preferences.</p>
                </div>
                <div className="space-y-3">
                    {MOCK_EVENTS.map(event => (
                        <div key={event.id} className="flex gap-4 p-3 bg-slate-800/50 rounded-lg">
                            <AnimatedCheckbox checked={!!selectedEvents[event.id]} onChange={() => handleToggleEvent(event.id)} />
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{event.title}</p>
                                <p className="text-sm text-slate-400">{event.time}</p>
                                {selectedEvents[event.id] && (
                                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-4">
                                        <p className="text-sm font-semibold text-cyan-400">AI Reminders:</p>
                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input type="checkbox" checked={selectedEvents[event.id].email} onChange={() => handleToggleReminder(event.id, 'email')} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"/>
                                            <Mail size={14}/> Email
                                        </label>
                                        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                            <input type="checkbox" checked={selectedEvents[event.id].sms} onChange={() => handleToggleReminder(event.id, 'sms')} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600"/>
                                            <MessageSquare size={14}/> SMS
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Calendar Sync</h2>
                    </div>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {renderContent()}
                </div>

                {isConnected && !isSynced && (
                    <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                        <button 
                            onClick={handleSync}
                            disabled={isSyncing || numSelected === 0}
                            className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                        >
                            {isSyncing ? "Syncing..." : `Sync ${numSelected} Event(s)`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
