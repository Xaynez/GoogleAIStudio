import React, { useState, useMemo } from 'react';
import type { NetworkUser, UserProfile } from '../../types';
import { Users, Search } from 'lucide-react';
import { NetworkUserCard } from './NetworkUserCard';

interface MyNetworkProps {
    networkUsers: NetworkUser[];
    currentUser: UserProfile;
    onViewProfile: (userId: string) => void;
    onMessage: (user: { id: string, name: string, title: string }) => void;
}

export const MyNetwork: React.FC<MyNetworkProps> = ({ networkUsers, currentUser, onViewProfile, onMessage }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return networkUsers;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return networkUsers.filter(user =>
            user.fullName.toLowerCase().includes(lowercasedTerm) ||
            user.jobTitle.toLowerCase().includes(lowercasedTerm) ||
            user.company.toLowerCase().includes(lowercasedTerm) ||
            user.location.toLowerCase().includes(lowercasedTerm) ||
            user.industries.some(ind => ind.toLowerCase().includes(lowercasedTerm))
        );
    }, [searchTerm, networkUsers]);

    return (
        <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Users /> My Network
                    </h1>
                    <p className="text-text-secondary">Manage your connections and find new opportunities.</p>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search your network..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-80 bg-surface-input border border-border-input rounded-full py-2.5 pl-11 pr-4 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <NetworkUserCard 
                            key={user.id} 
                            user={user} 
                            onViewProfile={onViewProfile} 
                            onMessage={onMessage} 
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-text-muted">
                        <p>No connections found matching your search.</p>
                    </div>
                )}
            </div>
        </main>
    );
};