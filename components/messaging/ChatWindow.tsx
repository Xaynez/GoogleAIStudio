import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Conversation, Message, UserProfile } from '../../types';
import { Send, Bot, Languages, Loader } from 'lucide-react';
import { summarizeConversationWithGemini, translateMessageWithGemini } from '../../services/geminiService';
import { useTranslation } from '../../i18n';
import { SUPPORTED_LOCALES } from '../../constants';

interface ChatWindowProps {
    conversation: Conversation;
    onSendMessage: (conversationId: string, messageText: string) => void;
    currentUser: UserProfile;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, currentUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
    const { locale } = useTranslation();
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const localeMap = useMemo(() => new Map(SUPPORTED_LOCALES.map(l => [l.code, l.name])), []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(conversation.id, newMessage);
            setNewMessage('');
        }
    };
    
    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummary(null);
        try {
            const result = await summarizeConversationWithGemini(conversation.messages, locale.name);
            setSummary(result);
        } catch (error) {
            console.error(error);
            setSummary("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };
    
    const handleTranslate = async (message: Message) => {
        if (translatedTexts[message.id]) return; // Don't re-translate
        setTranslatingMessageId(message.id);
        try {
            const targetLang = locale.name.split(' ')[0] || 'English'; // Translate to user's selected language
            const result = await translateMessageWithGemini(message.text.originalText, targetLang);
            setTranslatedTexts(prev => ({ ...prev, [message.id]: result }));
        } catch (error) {
            console.error(error);
        } finally {
            setTranslatingMessageId(null);
        }
    };

    return (
        <div className="flex-grow flex flex-col bg-slate-900/50">
            {/* Header */}
            <header className="p-4 border-b border-slate-800 flex-shrink-0 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">{conversation.participant.name}</h3>
                    <p className="text-sm text-slate-400">{conversation.participant.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSummarize} title="Summarize conversation with AI" disabled={isSummarizing || conversation.messages.length === 0} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-700 text-cyan-300 rounded-full hover:bg-slate-600 disabled:opacity-50">
                        <Bot size={16} /> {isSummarizing ? 'Summarizing...' : 'Summarize'}
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                 {summary && (
                    <div className="p-3 bg-slate-800/70 rounded-lg border border-cyan-500/30 my-2">
                        <h4 className="font-semibold text-cyan-400 text-sm mb-1">Conversation Summary</h4>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{summary}</p>
                    </div>
                 )}
                {conversation.messages.map(msg => {
                    const needsTranslation = !msg.isOwn && msg.text.originalLang !== currentUser.locale.code;
                    return (
                        <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[70%] ${msg.isOwn ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text.originalText}</p>
                                {needsTranslation && !translatedTexts[msg.id] && (
                                    <button onClick={() => handleTranslate(msg)} disabled={!!translatingMessageId} className="text-xs text-cyan-300/70 hover:underline mt-1.5 flex items-center gap-1">
                                        {translatingMessageId === msg.id ? <Loader size={12} className="animate-spin" /> : <Languages size={12} />}
                                        Translate to {locale.name.split(' ')[0]}
                                    </button>
                                )}
                                {translatedTexts[msg.id] && (
                                    <div className="text-xs mt-1 pt-1 border-t border-cyan-500/20 italic">
                                        <p className="text-cyan-200/90">{translatedTexts[msg.id]}</p>
                                        <p className="text-slate-500/80 text-[10px] not-italic mt-1">Translated from {localeMap.get(msg.text.originalLang)?.split(' ')[0] || 'Original'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-slate-800 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-4 pr-14 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button onClick={handleSend} title="Send message" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors">
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};