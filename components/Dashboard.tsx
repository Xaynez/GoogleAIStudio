import React from 'react';
import type { UserProfile } from '../../types';
import { useTranslation } from '../../i18n';
import { PremiumFeatureWrapper } from './common/PremiumFeatureWrapper';
import InteractiveGlobalExplorer from './explorer/InteractiveGlobalExplorer';
import { LiveMeetingPanel } from './dashboard/LiveMeetingPanel';

interface DashboardProps {
    userProfile: UserProfile;
    onUpgradeClick: () => void;
    onOpenScheduleMeeting: () => void;
    onOpenSyncEvents: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    userProfile, 
    onUpgradeClick,
    onOpenScheduleMeeting,
    onOpenSyncEvents
}) => {
    const { t } = useTranslation();

    return (
        <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8">
            
            <div className="animate-slide-in-up">
                 <h1 className="text-3xl md:text-4xl font-bold heading-gradient mb-2">
                    Welcome back, {userProfile.fullName.split(' ')[0]}
                </h1>
                <p className="text-lg text-text-secondary">Here's your overview for today.</p>
            </div>


            <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                <LiveMeetingPanel 
                    userProfile={userProfile}
                    onOpenScheduleMeeting={onOpenScheduleMeeting}
                    onOpenSyncEvents={onOpenSyncEvents}
                />
            </div>

            <div className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                <PremiumFeatureWrapper
                    userTier={userProfile.tier}
                    requiredTier="Elite"
                    featureName="Global Connection Map"
                    onUpgradeClick={onUpgradeClick}
                >
                    <InteractiveGlobalExplorer />
                </PremiumFeatureWrapper>
            </div>
        </main>
    );
};