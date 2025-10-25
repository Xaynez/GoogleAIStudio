import React from 'react';
import type { ListingAnalysis } from '../types';
import { SummaryPanel } from './panels/SummaryPanel';
import { VerificationPanel } from './panels/VerificationPanel';
import { FinancialsPanel } from './panels/FinancialsPanel';
import { MatchingPanel } from './panels/MatchingPanel';
import { RecommendationsPanel } from './panels/RecommendationsPanel';
import { LocationPanel } from './panels/LocationPanel';
import { ActionsPanel } from './panels/ActionsPanel';
import { HealthScorePanel } from './panels/HealthScorePanel';

interface AnalysisDashboardProps {
  analysis: ListingAnalysis;
  onOpenCalendar: () => void;
  onOpenMeet: () => void;
  onStartConversation: (participant: { id: string; name: string; title: string; }) => void;
  onOpenNoteTaker: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis, onOpenCalendar, onOpenMeet, onStartConversation, onOpenNoteTaker }) => {
  return (
    <div className="bg-white/50 dark:bg-slate-900/50 p-4 md:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main info) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <SummaryPanel summary={analysis.listingSummary} voiceSummary={analysis.voiceSummary} />
          </div>
          <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <RecommendationsPanel actions={analysis.recommendedActions} />
          </div>
           <div className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
            <MatchingPanel matches={analysis.suggestedMatches} onStartConversation={onStartConversation} />
          </div>
        </div>

        {/* Right Column (Side info & Key Metrics) */}
        <div className="space-y-6">
          <div className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
            <HealthScorePanel score={analysis.healthScore.score} details={analysis.healthScore.details} />
          </div>
           <div className="animate-slide-in-up" style={{ animationDelay: '500ms' }}>
             <VerificationPanel status={analysis.verification.status} flags={analysis.verification.flags} />
           </div>
          <div className="animate-slide-in-up" style={{ animationDelay: '600ms' }}>
            <ActionsPanel onOpenCalendar={onOpenCalendar} onOpenMeet={onOpenMeet} onOpenNoteTaker={onOpenNoteTaker} />
          </div>
          <div className="animate-slide-in-up" style={{ animationDelay: '700ms' }}>
            <FinancialsPanel 
              priceOriginal={analysis.financials.priceOriginal} 
              currency={analysis.financials.currency} 
              priceConverted={analysis.financials.priceConverted}
              predictedROI={analysis.financials.predictedROI}
            />
          </div>
          <div className="animate-slide-in-up" style={{ animationDelay: '800ms' }}>
            <LocationPanel location={analysis.location} />
          </div>
        </div>
        
      </div>
    </div>
  );
};