import React, { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import type { Conversation, UserProfile } from '../../types';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';

interface MessagingModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    onSendMessage: (conversationId: string, messageText: string) => void;
    currentUser: UserProfile;
    initialConversationId: string | null;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({ isOpen, onClose, conversations, onSendMessage, currentUser, initialConversationId }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            if (initialConversationId) {
                const initialConvo = conversations.find(c => c.id === initialConversationId);
                setActiveConversation(initialConvo || (conversations.length > 0 ? conversations[0] : null));
            } else if (conversations.length > 0 && !activeConversation) {
                // Default to the first conversation if no initial ID is provided and none is active
                setActiveConversation(conversations[0]);
            } else if (conversations.length === 0) {
                setActiveConversation(null);
            }
        }
    }, [isOpen, initialConversationId, conversations, activeConversation]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-white">Direct Messaging</h2>
                    </div>
                    <button onClick={triggerClose} title="Close messaging" aria-label="Close messaging" className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-grow flex overflow-hidden">
                    {/* Conversation List (Sidebar) */}
                    <div className="w-1/3 border-r border-slate-800 flex-shrink-0 overflow-y-auto">
                        <ConversationList 
                            conversations={conversations}
                            activeConversationId={activeConversation?.id}
                            onSelectConversation={setActiveConversation}
                        />
                    </div>

                    {/* Chat Window (Main Area) */}
                    <div className="flex-grow flex flex-col">
                        {activeConversation ? (
                            <ChatWindow
                                key={activeConversation.id} // Re-mount component on conversation change
                                conversation={activeConversation}
                                onSendMessage={onSendMessage}
                                currentUser={currentUser}
                            />
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-slate-500">
                                <p>Select a conversation to start messaging.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};