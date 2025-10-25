import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
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
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-md text-center p-8 transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">Upgrade to Unlock</h2>
                <p className="text-slate-400 mt-2">
                    This is a premium feature. Please upgrade your plan to gain access to the AI Studio, Global Connection Map, and other exclusive tools.
                </p>
                <div className="mt-6 space-y-2">
                    <button className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-colors">
                        View Pricing Plans
                    </button>
                    <button onClick={triggerClose} className="w-full px-6 py-2 text-slate-400 font-medium rounded-lg hover:bg-slate-800 transition-colors">
                        Maybe Later
                    </button>
                </div>
                 <button onClick={triggerClose} title="Close" className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};