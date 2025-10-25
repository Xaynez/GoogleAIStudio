import React from 'react';
import { CheckCircle, PartyPopper } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Step5Props {
  name: string;
}

export const Step5Complete: React.FC<Step5Props> = ({ name }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center flex flex-col items-center justify-center h-full">
        <div className="relative">
            <CheckCircle className="h-24 w-24 text-green-400" />
            <PartyPopper className="h-8 w-8 text-yellow-400 absolute -top-2 -right-4" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mt-6">{t('welcomeAboard', { name })}</h2>
        <p className="text-slate-300 mt-2 max-w-md">
            {t('profileComplete')}
        </p>
        <p className="mt-8 text-slate-400">
            {t('clickFinish')}
        </p>
    </div>
  );
};
