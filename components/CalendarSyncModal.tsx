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
                    {!isConnected ? (
                        <div className="text-center">
                            <h3 className="text-lg text-slate-200 mb-2">Connect Your Work Calendar</h3>
                            <p className="text-slate-400 mb-6">Allow EVOLVE to access your calendar (e.g., Google, Outlook) to sync important events and set AI-powered reminders.</p>
                            <button onClick={handleConnect} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300">
                                Connect to Google Calendar
                            </button>
                        </div>
                    ) : isSynced ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold text-white">Sync Complete!</h3>
                            <p className="text-slate-300">Your selected events have been synced.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg text-slate-200 mb-1">Select events to sync</h3>
                            <p className="text-sm text-slate-400 mb-4">Choose which events to import and set AI reminder preferences.</p>
                            <div className="space-y-3">
                                {MOCK_EVENTS.map(event => (
                                    <div key={event.id} className={`p-4 rounded-lg border transition-all duration-300 ${selectedEvents[event.id] ? 'bg-slate-800/70 border-cyan-500/50' : 'bg-slate-800/40 border-slate-700'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <AnimatedCheckbox
                                                    checked={!!selectedEvents[event.id]}
                                                    onChange={() => handleToggleEvent(event.id)}
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-100">{event.title}</p>
                                                    <p className="text-sm text-slate-400">{event.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedEvents[event.id] && (
                                            <div className="mt-3 pl-8 flex items-center gap-4">
                                                <span className="text-sm font-medium text-slate-300">AI Reminders:</span>
                                                <button onClick={() => handleToggleReminder(event.id, 'email')} className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded ${selectedEvents[event.id].email ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                                                    <Mail className="h-4 w-4" /> Email
                                                </button>
                                                <button onClick={() => handleToggleReminder(event.id, 'sms')} className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded ${selectedEvents[event.id].sms ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'}`}>
                                                    <MessageSquare className="h-4 w-4" /> SMS
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isConnected && !isSynced && (
                    <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={handleSync}
                            disabled={numSelected === 0 || isSyncing}
                            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSyncing ? 'Syncing...' : `Sync ${numSelected} Event${numSelected !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};