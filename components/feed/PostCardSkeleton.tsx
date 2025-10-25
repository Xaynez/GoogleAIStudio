import React from 'react';

export const PostCardSkeleton: React.FC = () => {
    return (
        <div className="bg-slate-900/50 p-4 rounded-2xl shadow-lg border border-slate-800 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
            <div className="mt-4 h-48 bg-slate-700 rounded-lg"></div>
            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-6">
                <div className="h-5 bg-slate-700 rounded w-20"></div>
                <div className="h-5 bg-slate-700 rounded w-24"></div>
            </div>
        </div>
    );
};