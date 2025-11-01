import React from 'react';

export const PostCardSkeleton: React.FC = () => {
    return (
        <div className="bg-surface-card p-4 rounded-2xl shadow-soft border border-border-subtle animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-surface-elevated rounded-full flex-shrink-0"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 bg-surface-elevated rounded w-1/3"></div>
                    <div className="h-3 bg-surface-elevated rounded w-1/2"></div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-full"></div>
                <div className="h-4 bg-surface-elevated rounded w-5/6"></div>
            </div>
            <div className="mt-4 h-48 bg-surface-elevated rounded-lg"></div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-6">
                <div className="h-5 bg-surface-elevated rounded w-20"></div>
                <div className="h-5 bg-surface-elevated rounded w-24"></div>
            </div>
        </div>
    );
};