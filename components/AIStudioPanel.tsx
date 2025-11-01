import React, { useState, useEffect, useRef } from 'react';
import { Bot, Image as ImageIcon, Video, Search, Loader, Download, ExternalLink, FileSignature, UploadCloud, X, FilePenLine, Copy, Settings, ChevronsUpDown, CheckCircle, FileAudio, Trash2, Eye, RotateCcw, Briefcase } from 'lucide-react';
import { generateImageWithImagen, editImageWithGemini, generateVideos, getVideosOperation, searchWebWithGemini, rewriteTextWithGemini, suggestPostIdeasWithGemini, generatePostContentWithGemini, transcribeAudioWithGemini } from '../../services/geminiService';
import type { UserProfile, PostType, TranscriptionSettings, TranscriptionResult, TranscriptionHistoryItem } from '../../types';
import { useTranslation } from '../../i18n';
import { SUPPORTED_LOCALES } from '../../constants';
import { ConfirmationModal } from './common/ConfirmationModal';
import { Tooltip } from './common/Tooltip';

interface AIStudioPanelProps {
    userProfile: UserProfile;
    onLaunchBusinessSuite: () => void;
}

const AITool: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <div className="flex items-start gap-4">
            <div className="text-cyan-400 mt-1">{icon}</div>
            <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-400 mt-1 mb-4">{description}</p>
            </div>
        </div>
        <div className="mt-2">{children}</div>
    </div>
);

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

const TRANSCRIPTION_SETTINGS_KEY = 'evolve_transcription_settings';
const TRANSCRIPTION_HISTORY_KEY = 'evolve_transcription_history';
const SUPPORTED_MIME_TYPES = ['audio/', 'video/'];

export const AIStudioPanel: React.FC<AIStudioPanelProps> = ({ userProfile, onLaunchBusinessSuite }) => {
    const { t } = useTranslation();
    
    // Unified Media Generation State
    const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image');
    const [mediaPrompt, setMediaPrompt] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResult, setGenerationResult] = useState<{ type: 'image' | 'video'; url: string; text?: string; } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState('');

    // Video-specific settings
    const [videoModel, setVideoModel] = useState<'fast' | 'hq'>('fast');
    const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
    const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
    
    // Research State
    const [researchPrompt, setResearchPrompt] = useState('');
    const [isResearching, setIsResearching] = useState(false);
    const [researchResult, setResearchResult] = useState<{ text: string, sources: any[] } | null>(null);
    const [researchError, setResearchError] = useState<string | null>(null);

    // Rewrite State
    const [rewriteInput, setRewriteInput] = useState('');
    const [rewriteTone, setRewriteTone] = useState<'Formal' | 'Casual' | 'Persuasive'>('Formal');
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenText, setRewrittenText] = useState<string | null>(null);
    const [rewriteError, setRewriteError] = useState<string | null>(null);

    // Post Ideas State
    const [postIdeas, setPostIdeas] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [generatedPost, setGeneratedPost] = useState<{ postText: string; suggestedMediaType: PostType | 'text' } | null>(null);
    const [isGeneratingPost, setIsGeneratingPost] = useState(false);
    const [postGenerationError, setPostGenerationError] = useState<string | null>(null);
    const [postTypeOption, setPostTypeOption] = useState<PostType | 'text'>('text');
    
    // Transcription State
    const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [transcriptionSettings, setTranscriptionSettings] = useState<TranscriptionSettings>({
        language: userProfile.locale.code,
        addPunctuation: true,
        summarize: false,
    });
    const [showTranscriptionSettings, setShowTranscriptionSettings] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionHistoryItem[]>([]);
    const [historyItemToDelete, setHistoryItemToDelete] = useState<TranscriptionHistoryItem | null>(null);


    // Type for the operation object
    type VeoOperation = {
        done: boolean;
        metadata?: { progressPercentage: number };
        name?: string;
        response?: { generatedVideos?: { video?: { uri: string } }[] };
    };

    // Effect for loading settings & history from localStorage
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(TRANSCRIPTION_SETTINGS_KEY);
            if (savedSettings) setTranscriptionSettings(JSON.parse(savedSettings));

            const savedHistory = localStorage.getItem(TRANSCRIPTION_HISTORY_KEY);
            if (savedHistory) setTranscriptionHistory(JSON.parse(savedHistory));
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    // Effect for saving history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(TRANSCRIPTION_HISTORY_KEY, JSON.stringify(transcriptionHistory));
        } catch (error) {
            console.error("Failed to save transcription history to localStorage", error);
        }
    }, [transcriptionHistory]);

    // Effect for handling uploaded file preview
    useEffect(() => {
        if (!mediaFile) {
            setMediaFilePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(mediaFile);
        setMediaFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [mediaFile]);
    
    // Effect for cleaning up the generated media URL
    useEffect(() => {
        return () => {
            if (generationResult?.url) {
                URL.revokeObjectURL(generationResult.url);
            }
        };
    }, [generationResult]);
    
    const handleModeChange = (mode: 'image' | 'video') => {
        setMediaMode(mode);
        // Reset results when switching modes
        setGenerationResult(null);
        setGenerationError(null);
        setGenerationStatus('');
    };

    const handleGenerateMedia = async () => {
        if (!mediaPrompt && !mediaFile) return;
        setIsGenerating(true);
        setGenerationResult(null);
        setGenerationError(null);
        setGenerationStatus('');
        setIsApiKeyMissing(false);

        if (mediaMode === 'image') {
            try {
                if (mediaFile) { // Edit image mode
                    const base64 = await blobToBase64(mediaFile);
                    const result = await editImageWithGemini(base64, mediaFile.type, mediaPrompt);
                    if (result.imageBase64 && result.imageMimeType) {
                        setGenerationResult({ type: 'image', url: `data:${result.imageMimeType};base64,${result.imageBase64}`, text: result.text });
                    }
                } else { // Generate image mode
                    const base64Image = await generateImageWithImagen(mediaPrompt);
                    setGenerationResult({ type: 'image', url: `data:image/png;base64,${base64Image}` });
                }
            } catch (error) {
                setGenerationError(t('aiStudioImageError'));
                console.error(error);
            } finally {
                setIsGenerating(false);
            }
        } else { // Video mode
             // Veo API key check
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setIsApiKeyMissing(true);
                setIsGenerating(false);
                setGenerationError('Please select an API key to generate videos.');
                return;
            }

            setGenerationStatus(t('aiStudioVideoStatusRequest'));
            try {
                let imagePayload;
                if (mediaFile) {
                    const base64 = await blobToBase64(mediaFile);
                    imagePayload = { imageBytes: base64, mimeType: mediaFile.type };
                }
        
                const model = 'veo-3.1-fast-generate-preview';
        
                let operation: VeoOperation = await generateVideos({
                    model,
                    prompt: mediaPrompt,
                    image: imagePayload,
                    config: { numberOfVideos: 1, resolution: videoResolution, aspectRatio: videoAspectRatio }
                });
                setGenerationStatus(t('aiStudioVideoStatusStarted'));
        
                while (operation && !operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    try {
                        operation = await getVideosOperation({ operation });
                        const progress = operation.metadata?.progressPercentage;
                        setGenerationStatus(t('aiStudioVideoStatusPolling', { progress: progress ? `${Math.round(progress)}` : '...' }));
                    } catch (pollError) {
                        if (pollError instanceof Error && pollError.message === "API_KEY_NOT_FOUND") {
                            setIsApiKeyMissing(true);
                            throw pollError; // rethrow to be caught by outer catch
                        }
                        console.error("Polling error:", pollError);
                        break;
                    }
                }
                
                const videoUri = operation?.response?.generatedVideos?.[0]?.video?.uri;
                if (videoUri) {
                    setGenerationStatus('Downloading video...');
                    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
                    
                    const videoBlob = await response.blob();
                    const objectUrl = URL.createObjectURL(videoBlob);
                    setGenerationResult({ type: 'video', url: objectUrl });
                    setGenerationStatus(t('aiStudioVideoStatusComplete'));
                } else {
                     throw new Error('Video generation failed or returned no response.');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('aiStudioVideoError');
                 if (errorMessage === "API_KEY_NOT_FOUND") {
                    setGenerationError('Your API key is invalid or not found. Please select a valid key.');
                    setIsApiKeyMissing(true);
                } else {
                    setGenerationError(errorMessage);
                }
                setGenerationStatus('');
                console.error(error);
            } finally {
                setIsGenerating(false);
            }
        }
    };
    
    const handleSelectApiKey = async () => {
        await (window as any).aistudio.openSelectKey();
        setIsApiKeyMissing(false);
        setGenerationError(null);
    };
    
    const handleSaveTranscriptionSettings = () => {
        localStorage.setItem(TRANSCRIPTION_SETTINGS_KEY, JSON.stringify(transcriptionSettings));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
    };

    const handleResearch = async () => {
        if (!researchPrompt) return;
        setIsResearching(true);
        setResearchResult(null);
        setResearchError(null);
        try {
            const result = await searchWebWithGemini(researchPrompt);
            setResearchResult(result);
        } catch (error) {
            setResearchError(t('aiStudioResearchError'));
        } finally {
            setIsResearching(false);
        }
    };

    const handleRewriteText = async () => {
        if (!rewriteInput) return;
        setIsRewriting(true);
        setRewrittenText(null);
        setRewriteError(null);
        try {
            const result = await rewriteTextWithGemini(rewriteInput, rewriteTone);
            setRewrittenText(result);
        } catch (error) {
            setRewriteError(t('aiStudioRewriteError'));
        } finally {
            setIsRewriting(false);
        }
    };

    const handleSuggestPosts = async () => {
        setIsSuggesting(true);
        setPostIdeas([]);
        setSuggestionError(null);
        try {
            const ideas = await suggestPostIdeasWithGemini(userProfile);
            setPostIdeas(ideas);
        } catch (error) {
            setSuggestionError(t('aiSuggestionsError'));
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleGeneratePost = async () => {
        if (!selectedTopic) return;
        setIsGeneratingPost(true);
        setGeneratedPost(null);
        setPostGenerationError(null);
        try {
            const post = await generatePostContentWithGemini(selectedTopic, userProfile, { postType: postTypeOption });
            setGeneratedPost(post);
        } catch (error) {
            setPostGenerationError(t('aiStudioRewriteError')); // Reusing translation key
        } finally {
            setIsGeneratingPost(false);
        }
    };

    const validateFile = (file: File) => {
        if (SUPPORTED_MIME_TYPES.some(type => file.type.startsWith(type))) {
            setTranscriptionFile(file);
            setTranscriptionError(null);
        } else {
            setTranscriptionFile(null);
            setTranscriptionError(t('aiStudioInvalidFileType'));
        }
    };
    
    const handleTranscribe = async () => {
        if (!transcriptionFile) return;
        setIsTranscribing(true);
        setTranscriptionResult(null);
        setTranscriptionError(null);
        try {
            const result = await transcribeAudioWithGemini(transcriptionFile, transcriptionSettings);
            setTranscriptionResult(result);
            // Add to history
            const newHistoryItem: TranscriptionHistoryItem = {
                id: Date.now(),
                filename: transcriptionFile.name,
                timestamp: new Date().toISOString(),
                result,
                settings: transcriptionSettings,
            };
            setTranscriptionHistory(prev => [newHistoryItem, ...prev]);
            setTranscriptionFile(null); // Clear file after successful transcription
        } catch (error) {
            setTranscriptionError(t('aiStudioTranscriptionError'));
            console.error(error);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleViewHistoryItem = (item: TranscriptionHistoryItem) => {
        setTranscriptionResult(item.result);
        // scroll to top of panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadHistoryItem = (item: TranscriptionHistoryItem) => {
        let content = `Transcription for: ${item.filename}\n`;
        content += `Date: ${new Date(item.timestamp).toLocaleString()}\n`;
        content += `Language: ${item.settings.language}\n\n`;
        content += `--- TRANSCRIPTION ---\n${item.result.transcription}\n\n`;
        if (item.result.summary) {
            content += `--- SUMMARY ---\n${item.result.summary}\n`;
        }
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.filename.split('.')[0]}_transcription.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteHistoryItem = (item: TranscriptionHistoryItem) => {
        setHistoryItemToDelete(item);
    };
    
    const confirmDeleteHistoryItem = () => {
        if (!historyItemToDelete) return;
        setTranscriptionHistory(prev => prev.filter(item => item.id !== historyItemToDelete.id));
        setHistoryItemToDelete(null);
    };


    if (userProfile.tier === 'Standard') {
        return (
            <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-slate-700">
                <Bot size={48} className="mx-auto text-cyan-400 mb-4" />
                <h3 className="text-2xl font-bold text-white">{t('aiStudioUnlockTitle')}</h3>
                <p className="text-slate-300 mt-2 max-w-md mx-auto">
                    {t('aiStudioUnlockDesc')}
                </p>
                <button className="mt-6 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700">
                    Choose
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3"><Bot /> {t('aiStudio')}</h2>
                <p className="text-slate-400 mt-2">{t('aiStudioSubtitle')}</p>
            </div>

            <AITool icon={<Briefcase size={24} />} title={t('businessSuiteTitle')} description={t('businessSuiteDescription')}>
                <button onClick={onLaunchBusinessSuite} className="w-full sm:w-auto px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">
                    {t('launchSuite')}
                </button>
            </AITool>

            {/* Post Ideas */}
            <AITool icon={<FileSignature size={24} />} title={t('postIdeasTitle')} description={t('postIdeasDescription')}>
                <button onClick={handleSuggestPosts} disabled={isSuggesting} className="w-full sm:w-auto px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700">
                    {isSuggesting ? t('generating') : t('getPostSuggestions')}
                </button>
                {suggestionError && <p className="text-red-400 mt-2">{suggestionError}</p>}
                {isSuggesting && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /></div>}
                {postIdeas.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-slate-300 mb-2">{t('suggestionsForYou')}:</h4>
                        <div className="flex flex-wrap gap-2">
                            {postIdeas.map((idea, index) => (
                                <button key={index} onClick={() => setSelectedTopic(idea)} className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                    {idea}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {/* AI Post Assistant */}
                {(selectedTopic || generatedPost) && (
                    <div className="mt-6 pt-4 border-t border-slate-700">
                        <h4 className="font-semibold text-slate-300 mb-2">{t('aiPostAssistant')}</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="text" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} placeholder={t('enterTopic')} className="flex-grow bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                            <button onClick={handleGeneratePost} disabled={isGeneratingPost || !selectedTopic} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 w-full sm:w-auto">
                                {isGeneratingPost ? t('generating') : t('generatePostBtn')}
                            </button>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                             <span className="text-sm font-semibold text-slate-300">Post Type:</span>
                             {(['text', 'image', 'video'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setPostTypeOption(type)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                                        postTypeOption === type
                                            ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white'
                                            : 'bg-surface-input text-text-primary hover:bg-surface-card'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {postGenerationError && <p className="text-red-400 mt-2">{postGenerationError}</p>}
                        {isGeneratingPost && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /></div>}
                        {generatedPost && (
                            <div className="mt-4 bg-slate-900/50 p-4 rounded-lg">
                                <h4 className="font-semibold text-slate-400 mb-2">{t('aiGeneratedPost')}</h4>
                                <div className="relative">
                                    <textarea readOnly value={generatedPost.postText} className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-300 whitespace-pre-wrap resize-none" />
                                    <button onClick={() => navigator.clipboard.writeText(generatedPost.postText)} className="absolute top-2 right-2 p-1.5 text-slate-400 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white"><Copy size={16}/></button>
                                </div>
                                <p className="text-sm mt-2 text-slate-400">{t('suggestedMedia')}: <span className="font-semibold text-cyan-300 capitalize">{generatedPost.suggestedMediaType}</span></p>
                            </div>
                        )}
                    </div>
                )}
            </AITool>

             {/* Unified Image/Video Generation */}
            <AITool icon={<ImageIcon size={24} />} title={t('aiStudioMediaTitle')} description={t('aiStudioMediaDesc')}>
                <div className="mb-4">
                    <fieldset className="flex items-center gap-2 p-1 bg-surface-input/50 rounded-full w-min">
                        <legend className="sr-only">Select Media Type</legend>
                        <button onClick={() => handleModeChange('image')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mediaMode === 'image' ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white' : 'text-text-primary hover:bg-surface-elevated/50'}`}>{t('aiStudioModeImage')}</button>
                        <button onClick={() => handleModeChange('video')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mediaMode === 'video' ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white' : 'text-text-primary hover:bg-surface-elevated/50'}`}>{t('aiStudioModeVideo')}</button>
                    </fieldset>
                </div>
                
                {!mediaFilePreview ? (
                    <label className="mb-4 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('aiStudioImageUpload')}</span></p>
                            <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                ) : (
                    <div className="mb-4 relative w-48 h-28">
                        <img src={mediaFilePreview} alt="upload preview" className="rounded-lg object-cover w-full h-full" />
                        <button onClick={() => setMediaFile(null)} className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-1 hover:bg-red-500"><X size={14} /></button>
                    </div>
                 )}
                
                {mediaMode === 'video' && isApiKeyMissing && (
                    <div className="my-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm space-y-3">
                        <p>To generate videos with Veo, you must select an API key and enable billing for your project.</p>
                        <div className="flex items-center gap-4">
                            <button onClick={handleSelectApiKey} className="px-4 py-2 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400">
                                Select API Key
                            </button>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-200 hover:underline">
                                Learn about billing
                            </a>
                        </div>
                    </div>
                )}


                {mediaMode === 'video' && (
                    <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <label htmlFor="video-model" className="block font-semibold text-slate-300 mb-1">{t('aiStudioModel')}</label>
                            <select
                                id="video-model"
                                value={videoModel}
                                onChange={(e) => setVideoModel(e.target.value as 'fast' | 'hq')}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                <option value="fast">{t('aiStudioModelFast')}</option>
                                <option value="hq">{t('aiStudioModelHQ')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="video-aspect" className="block font-semibold text-slate-300 mb-1">{t('aiStudioAspectRatio')}</label>
                            <select
                                id="video-aspect"
                                value={videoAspectRatio}
                                onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                <option value="16:9">{t('aiStudioAspectLandscape')}</option>
                                <option value="9:16">{t('aiStudioAspectPortrait')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="video-resolution" className="block font-semibold text-slate-300 mb-1">{t('aiStudioResolution')}</label>
                            <select
                                id="video-resolution"
                                value={videoResolution}
                                onChange={(e) => setVideoResolution(e.target.value as '720p' | '1080p')}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                <option value="720p">{t('aiStudio720p')}</option>
                                <option value="1080p">{t('aiStudio1080p')}</option>
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} placeholder={
                        mediaMode === 'image'
                            ? (mediaFile ? t('aiStudioImagePlaceholderEdit') : t('aiStudioImagePlaceholderGen'))
                            : t('aiStudioVideoPlaceholder')
                    } className="flex-grow bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button onClick={handleGenerateMedia} disabled={isGenerating || (!mediaPrompt && !mediaFile)} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 w-full sm:w-auto">
                        {isGenerating ? t('aiStudioProcessing') : `${t('aiStudioGenerate')} ${mediaMode === 'image' ? t('aiStudioModeImage') : t('aiStudioModeVideo')}`}
                    </button>
                </div>
                {generationError && <p className="text-red-400 mt-2">{generationError}</p>}
                {(isGenerating || generationStatus) && !generationResult && <p className="text-cyan-300 mt-2">{generationStatus}</p>}
                {isGenerating && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /></div>}
                
                {generationResult && (
                    <div className="mt-4 space-y-4">
                        {generationResult.text && <p className="text-slate-300 italic mb-2 p-3 bg-slate-900/50 rounded-md">"{generationResult.text}"</p>}
                        {generationResult.type === 'image' && <img src={generationResult.url} alt={mediaPrompt} className="rounded-lg border border-slate-600" />}
                        {generationResult.type === 'video' && (
                            <div className="space-y-2">
                                <video src={generationResult.url} controls className="w-full rounded-lg border border-slate-600" />
                                <a href={generationResult.url} download="evolve-ai-video.mp4" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                                    <Download size={18} /> {t('aiStudioDownloadVideo')}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </AITool>

            {/* Research */}
            <AITool icon={<Search size={24} />} title={t('aiStudioResearchTitle')} description={t('aiStudioResearchDesc')}>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={researchPrompt} onChange={e => setResearchPrompt(e.target.value)} placeholder={t('aiStudioResearchPlaceholder')} className="flex-grow bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button onClick={handleResearch} disabled={isResearching || !researchPrompt} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 w-full sm:w-auto">
                        {isResearching ? t('aiStudioSearching') : t('aiStudioSearch')}
                    </button>
                </div>
                {researchError && <p className="text-red-400 mt-2">{researchError}</p>}
                {isResearching && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /></div>}
                {researchResult && (
                    <div className="mt-4 bg-slate-900/50 p-4 rounded-lg">
                        <p className="text-slate-300 whitespace-pre-wrap">{researchResult.text}</p>
                        {researchResult.sources.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-slate-400">{t('aiStudioSources')}</h4>
                                <ul className="list-disc list-inside space-y-1 mt-1">
                                    {researchResult.sources.map((source, index) => source.web && (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm truncate">
                                                {source.web.title || source.web.uri} <ExternalLink className="inline-block h-3 w-3 ml-1" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </AITool>

            {/* Text Rewriter */}
            <AITool icon={<FilePenLine size={24} />} title={t('aiStudioRewriteTitle')} description={t('aiStudioRewriteDesc')}>
                <textarea
                    value={rewriteInput}
                    onChange={e => setRewriteInput(e.target.value)}
                    placeholder={t('aiStudioRewritePlaceholder')}
                    className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y"
                />
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-300">{t('aiStudioTone')}</span>
                        {(['Formal', 'Casual', 'Persuasive'] as const).map(tone => (
                            <button
                                key={tone}
                                onClick={() => setRewriteTone(tone)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    rewriteTone === tone
                                        ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white'
                                        : 'bg-surface-input text-text-primary hover:bg-surface-card'
                                }`}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleRewriteText} disabled={isRewriting || !rewriteInput} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700 w-full sm:w-auto">
                        {isRewriting ? t('aiStudioRewriting') : t('aiStudioRewrite')}
                    </button>
                </div>
                {rewriteError && <p className="text-red-400 mt-2">{rewriteError}</p>}
                {isRewriting && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /></div>}
                {rewrittenText && (
                    <div className="mt-4 bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-400 mb-2">{t('aiStudioRewrittenText', { tone: rewriteTone })}</h4>
                        <p className="text-slate-300 whitespace-pre-wrap">{rewrittenText}</p>
                    </div>
                )}
            </AITool>

            {/* Transcription Tool */}
            <AITool icon={<FileAudio size={24} />} title={t('aiStudioTranscriptionTitle')} description={t('aiStudioTranscriptionDesc')}>
                {!transcriptionFile && !isTranscribing && !transcriptionResult ? (
                    <label 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                validateFile(e.dataTransfer.files[0]);
                            }
                        }}
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors ${isDragOver ? 'border-cyan-500 bg-slate-700/50' : ''}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('aiStudioUploadAVPrompt')}</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">{t('aiStudioUploadAVFormats')}</p>
                        </div>
                        <input type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => e.target.files && validateFile(e.target.files[0])} />
                    </label>
                ) : transcriptionFile ? (
                    <div className="p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                            <FileAudio className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                            <div className="truncate">
                                <p className="text-sm text-slate-200 font-semibold truncate">{transcriptionFile.name}</p>
                                <p className="text-xs text-slate-400">{(transcriptionFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => setTranscriptionFile(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white"><X size={16} /></button>
                    </div>
                ) : null}

                 <div className="mt-4 flex items-center justify-between gap-4">
                    <button onClick={() => setShowTranscriptionSettings(prev => !prev)} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-700 text-slate-200 rounded-full hover:bg-slate-600">
                        <Settings size={16} /> {t('aiStudioTranscriptionSettings')}
                    </button>
                    <button onClick={handleTranscribe} disabled={!transcriptionFile || isTranscribing} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 hover:bg-cyan-700">
                        {isTranscribing ? t('aiStudioTranscribing') : t('aiStudioTranscribe')}
                    </button>
                </div>

                {showTranscriptionSettings && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                        <div>
                            <label htmlFor="transcription-language" className="block text-sm font-medium text-slate-300 mb-1">{t('aiStudioTranscriptionLang')}</label>
                            <div className="relative">
                                <select id="transcription-language" value={transcriptionSettings.language} onChange={e => setTranscriptionSettings(s => ({...s, language: e.target.value}))} className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-lg py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                    {SUPPORTED_LOCALES.map(loc => <option key={loc.code} value={loc.code}>{loc.name}</option>)}
                                </select>
                                <ChevronsUpDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={transcriptionSettings.addPunctuation} onChange={e => setTranscriptionSettings(s => ({...s, addPunctuation: e.target.checked}))} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600" />
                                <span>{t('aiStudioTranscriptionPunctuation')}</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={transcriptionSettings.summarize} onChange={e => setTranscriptionSettings(s => ({...s, summarize: e.target.checked}))} className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600" />
                                <span>{t('aiStudioTranscriptionSummarize')}</span>
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSaveTranscriptionSettings} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-sm flex items-center gap-2">
                                {settingsSaved ? <><CheckCircle size={16}/> {t('aiStudioSettingsSaved')}</> : t('aiStudioSaveSettings')}
                            </button>
                        </div>
                    </div>
                )}
                
                {isTranscribing && <div className="mt-4 text-center"><Loader className="h-8 w-8 animate-spin mx-auto" /><p className="text-sm text-slate-400">{t('aiStudioTranscribing')}</p></div>}
                {transcriptionError && <p className="mt-2 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/20">{transcriptionError}</p>}
                
                {transcriptionResult && (
                    <div className="mt-4 space-y-4">
                        <button onClick={() => setTranscriptionResult(null)} className="text-sm text-cyan-400 hover:underline flex items-center gap-1"><RotateCcw size={14}/> Start New Transcription</button>
                        <div>
                            <h4 className="font-semibold text-slate-300 mb-2">{t('aiStudioTranscriptionResult')}</h4>
                            <div className="relative">
                                <textarea readOnly value={transcriptionResult.transcription} className="w-full h-60 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-300 whitespace-pre-wrap resize-y" />
                                <button onClick={() => navigator.clipboard.writeText(transcriptionResult.transcription)} className="absolute top-2 right-2 p-1.5 text-slate-400 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white"><Copy size={16}/></button>
                            </div>
                        </div>
                        {transcriptionResult.summary && (
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-2">{t('aiStudioSummaryResult')}</h4>
                                <div className="relative">
                                     <textarea readOnly value={transcriptionResult.summary} className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-300 whitespace-pre-wrap resize-y" />
                                     <button onClick={() => navigator.clipboard.writeText(transcriptionResult.summary!)} className="absolute top-2 right-2 p-1.5 text-slate-400 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white"><Copy size={16}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </AITool>

             {/* Transcription History */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">{t('aiStudioTranscriptionHistoryTitle')}</h3>
                {transcriptionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {transcriptionHistory.map(item => (
                            <div key={item.id} className="p-3 bg-slate-800 rounded-lg flex items-center justify-between gap-4">
                                <div className="truncate">
                                    <p className="text-sm text-slate-200 font-semibold truncate">{item.filename}</p>
                                    <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2">
                                    <Tooltip text={t('aiStudioHistoryView')} position="top">
                                        <button onClick={() => handleViewHistoryItem(item)} className="p-2 text-slate-300 hover:bg-slate-700 rounded-full"><Eye size={16}/></button>
                                    </Tooltip>
                                    <Tooltip text={t('aiStudioHistoryDownload')} position="top">
                                        <button onClick={() => handleDownloadHistoryItem(item)} className="p-2 text-slate-300 hover:bg-slate-700 rounded-full"><Download size={16}/></button>
                                    </Tooltip>
                                    <Tooltip text={t('aiStudioHistoryDelete')} position="top">
                                        <button onClick={() => handleDeleteHistoryItem(item)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={16}/></button>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center text-slate-500 py-4">{t('aiStudioHistoryEmpty')}</p>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!historyItemToDelete}
                onClose={() => setHistoryItemToDelete(null)}
                onConfirm={confirmDeleteHistoryItem}
                title={t('aiStudioConfirmDeleteTitle')}
                message={t('aiStudioConfirmDeleteMessage')}
                confirmText={t('delete')}
            />
        </div>
    );
};