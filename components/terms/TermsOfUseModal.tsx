import React, { useState, useRef } from 'react';
import { TermsOfUsePage } from './TermsOfUsePage';
import { Shield } from 'lucide-react';

interface TermsOfUseModalProps {
  onAccept: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ onAccept }) => {
    const [canAccept, setCanAccept] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (el) {
            // Check if user has scrolled to the bottom (with a small tolerance)
            const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
            if (isAtBottom && !canAccept) {
                setCanAccept(true);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="w-full max-w-4xl h-full flex flex-col">
                <div className="text-center pt-8 pb-4 flex-shrink-0">
                     <Shield className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary font-display heading-gradient">Terms of Use</h1>
                    <p className="text-text-secondary mt-1">Please review and accept the terms to continue.</p>
                </div>
                
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-grow overflow-y-auto rounded-lg border border-border-subtle bg-surface-bg p-2"
                >
                    <TermsOfUsePage />
                </div>
                
                <div className="py-6 text-center flex-shrink-0">
                    <button 
                        onClick={onAccept}
                        disabled={!canAccept}
                        className="px-8 py-3 bg-brand-cyan text-text-inverted font-semibold rounded-lg shadow-lg shadow-cyan-500/20 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300"
                    >
                        I Have Read and Accept the Terms of Use
                    </button>
                </div>
            </div>
        </div>
    );
};