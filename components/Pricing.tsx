import React from 'react';
import { PricingCard } from './common/PricingCard';
import type { PricingTier } from '../types';
import { useTranslation } from '../i18n';

interface PricingProps {
    onSelectPlan: (tier: PricingTier) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { t } = useTranslation();

  const tiers = [
    {
      tier: 'Standard',
      price: 'Free',
      description: t('pricingTierStandard'),
      features: [
        'Read-only insights',
        'Limited visibility',
        'AI connection suggestions',
        'Google Calendar access',
      ],
      isFeatured: false,
    },
    {
      tier: 'Pro',
      price: '$50',
      description: t('pricingTierPro'),
      features: [
        'Post verified opportunities',
        'Direct messaging',
        'Moderate analytics dashboard',
        'Google Meet integration',
        'AI-generated meeting summaries',
      ],
      isFeatured: true,
    },
    {
      tier: 'Elite',
      price: '$250',
      description: t('pricingTierElite'),
      features: [
        'Full analytics suite',
        'AI-powered matchmaking',
        'Verified transaction tools',
        'Global exposure & priority listing',
        'Live Google Meet map visualization',
      ],
      isFeatured: false,
    },
  ];

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">{t('pricingTitle', 'Pricing')}</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {t('pricingTitle')}
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">
            {t('pricingSubtitle')}
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <PricingCard 
                key={tier.tier} 
                {...tier} 
                onSelect={() => onSelectPlan(tier.tier as PricingTier)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};