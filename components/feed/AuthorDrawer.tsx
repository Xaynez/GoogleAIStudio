import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, ShieldCheck } from 'lucide-react';
import type { Post } from '../../types';

interface AuthorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    author: Post['author'] | null;
}

export const AuthorDrawer: React.FC<AuthorDrawerProps> = ({ isOpen, onClose, author }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        }
    }, [isOpen]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={triggerClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
            >
                {author ? (
                    <>
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white">About the Author</h2>
                            <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 flex-grow">
                            <div className="text-center">
                                <User className="h-24 w-24 p-6 bg-slate-700 rounded-full text-slate-300 mx-auto" />
                                <h3 className="text-2xl font-bold text-white mt-4 flex items-center justify-center gap-2">
                                    {author.name}
                                    {author.verified && <ShieldCheck className="h-6 w-6 text-cyan-400" />}
                                </h3>
                                <p className="text-slate-300">{author.title}</p>
                                <p className="text-slate-400 text-sm">{author.company}</p>
                            </div>
                            <div className="mt-8">
                                <button className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                                    View Full Profile
                                </button>
                                <button className="w-full mt-2 py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No author information available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
