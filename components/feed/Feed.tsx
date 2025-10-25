import React, { useState, useEffect } from 'react';
import type { Post, UserProfile, Comment, FeedItem, OpportunityTeaser, MarketplaceListing, PostType, ReactionType, PostAuthor } from '../../types';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { rankFeedItems } from '../../services/geminiService';
import { ListingDetailModal } from '../marketplace/ListingDetailModal';
import { MOCK_MARKETPLACE_LISTINGS } from '../../constants';
import { PostCardSkeleton } from './PostCardSkeleton';

interface FeedProps {
    userProfile: UserProfile;
    feedItems: FeedItem[];
    onAddPost: (postData: { contentText: string; type: PostType; isSponsored?: boolean; mediaFiles: File[]; scheduledTime?: string; tags: string[] }) => void;
    onLikePost: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, commentText: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string, reaction: ReactionType) => void;
    onOpenLiveStream: () => void;
    onOpenScheduleLive: () => void;
    onEndLiveStream: (postId: string) => void;
    onArchiveLiveStream: (postId: string, action: 'post' | 'discard') => void;
    onStartScheduledStream: (postId: string) => void;
    onUpdatePost: (postId: string, newContent: string) => void;
    onRepost: (originalPost: Post) => void;
    onQuotePost: (originalPost: Post) => void;
    onDeletePost: (post: Post) => void;
    onBookmarkPost: (postId: string) => void;
    onShareByMessage: () => void;
    onViewProfile: (author: PostAuthor) => void;
}

const FEED_CACHE_KEY = 'evolve_feed_cache';

export const Feed: React.FC<FeedProps> = ({ 
    userProfile, feedItems, onAddPost, onLikePost, onAddComment, onLikeComment,
    onOpenLiveStream, onOpenScheduleLive, onEndLiveStream, onArchiveLiveStream, onStartScheduledStream,
    onUpdatePost, onRepost, onQuotePost, onDeletePost, onBookmarkPost, onShareByMessage,
    onViewProfile
}) => {
    
    const [sortedFeed, setSortedFeed] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadAndRankFeed = async () => {
            // Try to load from cache first for an instant UI
            try {
                const cachedFeed = sessionStorage.getItem(FEED_CACHE_KEY);
                if (cachedFeed && isMounted) {
                    const parsedFeed = JSON.parse(cachedFeed);
                    if (Array.isArray(parsedFeed) && parsedFeed.length > 0) {
                        setSortedFeed(parsedFeed);
                        setIsLoading(false); // We have something to show, stop initial loading
                    }
                }
            } catch (error) {
                console.error("Failed to load cached feed:", error);
                // If cache fails, we'll just continue to the ranking step.
            }

            // Always re-rank in the background to get the latest data/order.
            // This also handles the initial case where there's no cache.
            if (!isMounted) return;
            
            const ranked = await rankFeedItems(feedItems, userProfile);

            if (isMounted) {
                setSortedFeed(ranked);
                try {
                    sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(ranked));
                } catch (error) {
                    console.error("Failed to cache feed:", error);
                }
                setIsLoading(false); // Ensure loading is off after ranking completes
            }
        };
        
        loadAndRankFeed();

        return () => {
            isMounted = false;
        };
    }, [feedItems, userProfile]);

    const handleViewOpportunity = (teaser: OpportunityTeaser) => {
        const listing = MOCK_MARKETPLACE_LISTINGS.find(l => l.id === teaser.listingId);
        if (listing) {
            setSelectedListing(listing);
        }
    };

    return (
        <>
            <main className="container mx-auto max-w-3xl p-4 md:p-6 space-y-6">
                <CreatePost 
                    userProfile={userProfile} 
                    onAddPost={onAddPost} 
                    onOpenLiveStream={onOpenLiveStream}
                    onOpenScheduleLive={onOpenScheduleLive}
                />
                <div className="space-y-6">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)
                    ) : (
                        sortedFeed.map(item => (
                            <PostCard 
                                key={item.id} 
                                item={item}
                                currentUserProfile={userProfile}
                                onLikePost={onLikePost}
                                onAddComment={onAddComment}
                                onLikeComment={onLikeComment}
                                onViewOpportunity={handleViewOpportunity}
                                onAuthorClick={onViewProfile}
                                onEndLiveStream={onEndLiveStream}
                                onArchiveLiveStream={onArchiveLiveStream}
                                onStartScheduledStream={onStartScheduledStream}
                                onUpdatePost={onUpdatePost}
                                onRepost={onRepost}
                                onQuotePost={onQuotePost}
                                onDeletePost={onDeletePost}
                                onBookmarkPost={onBookmarkPost}
                                onShareByMessage={onShareByMessage}
                            />
                        ))
                    )}
                </div>
            </main>
            {selectedListing && (
                <ListingDetailModal 
                    listing={selectedListing} 
                    onClose={() => setSelectedListing(null)}
                    onInitiateTransaction={() => { /* Integrate transaction flow here */ }}
                />
            )}
        </>
    );
};