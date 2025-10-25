import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TranslatableContent, Translation } from '../types';
import { useTranslation } from '../i18n';
import { translateBatchWithGemini } from '../services/geminiService';

// --- Context ---
interface TranslatorContextType {
  showOriginal: boolean;
  setShowOriginal: (show: boolean) => void;
  // This state would live here to avoid re-fetching on every component
  // For simplicity in this mock, we'll manage it inside the hook
  // translationsCache: Record<string, TranslatableContent>;
  // setTranslationsCache: ...
}

const TranslatorContext = createContext<TranslatorContextType>({
  showOriginal: true,
  setShowOriginal: () => {},
});

// --- Provider Component ---
export const TranslatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOriginal, setShowOriginal] = useState(true);
  
  const value = { showOriginal, setShowOriginal };

  return React.createElement(TranslatorContext.Provider, { value }, children);
};

// --- Hook ---
export const useTranslator = (contentId: string, content?: TranslatableContent) => {
  const { showOriginal, setShowOriginal } = useContext(TranslatorContext);
  const { locale } = useTranslation();
  
  const [currentContent, setCurrentContent] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      // Update content if the prop changes
      setCurrentContent(content);
  }, [content]);

  const targetLocale = locale.code;
  const translation = currentContent?.translations?.[targetLocale];
  const isTranslated = !showOriginal && !!translation;
  const canBeTranslated = currentContent?.originalLang !== targetLocale;

  // Effect to trigger translation if needed
  useEffect(() => {
    if (!content || showOriginal || !canBeTranslated || content.translations?.[targetLocale] || isTranslating) {
      return;
    }
    
    const translate = async () => {
      setIsTranslating(true);
      setError(null);
      try {
        const result = await translateBatchWithGemini([{ contentId, text: content.originalText }], targetLocale);
        const translationResult = result[contentId];
        if (translationResult) {
          setCurrentContent(prev => {
            if (!prev) return prev;
            const newTranslation: Translation = {
                text: translationResult.text,
                confidence: translationResult.confidence
            };
            const newTranslations = { ...(prev.translations || {}), [targetLocale]: newTranslation };
            return { ...prev, translations: newTranslations };
          });
        }
      } catch (e) {
        setError("Translation failed.");
        console.error(e);
      } finally {
        setIsTranslating(false);
      }
    };
    
    translate();

  }, [content, showOriginal, targetLocale, canBeTranslated, contentId, isTranslating]);

  const text = showOriginal || !canBeTranslated
    ? currentContent?.originalText
    : translation?.text || currentContent?.originalText;

  return {
    text: text || '',
    isTranslated,
    isTranslating,
    translationError: error,
    showOriginal,
    setShowOriginal,
    canBeTranslated,
    confidence: isTranslated ? translation?.confidence : undefined,
    edited: isTranslated ? translation?.edited : undefined,
  };
};