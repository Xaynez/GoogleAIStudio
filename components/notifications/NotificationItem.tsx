import React from 'react';
import { ThumbsUp, MessageSquare, Store, Bot } from 'lucide-react';
import type { Notification } from '../../types';

interface NotificationItemProps {
    notification: Notification;
    onClick: (notification: Notification) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'new_message':
            return <MessageSquare className="h-5 w-5 text-brand-cyan" />;
        case 'post_like':
            return <ThumbsUp className="h-5 w-5 text-blue-400" />;
        case 'post_comment':
            return <MessageSquare className="h-5 w-5 text-green-400" />;
        case 'new_listing':
            return <Store className="h-5 w-5 text-yellow-400" />;
        case 'system':
        default:
            return <Bot className="h-5 w-5 text-purple-400" />;
    }
};

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
    return (
        <button
            onClick={() => onClick(notification)}
            className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${!notification.isRead ? 'bg-surface-elevated' : ''} hover:bg-surface-card rounded-lg`}
        >
            <div className="flex-shrink-0 mt-1 relative">
                {getNotificationIcon(notification.type)}
                {!notification.isRead && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                )}
            </div>
            <div className="flex-grow">
                <p className="text-sm text-text-primary">{notification.text}</p>
                <p className="text-xs text-text-secondary mt-1">{timeSince(new Date(notification.timestamp))}</p>
            </div>
        </button>
    );
};