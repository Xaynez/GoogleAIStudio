import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UserProfile, PostType } from '../../types';
import { Send, Image as ImageIcon, Video, FileText, X, User, Trash2, Mic, Briefcase } from 'lucide-react';

// Fix: Add type definition for the non-standard SpeechRecognition API instance to resolve type errors.
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

// Fix: Polyfill for SpeechRecognition and cast window to any to access non-standard properties.
// Renamed to SpeechRecognitionAPI to avoid shadowing the SpeechRecognition type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface QuickPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onAddPost: (postData: { contentText: string; type: PostType; isSponsored?: boolean; mediaFiles: File[] }) => void;
}

export const QuickPostModal: React.FC<QuickPostModalProps> = ({ isOpen, onClose, userProfile, onAddPost }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<PostType>('text');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice to text state
    const [isListening, setIsListening] = useState(false);
    // Fix: Use the defined SpeechRecognition interface for the ref type.
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            // Reset form state
            setNewPostContent('');
            setNewPostType('text');
            setMediaFiles([]);
            setIsListening(false);
        }, 300);
    };

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API is not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = userProfile.locale.code;

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
             setNewPostContent(prev => prev + finalTranscript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
             setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        }
    }, [userProfile.locale.code]);
    
    const handleToggleListen = () => {
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
        setMediaFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const handleCreatePost = () => {
        if (!newPostContent.trim() && mediaFiles.length === 0) return;
        onAddPost({ contentText: newPostContent, type: newPostType, mediaFiles });
        triggerClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Create Post</h2>
                    <button onClick={triggerClose} className="text-slate-400 hover:text-white transition-colors rounded-full p-1">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                        <div className="ml-14 space-y-2">
                            {mediaFiles.map((file, i) => (
                                <div key={i} className="p-2 bg-slate-800 rounded-md flex items-center justify-between">
                                    <p className="text-sm text-slate-300 truncate">{file.name}</p>
                                    <button onClick={() => removeFile(file)}><X className="h-4 w-4 text-slate-400"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {(newPostType !== 'text') && (
                        <div className="ml-14">
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept={newPostType === 'image' ? 'image/*' : newPostType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx'}
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20"
                            />
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1">
                        <button onClick={() => setNewPostType('text')} title="Text Post" className={`p-2 rounded-full ${newPostType === 'text' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><Briefcase className="h-5 w-5 text-cyan-400" /></button>
                        <button onClick={() => { setNewPostType('image'); fileInputRef.current?.click(); }} title="Add Image" className={`p-2 rounded-full ${newPostType === 'image' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><ImageIcon className="h-5 w-5 text-cyan-400" /></button>
                        <button onClick={() => { setNewPostType('video'); fileInputRef.current?.click(); }} title="Add Video" className={`p-2 rounded-full ${newPostType === 'video' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><Video className="h-5 w-5 text-cyan-400" /></button>
                        <button onClick={() => { setNewPostType('document'); fileInputRef.current?.click(); }} title="Add Document" className={`p-2 rounded-full ${newPostType === 'document' ? 'bg-cyan-500/20' : 'hover:bg-slate-800'}`}><FileText className="h-5 w-5 text-cyan-400" /></button>
                        {SpeechRecognitionAPI && (
                            <button onClick={handleToggleListen} title="Voice to Text" className={`p-2 rounded-full ${isListening ? 'bg-red-500/20 animate-pulse' : 'hover:bg-slate-800'}`}>
                                <Mic className={`h-5 w-5 ${isListening ? 'text-red-400' : 'text-cyan-400'}`} />
                            </button>
                        )}
                    </div>
                    <button onClick={handleCreatePost} disabled={!newPostContent.trim() && mediaFiles.length === 0} className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-cyan-700">
                        <Send className="h-4 w-4"/> Post
                    </button>
                </div>
            </div>
        </div>
    );
};
