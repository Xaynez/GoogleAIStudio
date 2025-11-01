import React, { useState, useCallback, useEffect } from 'react';
import type { MarketplaceCategory, MarketplaceListing, UserProfile } from '../../types';
import { X, PlusCircle, ChevronsUpDown, Trash2, BadgePercent, DollarSign, Loader, CheckCircle, UploadCloud, File, Image as ImageIcon, Video } from 'lucide-react';
import { NEW_MARKETPLACE_CATEGORIES } from '../../constants';
import { useTranslation } from '../../i18n';
import { generateVideos, getVideosOperation } from '../../services/geminiService';

const CATEGORIES: MarketplaceCategory[] = NEW_MARKETPLACE_CATEGORIES;

interface CreateListingModalProps {
    userProfile: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onAddListing: (listing: Omit<MarketplaceListing, 'id' | 'submittedAt' | 'status' | 'aiRiskScore' | 'aiFlags'>) => void;
    initialCategory?: MarketplaceCategory;
}

// Type for the VEO operation object from the service
type VeoOperation = {
    done: boolean;
    metadata?: { progressPercentage: number };
    name?: string;
    response?: { generatedVideos?: { video?: { uri: string } }[] };
};

const initialFormState = {
    title: '',
    category: 'Investments' as MarketplaceCategory,
    location: '',
    amount: 0,
    summary: '',
    description: '',
    keyMetrics: [{ label: '', value: '' }],
    // Job details
    jobResponsibilities: '',
    jobQualifications: '',
    salaryRange: '',
    // Event details
    eventStartDate: '',
    eventEndDate: '',
    eventFormat: 'Online' as 'Online' | 'In-Person',
    // Course details
    courseInstructor: '',
    courseDuration: '',
    courseOutcomes: [''],
    // Fundraising details
    fundraisingTarget: 0,
    fundraisingEquity: '',
    fundraisingStage: '',
};


export const CreateListingModal: React.FC<CreateListingModalProps> = ({ userProfile, isOpen, onClose, onAddListing, initialCategory }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [formState, setFormState] = useState({ ...initialFormState, category: initialCategory || 'Investments' });
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
    const [documents, setDocuments] = useState<File[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const { t } = useTranslation();

    // AI Video Generation State
    const [videoPrompt, setVideoPrompt] = useState('');
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoStatus, setVideoStatus] = useState('');
    const [videoError, setVideoError] = useState<string | null>(null);

    const [plan, setPlan] = useState<'daily' | 'monthly'>('monthly');
    const [boost, setBoost] = useState(false);
    
    const baseCost = plan === 'daily' ? 5 : 125;
    const boostCost = boost ? (plan === 'daily' ? 5 : 125) : 0;
    const totalCost = baseCost + boostCost;

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens, using the provided initial category
            setFormState({ ...initialFormState, category: initialCategory || 'Investments' });
            setDocuments([]);
            setMediaFiles([]);
            setSubmissionStatus('idle');
            setPlan('monthly');
            setBoost(false);
            setVideoPrompt('');
            setIsGeneratingVideo(false);
            setVideoStatus('');
            setVideoError(null);
        }
    }, [isOpen, initialCategory]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleAddMetric = () => {
        setFormState(prev => ({ ...prev, keyMetrics: [...prev.keyMetrics, { label: '', value: '' }] }));
    };
    
    const handleRemoveMetric = (index: number) => {
        setFormState(prev => ({ ...prev, keyMetrics: prev.keyMetrics.filter((_, i) => i !== index) }));
    };

    const handleMetricChange = (index: number, field: 'label' | 'value', value: string) => {
        const newMetrics = [...formState.keyMetrics];
        newMetrics[index][field] = value;
        setFormState(prev => ({ ...prev, keyMetrics: newMetrics }));
    };

    const handleOutcomeChange = (index: number, value: string) => {
        const newOutcomes = [...formState.courseOutcomes];
        newOutcomes[index] = value;
        setFormState(prev => ({ ...prev, courseOutcomes: newOutcomes }));
    };

    const addOutcome = () => setFormState(prev => ({ ...prev, courseOutcomes: [...prev.courseOutcomes, ''] }));
    const removeOutcome = (index: number) => setFormState(prev => ({ ...prev, courseOutcomes: prev.courseOutcomes.filter((_, i) => i !== index) }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prev => ({ ...prev, [id]: value }));
    };
    
    const onDropDocuments = useCallback((acceptedFiles: FileList | null) => {
        if (acceptedFiles) {
            setDocuments(prev => [...prev, ...Array.from(acceptedFiles)]);
        }
    }, []);
    
    const removeDocument = (fileToRemove: File) => {
        setDocuments(prev => prev.filter(file => file !== fileToRemove));
    };

    const onDropMedia = useCallback((acceptedFiles: FileList | null) => {
        if (acceptedFiles) {
            const validFiles = Array.from(acceptedFiles).filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
            setMediaFiles(prev => [...prev, ...validFiles]);
        }
    }, []);
    
    const removeMedia = (fileToRemove: File) => {
        setMediaFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleGenerateVideo = async () => {
        if (!videoPrompt) return;
        setIsGeneratingVideo(true);
        setVideoError(null);
        setVideoStatus(t('aiStudioVideoStatusRequest'));
    
        try {
            let operation: VeoOperation = await generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: videoPrompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9',
                }
            });
            setVideoStatus(t('aiStudioVideoStatusStarted'));
    
            while (operation && !operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await getVideosOperation({ operation });
                if (operation.metadata?.progressPercentage) {
                    setVideoStatus(t('aiStudioVideoStatusPolling', { progress: operation.metadata.progressPercentage }));
                }
            }
    
            if (operation?.response) {
                const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (videoUri) {
                    setVideoStatus('Downloading video...');
                    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                    if (!response.ok) {
                        throw new Error(`Failed to download video: ${response.statusText}`);
                    }
                    const videoBlob = await response.blob();
                    const videoFile = new File([videoBlob], `ai_generated_${Date.now()}.mp4`, { type: 'video/mp4' });
                    setMediaFiles(prev => [...prev, videoFile]);
                    setVideoStatus(t('aiStudioVideoStatusComplete'));
                    setVideoPrompt('');
                } else {
                    throw new Error('Video generation finished but no URL was returned.');
                }
            } else {
                 throw new Error('Video generation failed or returned no response.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('aiStudioVideoError');
            setVideoError(errorMessage);
            console.error(error);
        } finally {
            setIsGeneratingVideo(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionStatus('submitting');
        
        // Simulate API call and AI pre-screen
        setTimeout(() => {
            const newListingData: Omit<MarketplaceListing, 'id' | 'submittedAt' | 'status' | 'aiRiskScore' | 'aiFlags'> = {
                title: { originalLang: userProfile.locale.code, originalText: formState.title },
                category: formState.category,
                location: formState.location,
                summary: { originalLang: userProfile.locale.code, originalText: formState.summary },
                media: mediaFiles.map(file => ({
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    url: URL.createObjectURL(file), // Use object URL for immediate display
                    name: file.name
                })),
                amount: Number(formState.amount),
                currency: 'USD',
                documents: documents.map(doc => ({ name: doc.name, url: '#' })), // Mock URL
                details: {
                    description: { originalLang: userProfile.locale.code, originalText: formState.description },
                    keyMetrics: formState.keyMetrics,
                    ...(formState.category === 'C-level Jobs' && {
                        jobDetails: {
                            responsibilities: formState.jobResponsibilities,
                            qualifications: formState.jobQualifications,
                            salaryRange: formState.salaryRange,
                        }
                    }),
                    ...(formState.category === 'Events' && {
                        eventDetails: {
                            startDate: formState.eventStartDate,
                            endDate: formState.eventEndDate,
                            format: formState.eventFormat,
                        }
                    }),
                    ...(formState.category === 'Courses' && {
                        courseDetails: {
                            instructor: formState.courseInstructor,
                            duration: formState.courseDuration,
                            outcomes: formState.courseOutcomes.filter(o => o.trim() !== ''),
                        }
                    }),
                    ...(formState.category === 'Fundraising' && {
                        fundraisingDetails: {
                            targetAmount: formState.fundraisingTarget,
                            equityOffered: formState.fundraisingEquity,
                            stage: formState.fundraisingStage,
                        }
                    }),
                },
                submittedBy: userProfile.fullName,
                sponsorshipDetails: {
                    plan,
                    boost,
                    cost: totalCost,
                }
            };
            onAddListing(newListingData);
            setSubmissionStatus('submitted');
            setTimeout(triggerClose, 2000); // Close modal after success message
        }, 1500);
    };
    
    if (!isOpen) return null;
    
    const renderCategorySpecificFields = () => {
        switch(formState.category) {
            case 'C-level Jobs':
                return (
                    <div className="space-y-4 pt-4 border-t border-slate-700">
                        <h3 className="text-md font-semibold text-white">Job Details</h3>
                        <div>
                            <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-300 mb-1">Salary Range (Annual)</label>
                            <input type="text" id="salaryRange" value={formState.salaryRange} onChange={handleChange} placeholder="e.g., $250,000 - $350,000" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="jobResponsibilities" className="block text-sm font-medium text-slate-300 mb-1">Key Responsibilities</label>
                            <textarea id="jobResponsibilities" rows={4} value={formState.jobResponsibilities} onChange={handleChange} placeholder="List the main responsibilities..." className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
                        </div>
                        <div>
                            <label htmlFor="jobQualifications" className="block text-sm font-medium text-slate-300 mb-1">Qualifications</label>
                            <textarea id="jobQualifications" rows={4} value={formState.jobQualifications} onChange={handleChange} placeholder="List required qualifications and experience..." className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
                        </div>
                    </div>
                );
            case 'Events':
                return (
                     <div className="space-y-4 pt-4 border-t border-slate-700">
                        <h3 className="text-md font-semibold text-white">Event Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="eventStartDate" className="block text-sm font-medium text-slate-300 mb-1">Start Date & Time</label>
                                <input type="datetime-local" id="eventStartDate" value={formState.eventStartDate} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="eventEndDate" className="block text-sm font-medium text-slate-300 mb-1">End Date & Time</label>
                                <input type="datetime-local" id="eventEndDate" value={formState.eventEndDate} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="eventFormat" className="block text-sm font-medium text-slate-300 mb-1">Format</label>
                             <select id="eventFormat" value={formState.eventFormat} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                <option value="Online">Online</option>
                                <option value="In-Person">In-Person</option>
                            </select>
                        </div>
                    </div>
                );
            case 'Courses':
                 return (
                     <div className="space-y-4 pt-4 border-t border-slate-700">
                        <h3 className="text-md font-semibold text-white">Course Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="courseInstructor" className="block text-sm font-medium text-slate-300 mb-1">Instructor</label>
                                <input type="text" id="courseInstructor" value={formState.courseInstructor} onChange={handleChange} placeholder="e.g., Prof. Jane Doe" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                            <div>
                                <label htmlFor="courseDuration" className="block text-sm font-medium text-slate-300 mb-1">Duration</label>
                                <input type="text" id="courseDuration" value={formState.courseDuration} onChange={handleChange} placeholder="e.g., 6 Weeks, 20 Hours" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Learning Outcomes</label>
                            <div className="space-y-2">
                                {formState.courseOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={outcome} onChange={(e) => handleOutcomeChange(index, e.target.value)} placeholder={`Outcome #${index + 1}`} className="flex-grow bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                        <button type="button" onClick={() => removeOutcome(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addOutcome} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><PlusCircle size={14}/> Add Outcome</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    const renderContent = () => {
        if (submissionStatus === 'submitting') {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Loader className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white">{t('submittingAI')}</h3>
                    <p className="text-slate-400">{t('submittingAIDesc')}</p>
                </div>
            );
        }
        if (submissionStatus === 'submitted') {
            return (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-xl font-bold text-white">{t('submittedSuccess')}</h3>
                    <p className="text-slate-400">{t('submittedSuccessDesc')}</p>
                </div>
            );
        }
        
        return (
            <>
                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    {/* Basic Info */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">{t('listingTitleLabel')}</label>
                        <input type="text" id="title" value={formState.title} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">{t('categoryLabel')}</label>
                            <div className="relative">
                                <select id="category" value={formState.category} onChange={handleChange} className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <ChevronsUpDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">{t('valuationLabel')}</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input type="number" id="amount" value={formState.amount} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1">{t('locationLabel')}</label>
                        <input type="text" id="location" value={formState.location} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-slate-300 mb-1">{t('summaryLabel')}</label>
                        <textarea id="summary" rows={3} value={formState.summary} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">{t('fullDescriptionLabel')}</label>
                        <textarea id="description" rows={5} value={formState.description} onChange={handleChange} required className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
                    </div>

                    {renderCategorySpecificFields()}

                    {/* Media Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t('mediaLabel')}</label>
                        <div 
                            onDragOver={(e) => e.preventDefault()} 
                            onDrop={(e) => { e.preventDefault(); onDropMedia(e.dataTransfer.files); }}
                            className="flex flex-col items-center justify-center w-full p-6 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50"
                        >
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('uploadMediaPrompt')}</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">{t('mediaFormats')}</p>
                            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onDropMedia(e.target.files)} />
                        </div>
                        {mediaFiles.length > 0 &&
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                 {mediaFiles.map((file, i) => (
                                     <div key={i} className="relative aspect-video bg-slate-700 rounded-md overflow-hidden">
                                        {file.type.startsWith('image/') ? (
                                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
                                                <Video className="w-6 h-6 mb-1" />
                                                <span className="text-xs text-center truncate">{file.name}</span>
                                            </div>
                                        )}
                                        <button type="button" onClick={() => removeMedia(file)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"><Trash2 size={12} /></button>
                                     </div>
                                 ))}
                            </div>
                        }
                         {/* AI Video Generation */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('aiStudioVideoTitle')}</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="text" 
                                    value={videoPrompt}
                                    onChange={e => setVideoPrompt(e.target.value)}
                                    placeholder={t('aiStudioVideoPlaceholder')} 
                                    className="flex-grow bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" 
                                    disabled={isGeneratingVideo}
                                />
                                <button 
                                    type="button"
                                    onClick={handleGenerateVideo} 
                                    disabled={isGeneratingVideo || !videoPrompt} 
                                    className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 w-full sm:w-auto flex-shrink-0"
                                >
                                    {isGeneratingVideo ? t('aiStudioGenerating') : t('aiStudioGenerate')}
                                </button>
                            </div>
                            {videoError && <p className="text-red-400 text-sm mt-2">{videoError}</p>}
                            {(videoStatus) && <p className="text-cyan-300 text-sm mt-2">{videoStatus}</p>}
                            {isGeneratingVideo && <div className="mt-2 text-center"><Loader className="h-6 w-6 animate-spin mx-auto" /></div>}
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">{t('documentsLabel')}</label>
                        <div 
                            onDragOver={(e) => e.preventDefault()} 
                            onDrop={(e) => { e.preventDefault(); onDropDocuments(e.dataTransfer.files); }}
                            className="flex flex-col items-center justify-center w-full p-6 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50"
                        >
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('uploadDocsPrompt')}</span> or drag and drop</p>
                            <input type="file" multiple className="hidden" onChange={(e) => onDropDocuments(e.target.files)} />
                        </div>
                        {documents.length > 0 &&
                            <div className="mt-2 space-y-2">
                                 {documents.map((file, i) => (
                                     <div key={i} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md text-sm">
                                         <div className="flex items-center gap-2 truncate">
                                              <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                              <span className="text-slate-300 truncate">{file.name}</span>
                                         </div>
                                         <button type="button" onClick={() => removeDocument(file)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                                     </div>
                                 ))}
                            </div>
                        }
                    </div>

                    {/* Key Metrics */}
                     <div>
                        <h3 className="text-md font-semibold text-white mb-2">{t('keyMetricsLabel')}</h3>
                        <div className="space-y-2">
                            {formState.keyMetrics.map((metric, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder={t('metricLabelPlaceholder')} value={metric.label} onChange={(e) => handleMetricChange(index, 'label', e.target.value)} className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    <input type="text" placeholder={t('metricValuePlaceholder')} value={metric.value} onChange={(e) => handleMetricChange(index, 'value', e.target.value)} className="flex-grow bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none" />
                                    <button type="button" onClick={() => handleRemoveMetric(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddMetric} className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><PlusCircle size={14}/> {t('addMetric')}</button>
                    </div>

                    {/* Pricing */}
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2"><BadgePercent size={18}/> {t('listingOptionsTitle')}</h3>
                        <div className="space-y-3">
                            <fieldset className="grid grid-cols-2 gap-3">
                                <legend className="sr-only">Sponsorship Plan</legend>
                                <div>
                                    <input type="radio" id="plan-daily" name="plan" value="daily" checked={plan === 'daily'} onChange={() => setPlan('daily')} className="sr-only" />
                                    <label htmlFor="plan-daily" className={`block p-3 text-center rounded-lg border-2 cursor-pointer ${plan === 'daily' ? 'border-transparent bg-gradient-to-r from-brand-violet to-brand-cyan' : 'bg-slate-800 border-slate-700'}`}>
                                        <span className="font-bold text-white">Daily</span>
                                        <span className="block text-xs text-slate-400">$5 / day</span>
                                    </label>
                                </div>
                                <div>
                                    <input type="radio" id="plan-monthly" name="plan" value="monthly" checked={plan === 'monthly'} onChange={() => setPlan('monthly')} className="sr-only" />
                                    <label htmlFor="plan-monthly" className={`block p-3 text-center rounded-lg border-2 cursor-pointer ${plan === 'monthly' ? 'border-transparent bg-gradient-to-r from-brand-violet to-brand-cyan' : 'bg-slate-800 border-slate-700'}`}>
                                        <span className="font-bold text-white">Monthly</span>
                                        <span className="block text-xs text-slate-400">$125 / month</span>
                                    </label>
                                </div>
                            </fieldset>
                            <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
                                <div>
                                    <span className="text-white font-semibold">{t('boostListing')}</span>
                                    <p className="text-xs text-slate-400">Additional +${plan === 'daily' ? '5 / day' : '125 / month'}</p>
                                </div>
                                <input type="checkbox" checked={boost} onChange={e => setBoost(e.target.checked)} className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600" />
                            </label>
                        </div>
                    </div>

                </div>

                <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
                    <div>
                        <span className="text-sm text-slate-400">{t('totalCostLabel')} </span>
                        <span className="text-xl font-bold text-cyan-400">${totalCost}</span>
                        <span className="text-sm text-slate-400">/{plan === 'daily' ? 'day' : 'month'}</span>
                    </div>
                    <button 
                        type="submit"
                        className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-300"
                    >
                        {t('submitAndPay', { totalCost })}
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <form 
                onSubmit={handleSubmit}
                className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><PlusCircle className="text-cyan-400"/> {t('createListingTitle')}</h2>
                    <button type="button" onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                {renderContent()}
            </form>
        </div>
    );
};