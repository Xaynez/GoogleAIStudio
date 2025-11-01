import React from 'react';
import { Lock } from 'lucide-react';
import type { PricingTier } from '../../types';
import { useTranslation } from '../../i18n';

interface PremiumFeatureWrapperProps {
  userTier: PricingTier;
  requiredTier: PricingTier;
  featureName: string;
  onUpgradeClick: () => void;
  children: React.ReactNode;
}

const tierLevels: Record<PricingTier, number> = {
    'Standard': 1,
    'Pro': 2,
    'Elite': 3
};

export const PremiumFeatureWrapper: React.FC<PremiumFeatureWrapperProps> = ({
  userTier,
  requiredTier,
  featureName,
  onUpgradeClick,
  children
}) => {
  const { t } = useTranslation();
  const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative border border-slate-800 rounded-2xl">
      <div className="opacity-20 blur-sm pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-center p-4 rounded-2xl">
        <Lock className="w-10 h-10 text-yellow-400 mb-2" />
        <h3 className="text-xl font-bold text-white">Unlock {featureName}</h3>
        <p className="text-slate-400 mt-1 mb-4 text-sm">
          This is a premium feature available on the {requiredTier} plan and higher.
        </p>
        <button 
          onClick={onUpgradeClick}
          className="px-6 py-2 bg-yellow-500 text-slate-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors"
        >
          Choose
        </button>
      </div>
    </div>
  );
};