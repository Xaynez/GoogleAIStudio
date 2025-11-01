import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n';
import { Search, ChevronDown, MessageSquare, Bot } from 'lucide-react';

const FAQ_DATA = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    questionKey: `faqQ${i + 1}` as const,
    answerKey: `faqA${i + 1}` as const,
}));

interface FAQPageProps {
    onOpenChat: () => void;
}

const FAQItem: React.FC<{
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-border-subtle">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-5 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-text-primary">{question}</span>
                <ChevronDown
                    className={`h-6 w-6 text-brand-cyan transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-5 text-text-secondary">
                        <p>{answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onOpenChat }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

    const filteredFAQs = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) {
            return FAQ_DATA;
        }
        return FAQ_DATA.filter(item => 
            t(item.questionKey, '').toLowerCase().includes(lowercasedTerm) || 
            t(item.answerKey, '').toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm, t]);

    const handleToggleQuestion = (id: number) => {
        setOpenQuestionId(prevId => (prevId === id ? null : id));
    };

    return (
        <section className="py-24 bg-surface-bg min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-slide-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold heading-gradient mb-4 font-display" data-i18n="faq_title">
                        {t('faq_title')}
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        {t('faqSubtitle')}
                    </p>
                </div>

                <div className="relative mb-8 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder={t('faqSearchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-input border border-border-input rounded-full py-3 pl-12 pr-4 text-text-primary placeholder-text-muted focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    />
                </div>

                <div className="bg-surface-card/50 backdrop-blur-sm rounded-2xl shadow-soft border border-border-subtle overflow-hidden animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map(item => (
                            <FAQItem
                                key={item.id}
                                question={t(item.questionKey)}
                                answer={t(item.answerKey)}
                                isOpen={openQuestionId === item.id}
                                onClick={() => handleToggleQuestion(item.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center py-12 text-text-secondary">No questions found matching your search.</p>
                    )}
                </div>

                <div className="mt-12 text-center animate-slide-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="relative inline-block">
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <button
                            onClick={onOpenChat}
                            className="relative px-8 py-4 text-lg font-semibold text-text-inverted bg-surface-card rounded-lg leading-none flex items-center gap-2"
                        >
                             <Bot size={20} /> {t('faqNeedMoreHelp')}
                        </button>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border-subtle animate-slide-in-up" style={{ animationDelay: '800ms' }}>
                    <p className="text-center text-text-secondary">
                        {t('faqFooter')}
                    </p>
                </div>
            </div>
        </section>
    );
};