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
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-800 p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-cyan-500/10">
            <img src={user.profileImageUrl} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-slate-700 object-cover" />
            <h3 className="mt-4 text-xl font-bold text-white">{user.fullName}</h3>
            <p className="text-sm text-cyan-400">{user.jobTitle}</p>
            <p className="text-sm text-slate-400">{user.company}</p>
            <div className="mt-2 flex items-center text-xs text-slate-500">
                <MapPin size={12} className="mr-1" />
                <span>{user.location}</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {user.industries.slice(0, 2).map(industry => (
                    <span key={industry} className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded-full">{industry}</span>
                ))}
            </div>
            <div className="mt-6 flex gap-2 w-full">
                <button onClick={() => onMessage({ id: user.id, name: user.fullName, title: user.jobTitle })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors text-sm">
                    <MessageSquare size={16} /> Message
                </button>
                <button onClick={() => onViewProfile(user.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    <User size={16} /> Profile
                </button>
            </div>
        </div>
    );
};
