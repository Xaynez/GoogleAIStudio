// Fix: Import 'useCallback' from 'react' to resolve 'Cannot find name' error.
import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/marketplace/Marketplace';
import { Header } from './components/Header';
import { ProfileModal } from './components/ProfileModal';
import { GovernanceHubPage } from './components/governance/GovernanceHubPage';
import { MessagingModal } from './components/messaging/MessagingModal';
import { Feed } from './components/feed/Feed';
import { UpgradeModal } from './components/common/UpgradeModal';
import type { OnboardingData, PricingTier, UserProfile, MarketplaceListing, Conversation, MarketplaceCategory, AppView, Post, Comment, FeedItem, TranslatableContent, PostType, Notification, NetworkUser, Message, WebSearchResults, ReactionType, PostAuthor, AuditLog, Locale } from './types';
// Fix: Removed MOCK_FEED_POSTS as it is not exported from constants.ts and not used in this file.
import { MOCK_MARKETPLACE_LISTINGS, MOCK_CONVERSATIONS, SUPPORTED_LOCALES, MOCK_FEED_ITEMS, MOCK_NOTIFICATIONS, MOCK_NETWORK_USERS } from './constants';
// Fix: Renamed imported 'Locale' instance to 'localeManager' to avoid name collision with the 'Locale' type.
import { LocaleProvider, useTranslation, localeManager } from './i18n';
import { TranslatorProvider } from './hooks/useTranslator';
import { CreateListingModal } from './components/marketplace/CreateListingModal';
import { MyNetwork } from './components/network/MyNetwork';
import { LiveStreamModal } from './components/feed/LiveStreamModal';
import { ListingDetailModal } from './components/marketplace/ListingDetailModal';
import { TransactionModal } from './components/marketplace/TransactionModal';
import { ScheduleLiveModal } from './components/feed/ScheduleLiveModal';
import { ScheduleMeetingModal } from './components/meeting/ScheduleMeetingModal';
import { X, User, ShieldCheck } from 'lucide-react';
import { TranslatedText } from './components/common/TranslatedText';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { SearchResults as SearchResultsComponent } from './components/search/SearchResults';
// Fix: Correctly import searchMapsWithGemini which will be added to the service.
import { searchWebWithGemini, generateImageWithImagen, searchMapsWithGemini } from './services/geminiService';
import { ChatBot } from './components/ai/ChatBot';
import { LiveAssistant } from './components/ai/LiveAssistant';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { ConnectorsPage } from './components/connectors/ConnectorsPage';
import { TermsOfUsePage } from './components/terms/TermsOfUsePage';
import { PrivacyPolicyPage } from './components/privacy/PrivacyPolicyPage';

const MOCK_ELITE_USER: UserProfile = {
  fullName: 'Alex Thornton',
  idType: 'passport',
  idFrontPhoto: 'mock-photo',
  idBackPhoto: null,
  selfieVerified: true,
  ssoEmail: 'alex.thornton@evolve.net',
  jobTitle: 'Chief Executive Officer',
  company: 'Quantum Dynamics Inc.',
  location: 'New York, NY',
  summary: { originalLang: 'en-US', originalText: 'Seasoned executive with over 15 years of experience driving growth in the tech sector. Specialized in AI-driven market expansion and M&A. Passionate about building high-performance teams and disruptive technologies.' },
  education: [
    {
      institutionName: 'Stanford University',
      degreeType: 'Masters',
      fieldOfStudy: 'Computer Science, AI Specialization',
      startDate: '2005-09',
      endDate: '2007-06'
    },
    {
      institutionName: 'MIT',
      degreeType: 'BA',
      fieldOfStudy: 'Business Administration',
      startDate: '2001-09',
      endDate: '2005-06'
    }
  ],
  experience: [
    {
      role: 'Chief Executive Officer',
      company: 'Quantum Dynamics Inc.',
      startDate: '2015-01',
      endDate: 'Present',
      description: 'Leading the company through its next phase of growth, focusing on global expansion and AI product development.'
    },
    {
      role: 'VP of Product',
      company: 'Innovate Solutions',
      startDate: '2010-06',
      endDate: '2014-12',
      description: 'Managed the entire product lifecycle from conception to launch, growing the user base by 300%.'
    }
  ],
  languages: ['English', 'German'],
  industries: ['Technology', 'Finance', 'AI'],
  interests: ['Investments', 'Partnerships', 'Business for Sale'],
  termsAccepted: true,
  privacyAccepted: true,
  governanceAccepted: true,
  tier: 'Elite',
  role: 'Admin', // Give them Admin role to see everything
  isBiometricEnrolled: true,
  locale: SUPPORTED_LOCALES[0],
  yearsExperience: 18,
  achievements: ['Forbes 40 Under 40', 'Led $250M Series C funding round'],
  preferredCurrency: 'USD',
  verifiedStatus: 'Verified',
  trustScore: 99,
  activity: MOCK_FEED_ITEMS.filter(p => 'author' in p && p.author.id === 'user-1') as Post[],
  profileImageUrl: `https://i.pravatar.cc/150?u=alex.thornton@evolve.net`,
  coverImageUrl: 'https://picsum.photos/seed/cover-1/1200/400',
  selectedImageModel: 'imagen',
  selectedVideoModel: 'gemini-storyboard',
  hasVeoApiKey: false,
};


const SharePostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    postToShare: Post;
    onSharePost: (originalPost: Post, thoughts: string) => void;
    currentUserProfile: UserProfile;
}> = ({ isOpen, onClose, postToShare, onSharePost, currentUserProfile }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [thoughts, setThoughts] = useState('');

    useEffect(() => {
        if (isOpen) setIsClosing(false);
    }, [isOpen]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setThoughts('');
        }, 300);
    };

    const handleSubmit = () => {
        onSharePost(postToShare, thoughts);
        triggerClose();
    };

    if (!isOpen || !postToShare) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className={`bg-surface-modal border border-border-subtle rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                    <h2 className="text-xl font-bold text-text-primary">Share Post to Feed</h2>
                    <button onClick={triggerClose} title="Close" aria-label="Close share post modal" className="text-text-secondary hover:text-text-primary transition-colors rounded-full p-1"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex gap-4">
                        <User className="h-10 w-10 p-2 bg-surface-elevated rounded-full text-text-secondary flex-shrink-0" />
                        <textarea
                            value={thoughts}
                            onChange={(e) => setThoughts(e.target.value)}
                            placeholder="Add your thoughts... (optional)"
                            className="w-full bg-transparent text-lg text-text-primary focus:outline-none resize-none"
                            rows={4}
                        />
                    </div>
                    <div className="ml-14 border border-border-subtle rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <User className="h-6 w-6 p-1 bg-surface-elevated rounded-full" />
                            <div>
                                <p className="font-semibold text-sm text-text-primary flex items-center gap-1.5">{postToShare.author.name} {postToShare.author.verified && <ShieldCheck size={14} className="text-brand-cyan" />}</p>
                                <p className="text-xs text-text-muted">{new Date(postToShare.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-text-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                            <TranslatedText contentId={`${postToShare.id}_quote_preview`} content={postToShare.content} as="span" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-surface-modal/50 border-t border-border-subtle flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-brand-cyan text-text-inverted font-semibold rounded-lg hover:bg-cyan-700">Share</button>
                </div>
            </div>
        </div>
    );
};

const AppCore: React.FC = () => {
  const { locale, isLoading, setLocale } = useTranslation();
  
  // Dynamically set page direction and font
  useEffect(() => {
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.rtl ? 'rtl' : 'ltr';
    document.body.style.fontFamily = `'${locale.font}', sans-serif`;

    const fontId = `font-${locale.font.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const fontLink = document.createElement('link');
      fontLink.id = fontId;
      fontLink.rel = 'stylesheet';
      fontLink.href = `https://fonts.googleapis.com/css2?family=${locale.font.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
      document.head.appendChild(fontLink);
    }
  }, [locale]);
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(MOCK_ELITE_USER);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(MOCK_MARKETPLACE_LISTINGS);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [initialConversationId, setInitialConversationId] = useState<string | null>(null);
  const [activeMarketplaceCategory, setActiveMarketplaceCategory] = useState<MarketplaceCategory>('Investments');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(MOCK_FEED_ITEMS);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState(false);
  const [isScheduleLiveModalOpen, setIsScheduleLiveModalOpen] = useState(false);
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [initialProfileTab, setInitialProfileTab] = useState('About');
  const [initialListingCategory, setInitialListingCategory] = useState<MarketplaceCategory>('Investments');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [networkUsers, setNetworkUsers] = useState<NetworkUser[]>(MOCK_NETWORK_USERS);
  
  // State lifted from Marketplace.tsx to handle global navigation
  const [selectedListingForDetail, setSelectedListingForDetail] = useState<MarketplaceListing | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<MarketplaceListing | null>(null);

  // State for viewing other users' profiles from My Network
  const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  
  // State for Share Post Modal
  const [sharePostTarget, setSharePostTarget] = useState<Post | null>(null);

  // State for Post Deletion Modal
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [webSearchResults, setWebSearchResults] = useState<WebSearchResults | null>(null);
  const [searchMode, setSearchMode] = useState<'evolve' | 'web'>('web');

  // Governance state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const addAuditLog = useCallback((event: string, details: Record<string, any>) => {
    if (!userProfile) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: userProfile.fullName,
      event,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [userProfile]);

  useEffect(() => {
    let isMounted = true;
    const initializeLocale = async () => {
        // When the user logs in, we establish the correct locale.
        // The localeManager already loads from localStorage by default.
        // We only need to set the locale from the user's profile IF
        // no locale has been previously stored.
        const storedLocaleJSON = localStorage.getItem('evolve-locale-v2');
        if (!storedLocaleJSON && userProfile?.locale) {
            if (isMounted) {
                await setLocale(userProfile.locale.id);
            }
        }
    };
    initializeLocale();
    return () => { isMounted = false; }
  }, [userProfile, setLocale]);


  // Robust theme state initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('evolve-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Check for Veo API key on mount
  useEffect(() => {
    if (userProfile && (window as any).aistudio?.hasSelectedApiKey) {
        (window as any).aistudio.hasSelectedApiKey().then((hasKey: boolean) => {
            if (userProfile.hasVeoApiKey !== hasKey) {
                setUserProfile(prev => prev ? { ...prev, hasVeoApiKey: hasKey } : null);
            }
        });
    }
  }, [userProfile]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('evolve-search-history');
    if (storedHistory) {
        try {
            setSearchHistory(JSON.parse(storedHistory));
        } catch (e) {
            console.error("Failed to parse search history from localStorage", e);
            setSearchHistory([]);
        }
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('evolve-theme', theme);
  }, [theme]);
  
  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSelectPlan = (tier: PricingTier) => {
    setNeedsOnboarding(true);
  };

  const handleBiometricLogin = () => {
    // Simulate successful biometric login for an existing user.
    // This logs them in directly, bypassing onboarding.
    setUserProfile(MOCK_ELITE_USER);
    setIsAuthenticated(true);
    setNeedsOnboarding(false);
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    const profile: UserProfile = {
      ...data,
      tier: 'Elite', // Grant Elite tier for full feature access
      role: 'Compliance Officer', // Assign role to see compliance dashboard
      isBiometricEnrolled: isBiometricEnrolled,
      locale: SUPPORTED_LOCALES[0], // Default locale
      yearsExperience: 15,
      achievements: ['Forbes 30 Under 30', 'Scaled company to $100M ARR'],
      preferredCurrency: 'USD',
      verifiedStatus: 'Verified',
      trustScore: 98,
      activity: [],
      selectedImageModel: 'imagen',
      selectedVideoModel: 'gemini-storyboard',
      hasVeoApiKey: false,
    };
    setUserProfile(profile);
    setNeedsOnboarding(false);
    setIsAuthenticated(true);

    if (data.termsAccepted) {
      localStorage.setItem('evolve-terms-accepted:2025-10-30', 'true');
    }
    if (data.privacyAccepted) {
        localStorage.setItem('evolve-privacy-accepted:2025-10-30', 'true');
    }
    if (data.governanceAccepted) {
        localStorage.setItem('evolve-governance-accepted:2025-10-30', 'true');
    }
  };

  const handleEnableBiometrics = () => {
    setIsBiometricEnrolled(true);
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, isBiometricEnrolled: true } : null);
    }
  };
  
  const handleAddListing = (newListing: Omit<MarketplaceListing, 'id' | 'submittedAt' | 'status' | 'aiRiskScore' | 'aiFlags'>) => {
    const listingWithGov: MarketplaceListing = {
        ...newListing,
        id: `listing-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'Pending Review',
        aiRiskScore: Math.floor(Math.random() * 40) + 30,
        aiFlags: newListing.details.description.originalText.length < 100 ? ['Vague description'] : [],
    };
    setMarketplaceListings(prev => [listingWithGov, ...prev]);
    setIsCreateListingOpen(false);
  };
  
  const handleUpdateListingStatus = (listingId: string, status: 'Approved' | 'Rejected', reason?: string) => {
    setMarketplaceListings(prev => prev.map(listing => {
        if (listing.id === listingId) {
            return {
                ...listing,
                status,
                rejectionReason: reason,
                reviewedBy: userProfile?.fullName,
                reviewedAt: new Date().toISOString(),
            };
        }
        return listing;
    }));
  };

  const handleSendMessage = (conversationId: string, messageText: string) => {
    if (!userProfile) return;
    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'user-1',
        senderName: userProfile.fullName,
        text: {
            originalLang: userProfile.locale.code,
            originalText: messageText,
        },
        timestamp: new Date().toISOString(),
        isOwn: true,
    };

    setConversations(prev => prev.map(convo => {
        if (convo.id === conversationId) {
            return { ...convo, messages: [...convo.messages, newMessage], lastMessage: messageText, timestamp: newMessage.timestamp };
        }
        return convo;
    }));
  };
  
  const openMessaging = (conversationId?: string) => {
    setInitialConversationId(conversationId || null);
    setIsMessagingOpen(true);
  };

  const handleStartConversation = (participant: { id: string; name: string; title: string; }) => {
    let conversation = conversations.find(c => c.participant.id === participant.id);
    if (!conversation) {
        conversation = {
            id: `conv-${participant.id}-${Date.now()}`,
            participant: participant,
            lastMessage: 'You can now start the conversation.',
            timestamp: new Date().toISOString(),
            unreadCount: 0,
            messages: [],
        };
        setConversations(prev => [conversation!, ...prev]);
    }
    openMessaging(conversation.id);
  };
  
  const handleLogout = () => {
      setIsAuthenticated(false);
      setUserProfile(null);
      setNeedsOnboarding(false);
      setCurrentView('feed');
  };
  
  const handleAddPost = (postData: { contentText: string; type: PostType; isSponsored?: boolean; mediaFiles: File[]; scheduledTime?: string; tags: string[]; id?: string; }) => {
    if (!userProfile) return;
    const newPost: Post = {
        id: postData.id || `post-${Date.now()}`,
        author: { id: userProfile.ssoEmail, name: userProfile.fullName, title: userProfile.jobTitle, company: userProfile.company, verified: userProfile.verifiedStatus === 'Verified' },
        timestamp: new Date().toISOString(),
        analytics: { allReactions: [], comments: 0, impressions: 0, views: 0, shares: 0, profileViews: 0, newConnections: 0 },
        content: {
            originalLang: userProfile.locale.code,
            originalText: postData.contentText,
        },
        type: postData.type,
        isSponsored: postData.isSponsored,
        media: postData.mediaFiles.map(file => {
            let type: 'image' | 'video' | 'document' = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            if (file.type.startsWith('video/')) type = 'video';
            return {
                type,
                url: URL.createObjectURL(file), // Note: Object URLs are temporary
                name: file.name,
            };
        }),
        tags: postData.tags,
        isLive: postData.type === 'live' ? true : undefined,
        scheduledTime: postData.scheduledTime,
    };
    setFeedItems(prev => [newPost, ...prev]);
  };

  const handleUpdatePost = (postId: string, newContent: string) => {
    setFeedItems(prev => prev.map(item => {
        if ('content' in item && item.id === postId) {
            return {
                ...item,
                content: { ...item.content, originalText: newContent }
            };
        }
        return item;
    }));
  };

  const handleDeletePost = () => {
    if (!postToDelete) return;
    setFeedItems(prev => prev.filter(item => item.id !== postToDelete.id));
    setPostToDelete(null);
  };

  const openDeleteConfirmation = (post: Post) => {
      setPostToDelete(post);
  };
  
  const handleSharePost = (originalPost: Post, thoughts: string) => {
      if (!userProfile) return;
      const newPost: Post = {
          id: `share-${Date.now()}`,
          author: { id: userProfile.ssoEmail, name: userProfile.fullName, title: userProfile.jobTitle, company: userProfile.company, verified: userProfile.verifiedStatus === 'Verified' },
          timestamp: new Date().toISOString(),
          analytics: { allReactions: [], comments: 0, impressions: 0, views: 0, shares: 0, profileViews: 0, newConnections: 0 },
          content: { originalLang: userProfile.locale.code, originalText: thoughts },
          type: 'text',
          repostOf: originalPost,
      };
      setFeedItems(prev => [newPost, ...prev]);
      setSharePostTarget(null); // Close the modal
  };
  
  const handleEndLiveStream = (postId: string) => {
    setFeedItems(prev => prev.map(item => {
        if ('content' in item && item.id === postId && item.type === 'live') {
            return { ...item, isLive: false };
        }
        return item;
    }));
  };
  
  const handleArchiveLiveStream = () => {
    // Placeholder for archiving logic
  };

  const handleLikePost = (postId: string, reaction: ReactionType) => {
    if (!userProfile) return;

    setFeedItems(prev => prev.map(item => {
        if ('content' in item && item.id === postId) {
            const post = item as Post;
            const analytics = post.analytics;
            const allReactions = [...(analytics.allReactions || [])];
            
            const currentUserAsAuthor: PostAuthor = {
                id: userProfile.ssoEmail,
                name: userProfile.fullName,
                title: userProfile.jobTitle,
                company: userProfile.company,
                verified: userProfile.verifiedStatus === 'Verified',
            };

            const existingReactionIndex = allReactions.findIndex(r => r.user.id === userProfile.ssoEmail);
            let newCurrentUserReaction: ReactionType | undefined = reaction;

            if (existingReactionIndex > -1) {
                const existingReactionType = allReactions[existingReactionIndex].type;
                // Remove the old reaction
                allReactions.splice(existingReactionIndex, 1);
                // If the new reaction is different, add it. If it's the same, it's an "un-react".
                if (existingReactionType !== reaction) {
                    allReactions.push({ user: currentUserAsAuthor, type: reaction });
                } else {
                    newCurrentUserReaction = undefined;
                }
            } else {
                // No previous reaction, just add the new one
                allReactions.push({ user: currentUserAsAuthor, type: reaction });
            }
            
            return {
                ...post,
                currentUserReaction: newCurrentUserReaction,
                analytics: { ...analytics, allReactions }
            };
        }
        return item;
    }));
};

  const handleAddComment = (postId: string, commentText: string, parentId?: string) => {
    if (!userProfile) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        id: userProfile.ssoEmail,
        name: userProfile.fullName,
        title: userProfile.jobTitle,
        company: userProfile.company,
        verified: userProfile.verifiedStatus === 'Verified',
      },
      text: { originalLang: userProfile.locale.code, originalText: commentText },
      timestamp: new Date().toISOString(),
      allReactions: [],
      replies: [],
    };

    const addReplyRecursively = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
            if (c.id === parentId) {
                return { ...c, replies: [...(c.replies || []), newComment] };
            }
            if (c.replies) {
                return { ...c, replies: addReplyRecursively(c.replies) };
            }
            return c;
        });
    };
    
    setFeedItems(prev => prev.map(item => {
        if ('content' in item && item.id === postId) {
            const post = item as Post;
            let updatedComments;
            if (parentId) {
                updatedComments = addReplyRecursively(post.comments || []);
            } else {
                updatedComments = [...(post.comments || []), newComment];
            }
            return {
                ...post,
                comments: updatedComments,
                analytics: { ...post.analytics, comments: (post.analytics.comments || 0) + 1 }
            };
        }
        return item;
    }));
  };
  
    const handleLikeComment = (postId: string, commentId: string, reaction: ReactionType) => {
        if (!userProfile) return;

        const currentUserAsAuthor: PostAuthor = {
            id: userProfile.ssoEmail,
            name: userProfile.fullName,
            title: userProfile.jobTitle,
            company: userProfile.company,
            verified: userProfile.verifiedStatus === 'Verified',
        };

        const updateCommentRecursively = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
                if (comment.id === commentId) {
                    const allReactions = [...(comment.allReactions || [])];
                    const existingReactionIndex = allReactions.findIndex(r => r.user.id === userProfile.ssoEmail);
                    let newCurrentUserReaction: ReactionType | undefined = reaction;

                    if (existingReactionIndex > -1) {
                        const existingReactionType = allReactions[existingReactionIndex].type;
                        allReactions.splice(existingReactionIndex, 1);
                        if (existingReactionType !== reaction) {
                            allReactions.push({ user: currentUserAsAuthor, type: reaction });
                        } else {
                            newCurrentUserReaction = undefined;
                        }
                    } else {
                        allReactions.push({ user: currentUserAsAuthor, type: reaction });
                    }
                    
                    return {
                        ...comment,
                        currentUserReaction: newCurrentUserReaction,
                        allReactions,
                    };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: updateCommentRecursively(comment.replies) };
                }
                return comment;
            });
        };

        setFeedItems(prev => prev.map(item => {
            if ('content' in item && item.id === postId) {
                const post = item as Post;
                const updatedComments = updateCommentRecursively(post.comments || []);
                return { ...post, comments: updatedComments };
            }
            return item;
        }));
    };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('evolve-search-history', JSON.stringify(newHistory));

    setSearchQuery(query);
    setCurrentView('search');
    setWebSearchResults(null); // Set to null to indicate loading

    if (searchMode === 'web') {
        try {
            const { text, sources } = await searchWebWithGemini(query);
            let finalImageUrl: string | undefined = undefined;
            try {
                const imagePrompt = `An artistic, abstract concept image representing: "${query}"`;
                const imageBase64 = await generateImageWithImagen(imagePrompt);
                finalImageUrl = `data:image/png;base64,${imageBase64}`;
            } catch (imgError) {
                console.warn("Could not generate image for search query:", imgError);
            }
            setWebSearchResults({ 
                summary: text, 
                sources: sources,
                imageUrl: finalImageUrl,
            });
        } catch (error) {
            console.error("Search failed:", error);
            setWebSearchResults({ 
                summary: "Sorry, the web search failed. Please try again.", 
                sources: []
            });
        }
    } else { // 'evolve' mode
        const lowerQuery = query.toLowerCase();
        const posts = feedItems.filter((item): item is Post => 'content' in item && (item.content.originalText.toLowerCase().includes(lowerQuery) || item.author.name.toLowerCase().includes(lowerQuery)));
        const people = networkUsers.filter(user => user.fullName.toLowerCase().includes(lowerQuery) || user.jobTitle.toLowerCase().includes(lowerQuery));
        const marketplace = marketplaceListings.filter(l => l.title.originalText.toLowerCase().includes(lowerQuery) || l.summary.originalText.toLowerCase().includes(lowerQuery));
        
        const categorizedResults = {
            Posts: posts,
            People: people,
            Companies: [],
            Groups: [],
            Schools: [],
            Courses: [],
            Jobs: [],
            Events: [],
            Services: marketplace.filter(l => ['Partnerships', 'Suppliers & Logistics'].includes(l.category)),
            Products: marketplace.filter(l => ['Assets', 'Business for Sale', 'Intellectual Property', 'Investments', 'Real Estate'].includes(l.category)),
        };

        setWebSearchResults({
            summary: '',
            sources: [],
            categorized: categorizedResults,
        });
    }
  };
  
  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('evolve-search-history');
  };

  const handleViewProfile = (author: PostAuthor) => {
    if (author.id === userProfile?.ssoEmail) {
        setIsProfileOpen(true);
        return;
    }
    const profile = networkUsers.find(u => u.id === author.id);
    let mockFullProfile: UserProfile;
    if (profile) {
        mockFullProfile = { ...MOCK_ELITE_USER, fullName: author.name, jobTitle: author.title, company: author.company, ssoEmail: `mock-${author.id}@email.com`, industries: profile.industries, location: profile.location, profileImageUrl: profile.profileImageUrl, coverImageUrl: `https://picsum.photos/seed/${author.id}/1200/400` };
    } else {
        // Fallback for authors not in the mock network users list
        mockFullProfile = { ...MOCK_ELITE_USER, fullName: author.name, jobTitle: author.title, company: author.company, ssoEmail: `mock-${author.id}@email.com`, profileImageUrl: `https://i.pravatar.cc/150?u=${author.id}`, coverImageUrl: `https://picsum.photos/seed/${author.id}/1200/400` };
    }
    setViewedProfile(mockFullProfile);
    setIsViewProfileOpen(true);
};

  const handleOpenCreateListing = (category: MarketplaceCategory = 'Investments') => {
    setInitialListingCategory(category);
    setIsCreateListingOpen(true);
  };


  if (!isAuthenticated && !needsOnboarding) {
    return <LandingPage onSelectPlan={handleSelectPlan} isBiometricEnrolled={isBiometricEnrolled} onBiometricLogin={handleBiometricLogin} onNavigate={setCurrentView} />;
  }


  return (
        <div className={`min-h-screen text-text-primary ${isLoading ? 'opacity-50 transition-opacity' : ''}`}>
          {/* ARIA Live Region for screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {`Language changed to ${locale.name}`}
          </div>

          {isAuthenticated && userProfile && (
            <>
            <Header
              isAuthenticated={isAuthenticated}
              userProfile={userProfile}
              onOpenProfile={() => { setInitialProfileTab('About'); setIsProfileOpen(true); }}
              onNavigate={(view) => setCurrentView(view)}
              onOpenMessages={openMessaging}
              currentView={currentView}
              onLogout={handleLogout}
              onSelectMarketplaceCategory={(category) => {
                setActiveMarketplaceCategory(category);
                setCurrentView('marketplace');
              }}
              activeMarketplaceCategory={activeMarketplaceCategory}
              onOpenCreateListing={handleOpenCreateListing}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onSearch={handleSearch}
              searchHistory={searchHistory}
              onClearSearchHistory={handleClearSearchHistory}
              feedItems={feedItems}
              networkUsers={networkUsers}
              marketplaceListings={marketplaceListings}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
            />
            <ChatBot />
            <LiveAssistant />
            </>
          )}

          <OnboardingWizard
            isOpen={needsOnboarding}
            onClose={() => setNeedsOnboarding(false)}
            onComplete={handleOnboardingComplete}
            onEnableBiometrics={handleEnableBiometrics}
          />
          
          {isAuthenticated && userProfile && (
              <>
                 <ProfileModal
                    isOpen={isProfileOpen || isViewProfileOpen}
                    onClose={() => { setIsProfileOpen(false); setIsViewProfileOpen(false); setViewedProfile(null); }}
                    userProfile={viewedProfile || userProfile}
                    setUserProfile={setUserProfile}
                    initialTab={initialProfileTab}
                    isCurrentUser={!viewedProfile}
                    addAuditLog={addAuditLog}
                />
                 <MessagingModal
                    isOpen={isMessagingOpen}
                    onClose={() => setIsMessagingOpen(false)}
                    conversations={conversations}
                    onSendMessage={handleSendMessage}
                    currentUser={userProfile}
                    initialConversationId={initialConversationId}
                 />
                 <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
                 <CreateListingModal
                    userProfile={userProfile}
                    isOpen={isCreateListingOpen}
                    onClose={() => setIsCreateListingOpen(false)}
                    onAddListing={handleAddListing}
                    initialCategory={initialListingCategory}
                />
                <LiveStreamModal 
                    isOpen={isLiveStreamModalOpen} 
                    onClose={() => setIsLiveStreamModalOpen(false)} 
                    userProfile={userProfile}
                    onAddPost={handleAddPost}
                    onEndLiveStream={handleEndLiveStream}
                />
                <ScheduleLiveModal
                    isOpen={isScheduleLiveModalOpen}
                    onClose={() => setIsScheduleLiveModalOpen(false)}
                    userProfile={userProfile}
                    onAddPost={handleAddPost}
                />
                <ScheduleMeetingModal
                    isOpen={isScheduleMeetingModalOpen}
                    onClose={() => setIsScheduleMeetingModalOpen(false)}
                    networkUsers={networkUsers}
                    currentUser={userProfile}
                />
                <CalendarSyncModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
                {selectedListingForDetail && <ListingDetailModal
                    listing={selectedListingForDetail}
                    onClose={() => setSelectedListingForDetail(null)}
                    onInitiateTransaction={(listing) => {
                        setActiveTransaction(listing);
                        setSelectedListingForDetail(null);
                    }}
                    onStartConversation={handleStartConversation}
                    onOpenMessages={openMessaging}
                    onOpenCalendar={() => setIsCalendarOpen(true)}
                />}
                {activeTransaction && <TransactionModal 
                    listing={activeTransaction}
                    onClose={() => setActiveTransaction(null)}
                />}
                <SharePostModal
                    isOpen={!!sharePostTarget}
                    onClose={() => setSharePostTarget(null)}
                    postToShare={sharePostTarget!}
                    onSharePost={handleSharePost}
                    currentUserProfile={userProfile}
                />
                <ConfirmationModal
                    isOpen={!!postToDelete}
                    onClose={() => setPostToDelete(null)}
                    onConfirm={handleDeletePost}
                    title="Delete Post"
                    message="Are you sure you want to permanently delete this post? This action cannot be undone."
                    confirmText="Delete"
                />
              </>
          )}

          <main>
            {currentView === 'dashboard' && userProfile && (
              <Dashboard 
                userProfile={userProfile} 
                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                onOpenScheduleMeeting={() => setIsScheduleMeetingModalOpen(true)}
                onOpenSyncEvents={() => setIsCalendarOpen(true)}
              />
            )}
            {currentView === 'marketplace' && userProfile && (
              <Marketplace 
                userProfile={userProfile}
                listings={marketplaceListings}
                activeCategory={activeMarketplaceCategory}
                onSelectCategory={setActiveMarketplaceCategory}
                onOpenCreateListing={handleOpenCreateListing}
                onViewListing={(listing) => setSelectedListingForDetail(listing)}
              />
            )}
             {currentView === 'governanceHub' && userProfile && (
              <GovernanceHubPage 
                userProfile={userProfile}
                listings={marketplaceListings} 
                onUpdateStatus={handleUpdateListingStatus}
                auditLogs={auditLogs}
              />
            )}
            {currentView === 'feed' && userProfile && (
                <Feed
                    userProfile={userProfile}
                    feedItems={feedItems}
                    onAddPost={handleAddPost}
                    onLikePost={handleLikePost}
                    // Fix: Pass handleAddComment to the onAddComment prop
                    onAddComment={handleAddComment}
                    // Fix: Pass handleLikeComment to the onLikeComment prop
                    onLikeComment={handleLikeComment}
                    onOpenLiveStream={() => setIsLiveStreamModalOpen(true)}
                    onOpenScheduleLive={() => setIsScheduleLiveModalOpen(true)}
                    onEndLiveStream={handleEndLiveStream}
                    onArchiveLiveStream={handleArchiveLiveStream}
                    onStartScheduledStream={() => {}} // Placeholder
                    // Fix: Pass handleUpdatePost to the onUpdatePost prop
                    onUpdatePost={handleUpdatePost}
                    onRepost={() => {}} // Placeholder
                    onQuotePost={(post) => setSharePostTarget(post)}
                    onDeletePost={openDeleteConfirmation}
                    onBookmarkPost={() => {}} // Placeholder
                    onShareByMessage={openMessaging}
                    onViewProfile={handleViewProfile}
                />
            )}
            {currentView === 'network' && userProfile && (
                 <MyNetwork
                    networkUsers={networkUsers}
                    // Fix: Cannot find name 'currentUser'. Changed to 'userProfile'.
                    currentUser={userProfile}
                    onViewProfile={(userId) => {
                        const user = MOCK_NETWORK_USERS.find(u => u.id === userId);
                        if(user) {
                           handleViewProfile({id: user.id, name: user.fullName, title: user.jobTitle, company: user.company, verified: false})
                        }
                    }}
                    onMessage={(user) => handleStartConversation({id: user.id, name: user.name, title: user.title})}
                />
            )}
             {currentView === 'connectors' && userProfile && (
                <ConnectorsPage />
            )}
            {currentView === 'search' && (
                <SearchResultsComponent
                    query={searchQuery}
                    results={webSearchResults}
                />
            )}
            {currentView === 'terms' && (
                <TermsOfUsePage />
            )}
             {currentView === 'privacy' && (
                <PrivacyPolicyPage />
            )}
          </main>
        </div>
  );
};


const AppContent: React.FC = () => {
  return (
    <LocaleProvider>
      <TranslatorProvider>
        <AppCore />
      </TranslatorProvider>
    </LocaleProvider>
  );
}

export default AppContent;