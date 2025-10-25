import React from 'react';
import { useTranslator } from '../../hooks/useTranslator';
import type { TranslatableContent } from '../../types';
import { Languages, Loader, AlertTriangle } from 'lucide-react';

interface TranslatedTextProps {
  contentId: string;
  content: TranslatableContent;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
  showToggle?: boolean;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ contentId, content, as = 'p', className = '', showToggle = false }) => {
  const { text, isTranslated, isTranslating, showOriginal, setShowOriginal, canBeTranslated, confidence, edited } = useTranslator(contentId, content);

  const Tag = as;

  const toggle = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowOriginal(!showOriginal);
      }}
      className="ml-2 text-xs text-cyan-400/80 hover:underline flex items-center gap-1"
      title={showOriginal ? 'Show translation' : 'Show original'}
    >
      {isTranslating ? <Loader size={12} className="animate-spin" /> : <Languages size={12} />}
      <span>{showOriginal ? 'Translate' : 'Original'}</span>
    </button>
  );
  
  const suggestEdit = (
    <button
        onClick={(e) => {
            e.stopPropagation();
            // TODO: Open modal to suggest a better translation
            console.log(`Suggest edit for contentId: ${contentId}`);
        }}
        className="ml-2 text-xs text-slate-500 hover:underline"
        title="Suggest a better translation"
    >
        (Suggest an edit)
    </button>
  );

  return (
    <div className={`inline ${className}`}>
        {isTranslated && confidence && confidence < 0.6 && (
            <div className="text-xs text-yellow-300 bg-yellow-500/10 p-1.5 rounded-md mb-2 flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Machine translation — please review</span>
            </div>
        )}
        <Tag>
            {text}
            {showToggle && canBeTranslated && toggle}
            {isTranslated && (
                <span className="ml-1 text-xs text-slate-500">
                    {edited && <span className="mr-2 font-semibold">(Edited)</span>}
                    {confidence !== undefined && <span>({(confidence * 100).toFixed(0)}% confidence)</span>}
                </span>
            )}
        </Tag>
    </div>
  );
};