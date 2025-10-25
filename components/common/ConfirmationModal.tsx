import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
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
    }, 300); // Animation duration
  };

  const handleConfirm = () => {
    onConfirm();
    triggerClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
      <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">{title}</h2>
          <div className="text-slate-400 mt-2">{message}</div>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-center gap-4">
          <button onClick={triggerClose} className="px-6 py-2 text-slate-300 font-semibold rounded-lg hover:bg-slate-800">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
