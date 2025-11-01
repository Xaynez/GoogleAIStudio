import React, { useState, useEffect } from 'react';
import type { MarketplaceListing, UserProfile, AuditLog } from '../../types';
import { Shield, Search, SlidersHorizontal } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { useTranslation } from '../../i18n';
import { GovernancePolicyPage } from './GovernancePolicyPage';
import { AuditLogPanel } from './AuditLogPanel';

interface GovernanceHubPageProps {
    userProfile: UserProfile;
    listings: MarketplaceListing[];
    onUpdateStatus: (listingId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
    auditLogs: AuditLog[];
}

const ListingReviewContent: React.FC<Omit<GovernanceHubPageProps, 'userProfile' | 'auditLogs'>> = ({ listings, onUpdateStatus }) => {
    const { t } = useTranslation();
    const [reviewQueue, setReviewQueue] = useState(() => listings.filter(l => l.status === 'Pending Review' || l.status === 'Flagged').sort((a, b) => b.aiRiskScore - a.aiRiskScore));

    useEffect(() => {
        setReviewQueue(listings.filter(l => l.status === 'Pending Review' || l.status === 'Flagged').sort((a, b) => b.aiRiskScore - a.aiRiskScore));
    }, [listings]);

    return (
        <div className="bg-surface-card/50 p-4 rounded-lg border border-border-subtle backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-text-primary font-display">{t('reviewQueue')} ({reviewQueue.length} items)</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                         <input type="text" placeholder="Search by title or ID..." className="w-full bg-surface-input border border-border-input rounded-full py-2 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                    </div>
                    <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-surface-input text-text-secondary font-semibold rounded-full hover:bg-surface-elevated transition-colors">
                        <SlidersHorizontal size={16} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {reviewQueue.length > 0 ? (
                <div className="space-y-4">
                    {reviewQueue.map(listing => (
                        <ReviewCard 
                            key={listing.id} 
                            listing={listing} 
                            onUpdateStatus={onUpdateStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-text-muted border-2 border-dashed border-border-subtle rounded-lg">
                    <p className="font-semibold">The review queue is empty.</p>
                    <p className="text-sm">All listings have been processed.</p>
                </div>
            )}
        </div>
    );
};

export const GovernanceHubPage: React.FC<GovernanceHubPageProps> = ({ userProfile, listings, onUpdateStatus, auditLogs }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('hub');
    const showReviewTab = userProfile.role === 'Compliance Officer' || userProfile.role === 'Admin';
    const showAuditTab = userProfile.role === 'Admin';

    return (
        <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8 font-sans">
            <div className="text-center">
                <Shield className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                <h1 className="text-3xl font-bold font-display heading-gradient" data-i18n="governance_title">{t('governance_title')}</h1>
            </div>

            <div className="border-b border-border-subtle flex justify-center">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('hub')} className={`font-display font-bold py-2 px-1 border-b-2 ${activeTab === 'hub' ? 'border-brand-cyan text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Governance Hub</button>
                    {showReviewTab && <button onClick={() => setActiveTab('review')} className={`font-display font-bold py-2 px-1 border-b-2 ${activeTab === 'review' ? 'border-brand-cyan text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Listing Review</button>}
                    {showAuditTab && <button onClick={() => setActiveTab('audit')} className={`font-display font-bold py-2 px-1 border-b-2 ${activeTab === 'audit' ? 'border-brand-cyan text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>Audit Log</button>}
                </nav>
            </div>

            {activeTab === 'hub' && (
                <div className="animate-fade-in">
                   <GovernancePolicyPage />
                </div>
            )}
            {activeTab === 'review' && showReviewTab && (
                <ListingReviewContent listings={listings} onUpdateStatus={onUpdateStatus} />
            )}
            {activeTab === 'audit' && showAuditTab && (
                <div className="animate-fade-in">
                    <AuditLogPanel auditLogs={auditLogs} />
                </div>
            )}
        </main>
    );
};