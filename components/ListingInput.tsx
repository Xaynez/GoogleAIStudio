import React, { useState } from 'react';
import { Bot, Loader } from 'lucide-react';
import { useTranslation } from '../i18n';

interface ListingInputProps {
  onAnalyze: (listingText: string) => void;
  isLoading: boolean;
  initialValue: string;
}

export const ListingInput: React.FC<ListingInputProps> = ({ onAnalyze, isLoading, initialValue }) => {
  const [listingText, setListingText] = useState(initialValue);
  const { t } = useTranslation();

  const handleSubmit = () => {
    if (!listingText.trim() || isLoading) return;
    onAnalyze(listingText);
  };

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('analyzeListing')}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        {t('analyzeListingSubtitle')}
      </p>
      <div className="relative">
        <textarea
          value={listingText}
          onChange={(e) => setListingText(e.target.value)}
          placeholder="Paste your listing text here..."
          className="w-full h-48 p-4 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
          disabled={isLoading}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !listingText.trim()}
          className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 disabled:bg-slate-500 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              <span>{t('analyzing')}</span>
            </>
          ) : (
            <>
              <Bot className="h-5 w-5 mr-2" />
              <span>{t('analyzeWithAI')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};