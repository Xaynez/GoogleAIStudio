import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, CornerDownLeft, MessageSquare, Loader } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
             chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash-lite',
                config: {
                    systemInstruction: 'You are EVOLVE AI, a helpful and concise assistant for the EVOLVE professional networking platform. Keep your answers brief and to the point.',
                },
            });
            if(messages.length === 0) {
                 setMessages([{ role: 'model', text: 'Hello! How can I assist you today?' }]);
            }
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleToggleOpen = () => {
        if (isOpen) {
            setIsClosing(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsClosing(false);
            }, 300);
        } else {
            setIsOpen(true);
        }
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
        return (
            <button
                onClick={handleToggleOpen}
                className="fixed bottom-6 right-6 bg-cyan-600 text-white rounded-full p-4 shadow-lg hover:bg-cyan-700 transition-transform transform hover:scale-110 z-50 animate-pulse"
                aria-label="Open AI Chat"
                title="Open AI Chat"
            >
                <MessageSquare className="h-7 w-7" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 h-[60vh] bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">EVOLVE Assistant</h3>
                </div>
                <button onClick={handleToggleOpen} title="Close chat" className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5 text-cyan-400" />
                            </div>
                        )}
                        <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-cyan-600 rounded-br-none text-white' : 'bg-slate-800 rounded-tl-none text-slate-300'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length-1].role === 'user' && (
                     <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-cyan-400" />
                        </div>
                         <div className="p-3 rounded-lg bg-slate-800 rounded-tl-none text-slate-300">
                             <Loader className="h-5 w-5 animate-spin" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-slate-800 flex-shrink-0 flex items-center gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask anything..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-4 pr-12 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading} title="Send message" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-cyan-400 disabled:opacity-50">
                        <CornerDownLeft className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};