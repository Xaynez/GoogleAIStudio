import React, { useState, useEffect } from 'react';
import type { MarketplaceListing, ListingAnalysis } from '../../types';
import { X, DollarSign, MapPin, ArrowRight, Video, ImageIcon, Briefcase, Calendar, GraduationCap, Bot, Loader, ArrowLeft } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from '../../i18n';
import { TranslatedText } from '../common/TranslatedText';
import { analyzeListingWithGemini } from '../../services/geminiService';
import { AnalysisDashboard } from '../AnalysisDashboard';
import { MeetModal } from '../MeetModal';


interface ListingDetailModalProps {
    listing: MarketplaceListing;
    onClose: () => void;
    onInitiateTransaction: (listing: MarketplaceListing) => void;
    onStartConversation: (participant: { id: string; name: string; title: string; }) => void;
    onOpenMessages: () => void;
    onOpenCalendar: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listing, onClose, onInitiateTransaction, onStartConversation, onOpenMessages, onOpenCalendar }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation();
    
    // State for AI Analysis
    const [analysis, setAnalysis] = useState<ListingAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMeetOpen, setIsMeetOpen] = useState(false);
    const [openNoteTakerOnMeetStart, setOpenNoteTakerOnMeetStart] = useState(false);


    useEffect(() => {
        // Reset state when a new listing is opened in the same modal instance
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
        setSelectedMediaIndex(0);
    }, [listing.id]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') triggerClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const getListingTextForAnalysis = (listing: MarketplaceListing): string => {
        return `
            Title: ${listing.title.originalText}
            Category: ${listing.category}
            Location: ${listing.location}
            Amount: ${listing.amount} ${listing.currency}
            Summary: ${listing.summary.originalText}
            Description: ${listing.details.description.originalText}
            Key Metrics: ${listing.details.keyMetrics.map(m => `${m.label}: ${m.value}`).join(', ')}
        `;
    };

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const textToAnalyze = getListingTextForAnalysis(listing);
            const result = await analyzeListingWithGemini(textToAnalyze);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenMeetWithNoteTaker = () => {
        setOpenNoteTakerOnMeetStart(true);
        setIsMeetOpen(true);
    };

    const handleCloseMeetModal = () => {
        setIsMeetOpen(false);
        setOpenNoteTakerOnMeetStart(false); // Reset on close
    };


    const selectedMedia = listing.media?.[selectedMediaIndex];

    const renderCategorySpecificDetails = () => (
        <>
            {listing.details.jobDetails && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Briefcase /> Job Details</h3>
                    <div className="space-y-3 text-slate-300 text-sm">
                        <p><strong>Salary Range:</strong> {listing.details.jobDetails.salaryRange}</p>
                        <div><strong>Responsibilities:</strong><p className="whitespace-pre-wrap pl-2">{listing.details.jobDetails.responsibilities}</p></div>
                        <div><strong>Qualifications:</strong><p className="whitespace-pre-wrap pl-2">{listing.details.jobDetails.qualifications}</p></div>
                    </div>
                </div>
            )}
            {listing.details.eventDetails && (
                 <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Calendar /> Event Details</h3>
                     <div className="space-y-2 text-slate-300 text-sm">
                        <p><strong>Format:</strong> {listing.details.eventDetails.format}</p>
                        <p><strong>Starts:</strong> {new Date(listing.details.eventDetails.startDate).toLocaleString()}</p>
                        <p><strong>Ends:</strong> {new Date(listing.details.eventDetails.endDate).toLocaleString()}</p>
                     </div>
                 </div>
            )}
             {listing.details.courseDetails && (
                 <div className="mt-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><GraduationCap /> Course Details</h3>
                     <div className="space-y-3 text-slate-300 text-sm">
                        <p><strong>Instructor:</strong> {listing.details.courseDetails.instructor}</p>
                        <p><strong>Duration:</strong> {listing.details.courseDetails.duration}</p>
                         <div>
                            <strong>Learning Outcomes:</strong>
                            <ul className="list-disc list-inside pl-2 mt-1">
                                {listing.details.courseDetails.outcomes.map((outcome, i) => <li key={i}>{outcome}</li>)}
                            </ul>
                        </div>
                     </div>
                 </div>
            )}
        </>
    );
    
    return (
        <>
            <MeetModal 
                isOpen={isMeetOpen} 
                onClose={handleCloseMeetModal} 
                listingContext={analysis?.listingSummary || listing.summary.originalText}
                openNoteTakerByDefault={openNoteTakerOnMeetStart}
            />
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                <div 
                    className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
                >
                    <div className="relative h-96 rounded-t-2xl overflow-hidden bg-black flex items-center justify-center">
                        {selectedMedia?.type === 'image' && (
                            <img src={selectedMedia.url} alt={listing.title.originalText} className="w-full h-full object-contain" />
                        )}
                        {selectedMedia?.type === 'video' && (
                            <video src={selectedMedia.url} controls autoPlay className="w-full h-full object-contain" />
                        )}
                        {!selectedMedia && (
                            <div className="text-slate-500 text-center">
                                <ImageIcon size={64} className="mx-auto" />
                                <p>No media available for this listing.</p>
                            </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                            {listing.media && listing.media.length > 1 && (
                                <div className="flex gap-2 mb-4">
                                    {listing.media.map((media, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => setSelectedMediaIndex(index)}
                                            className={`w-16 h-10 rounded-md overflow-hidden border-2 transition-all ${selectedMediaIndex === index ? 'border-cyan-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            {media.type === 'image' ? (
                                                <img src={media.url} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                                    <Video size={18} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-white">
                                <TranslatedText contentId={`${listing.id}_title`} content={listing.title} as="span" showToggle />
                            </h2>
                            <div className="flex items-center gap-4 text-slate-300 mt-1">
                                <div className="flex items-center gap-1.5"><MapPin size={14} /> {listing.location}</div>
                                {listing.amount > 0 && <div className="flex items-center gap-1.5 font-semibold text-cyan-400"><DollarSign size={14} /> {formatCurrency(listing.amount)}</div>}
                            </div>
                        </div>
                        <button onClick={triggerClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <div className="max-h-[40vh] overflow-y-auto p-6">
                        {analysis ? (
                             <div className="animate-fade-in">
                                <button onClick={() => setAnalysis(null)} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline mb-4">
                                    <ArrowLeft size={16} />
                                    Back to Listing Details
                                </button>
                                <AnalysisDashboard 
                                    analysis={analysis}
                                    onOpenCalendar={onOpenCalendar}
                                    onOpenMeet={() => setIsMeetOpen(true)}
                                    onStartConversation={onStartConversation}
                                    onOpenNoteTaker={handleOpenMeetWithNoteTaker}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-bold text-white mb-2">{t('listingDetailDescription')}</h3>
                                    <div className="text-slate-300 whitespace-pre-wrap">
                                        <TranslatedText contentId={`${listing.id}_description`} content={listing.details.description} showToggle />
                                    </div>
                                    {renderCategorySpecificDetails()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{t('listingDetailKeyMetrics')}</h3>
                                    <div className="space-y-3">
                                        {listing.details.keyMetrics.map(metric => (
                                            <div key={metric.label} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
                                                <span className="text-sm font-semibold text-slate-400">{metric.label}</span>
                                                <span className="text-sm font-bold text-white">{metric.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                         {error && !analysis && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
                        {!analysis && (
                            <button 
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader className="animate-spin" size={20} />
                                ) : (
                                    <Bot size={20} />
                                )}
                                {isLoading ? "Analyzing..." : "Analyze with AI"}
                            </button>
                        )}
                        {analysis && (
                            <div></div> // Placeholder to keep the transaction button to the right
                        )}
                        <button 
                            onClick={() => onInitiateTransaction(listing)}
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-300"
                        >
                            {listing.category === 'Partnerships' ? t('contactSupplier') : t('initiateTransaction')}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};