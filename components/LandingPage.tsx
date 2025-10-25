import React, { useState } from 'react';
import { Pricing } from './Pricing';
import type { PricingTier } from '../types';
import { Fingerprint, Loader, Check } from 'lucide-react';
import { useTranslation } from '../i18n';

interface LandingPageProps {
  onSelectPlan: (tier: PricingTier) => void;
  isBiometricEnrolled: boolean;
  onBiometricLogin: () => void;
}

const FullEvolveLogo: React.FC = () => (
    <svg viewBox="0 0 500 220" className="w-96 h-auto mx-auto mb-8">
        <defs>
            <linearGradient id="brainStroke" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id="evolveTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        {/* Brain Network */}
        <g transform="translate(165, 0) scale(1.5)">
            <g stroke="url(#brainStroke)" strokeWidth="1">
                <line x1="80" y1="20" x2="60" y2="40" /> <line x1="80" y1="20" x2="100" y2="30" /> <line x1="80" y1="20" x2="105" y2="15" /> <line x1="60" y1="40" x2="50" y2="60" /> <line x1="60" y1="40" x2="85" y2="55" /> <line x1="100" y1="30" x2="85" y2="55" /> <line x1="100" y1="30" x2="120" y2="40" /> <line x1="105" y1="15" x2="125" y2="10" /> <line x1="105" y1="15" x2="120" y2="40" /> <line x1="50" y1="60" x2="65" y2="80" /> <line x1="50" y1="60" x2="85" y2="55" /> <line x1="85" y1="55" x2="65" y2="80" /> <line x1="85" y1="55" x2="110" y2="70" /> <line x1="85" y1="55" x2="120" y2="40" /> <line x1="120" y1="40" x2="125" y2="10" /> <line x1="120" y1="40" x2="140" y2="55" /> <line x1="120" y1="40" x2="110" y2="70" /> <line x1="65" y1="80" x2="90" y2="85" /> <line x1="110" y1="70" x2="90" y2="85" /> <line x1="110" y1="70" x2="140" y2="55" /> <line x1="140" y1="55" x2="150" y2="35" /> <line x1="125" y1="10" x2="150" y2="35" />
            </g>
            <g fill="url(#brainStroke)">
                <circle cx="80" cy="20" r="2.5" /> <circle cx="105" cy="15" r="2" /> <circle cx="125" cy="10" r="2.5" /> <circle cx="150" cy="35" r="3" /> <circle cx="140" cy="55" r="2.5" /> <circle cx="120" cy="40" r="3" /> <circle cx="100" cy="30" r="2.5" /> <circle cx="60" cy="40" r="3" /> <circle cx="50" cy="60" r="2.5" /> <circle cx="65" cy="80" r="2" /> <circle cx="90" cy="85" r="2.5" /> <circle cx="110" cy="70" r="3" /> <circle cx="85" cy="55" r="4" />
            </g>
        </g>

        {/* EVOLVE Text */}
        <text y="150" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="80" fill="url(#evolveTextGradient)" letterSpacing="-3">
            <tspan x="40">E</tspan>
            <tspan x="105">V</tspan>
            <tspan x="265">L</tspan>
            <tspan x="325">V</tspan>
            <tspan x="390">E</tspan>
        </text>

        {/* Stylized O */}
        <g transform="translate(210, 118)">
            <circle cx="0" cy="0" r="38" fill="#00ffff" filter="url(#glow)" opacity="0.9"/>
            <circle cx="0" cy="0" r="35" fill="url(#evolveTextGradient)"/>
            <path d="M-15 8 L0 -7 L15 8" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        
        {/* Tagline */}
        <text x="250" y="185" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="20" textAnchor="middle" fill="url(#evolveTextGradient)" letterSpacing="1">
            AI-NATIVE ECOSYSTEM FOR LEADERS
        </text>
    </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPlan, isBiometricEnrolled, onBiometricLogin }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { t } = useTranslation();

  const handleBiometricClick = () => {
    setIsVerifying(true);
    // Simulate WebAuthn API call
    setTimeout(() => {
        onBiometricLogin();
        setIsVerifying(false);
    }, 1500);
  };
  
  return (
    <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <FullEvolveLogo />
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent leading-tight whitespace-pre-line">
            {t('heroTitle', "Where Leaders Come, \nand Visionaries Evolve")}
        </h1>
        
        {isBiometricEnrolled && (
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleBiometricClick}
                    disabled={isVerifying}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg shadow-lg hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-wait transition-all duration-300 transform hover:-translate-y-1"
                >
                    {isVerifying ? (
                        <>
                            <Loader className="h-6 w-6 animate-spin" />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <>
                            <Fingerprint className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                            <span>Biometric Login</span>
                        </>
                    )}
                </button>
            </div>
        )}
        
        <div className="mt-12 max-w-4xl mx-auto text-left bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-black dark:border-slate-800">
            <h2 className="text-xl font-bold text-center text-cyan-600 dark:text-cyan-400">{t('exclusiveNetworkTitle')}</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-slate-700 dark:text-slate-300 text-sm">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> C-Suite Executives</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Founders & Entrepreneurs</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Board Members</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> VPs & Directors</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Business Owners</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Medical & Legal Leaders</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Political Officials</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Key Stakeholders</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" /> Education System Leaders</div>
            </div>
            <p className="mt-4 text-xs text-center text-slate-400 dark:text-slate-500 italic">
                {t('verifiedByAI')}
            </p>
        </div>
      </div>
      
      <Pricing onSelectPlan={onSelectPlan} />
    </main>
  );
};