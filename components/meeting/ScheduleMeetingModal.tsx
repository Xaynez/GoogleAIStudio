import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Calendar, UserPlus, Search, CheckCircle } from 'lucide-react';
import type { UserProfile, NetworkUser } from '../../types';

interface Attendee {
    id: string;
    name: string;
    email: string;
    isGuest?: boolean;
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkUsers: NetworkUser[];
  currentUser: UserProfile;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ isOpen, onClose, networkUsers, currentUser }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [title, setTitle] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setIsScheduled(false);
            setIsScheduling(false);
            setTitle('');
            setAttendees([{ id: currentUser.ssoEmail, name: currentUser.fullName, email: currentUser.ssoEmail }]);
            
            const defaultTime = new Date();
            defaultTime.setHours(defaultTime.getHours() + 1);
            defaultTime.setMinutes(0);
            const formattedTime = defaultTime.toISOString().slice(0, 16);
            setScheduledTime(formattedTime);
        }
    }, [isOpen, currentUser]);

    const suggestions = useMemo(() => {
        if (!searchTerm) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return networkUsers.filter(user => 
            !attendees.some(a => a.id === user.id) &&
            (user.fullName.toLowerCase().includes(lowercasedTerm) || user.company.toLowerCase().includes(lowercasedTerm))
        ).slice(0, 5);
    }, [searchTerm, networkUsers, attendees]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const addAttendee = (user: { id: string, name: string, email: string }, isGuest: boolean) => {
        if (!attendees.some(a => a.id === user.id)) {
            setAttendees(prev => [...prev, { ...user, isGuest }]);
        }
        setSearchTerm('');
        inputRef.current?.focus();
    };

    const removeAttendee = (attendeeId: string) => {
        if(attendeeId === currentUser.ssoEmail) return; // Can't remove self
        setAttendees(prev => prev.filter(a => a.id !== attendeeId));
    };
    
    const handleAddGuestByEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(emailRegex.test(searchTerm)) {
            addAttendee({ id: searchTerm, name: searchTerm.split('@')[0], email: searchTerm }, true);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddGuestByEmail();
        }
    };
    
    const handleSchedule = () => {
        setIsScheduling(true);
        // Simulate sending invitations
        setTimeout(() => {
            setIsScheduling(false);
            setIsScheduled(true);
            setTimeout(triggerClose, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-cyan-400"/> Schedule a Meeting</h2>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {isScheduled ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white">Meeting Scheduled!</h3>
                        <p className="text-slate-300">Invitations have been sent to all attendees.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label htmlFor="meeting-title" className="block text-sm font-medium text-slate-300 mb-1">Meeting Title</label>
                                <input type="text" id="meeting-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Q4 Strategy Sync" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="meeting-time" className="block text-sm font-medium text-slate-300 mb-1">Date & Time</label>
                                <input type="datetime-local" id="meeting-time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Attendees</label>
                                <div className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-wrap gap-2">
                                    {attendees.map(att => (
                                        <div key={att.id} className="bg-slate-700 rounded-full pl-3 pr-2 py-1 flex items-center gap-2 text-sm">
                                            <span className="font-medium text-slate-200">{att.name}</span>
                                            {att.id !== currentUser.ssoEmail && (
                                                <button onClick={() => removeAttendee(att.id)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="attendee-search" className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                    <UserPlus size={16} /> Add Attendees
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        id="attendee-search"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search contacts or enter external email..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                    />
                                </div>
                                {suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {suggestions.map(user => (
                                            <li key={user.id} onClick={() => addAttendee({ id: user.id, name: user.fullName, email: `mock-${user.id}@email.com` }, false)}
                                                className="p-3 hover:bg-slate-700 cursor-pointer text-sm">
                                                <p className="font-semibold text-slate-200">{user.fullName}</p>
                                                <p className="text-xs text-slate-400">{user.jobTitle} at {user.company}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                            <button onClick={handleSchedule} disabled={isScheduling || !title || attendees.length === 0}
                                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all">
                                {isScheduling ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
