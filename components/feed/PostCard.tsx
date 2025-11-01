import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Post, UserProfile, Comment, FeedItem, OpportunityTeaser, ReactionType, PostAuthor, Reaction } from '../../types';
import { User, ThumbsUp, MessageSquare, Send, Video, FileText, ShieldCheck, MapPin, DollarSign, ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2, Share2, CornerUpRight, MessageCircle, Languages, Loader, BadgePercent, Bookmark, Link, Check, Hand, Heart, Lightbulb, Smile, Award, HeartHandshake, ChevronDown, X, Mic, Radio } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { TranslatedText } from '../common/TranslatedText';
import { useTranslation } from '../../i18n';
import { useTranslator } from '../../hooks/useTranslator';
import { cleanupTranscriptionWithGemini } from '../../services/geminiService';
import { Tooltip } from '../common/Tooltip';

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
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;


const REACTION_TYPES: ReactionType[] = ['like', 'applaud', 'support', 'love', 'insightful', 'funny'];
const REACTION_ICONS: Record<ReactionType, React.ReactNode> = {
    like: <ThumbsUp size={20} className="text-blue-400" />,
    applaud: <Award size={20} className="text-green-400" />,
    support: <HeartHandshake size={20} className="text-purple-400" />,
    love: <Heart size={20} className="text-red-400" />,
    insightful: <Lightbulb size={20} className="text-yellow-400" />,
    funny: <Smile size={20} className="text-orange-400" />,
};
const REACTION_COLORS: Record<ReactionType, string> = {
    like: 'text-blue-400',
    applaud: 'text-green-400',
    support: 'text-purple-400',
    love: 'text-red-400',
    insightful: 'text-yellow-400',
    funny: 'text-orange-400',
};
const REACTION_LABELS: Record<ReactionType, string> = {
    like: 'Like', applaud: 'Applaud', support: 'Support', love: 'Love', insightful: 'Insightful', funny: 'Funny'
};

const ReactionSelector: React.FC<{ onSelect: (reaction: ReactionType) => void }> = ({ onSelect }) => (
    <div className="absolute bottom-full mb-2 bg-surface-modal border border-border-subtle rounded-full shadow-lg flex items-center p-1 space-x-1 animate-scale-in origin-bottom-left z-20">
        {REACTION_TYPES.map(type => (
            <Tooltip key={type} text={REACTION_LABELS[type]} position="top">
                <button
                    onClick={(e) => { e.stopPropagation(); onSelect(type); }}
                    className="p-1.5 rounded-full hover:bg-surface-elevated transition-transform transform hover:scale-125"
                >
                    {React.cloneElement(REACTION_ICONS[type] as React.ReactElement, { size: 22 })}
                </button>
            </Tooltip>
        ))}
    </div>
);

const ReactionsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    reactions: Reaction[];
    onViewProfile: (author: PostAuthor) => void;
}> = ({ isOpen, onClose, reactions, onViewProfile }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<ReactionType | 'all'>('all');

    useEffect(() => {
        if (isOpen) setIsClosing(false);
    }, [isOpen]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const reactionCounts = reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {} as Record<ReactionType, number>);

    const filteredReactions = activeFilter === 'all'
        ? reactions
        : reactions.filter(r => r.type === activeFilter);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={triggerClose}>
            <div className={`bg-surface-modal border border-border-subtle rounded-2xl shadow-2xl w-full max-w-md flex flex-col transform transition-all duration-300 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Reactions</h2>
                    <button onClick={triggerClose} className="text-text-secondary hover:text-text-primary rounded-full p-1"><X /></button>
                </div>
                <div className="p-2 border-b border-border-subtle flex flex-wrap gap-1">
                    <button onClick={() => setActiveFilter('all')} className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 ${activeFilter === 'all' ? 'bg-brand-cyan text-text-inverted' : 'bg-surface-elevated text-text-primary'}`}>
                        All <span className="text-xs font-bold">{reactions.length}</span>
                    </button>
                    {Object.entries(reactionCounts).map(([type, count]) => (
                        <button key={type} onClick={() => setActiveFilter(type as ReactionType)} className={`px-3 py-1 rounded-full flex items-center gap-1 ${activeFilter === type ? 'bg-brand-cyan/20' : 'bg-surface-elevated'}`}>
                            {React.cloneElement(REACTION_ICONS[type as ReactionType] as React.ReactElement, { size: 16 })}
                            <span className="text-sm">{count}</span>
                        </button>
                    ))}
                </div>
                <div className="flex-grow p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                    {filteredReactions.map(({ user }, index) => (
                        <div key={`${user.id}-${index}`} onClick={() => { onViewProfile(user); triggerClose(); }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated cursor-pointer">
                            <img src={user.profileImageUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="h-10 w-10 rounded-full" />
                            <div>
                                <p className="font-bold text-text-primary">{user.name}</p>
                                <p className="text-sm text-text-secondary">{user.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface PostCardProps {
    item: FeedItem;
    currentUserProfile: UserProfile;
    onLikePost: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, commentText: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string, reaction: ReactionType) => void;
    onViewOpportunity: (teaser: OpportunityTeaser) => void;
    onAuthorClick: (author: PostAuthor) => void;
    onEndLiveStream: (postId: string) => void;
    onArchiveLiveStream: (postId: string, action: 'post' | 'discard') => void;
    onStartScheduledStream: (postId: string) => void;
    onUpdatePost: (postId: string, newContent: string) => void;
    onRepost: (originalPost: Post) => void;
    onQuotePost: (originalPost: Post) => void;
    onDeletePost: (post: Post) => void;
    onBookmarkPost: (postId: string) => void;
    onShareByMessage: () => void;
}

const CommentItem: React.FC<{
    comment: Comment;
    postId: string;
    onAddComment: PostCardProps['onAddComment'];
    onLikeComment: PostCardProps['onLikeComment'];
    onAuthorClick: PostCardProps['onAuthorClick'];
    currentUserProfile: UserProfile;
}> = ({ comment, postId, onAddComment, onLikeComment, onAuthorClick, currentUserProfile }) => {
    const { text } = useTranslator(`${comment.id}_text`, comment.text);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isCleaningUpText, setIsCleaningUpText] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [isReactionSelectorOpen, setIsReactionSelectorOpen] = useState(false);
    const reactionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reactionRef.current && !reactionRef.current.contains(event.target as Node)) {
                setIsReactionSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReactionSelect = (reaction: ReactionType) => {
        onLikeComment(postId, comment.id, reaction);
        setIsReactionSelectorOpen(false);
    };

    const totalReactions = (comment.allReactions || []).length;
    const topReactions = useMemo(() => {
        const counts = (comment.allReactions || []).reduce((acc: Record<ReactionType, number>, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {} as Record<ReactionType, number>);
        
        return Object.entries(counts)
            .sort(([, aCount], [, bCount]) => Number(bCount) - Number(aCount))
            .slice(0, 3)
            .map(([type]) => type as ReactionType);
    }, [comment.allReactions]);

    useEffect(() => {
        if (!SpeechRecognitionAPI) return;
        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentUserProfile.locale.code;
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
                    setReplyText(prev => prev.trim() ? `${prev.trim()} ${cleanedText}` : cleanedText);
                } catch (e) {
                    setReplyText(prev => prev.trim() ? `${prev.trim()} ${finalTranscript}` : finalTranscript);
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
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        return () => { recognitionRef.current?.stop(); };
    }, [currentUserProfile.locale.code]);

    const handleToggleListen = () => {
        if (isCleaningUpText) return;
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const handleReplySubmit = () => {
        if (!replyText.trim()) return;
        onAddComment(postId, replyText, comment.id);
        setReplyText('');
        setShowReplyInput(false);
    };

    return (
        <div className="flex items-start gap-2">
            <img onClick={() => onAuthorClick(comment.author)} src={comment.author.profileImageUrl || `https://i.pravatar.cc/150?u=${comment.author.id}`} alt={comment.author.name} className="h-8 w-8 rounded-full cursor-pointer mt-1" />
            <div className="flex-grow">
                <div className="bg-surface-elevated p-2 rounded-lg relative">
                    <div onClick={() => onAuthorClick(comment.author)} className="flex items-center justify-between cursor-pointer">
                        <p className="text-sm font-bold text-text-primary hover:underline">{comment.author.name}</p>
                    </div>
                    <p className="text-xs text-text-secondary">{comment.author.title}</p>
                    <div className="text-sm text-text-primary mt-1">{text}</div>
                    {totalReactions > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-surface-card px-1.5 py-0.5 rounded-full shadow flex items-center border border-border-subtle">
                            {topReactions.slice(0,2).map(type => 
                                <span key={type} className="-ml-0.5">{React.cloneElement(REACTION_ICONS[type] as React.ReactElement, { size: 14 })}</span>
                            )}
                            <span className="text-xs text-text-secondary ml-1.5">{totalReactions}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary px-2 mt-1">
                    <div className="relative" ref={reactionRef}>
                        <button 
                            onMouseEnter={() => setIsReactionSelectorOpen(true)} 
                            onMouseLeave={() => setIsReactionSelectorOpen(false)}
                            onClick={() => onLikeComment(postId, comment.id, comment.currentUserReaction || 'like')}
                            className={`hover:underline font-semibold flex items-center gap-1 ${comment.currentUserReaction ? REACTION_COLORS[comment.currentUserReaction] : ''}`}
                        >
                            {comment.currentUserReaction ? REACTION_LABELS[comment.currentUserReaction] : 'React'}
                        </button>
                        {isReactionSelectorOpen && <ReactionSelector onSelect={handleReactionSelect} />}
                    </div>
                    <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:underline">Reply</button>
                    <span>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {showReplyInput && (
                     <div className="flex gap-2 mt-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleReplySubmit()}
                            placeholder={`Reply to ${comment.author.name}...`} className="flex-grow bg-surface-input border border-border-input rounded-full py-1 px-3 text-text-primary text-sm focus:ring-1 focus:ring-brand-cyan focus:outline-none"/>
                        {SpeechRecognitionAPI && (
                            <button onClick={handleToggleListen} disabled={isCleaningUpText} title="Voice to Text" className={`p-1.5 rounded-full ${isListening ? 'bg-red-500/20 animate-pulse' : 'hover:bg-surface-elevated'} disabled:cursor-not-allowed`}>
                                {isCleaningUpText ? (
                                    <Loader className="h-4 w-4 text-brand-cyan animate-spin" />
                                ) : (
                                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-400' : 'text-link'}`} />
                                )}
                            </button>
                        )}
                        <button onClick={handleReplySubmit} className="p-1.5 rounded-full bg-brand-cyan text-text-inverted hover:bg-cyan-700"><Send className="h-4 w-4"/></button>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                        <button onClick={() => setShowReplies(!showReplies)} className="text-xs font-semibold text-link flex items-center gap-1">
                            <ChevronDown size={14} className={`transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                            {showReplies ? 'Collapse replies' : `See ${comment.replies.length} more repl${comment.replies.length > 1 ? 'ies' : 'y'}`}
                        </button>
                        {showReplies && (
                             <div className="mt-2 space-y-3 pl-4 border-l-2 border-border-subtle">
                                {comment.replies.map(reply => (
                                    <CommentItem key={reply.id} comment={reply} postId={postId} onAddComment={onAddComment} onLikeComment={onLikeComment} onAuthorClick={onAuthorClick} currentUserProfile={currentUserProfile} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const OpportunityTeaserView: React.FC<{ 
    teaser: OpportunityTeaser; 
    onViewOpportunity: (teaser: OpportunityTeaser) => void;
}> = ({ teaser, onViewOpportunity }) => {
    const { formatCurrency } = useCurrency();
    
    return (
        <div className="bg-surface-card p-4 rounded-2xl shadow-lg border-2 border-yellow-500/30 transition-all duration-300 hover:border-yellow-500/60 hover:shadow-yellow-500/10">
            <span className="text-xs font-semibold text-yellow-400">AI-Targeted Opportunity</span>
            <h3 className="text-xl font-bold text-text-primary mt-2">
                <TranslatedText contentId={`${teaser.id}_title`} content={teaser.title} as="span" showToggle />
            </h3>
            <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                <div className="flex items-center gap-1.5"><MapPin size={14} /> {teaser.location}</div>
                <div className="flex items-center gap-1.5 text-yellow-300 font-semibold"><DollarSign size={14} /> {formatCurrency(teaser.shortValuation)}</div>
            </div>
            <button onClick={() => onViewOpportunity(teaser)} className="mt-4 w-full text-center py-2.5 bg-yellow-600/80 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
                View Opportunity
            </button>
        </div>
    );
};

type PostViewProps = Omit<PostCardProps, 'item' | 'onViewOpportunity'> & {
    post: Post;
};

const PostView: React.FC<PostViewProps> = ({ post, currentUserProfile, onLikePost, onAddComment, onLikeComment, onAuthorClick, onEndLiveStream, onArchiveLiveStream, onStartScheduledStream, onUpdatePost, onRepost, onQuotePost, onDeletePost, onBookmarkPost, onShareByMessage }) => {
    const { t } = useTranslation();
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const liveVideoRef = useRef<HTMLVideoElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const [isReactionSelectorOpen, setIsReactionSelectorOpen] = useState(false);
    const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const reactionRef = useRef<HTMLDivElement>(null);

    // Voice-to-text for main comment box
    const [isListening, setIsListening] = useState(false);
    const [isCleaningUpText, setIsCleaningUpText] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // New state for live transcript
    const [liveTranscript, setLiveTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const liveRecognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) return;
        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentUserProfile.locale.code;
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
                    setCommentText(prev => prev.trim() ? `${prev.trim()} ${cleanedText}` : cleanedText);
                } catch (e) {
                    setCommentText(prev => prev.trim() ? `${prev.trim()} ${finalTranscript}` : finalTranscript);
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
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        return () => { recognitionRef.current?.stop(); };
    }, [currentUserProfile.locale.code]);

    const handleToggleListen = () => {
        if (isCleaningUpText) return;
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    
    useEffect(() => {
        setEditedContent(post.content.originalText);
    }, [post]);

    useEffect(() => {
        setCurrentMediaIndex(0);
    }, [post.id]);
    
    useEffect(() => {
        let isEffectActive = true;

        const cleanup = () => {
            if (liveRecognitionRef.current) {
                liveRecognitionRef.current.stop();
                liveRecognitionRef.current = null;
                if (isEffectActive) setIsTranscribing(false);
            }
        };

        if (post?.type === 'live' && post.isLive) {
            if (SpeechRecognitionAPI) {
                const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = currentUserProfile.locale.code;

                let fullTranscript = '';
                recognition.onresult = async (event: any) => {
                    let finalTranscriptSegment = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscriptSegment += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscriptSegment.trim()) {
                        try {
                            const cleaned = await cleanupTranscriptionWithGemini(finalTranscriptSegment);
                            fullTranscript += cleaned + ' ';
                            if (isEffectActive) setLiveTranscript(fullTranscript);
                        } catch {
                            // Fallback on error
                            fullTranscript += finalTranscriptSegment + ' ';
                            if (isEffectActive) setLiveTranscript(fullTranscript);
                        }
                    }
                };
                recognition.onend = () => { if (isEffectActive) setIsTranscribing(false); };
                recognition.onerror = (event: any) => { console.error("Live transcription error", event.error); if (isEffectActive) setIsTranscribing(false); };
                liveRecognitionRef.current = recognition;

                // This will prompt for microphone access
                try {
                    recognition.start();
                    if (isEffectActive) setIsTranscribing(true);
                } catch (err) {
                    console.error("Could not start recognition:", err);
                }
            }
        }

        return () => {
            isEffectActive = false;
            cleanup();
        };
    }, [post, currentUserProfile.locale.code]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (shareMenuRef.current && !shareMenuRef.current.contains(target)) setIsShareMenuOpen(false);
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(target)) setIsOptionsMenuOpen(false);
            if (reactionRef.current && !reactionRef.current.contains(target)) setIsReactionSelectorOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleCommentSubmit = (postId: string) => {
        if (!commentText.trim()) return;
        onAddComment(postId, commentText);
        setCommentText('');
    };
    
    const handleSaveEdit = () => {
        onUpdatePost(post.id, editedContent);
        setIsEditing(false);
    };
    
    const handleCancelEdit = () => {
        setEditedContent(post.content.originalText);
        setIsEditing(false);
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const postUrl = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(postUrl);
        setLinkCopied(true);
        setTimeout(() => {
            setLinkCopied(false);
            setIsShareMenuOpen(false);
        }, 2000);
    };

    const handleShareByMessage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShareByMessage();
        setIsShareMenuOpen(false);
    };

    const totalReactions = (post.analytics.allReactions || []).length;
    
    const topReactions = useMemo(() => {
        const counts = (post.analytics.allReactions || []).reduce((acc: Record<ReactionType, number>, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {} as Record<ReactionType, number>);
        
        return Object.entries(counts)
            .sort(([, aCount], [, bCount]) => Number(bCount) - Number(aCount))
            .slice(0, 3)
            .map(([type]) => type as ReactionType);
    }, [post.analytics.allReactions]);

    const renderPostContent = () => {
        const contentElement = (
            <div className="text-text-primary whitespace-pre-wrap">
                <TranslatedText contentId={`${post.id}_content`} content={post.content} as="span" showToggle />
            </div>
        );

        const tagsElement = post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <span key={tag} className="text-sm text-link hover:underline cursor-pointer">#{tag}</span>
                ))}
            </div>
        );
        
        const repostElement = post.repostOf && (
            <div className="mt-3 border border-border-subtle rounded-lg p-3">
                 <div className="flex items-center gap-3 cursor-pointer group">
                    <img onClick={() => onAuthorClick(post.repostOf!.author)} src={post.repostOf!.author.profileImageUrl || `https://i.pravatar.cc/150?u=${post.repostOf!.author.id}`} alt={post.repostOf!.author.name} className="h-8 w-8 rounded-full" />
                    <div>
                        <p className="font-bold text-sm text-text-primary group-hover:underline flex items-center gap-1.5">{post.repostOf.author.name} {post.repostOf.author.verified && <ShieldCheck className="h-4 w-4 text-brand-cyan" />}</p>
                        <p className="text-xs text-text-muted">{new Date(post.repostOf.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <div className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                    <TranslatedText contentId={`${post.repostOf.id}_content`} content={post.repostOf.content} />
                </div>
            </div>
        );

        if (isEditing) {
            return (
                <div className="mt-2 space-y-3">
                    <textarea 
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full bg-surface-input border border-border-input rounded-lg py-2 px-3 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none resize-y"
                        rows={5}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancelEdit} className="px-4 py-2 text-sm text-text-secondary rounded-md hover:bg-surface-elevated">Cancel</button>
                        <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-brand-cyan text-text-inverted font-semibold rounded-md hover:bg-cyan-700">Save</button>
                    </div>
                </div>
            )
        }
        
        if (post.type === 'live') {
            return (
                <div className="mt-2 space-y-3">
                    {post.content.originalText && <div>{contentElement}</div>}
                    <div className="relative group aspect-video bg-black rounded-lg border border-border-subtle flex items-center justify-center">
                        {post.isLive ? (
                            <>
                                <video ref={liveVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary bg-black/50">
                                    <Radio className="h-12 w-12 text-red-500 animate-pulse" />
                                    <p className="mt-2 font-semibold text-white">Live Stream in Progress</p>
                                    <p className="text-xs text-slate-400">(This is a visual placeholder)</p>
                                </div>
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    LIVE
                                </div>
                                {post.author.id === currentUserProfile.ssoEmail && (
                                     <button onClick={() => onEndLiveStream(post.id)} className="absolute bottom-2 right-2 px-3 py-1.5 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700 transition-colors">
                                        Stop Stream
                                     </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-text-secondary">
                                <Video className="h-10 w-10 mx-auto mb-2 opacity-50"/>
                                <p className="font-semibold">Stream Ended</p>
                            </div>
                        )}
                    </div>
                    {(isTranscribing || liveTranscript) && (
                        <div className="mt-2 p-3 bg-black/50 rounded-lg max-h-32 overflow-y-auto border border-slate-700">
                            <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                LIVE TRANSCRIPT 
                                {isTranscribing && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                            </h4>
                            <p className="text-xs text-yellow-300/80 mb-2 italic">Demonstration: Live transcription is active using your microphone's audio.</p>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{liveTranscript}</p>
                            {isTranscribing && !liveTranscript && <p className="text-sm text-slate-500 italic">Listening for audio via your microphone...</p>}
                        </div>
                    )}
                </div>
            )
        }

        const visualMedia = post.media?.filter(m => m.type === 'image' || m.type === 'video') || [];
        const documents = post.media?.filter(m => m.type === 'document') || [];

        const handlePrev = (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrentMediaIndex(prev => (prev === 0 ? visualMedia.length - 1 : prev - 1));
        };

        const handleNext = (e: React.MouseEvent) => {
            e.stopPropagation();
            setCurrentMediaIndex(prev => (prev === visualMedia.length - 1 ? 0 : prev + 1));
        };
        
        return (
            <div className="mt-2 space-y-3">
                {post.content.originalText && <div>{contentElement}</div>}
                {repostElement}
                {tagsElement}
                
                {visualMedia.length > 0 && (
                    <div className="relative group">
                        <div className="overflow-hidden rounded-lg border border-border-subtle">
                             <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}>
                                {visualMedia.map((media, index) => (
                                    <div key={index} className="w-full flex-shrink-0 aspect-video bg-black flex items-center justify-center">
                                        {media.type === 'image' ? (
                                            <img src={media.url} alt={media.name} className="max-h-96 w-full h-full object-contain" />
                                        ) : (
                                            <video src={media.url} controls className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {visualMedia.length > 1 && (
                            <>
                                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10">
                                    <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {visualMedia.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-2 rounded-full transition-all duration-300 ${index === currentMediaIndex ? 'bg-white w-4' : 'bg-white/50 w-2'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                {documents.length > 0 && (
                    <div className="space-y-2">
                        {documents.map((doc, index) => (
                             <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-surface-elevated/50 rounded-lg border border-border-subtle hover:bg-surface-elevated transition-colors">
                               <FileText className="h-8 w-8 text-brand-cyan flex-shrink-0" />
                               <div>
                                   <p className="font-semibold text-text-primary">{doc.name}</p>
                                   <p className="text-sm text-text-secondary">Click to view document</p>
                               </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <ReactionsModal 
                isOpen={isReactionsModalOpen}
                onClose={() => setIsReactionsModalOpen(false)}
                reactions={post.analytics.allReactions || []}
                onViewProfile={onAuthorClick}
            />
            <div className="bg-surface-card p-4 rounded-2xl shadow-soft border border-border-subtle">
                <div className="flex justify-between items-start">
                    <div onClick={() => onAuthorClick(post.author)} className="flex items-center gap-3 cursor-pointer group">
                        <img src={post.author.profileImageUrl || `https://i.pravatar.cc/150?u=${post.author.id}`} alt={post.author.name} className="h-10 w-10 rounded-full" />
                        <div>
                            <p className="font-bold text-text-primary group-hover:underline flex items-center gap-1.5">{post.author.name} {post.author.verified && <ShieldCheck className="h-4 w-4 text-brand-cyan" />}</p>
                            <p className="text-xs text-text-secondary">{post.author.company} · {new Date(post.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.isSponsored && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
                                <BadgePercent size={14} />
                                <span>Sponsored</span>
                            </span>
                        )}
                        {post.author.id === currentUserProfile.ssoEmail && !isEditing && (
                            <div className="relative" ref={optionsMenuRef}>
                                <Tooltip text="More options" position="left">
                                    <button onClick={() => setIsOptionsMenuOpen(prev => !prev)} className="p-1 rounded-full text-text-secondary hover:bg-surface-elevated">
                                        <MoreVertical size={18}/>
                                    </button>
                                </Tooltip>
                                 {isOptionsMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-32 bg-surface-modal border border-border-subtle rounded-md shadow-lg z-10 animate-dropdown-enter origin-top-right">
                                        <button onClick={() => { setIsEditing(true); setIsOptionsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
                                            <Edit size={14}/> Edit
                                        </button>
                                        <button onClick={() => { onDeletePost(post); setIsOptionsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surface-elevated">
                                            <Trash2 size={14}/> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {renderPostContent()}
                <div className="mt-4 flex justify-between items-center text-sm text-text-secondary">
                    {totalReactions > 0 && (
                        <button onClick={() => setIsReactionsModalOpen(true)} className="flex items-center hover:underline">
                            <div className="flex -space-x-1">
                                {topReactions.map(type => (
                                    <div key={type} className="w-5 h-5 flex items-center justify-center bg-surface-elevated rounded-full border-2 border-surface-card">
                                        {React.cloneElement(REACTION_ICONS[type] as React.ReactElement, { size: 12 })}
                                    </div>
                                ))}
                            </div>
                            <span className="ml-2">{totalReactions}</span>
                        </button>
                    )}
                     {post.analytics.comments > 0 && (
                        <button onClick={() => setIsCommentsExpanded(!isCommentsExpanded)} className="hover:underline">
                            {post.analytics.comments} comment{post.analytics.comments !== 1 ? 's' : ''}
                        </button>
                    )}
                </div>
                <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-around text-sm font-semibold text-text-secondary">
                    <div className="relative" ref={reactionRef}>
                        <button onMouseEnter={() => setIsReactionSelectorOpen(true)} onMouseLeave={() => setIsReactionSelectorOpen(false)} onClick={() => onLikePost(post.id, post.currentUserReaction || 'like')} className={`flex items-center gap-1.5 transition-colors p-2 rounded-md hover:bg-surface-elevated ${post.currentUserReaction ? REACTION_COLORS[post.currentUserReaction] : 'hover:text-text-primary'}`}>
                            {post.currentUserReaction ? REACTION_ICONS[post.currentUserReaction] : <ThumbsUp size={18} />}
                            <span>{post.currentUserReaction ? REACTION_LABELS[post.currentUserReaction] : 'React'}</span>
                            {isReactionSelectorOpen && <ReactionSelector onSelect={(reaction) => { onLikePost(post.id, reaction); setIsReactionSelectorOpen(false); }} />}
                        </button>
                    </div>
                    <button onClick={() => setIsCommentsExpanded(prev => !prev)} className="flex items-center gap-1.5 transition-colors hover:text-text-primary p-2 rounded-md hover:bg-surface-elevated">
                        <MessageSquare size={18} />
                        <span>Comment</span>
                    </button>
                    <div className="relative" ref={shareMenuRef}>
                        <button onClick={() => setIsShareMenuOpen(prev => !prev)} className="flex items-center gap-1.5 transition-colors hover:text-text-primary p-2 rounded-md hover:bg-surface-elevated">
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                        {isShareMenuOpen && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-surface-modal border border-border-subtle rounded-md shadow-lg z-10 animate-dropdown-enter origin-bottom">
                                <button onClick={(e) => { e.stopPropagation(); onRepost(post); setIsShareMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
                                    <CornerUpRight size={16}/> Repost
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onQuotePost(post); setIsShareMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
                                    <MessageCircle size={16}/> Repost with thoughts
                                </button>
                                <div className="border-t border-border-subtle my-1"></div>
                                <button onClick={handleShareByMessage} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
                                    <Send size={16}/> Send in a message
                                </button>
                                <button onClick={handleCopyLink} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-surface-elevated">
                                    {linkCopied ? <Check size={16} className="text-green-400"/> : <Link size={16}/>}
                                    {linkCopied ? 'Link Copied!' : 'Copy link to post'}
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => onBookmarkPost(post.id)} className={`flex items-center gap-1.5 transition-colors p-2 rounded-md hover:bg-surface-elevated ${post.isBookmarked ? 'text-link' : 'hover:text-text-primary'}`}>
                        <Bookmark size={18} className={`transition-all ${post.isBookmarked ? 'fill-current' : ''}`} />
                        <span>{post.isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
                <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out ${isCommentsExpanded ? 'grid-rows-[1fr]' : ''}`}>
                    <div className="overflow-hidden">
                        <div className="mt-4 pt-3 border-t border-border-subtle">
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {post.comments && post.comments.length > 0 ? (
                                   post.comments.map(comment => (
                                        <CommentItem key={comment.id} comment={comment} postId={post.id} onAddComment={onAddComment} onLikeComment={onLikeComment} onAuthorClick={onAuthorClick} currentUserProfile={currentUserProfile} />
                                   ))
                                ) : (
                                    <p className="text-sm text-text-muted text-center py-4">No comments yet. Start the conversation.</p>
                                )}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <img src={`https://i.pravatar.cc/150?u=${currentUserProfile.ssoEmail}`} alt={currentUserProfile.fullName} className="h-8 w-8 rounded-full" />
                                <div className="relative flex-grow">
                                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                                        placeholder="Write a comment..." className="w-full bg-surface-input border border-border-input rounded-full py-2 pl-4 pr-24 text-text-primary text-sm focus:ring-1 focus:ring-brand-cyan focus:outline-none"/>
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                        {SpeechRecognitionAPI && (
                                            <button onClick={handleToggleListen} disabled={isCleaningUpText} title="Voice to Text" className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 animate-pulse' : 'hover:bg-surface-elevated'} disabled:cursor-not-allowed`}>
                                                {isCleaningUpText ? (
                                                    <Loader className="h-5 w-5 text-brand-cyan animate-spin" />
                                                ) : (
                                                    <Mic className={`h-5 w-5 ${isListening ? 'text-red-400' : 'text-link'}`} />
                                                )}
                                            </button>
                                        )}
                                        <button onClick={() => handleCommentSubmit(post.id)} className="p-2 rounded-full bg-brand-cyan text-text-inverted hover:bg-cyan-700"><Send className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export const PostCard: React.FC<PostCardProps> = (props) => {
    const { item, onViewOpportunity } = props;

    if (item.itemType === 'opportunity') {
        return <OpportunityTeaserView teaser={item} onViewOpportunity={onViewOpportunity} />;
    }
    
    const { 
        item: _item, 
        onViewOpportunity: _onViewOpportunity, 
        ...postViewProps 
    } = props;

    return <PostView post={item} {...postViewProps} />;
};
