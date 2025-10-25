import React, { useState, useEffect, useCallback } from 'react';
import type { MarketplaceListing, Transaction, TransactionStatus } from '../../types';
import { X, ShieldCheck, Banknote, FileCheck, PartyPopper, UploadCloud, File, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
// Fix: Import TRANSLATIONS to resolve type error for translation keys.
import { useTranslation, TRANSLATIONS } from '../../i18n';

interface TransactionModalProps {
    listing: MarketplaceListing;
    onClose: () => void;
}

const STEPS_CONFIG: { status: TransactionStatus; titleKey: keyof typeof TRANSLATIONS['en-US']; icon: React.ReactNode }[] = [
    { status: 'Offer', titleKey: 'stepOffer', icon: <FileCheck size={20}/> },
    { status: 'Escrow', titleKey: 'stepEscrow', icon: <Banknote size={20}/> },
    { status: 'Due Diligence', titleKey: 'stepDiligence', icon: <FileCheck size={20}/> },
    { status: 'Completed', titleKey: 'stepCompleted', icon: <PartyPopper size={20}/> },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({ listing, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [transaction, setTransaction] = useState<Transaction>({
        id: `txn-${Date.now()}`,
        listingId: listing.id,
        status: 'Offer',
        documents: [],
    });
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();

    const onDrop = useCallback((acceptedFiles: FileList | null) => {
        if (acceptedFiles) {
            setUploadedFiles(prev => [...prev, ...Array.from(acceptedFiles)]);
        }
    }, []);
    
    const handleUpload = () => {
        if(uploadedFiles.length === 0) return;
        setIsUploading(true);
        // Simulate upload
        setTimeout(() => {
            setTransaction(prev => ({
                ...prev,
                documents: [
                    ...prev.documents,
                    ...uploadedFiles.map(file => ({ name: file.name, status: 'Uploaded' as const }))
                ]
            }));
            setUploadedFiles([]);
            setIsUploading(false);
        }, 1500);
    };

    const removeFile = (fileToRemove: File) => {
        setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const advanceStatus = () => {
        const currentIndex = STEPS_CONFIG.findIndex(step => step.status === transaction.status);
        if (currentIndex < STEPS_CONFIG.length - 1) {
            setTransaction(prev => ({...prev, status: STEPS_CONFIG[currentIndex + 1].status }));
        }
    };
    
    const buyerFee = listing.amount * 0.01;
    const totalForBuyerToEscrow = listing.amount + buyerFee;

    const currentStepIndex = STEPS_CONFIG.findIndex(step => step.status === transaction.status);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-cyan-400"/> {t('transactionRoomTitle')}</h2>
                        <p className="text-sm text-slate-400 truncate max-w-md">{t('transactionFor')} {listing.title.originalText}</p>
                    </div>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Stepper & Actions */}
                    <div className="md:col-span-1">
                        <h3 className="font-bold text-white mb-4">{t('transactionStatus')}</h3>
                        <ol className="relative border-l border-slate-700 ml-2">                  
                            {STEPS_CONFIG.map((step, index) => (
                                <li key={step.status} className="mb-8 ml-6">
                                    <span className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-slate-900 ${index <= currentStepIndex ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                                        {step.icon}
                                    </span>
                                    <h4 className={`font-semibold ${index <= currentStepIndex ? 'text-white' : 'text-slate-400'}`}>{t(step.titleKey)}</h4>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Right Column - Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Financial Summary */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h3 className="font-bold text-white mb-4">{t('financialSummary')}</h3>
                             <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-400">{t('listingPriceLabel')}</span><span className="font-semibold text-white">{formatCurrency(listing.amount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">{t('buyerFeeLabel')}</span><span className="font-semibold text-white">{formatCurrency(buyerFee)}</span></div>
                                <div className="flex justify-between pt-2 border-t border-slate-700"><span className="text-slate-300 font-bold">{t('totalEscrowLabel')}</span><span className="font-bold text-cyan-400 text-lg">{formatCurrency(totalForBuyerToEscrow)}</span></div>
                             </div>
                             <p className="text-xs text-slate-500 mt-3 text-center">{t('sellerFeeNote')}</p>
                        </div>

                         {/* Document Upload */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <h3 className="font-bold text-white mb-4">{t('dueDiligenceDocs')}</h3>
                             <div 
                                onDragOver={(e) => e.preventDefault()} 
                                onDrop={(e) => { e.preventDefault(); onDrop(e.dataTransfer.files); }}
                                className="flex flex-col items-center justify-center w-full p-6 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50"
                             >
                                <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('uploadDocsPrompt')}</span> or drag and drop</p>
                                <p className="text-xs text-slate-500">PDF, DOCX, XLSX (MAX. 25MB each)</p>
                                <input type="file" multiple className="hidden" onChange={(e) => onDrop(e.target.files)} />
                             </div>
                             
                             {(uploadedFiles.length > 0 || transaction.documents.length > 0) &&
                                <div className="mt-4 space-y-2">
                                     {transaction.documents.map((doc, i) => (
                                         <div key={i} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm">
                                             <div className="flex items-center gap-2 truncate">
                                                 <File className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                                                 <span className="text-slate-300 truncate">{doc.name}</span>
                                             </div>
                                             <div className="flex items-center gap-1.5 text-green-400 font-semibold"><CheckCircle size={14} /> Verified</div>
                                         </div>
                                     ))}
                                     {uploadedFiles.map((file, i) => (
                                         <div key={i} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm">
                                             <div className="flex items-center gap-2 truncate">
                                                  <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                  <span className="text-slate-300 truncate">{file.name}</span>
                                             </div>
                                             <button onClick={() => removeFile(file)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                                         </div>
                                     ))}
                                     {uploadedFiles.length > 0 &&
                                         <button onClick={handleUpload} disabled={isUploading} className="w-full mt-2 py-2 text-sm bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700">
                                            {isUploading ? 'Uploading...' : t('uploadAndVerify')}
                                         </button>
                                     }
                                </div>
                             }
                        </div>
                    </div>
                </div>

                 <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                    {transaction.status !== 'Completed' &&
                        <button onClick={advanceStatus} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                           {transaction.status === 'Offer' && t('confirmOffer')}
                           {transaction.status === 'Escrow' && t('confirmFunds')}
                           {transaction.status === 'Due Diligence' && t('finalizeTransaction')}
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};