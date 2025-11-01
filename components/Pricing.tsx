import React, { useState } from 'react';
import { PricingCard } from './common/PricingCard';
import type { PricingTier } from '../types';
import { useTranslation } from '../i18n';

interface PricingProps {
    onSelectPlan: (tier: PricingTier) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      tier: 'Standard',
      price: { monthly: 'Free', annual: 'Free' },
      description: "For individual users exploring EVOLVE’s AI-powered ecosystem.",
      features: [
        'Read-only analytics insights',
        'Limited visibility on Marketplace listings',
        'Gemini 2.5-driven AI recommendations',
        'Google Calendar & Workspace view-only integration',
        'Access to Governance awareness dashboard',
        'Language translation for up to 3 automatic languages',
      ],
      isFeatured: false,
    },
    {
      tier: 'Pro',
      price: { monthly: '$99/month', annual: '$999/year' },
      description: "Ideal for executives, founders, and verified professionals scaling partnerships and opportunities.",
      features: [
        'Post verified Marketplace opportunities',
        'Direct messaging with AI moderation',
        'Moderate analytics dashboard with Gemini insights',
        'Verified transaction previews and compliance summaries',
        'AI-generated meeting notes via Gemini + Workspace',
        'Imagen & Veo 3 basic access (visuals and short clips)',
        'Google Meet & Drive integration',
        'Global multilingual support',
        'Standard visibility across all active regions',
      ],
      isFeatured: true,
    },
    {
      tier: 'Elite',
      price: { monthly: '$399/month', annual: '$4,069/year' },
      description: "For enterprise organizations requiring full governance integration and advanced analytics.",
      features: [
        'Full analytics suite with performance and compliance dashboards',
        'AI-powered matchmaking for partnerships, investors, and assets',
        'Verified transaction and smart contract automation via Governance Hub',
        'Priority listing placement and international exposure',
        'Live Google Meet map visualization',
        'Imagen & Veo 3 Pro for advanced media creation',
        'Real-time compliance audit trails',
        'Voice-to-text multilingual translation',
        'Dedicated onboarding and Gemini 2.5 Pro direct access',
      ],
      isFeatured: false,
    },
  ];

  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl heading-gradient" data-i18n="section_pricing_title">
            {t('section_pricing_title')}
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">
            Flexible plans designed for executives, investors, and innovators. Scale intelligently with governance-first AI collaboration.
          </p>
        </div>
        
        <div className="mt-10 flex justify-center">
            <div className="relative flex items-center p-1 bg-surface-elevated rounded-full">
                <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`relative w-28 text-center py-2 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${billingPeriod === 'monthly' ? 'text-text-inverted' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setBillingPeriod('annual')}
                    className={`relative w-40 text-center py-2 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${billingPeriod === 'annual' ? 'text-text-inverted' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Annual (Save 15%)
                </button>
                <span
                    className={`absolute top-1 h-10 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full transition-all duration-300 ease-in-out shadow-lg`}
                    style={{
                        width: billingPeriod === 'monthly' ? '7rem' : '10rem',
                        left: billingPeriod === 'monthly' ? '0.25rem' : '7.25rem'
                    }}
                />
            </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <PricingCard 
                key={tier.tier}
                tier={tier.tier}
                price={tier.price[billingPeriod]}
                description={tier.description}
                features={tier.features} 
                isFeatured={tier.isFeatured}
                onSelect={() => onSelectPlan(tier.tier as PricingTier)}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center text-sm text-text-secondary max-w-3xl mx-auto">
            <p>
                All subscriptions include authenticated access to EVOLVE’s Governance & Compliance Hub, ensuring every interaction meets ethical, legal, and data-protection standards globally.
            </p>
        </div>
      </div>
    </div>
  );
};