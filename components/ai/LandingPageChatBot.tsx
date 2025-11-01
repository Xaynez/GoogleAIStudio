import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, CornerDownLeft, Loader } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useTranslation } from '../../i18n';

interface LandingPageChatBotProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const LandingPageChatBot: React.FC<LandingPageChatBotProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            const genAI = new GoogleGenAI({apiKey: process.env.API_KEY!});
            setAi(genAI);
             chatRef.current = genAI.chats.create({
                model: 'gemini-2.5-pro',
                config: {
                    systemInstruction: 'You are EVOLVE AI Support, a helpful and friendly assistant for the EVOLVE professional networking platform. Your goal is to answer questions from potential users visiting the landing page. Be informative and encouraging.',
                },
            });
            if(messages.length === 0) {
                 setMessages([{ role: 'model', text: t('landingChatGreeting') }]);
            }
        }
    }, [isOpen, t, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!chatRef.current) return;
            
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            const result = await chatRef.current.sendMessageStream({ message: userMessage.text });
            
            for await (const chunk of result) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'model') {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { ...lastMessage, text: lastMessage.text + chunkText };
                        return newMessages;
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" aria-modal="true" role="dialog" onClick={triggerClose}>
            <div
                className={`w-full max-w-lg h-[80vh] bg-surface-modal border border-border-subtle rounded-2xl shadow-2xl flex flex-col z-50 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-border-subtle flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-brand-cyan" />
                        <h3 className="text-lg font-bold text-text-primary">{t('landingChatTitle')}</h3>
                    </div>
                    <button onClick={triggerClose} title="Close chat" aria-label="Close chat" className="text-text-muted hover:text-text-primary transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-5 w-5 text-brand-cyan" />
                                </div>
                            )}
                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-brand-violet text-white rounded-br-none' : 'bg-surface-elevated rounded-tl-none text-text-primary'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length-1].role === 'user' && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5 text-brand-cyan" />
                            </div>
                            <div className="p-3 rounded-2xl bg-surface-elevated rounded-tl-none">
                                <Loader className="h-5 w-5 animate-spin text-brand-cyan" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-border-subtle flex-shrink-0 flex items-center gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about EVOLVE..."
                            className="w-full bg-surface-input border border-border-input rounded-full py-3 pl-4 pr-12 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading} title="Send message" aria-label="Send message" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-brand-cyan disabled:opacity-50">
                            <CornerDownLeft className="h-6 w-6" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};