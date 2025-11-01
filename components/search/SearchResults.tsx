import React, { useState, useMemo } from 'react';
import { Bot, Link, Loader, ThumbsUp, MessageSquare, User, ArrowRight, Store, DollarSign, MapPin, Copy, Check } from 'lucide-react';
import type { WebSearchResults, SearchResultItem, Post, NetworkUser, MarketplaceListing, GroundingSource } from '../../types';
import { SEARCH_CATEGORIES } from '../../constants';
import { useCurrency } from '../../hooks/useCurrency';

interface SearchResultsProps {
    query: string;
    results: WebSearchResults | null;
}

const PostResultCard: React.FC<{ item: Post }> = ({ item }) => (
    <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
            <User className="h-6 w-6 p-1 bg-surface-input rounded-full text-text-secondary" />
            <div>
                <p className="font-semibold text-sm text-text-primary">{item.author.name}</p>
                <p className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
        </div>
        <p className="text-text-secondary text-sm line-clamp-3 flex-grow">{item.content.originalText}</p>
        <div className="flex items-center gap-4 text-xs text-text-muted mt-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center gap-1"><ThumbsUp size={12} /> {item.analytics.allReactions.length}</div>
            <div className="flex items-center gap-1"><MessageSquare size={12} /> {item.analytics.comments}</div>
        </div>
    </div>
);

const PersonResultCard: React.FC<{ item: NetworkUser }> = ({ item }) => (
    <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle flex items-center gap-4">
        <img src={item.profileImageUrl} alt={item.fullName} className="w-16 h-16 rounded-full object-cover" />
        <div>
            <p className="font-bold text-text-primary">{item.fullName}</p>
            <p className="text-sm text-link">{item.jobTitle}</p>
            <p className="text-sm text-text-secondary">{item.company}</p>
        </div>
    </div>
);

const MarketplaceResultCard: React.FC<{ item: MarketplaceListing }> = ({ item }) => {
    const { formatCurrency } = useCurrency();
    
    return (
        <div className="bg-surface-elevated p-4 rounded-lg border border-border-subtle h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <Store className="h-5 w-5 text-link flex-shrink-0" />
                <p className="font-semibold text-sm text-text-primary truncate">{item.title.originalText}</p>
            </div>
            <p className="text-text-secondary text-sm line-clamp-2 flex-grow">{item.summary.originalText}</p>
            <div className="flex items-center justify-between text-xs text-text-muted mt-3 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-1 truncate"><MapPin size={12} /> {item.location}</div>
                {item.amount > 0 && <div className="flex items-center gap-1 font-semibold text-link"><DollarSign size={12} /> {formatCurrency(item.amount)}</div>}
            </div>
        </div>
    );
};

const SourceItem: React.FC<{ source: { web: { uri: string; title: string; }} }> = ({ source }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        navigator.clipboard.writeText(source.web.uri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <li className="relative">
            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-surface-elevated rounded-lg hover:bg-surface-input transition-colors group">
                <p className="font-semibold text-link truncate pr-8">{source.web.title || 'Untitled'}</p>
                <p className="text-xs text-text-muted truncate">{source.web.uri}</p>
            </a>
            <button
                onClick={handleCopy}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary bg-surface-input/50 rounded-md hover:bg-surface-card hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy link"
            >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
        </li>
    );
};

const MapSourceItem: React.FC<{ source: { maps: { uri: string; title: string; }} }> = ({ source }) => {
    return (
      <li>
        <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg hover:bg-surface-input transition-colors group">
          <MapPin size={20} className="text-red-400 flex-shrink-0" />
          <div className="flex-grow">
            <p className="font-semibold text-link truncate">{source.maps.title || 'Untitled Location'}</p>
            <p className="text-xs text-text-muted truncate">{source.maps.uri}</p>
          </div>
        </a>
      </li>
    );
};


export const SearchResults: React.FC<SearchResultsProps> = ({ query, results }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>(['All']);

    const handleFilterClick = (category: string) => {
        if (category === 'All') {
            setActiveFilters(['All']);
            return;
        }
        setActiveFilters(prev => {
            const newFilters = prev.filter(f => f !== 'All');
            if (newFilters.includes(category)) {
                const updated = newFilters.filter(f => f !== category);
                return updated.length === 0 ? ['All'] : updated;
            } else {
                return [...newFilters, category];
            }
        });
    };

    const filteredResults = useMemo(() => {
        if (!results?.categorized) return {};
        if (activeFilters.includes('All')) return results.categorized;

        const filtered: { [key: string]: SearchResultItem[] } = {};
        for (const category of activeFilters) {
            if (results.categorized && results.categorized[category]) {
                filtered[category] = results.categorized[category];
            }
        }
        return filtered;
    }, [activeFilters, results]);

    const totalCount = useMemo(() => {
        if (!results?.categorized) return 0;
        return Object.values(results.categorized).reduce((sum: number, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
    }, [results?.categorized]);


    if (!results) {
        return (
            <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-8">
                <h1 className="text-2xl font-bold text-text-primary">
                    Searching for "<span className="text-link">{query}</span>"
                </h1>
                <div className="text-center py-16 text-text-secondary">
                    <Loader className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <p>Searching EVOLVE and the web with Gemini...</p>
                </div>
            </main>
        );
    }
    
    const isWebSearch = !!results.summary;
    const hasCategorizedResults = results.categorized && Object.values(results.categorized).some(arr => Array.isArray(arr) && arr.length > 0);

    return (
        <main className="container mx-auto max-w-4xl p-4 md:p-6 space-y-8">
            <h1 className="text-2xl font-bold text-text-primary">
                Results for "<span className="text-link">{query}</span>"
            </h1>

            {isWebSearch || hasCategorizedResults ? (
                <div className="space-y-8">
                    {/* AI Summary Section */}
                    {isWebSearch && (
                        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle">
                            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><Bot /> AI Web Summary</h2>
                            {results.imageUrl && (
                                <img src={results.imageUrl} alt={`AI generated image for "${query}"`} className="w-full h-64 object-cover rounded-lg mb-4 border border-border-subtle" />
                            )}
                            <p className="text-text-primary whitespace-pre-wrap">{results.summary.replace(/\*/g, '')}</p>
                        </div>
                    )}

                    {/* Sources Section */}
                    {isWebSearch && results.sources && results.sources.length > 0 && (
                        <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle">
                            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><Link /> Sources</h2>
                            <ul className="space-y-2">
                                {results.sources.map((source, index) => {
                                    if(source.web) {
                                        return <SourceItem key={index} source={source as { web: { uri: string, title: string } }} />
                                    }
                                    if(source.maps) {
                                        return <MapSourceItem key={index} source={source as { maps: { uri: string, title: string } }} />
                                    }
                                    return null;
                                })}
                            </ul>
                        </div>
                    )}
                    
                    {/* Categorized Results Section */}
                    {hasCategorizedResults && (
                        <div className="space-y-6">
                            <div className="border-b border-border-subtle">
                                <nav className="-mb-px flex space-x-6 overflow-x-auto pb-2">
                                    {SEARCH_CATEGORIES.map(category => {
                                        const count = category === 'All' ? totalCount : (results.categorized?.[category] || []).length;
                                        if (count > 0) {
                                        return (
                                            <button 
                                                key={category} 
                                                onClick={() => handleFilterClick(category)}
                                                className={`flex-shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeFilters.includes(category) ? 'border-link text-link' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                                            >
                                                {category} <span className={`ml-1.5 text-xs font-bold py-0.5 px-2 rounded-full ${activeFilters.includes(category) ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white' : 'bg-surface-input text-text-secondary'}`}>{count}</span>
                                            </button>
                                        )
                                        }
                                        return null;
                                    })}
                                </nav>
                            </div>
                            
                            <div className="space-y-8">
                            {Object.entries(filteredResults).map(([category, items]) => {
                                if (!Array.isArray(items) || items.length === 0) return null;
                                const itemsToShow = activeFilters.includes('All') ? items.slice(0, 5) : items;
                                return (
                                    <div key={category} className="bg-surface-card p-6 rounded-2xl border border-border-subtle">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-text-primary">{category}</h2>
                                            {activeFilters.includes('All') && items.length > 5 && (
                                                <button onClick={() => setActiveFilters([category])} className="text-sm text-link hover:underline flex items-center gap-1">
                                                    View All ({items.length}) <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {itemsToShow.map(item => {
                                                if ('content' in item) return <PostResultCard key={item.id} item={item as Post} />;
                                                if ('fullName' in item) return <PersonResultCard key={item.id} item={item as NetworkUser} />;
                                                if ('category' in item && 'submittedBy' in item) return <MarketplaceResultCard key={item.id} item={item as MarketplaceListing} />;
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 text-text-secondary">
                    <p>No results found for "{query}". Try a different search.</p>
                </div>
            )}
        </main>
    );
};