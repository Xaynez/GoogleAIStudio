import React from 'react';
import type { NetworkUser } from '../../types';
import { MapPin, Building2, MessageSquare, User } from 'lucide-react';

interface NetworkUserCardProps {
    user: NetworkUser;
    onViewProfile: (userId: string) => void;
    onMessage: (user: { id: string, name: string, title: string }) => void;
}

export const NetworkUserCard: React.FC<NetworkUserCardProps> = ({ user, onViewProfile, onMessage }) => {
    return (
        <div className="bg-surface-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border-subtle p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-brand-cyan/50 hover:-translate-y-1 hover:shadow-cyan-500/10">
            <img src={user.profileImageUrl} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-surface-elevated object-cover" />
            <h3 className="mt-4 text-xl font-bold text-text-primary">{user.fullName}</h3>
            <p className="text-sm text-link">{user.jobTitle}</p>
            <p className="text-sm text-text-secondary">{user.company}</p>
            <div className="mt-2 flex items-center text-xs text-text-muted">
                <MapPin size={12} className="mr-1" />
                <span>{user.location}</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {user.industries.slice(0, 2).map(industry => (
                    <span key={industry} className="px-2 py-0.5 text-xs bg-surface-input text-text-secondary rounded-full">{industry}</span>
                ))}
            </div>
            <div className="mt-6 flex gap-2 w-full">
                <button onClick={() => onMessage({ id: user.id, name: user.fullName, title: user.jobTitle })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-surface-input text-text-primary font-semibold rounded-lg hover:bg-surface-elevated transition-colors text-sm">
                    <MessageSquare size={16} /> Message
                </button>
                <button onClick={() => onViewProfile(user.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-surface-elevated text-text-secondary font-semibold rounded-lg hover:bg-surface-input transition-colors text-sm">
                    <User size={16} /> Profile
                </button>
            </div>
        </div>
    );
};