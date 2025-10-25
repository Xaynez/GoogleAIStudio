import React from 'react';
import type { UserProfile } from '../types';
import { useTranslation } from '../i18n';
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
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">{t('welcome')}, {userProfile.fullName.split(' ')[0]}</h1>
                <p className="text-slate-600 dark:text-slate-400">Here's a look at your network and tools.</p>
            </header>

            <LiveMeetingPanel 
                userProfile={userProfile}
                onOpenScheduleMeeting={onOpenScheduleMeeting}
                onOpenSyncEvents={onOpenSyncEvents}
            />

            <div>
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