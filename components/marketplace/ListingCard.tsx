import React from 'react';
import type { MarketplaceListing } from '../../types';
import { MapPin, DollarSign, Video } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

interface ListingCardProps {
    listing: MarketplaceListing;
    onSelect: (listing: MarketplaceListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
    const { formatCurrency } = useCurrency();
    const displayImage = listing.media?.find(m => m.type === 'image')?.url || 'https://picsum.photos/seed/placeholder/400/200';
    const hasVideo = listing.media?.some(m => m.type === 'video');
    
    return (
        <div 
            onClick={() => onSelect(listing)}
            className="bg-surface-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border-subtle overflow-hidden transition-all duration-300 ease-in-out hover:border-brand-cyan/50 hover:-translate-y-1 hover:shadow-cyan-500/10 cursor-pointer flex flex-col"
        >
            <div className="relative">
                <img src={displayImage} alt={listing.title.originalText} className="w-full h-40 object-cover" />
                {hasVideo && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full">
                        <Video size={18} />
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-text-primary flex-grow">{listing.title.originalText}</h3>
                <p className="text-sm text-text-secondary mt-2">{listing.summary.originalText}</p>
                <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                        <MapPin size={14} />
                        <span>{listing.location}</span>
                    </div>
                    {listing.amount > 0 && (
                        <div className="flex items-center gap-1.5 text-link font-semibold">
                            <DollarSign size={14} />
                            <span>{formatCurrency(listing.amount)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};