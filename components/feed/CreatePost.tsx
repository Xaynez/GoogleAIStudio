import React, { useState, useRef, useEffect } from 'react';
import type { UserProfile, Post, PostType } from '../../types';
import { Send, Camera, Video, FileText, X, User, Trash2, CalendarClock, Hash, Mic, Loader, Paperclip, Bookmark } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { cleanupTranscriptionWithGemini } from '../../services/geminiService';
import { Tooltip } from '../common/Tooltip';

interface CreatePostProps {
  userProfile: UserProfile;
  onAddPost: (postData: { contentText: string; type: PostType; isSponsored?: boolean; mediaFiles: File[]; scheduledTime?: string; tags: string[] }) => void;
  onOpenLiveStream: () => void;
  onOpenScheduleLive: () => void;
}

// Add type definition for the non-standard SpeechRecognition API instance to resolve type errors.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

// Polyfill for SpeechRecognition and cast window to any to access non-standard properties.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;


export const CreatePost: React.FC<CreatePostProps> = ({ userProfile, onAddPost, onOpenLiveStream, onOpenScheduleLive }) => {
    const { t } = useTranslation();
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<PostType>('text');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice to text state
    const [isListening, setIsListening] = useState(false);
    const [isCleaningUpText, setIsCleaningUpText] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API is not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = userProfile.locale.code;

        recognition.onresult = async (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript.trim()) {
                setIsCleaningUpText(true);
                try {
                    const cleanedText = await cleanupTranscriptionWithGemini(finalTranscript);
                    setNewPostContent(prev => prev.trim() ? `${prev.trim()} ${cleanedText}` : cleanedText);
                } catch (e) {
                    setNewPostContent(prev => prev.trim() ? `${prev.trim()} ${finalTranscript}` : finalTranscript);
                } finally {
                    setIsCleaningUpText(false);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setIsCleaningUpText(false);
        };
        
        recognition.onend = () => {
             setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        }
    }, [userProfile.locale.code]);
    
    const handleToggleListen = () => {
        if (isCleaningUpText) return;
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setMediaFiles(prev => [...prev, ...Array.from(event.target.files!)]);
        }
    };

    const removeFile = (fileToRemove: File) => {
        const newFiles = mediaFiles.filter(file => file !== fileToRemove);
        setMediaFiles(newFiles);
        if (newFiles.length === 0) {
            setNewPostType('text');
        }
    };

    const handleCreatePost = () => {
        if (!newPostContent.trim() && mediaFiles.length === 0) return;

        const tags = (newPostContent.match(/#\w+/g) || []).map(tag => tag.substring(1));
        
        // Dynamically determine type to be more robust
        let postType: PostType = 'text';
        if (mediaFiles.length > 0) {
            const fileType = mediaFiles[0].type;
            if (fileType.startsWith('image/')) postType = 'image';
            else if (fileType.startsWith('video/')) postType = 'video';
            else postType = 'document';
        }

        onAddPost({
            contentText: newPostContent,
            type: postType,
            mediaFiles,
            tags,
        });

        // Reset form
        setNewPostContent('');
        setNewPostType('text');
        setMediaFiles([]);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSelectPostType = (type: PostType) => {
        setNewPostType(type);
        if (type === 'image' || type === 'video' || type === 'document') {
            setTimeout(() => fileInputRef.current?.click(), 0);
        }
    }

    return (
        <div className="bg-slate-900/50 p-4 rounded-2xl shadow-lg border border-slate-800">
            <div className="flex gap-4">
                <User className="h-10 w-10 p-2 bg-slate-700 rounded-full text-slate-300 flex-shrink-0" />
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`What's on your mind, ${userProfile.fullName.split(' ')[0]}?`}
                    className="w-full bg-transparent text-lg text-white focus:outline-none resize-none"
                    rows={5}
                />
            </div>

            {mediaFiles.length > 0 && (
                <div className="mt-2 ml-14 space-y-2">
                    {mediaFiles.map((file, i) => (
                        <div key={i} className="p-2 bg-slate-800 rounded-md flex items-center justify-between">
                            <p className="text-sm text-slate-300 truncate">{file.name}</p>
                            <button onClick={() => removeFile(file)} title="Remove file"><X className="h-4 w-4 text-slate-400"/></button>
                        </div>
                    ))}
                </div>
            )}
            
            {(newPostType === 'image' || newPostType === 'video' || newPostType === 'document') && (
                <div className="ml-14 mt-2">
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept={newPostType === 'image' ? 'image/*' : newPostType === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                        className="hidden"
                    />
                </div>
            )}

            <div className="mt-10 ml-14">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Media Attachments */}
                    <Tooltip text="Add Image" position="top">
                        <button onClick={() => handleSelectPostType('image')} className={`p-2 rounded-full ${newPostType === 'image' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><Camera className="h-5 w-5 text-cyan-400" /></button>
                    </Tooltip>
                    <Tooltip text="Add Video" position="top">
                        <button onClick={() => handleSelectPostType('video')} className={`p-2 rounded-full ${newPostType === 'video' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><Video className="h-5 w-5 text-cyan-400" /></button>
                    </Tooltip>
                    <Tooltip text="Add Document" position="top">
                        <button onClick={() => handleSelectPostType('document')} className={`p-2 rounded-full ${newPostType === 'document' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><Paperclip className="h-5 w-5 text-cyan-400" /></button>
                    </Tooltip>

                    {/* Live Features */}
                    <Tooltip text={t('goLive')} position="top">
                        <button onClick={onOpenLiveStream} className="p-2 rounded-full hover:bg-slate-800"><Video className="h-5 w-5 text-red-400" /></button>
                    </Tooltip>
                    <Tooltip text={t('scheduleLive')} position="top">
                        <button onClick={onOpenScheduleLive} className="p-2 rounded-full hover:bg-slate-800"><CalendarClock className="h-5 w-5 text-cyan-400" /></button>
                    </Tooltip>

                     {/* Input Tools */}
                    {SpeechRecognitionAPI && (
                        <Tooltip text="Voice to Text" position="top">
                            <button onClick={handleToggleListen} disabled={isCleaningUpText} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 animate-pulse' : 'hover:bg-slate-800'} disabled:cursor-not-allowed`}>
                                {isCleaningUpText ? (
                                    <Loader className="h-5 w-5 text-cyan-400 animate-spin" />
                                ) : (
                                    <Mic className={`h-5 w-5 ${isListening ? 'text-red-400' : 'text-cyan-400'}`} />
                                )}
                            </button>
                        </Tooltip>
                    )}
                    
                    {/* Post Actions */}
                    <Tooltip text="Save Draft" position="top">
                        <button className="p-2 rounded-full hover:bg-slate-800"><Bookmark className="h-5 w-5 text-cyan-400" /></button>
                    </Tooltip>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={handleCreatePost} disabled={!newPostContent.trim() && mediaFiles.length === 0} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-cyan-700">
                        <Send className="h-4 w-4"/> Post
                    </button>
                </div>
            </div>
        </div>
    );
};
