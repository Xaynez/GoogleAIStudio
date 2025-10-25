import React from 'react';
import { useTranslation } from '../../i18n';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const { t } = useTranslation();
  
  const steps = [
      { number: 1, title: t('stepVerification') },
      { number: 2, title: t('stepProfile') },
      { number: 3, title: t('stepInterests') },
      { number: 4, title: t('stepSecurity') },
      { number: 5, title: t('stepComplete') },
  ];

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {step.number < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-cyan-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-cyan-600 rounded-full">
                  <span className="text-white font-bold">{step.number}</span>
                </div>
                 <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm text-cyan-400 font-semibold">{step.title}</span>
              </>
            ) : step.number === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-slate-800 border-2 border-cyan-500 rounded-full">
                   <span className="text-cyan-400 font-bold">{step.number}</span>
                </div>
                 <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm text-cyan-400 font-bold">{step.title}</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-700" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-slate-800 border-2 border-slate-600 rounded-full">
                  <span className="text-slate-400">{step.number}</span>
                </div>
                 <span className="absolute top-10 left-1/2 -translate-x-1/2 text-sm text-slate-400">{step.title}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
