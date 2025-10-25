import React, { useState, useEffect } from 'react';
import { X, CalendarClock } from 'lucide-react';
import type { UserProfile, PostType } from '../../types';
import { useTranslation } from '../../i18n';

interface ScheduleLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAddPost: (postData: { contentText: string; type: PostType; mediaFiles: File[]; scheduledTime: string }) => void;
}

export const ScheduleLiveModal: React.FC<ScheduleLiveModalProps> = ({ isOpen, onClose, userProfile, onAddPost }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [description, setDescription] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            // Set a default schedule time for 1 hour from now
            const defaultTime = new Date();
            defaultTime.setHours(defaultTime.getHours() + 1);
            defaultTime.setMinutes(0);
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            const formattedTime = defaultTime.toISOString().slice(0, 16);
            setScheduledTime(formattedTime);
        }
    }, [isOpen]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setDescription('');
        }, 300);
    };

    const handleSchedule = () => {
        if (!scheduledTime) {
            alert("Please select a time for your live stream.");
            return;
        }
        onAddPost({
            contentText: description || `Join my live stream!`,
            type: 'scheduled-live',
            mediaFiles: [],
            scheduledTime,
        });
        triggerClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarClock className="text-cyan-400"/> {t('scheduleLiveTitle')}</h2>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                     <div>
                        <label htmlFor="schedule-description" className="block text-sm font-medium text-slate-300 mb-1">{t('scheduleLiveDescription')}</label>
                        <textarea
                            id="schedule-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What will your live stream be about?"
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                        />
                    </div>
                     <div>
                        <label htmlFor="schedule-time" className="block text-sm font-medium text-slate-300 mb-1">{t('scheduleTime')}</label>
                        <input
                            type="datetime-local"
                            id="schedule-time"
                            value={scheduledTime}
                            onChange={e => setScheduledTime(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={handleSchedule}
                        disabled={!scheduledTime}
                        className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {t('schedule')}
                    </button>
                </div>
            </div>
        </div>
    );
};