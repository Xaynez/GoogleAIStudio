import React, { useState } from 'react';
import type { MarketplaceListing } from '../../types';
import { DollarSign, MapPin, Flag, Check, X, AlertTriangle } from 'lucide-react';

interface ReviewCardProps {
    listing: MarketplaceListing;
    onUpdateStatus: (listingId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
    onDragStart: (id: string) => void;
    onDrop: (id: string) => void;
    onDragEnd: () => void;
    isDragging: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ listing, onUpdateStatus, onDragStart, onDrop, onDragEnd, isDragging }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const getRiskColor = (score: number) => {
        if (score >= 75) return 'text-red-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-green-400';
    };

    const handleApprove = () => {
        setIsExiting(true);
        setTimeout(() => {
            onUpdateStatus(listing.id, 'Approved');
        }, 400); // Match animation duration
    };

    const handleReject = () => {
        if (!rejectionReason.trim() && showRejectionInput) {
            alert("Please provide a reason for rejection.");
            return;
        }
        setIsExiting(true);
        setTimeout(() => {
            onUpdateStatus(listing.id, 'Rejected', rejectionReason);
        }, 400); // Match animation duration
    };

    const cardClasses = [
        "bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden transition-opacity",
        isDragging ? "opacity-50 cursor-grabbing" : "opacity-100 cursor-grab",
        isExiting ? "animate-task-complete" : ""
    ].join(' ');

    return (
        <div 
            className={cardClasses}
            draggable="true"
            onDragStart={() => onDragStart(listing.id)}
            onDrop={() => {
                onDrop(listing.id);
                setDragOver(false);
            }}
            onDragEnd={onDragEnd}
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
        >
             {dragOver && !isDragging && <div className="drop-indicator"></div>}
            <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-white">{listing.title.originalText}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span>ID: {listing.id}</span>
                        <div className="flex items-center gap-1.5"><MapPin size={14} /> {listing.location}</div>
                        <div className="flex items-center gap-1.5"><DollarSign size={14} /> {listing.amount.toLocaleString()}</div>
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-slate-400">AI Risk Score</p>
                        <p className={`text-2xl font-bold ${getRiskColor(listing.aiRiskScore)}`}>{listing.aiRiskScore}</p>
                    </div>
                    <div className="flex gap-2">
                         {!showRejectionInput && (
                            <>
                                <button onClick={() => setShowRejectionInput(true)} title="Reject Listing" className="p-3 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors"><X size={20} /></button>
                                <button onClick={handleApprove} title="Approve Listing" className="p-3 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-colors"><Check size={20} /></button>
                            </>
                         )}
                    </div>
                </div>
            </div>
            {listing.aiFlags.length > 0 && (
                <div className="px-4 pb-4">
                     <h4 className="font-semibold text-yellow-400 text-sm flex items-center gap-2 mb-2"><AlertTriangle size={16} /> AI Flags</h4>
                     <ul className="space-y-1 list-disc list-inside text-sm text-yellow-300/80">
                         {listing.aiFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                     </ul>
                </div>
            )}
            {showRejectionInput && (
                <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Rejection</label>
                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                        rows={2}
                        placeholder="e.g., Incomplete financial documentation."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setShowRejectionInput(false)} className="px-4 py-2 text-sm text-slate-300 rounded-md hover:bg-slate-700">Cancel</button>
                        <button onClick={handleReject} className="px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Confirm Rejection</button>
                    </div>
                </div>
            )}
             <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-center text-xs py-1 bg-slate-800 hover:bg-slate-700 text-slate-400">
                {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                    <h4 className="font-semibold text-white mb-2">Full Description</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{listing.details.description.originalText}</p>
                </div>
            )}
        </div>
    );
};