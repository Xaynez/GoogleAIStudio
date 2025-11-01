import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface PricingCardProps {
  tier: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSelect: (tier: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  description,
  features,
  isFeatured = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  
  const buttonClasses = `
    w-full inline-flex justify-center whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold
    transition-all duration-300
    bg-gradient-to-r from-heading-start to-heading-end text-text-inverted hover:shadow-lg hover:shadow-cyan-500/40
  `;

  const [priceValue, pricePeriod] = price.includes('/') ? price.split('/') : [price, null];

  return (
    <div className="pricing-card-glow h-full"> {/* Wrapper for the exterior glow */}
      <div className="relative flex flex-col h-full p-8 rounded-2xl bg-surface-card shadow-soft text-text-primary">
        {isFeatured && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center text-xs font-semibold py-1.5 px-3 bg-gradient-to-r from-heading-start to-heading-end text-text-inverted rounded-full shadow-md">
              Most Popular
            </div>
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-text-primary">{tier}</h3>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
          <div className="mt-6">
            <span className="text-5xl font-bold tracking-tight text-text-primary">{priceValue}</span>
            {pricePeriod && <span className="text-sm font-medium text-text-secondary">/{pricePeriod}</span>}
          </div>
          <ul className="mt-8 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <button onClick={() => onSelect(tier)} className={buttonClasses}>
            Choose
          </button>
        </div>
      </div>
    </div>
  );
};
