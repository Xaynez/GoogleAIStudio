import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MarketplaceListing } from '../../types';
import { Shield, Search, SlidersHorizontal } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { useTranslation } from '../../i18n';

interface ComplianceDashboardProps {
    listings: MarketplaceListing[];
    onUpdateStatus: (listingId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ listings, onUpdateStatus }) => {
    const { t } = useTranslation();
    
    const initialQueue = useMemo(() => {
        return listings.filter(l => l.status === 'Pending Review' || l.status === 'Flagged')
                       .sort((a, b) => b.aiRiskScore - a.aiRiskScore);
    }, [listings]);

    const [reviewQueue, setReviewQueue] = useState(initialQueue);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    // Update state if the source prop changes
    useEffect(() => {
        const updatedQueue = listings.filter(l => l.status === 'Pending Review' || l.status === 'Flagged')
                                     .sort((a, b) => b.aiRiskScore - a.aiRiskScore);
        setReviewQueue(updatedQueue);
    }, [listings]);

    const handleDragStart = (id: string) => {
        setDraggedItemId(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (dropTargetId: string) => {
        if (!draggedItemId || draggedItemId === dropTargetId) return;

        const draggedItemIndex = reviewQueue.findIndex(item => item.id === draggedItemId);
        const dropTargetIndex = reviewQueue.findIndex(item => item.id === dropTargetId);

        const newQueue = [...reviewQueue];
        const [draggedItem] = newQueue.splice(draggedItemIndex, 1);
        newQueue.splice(dropTargetIndex, 0, draggedItem);
        
        setReviewQueue(newQueue);
        setDraggedItemId(null);
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    return (
        <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8">
            <div className="text-center">
                <Shield className="h-12 w-12 text-cyan-400 mx-auto mb-2" />
                <h1 className="text-3xl font-bold text-white">{t('complianceTitle')}</h1>
                <p className="text-slate-400">{t('complianceSubtitle')}</p>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-white">{t('reviewQueue')} ({reviewQueue.length} items)</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:w-64">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                             <input type="text" placeholder="Search by title or ID..." className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                        </div>
                        <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-full hover:bg-slate-700 transition-colors">
                            <SlidersHorizontal size={16} />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {reviewQueue.length > 0 ? (
                    <div className="space-y-4" onDragOver={handleDragOver}>
                        {reviewQueue.map(listing => (
                            <ReviewCard 
                                key={listing.id} 
                                listing={listing} 
                                onUpdateStatus={onUpdateStatus}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                                isDragging={draggedItemId === listing.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-700 rounded-lg">
                        <p className="font-semibold">The review queue is empty.</p>
                        <p className="text-sm">All listings have been processed.</p>
                    </div>
                )}

            </div>
        </main>
    );
};