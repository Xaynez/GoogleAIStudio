import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  onSelect: (tier: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  price,
  period,
  description,
  features,
  isFeatured = false,
  onSelect,
}) => {
  const { t } = useTranslation();
  
  const cardClasses = `
    relative flex flex-col h-full p-8 rounded-2xl transition-all duration-300
    bg-white
    dark:bg-slate-900/80 dark:backdrop-blur-sm
    border-2
    hover:border-purple-400
    ${isFeatured
      ? 'border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.55)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]'
      : 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)]'
    }
  `;

  const buttonClasses = `
    w-full inline-flex justify-center whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold
    transition-all duration-300
    ${isFeatured
      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-cyan-500/40'
      : 'bg-slate-200 text-slate-900 border-2 border-black hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
    }
  `;

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="inline-flex items-center text-xs font-semibold py-1.5 px-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full shadow-md">
            {t('pricingMostPopular')}
          </div>
        </div>
      )}
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tier}</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
        <div className="mt-6">
          <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{price}</span>
          {price !== 'Free' && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{period || t('pricingPeriod')}</span>}
        </div>
        <ul className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-cyan-500 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <button onClick={() => onSelect(tier)} className={buttonClasses}>
          {t('pricingChoose', { tier })}
        </button>
      </div>
    </div>
  );
};