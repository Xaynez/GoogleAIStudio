import React, { useState, useRef } from 'react';
import type { OnboardingData } from '../../types';
import { TermsOfUsePage } from '../terms/TermsOfUsePage';
import { PrivacyPolicyPage } from '../privacy/PrivacyPolicyPage';
import { GovernancePolicyPage } from '../governance/GovernancePolicyPage';
import { Check } from 'lucide-react';

interface Step2Props {
  data: OnboardingData;
  updateData: (update: Partial<OnboardingData>) => void;
}

const ScrollableDocument: React.FC<{ title: string, onScrolled: () => void, children: React.ReactNode }> = ({ title, onScrolled, children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (el) {
            const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
            if (isAtBottom) {
                onScrolled();
            }
        }
    };
    
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div ref={scrollRef} onScroll={handleScroll} className="h-48 overflow-y-auto bg-slate-900/50 p-2 rounded prose-sm">
                {children}
            </div>
        </div>
    );
};

const AcceptanceCheckbox: React.FC<{ label: string, onAccept: () => void, checked: boolean, disabled: boolean }> = ({ label, onAccept, checked, disabled }) => (
    <label className={`flex items-start space-x-3 p-3 rounded-lg border ${disabled ? 'cursor-not-allowed text-slate-500 border-slate-700' : 'cursor-pointer border-slate-600'}`}>
        <div className={`mt-1 h-5 w-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${checked ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-700 border-slate-500'}`}>
            {checked && <Check size={14} className="text-white" />}
        </div>
        <input type="checkbox" checked={checked} onChange={onAccept} disabled={disabled} className="sr-only" />
        <span className="font-medium text-slate-200">{label}</span>
    </label>
);

export const Step2_Legal: React.FC<Step2Props> = ({ data, updateData }) => {
    const [termsScrolled, setTermsScrolled] = useState(false);
    const [privacyScrolled, setPrivacyScrolled] = useState(false);
    const [governanceScrolled, setGovernanceScrolled] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Legal Agreements</h2>
                <p className="text-slate-400">Please review and accept the following documents to continue.</p>
            </div>

            <div className="space-y-2">
                <ScrollableDocument title="Terms of Use" onScrolled={() => setTermsScrolled(true)}>
                    <TermsOfUsePage />
                </ScrollableDocument>
                <AcceptanceCheckbox label="I have read and accept the Terms of Use" onAccept={() => updateData({ termsAccepted: !data.termsAccepted })} checked={data.termsAccepted} disabled={!termsScrolled} />
            </div>

            <div className="space-y-2">
                <ScrollableDocument title="Privacy Policy" onScrolled={() => setPrivacyScrolled(true)}>
                    <PrivacyPolicyPage />
                </ScrollableDocument>
                 <AcceptanceCheckbox label="I have read and accept the Privacy Policy" onAccept={() => updateData({ privacyAccepted: !data.privacyAccepted })} checked={data.privacyAccepted} disabled={!privacyScrolled} />
            </div>

            <div className="space-y-2">
                <ScrollableDocument title="Governance & Compliance Framework" onScrolled={() => setGovernanceScrolled(true)}>
                    <GovernancePolicyPage />
                </ScrollableDocument>
                <AcceptanceCheckbox label="I have read and accept the Governance & Compliance Framework" onAccept={() => updateData({ governanceAccepted: !data.governanceAccepted })} checked={data.governanceAccepted} disabled={!governanceScrolled} />
            </div>
        </div>
    );
};
