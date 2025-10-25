import React from 'react';
import type { Conversation } from '../../types';
import { User } from 'lucide-react';

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId: string | null | undefined;
    onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, activeConversationId, onSelectConversation }) => {
    return (
        <div className="h-full">
            <div className="p-4 border-b border-slate-800">
                <h3 className="font-bold text-white">Conversations</h3>
            </div>
            <nav className="p-2 space-y-1">
                {conversations.map(convo => {
                    const isActive = convo.id === activeConversationId;
                    return (
                        <button 
                            key={convo.id}
                            onClick={() => onSelectConversation(convo)}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${isActive ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                {convo.unreadCount > 0 && (
                                     <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {convo.unreadCount}
                                     </span>
                                )}
                            </div>
                           
                            <div className="flex-grow overflow-hidden">
                                <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{convo.participant.name}</p>
                                <p className="text-sm text-slate-400 truncate">{convo.lastMessage}</p>
                            </div>
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};