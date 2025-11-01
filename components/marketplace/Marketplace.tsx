import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Store, Search, PlusCircle, BarChart2, ChevronsUpDown, SlidersHorizontal, ChevronDown } from 'lucide-react';
import type { MarketplaceCategory, MarketplaceListing, UserProfile } from '../../types';
import { ListingCard } from './ListingCard';
import { NEW_MARKETPLACE_CATEGORIES } from '../../constants';
import { useTranslation, TRANSLATIONS } from '../../i18n';
import { useCurrency } from '../../hooks/useCurrency';
import { MarketplaceFilterPanel, FilterState, initialFilters } from './MarketplaceFilterPanel';

const CATEGORIES: MarketplaceCategory[] = NEW_MARKETPLACE_CATEGORIES;

type SortByOption = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'alpha_asc';

interface MarketplaceProps {
    userProfile: UserProfile;
    listings: MarketplaceListing[];
    activeCategory: MarketplaceCategory;
    onSelectCategory: (category: MarketplaceCategory) => void;
    onOpenCreateListing: (category: MarketplaceCategory) => void;
    onViewListing: (listing: MarketplaceListing) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ userProfile, listings, activeCategory, onSelectCategory, onOpenCreateListing, onViewListing }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortByOption>('date_desc');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const [badgeKey, setBadgeKey] = useState(0);
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const approvedListings = useMemo(() => listings.filter(l => l.status === 'Approved'), [listings]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.priceRange.min > initialFilters.priceRange.min || filters.priceRange.max < initialFilters.priceRange.max) count++;
        if (filters.maxRiskScore < initialFilters.maxRiskScore) count++;
        if (filters.hasDocuments) count++;
        if (filters.isSponsored) count++;
        return count;
    }, [filters]);

    useEffect(() => {
        setBadgeKey(prev => prev + 1);
    }, [activeFilterCount]);

    const filteredAndSortedListings = useMemo(() => {
        const filtered = approvedListings
            .filter(listing => listing.category === activeCategory)
            .filter(listing => {
                if (!searchTerm.trim()) return true;
                const lowercasedTerm = searchTerm.toLowerCase();
                return (
                    listing.title.originalText.toLowerCase().includes(lowercasedTerm) ||
                    listing.summary.originalText.toLowerCase().includes(lowercasedTerm)
                );
            })
            .filter(listing => {
                const { priceRange, maxRiskScore, hasDocuments, isSponsored } = filters;
                // Price range filter (ignore for service-based listings with amount 0)
                if (listing.amount > 0 && (listing.amount < priceRange.min || listing.amount > priceRange.max)) {
                    return false;
                }
                // AI risk score filter
                if (listing.aiRiskScore > maxRiskScore) {
                    return false;
                }
                // Has documents filter
                if (hasDocuments && (!listing.documents || listing.documents.length === 0)) {
                    return false;
                }
                // Is sponsored filter
                if (isSponsored && !listing.sponsorshipDetails) {
                    return false;
                }
                return true;
            });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date_asc':
                    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
                case 'price_desc':
                    return b.amount - a.amount;
                case 'price_asc':
                    return a.amount - b.amount;
                case 'alpha_asc':
                    return a.title.originalText.localeCompare(b.title.originalText);
                case 'date_desc':
                default:
                    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
            }
        });
    }, [activeCategory, approvedListings, searchTerm, sortBy, filters]);
    
    const totalListings = approvedListings.length;
    const totalValue = approvedListings.reduce((sum, listing) => sum + listing.amount, 0);
    const categoryBreakdown = CATEGORIES.reduce((acc, category) => {
        acc[category] = approvedListings.filter(l => l.category === category).length;
        return acc;
    }, {} as Record<MarketplaceCategory, number>);
    
    const getTranslatedCategory = (category: MarketplaceCategory) => {
        const key = ('category' + category.replace(/ & | /g, '')) as keyof typeof TRANSLATIONS['en-US'];
        return t(key, category);
    };

    const sortOptions: { value: SortByOption, label: string }[] = [
        { value: 'date_desc', label: t('filterDateNewest') },
        { value: 'date_asc', label: t('filterDateOldest') },
        { value: 'price_desc', label: t('filterPriceHighLow') },
        { value: 'price_asc', label: t('filterPriceLowHigh') },
        { value: 'alpha_asc', label: t('filterTitleAZ') },
    ];

    return (
        <>
            <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-8">
                <div className="text-center">
                    <Store className="h-12 w-12 text-brand-cyan mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary">{t('marketplaceTitle')}</h1>
                    <p className="text-text-secondary">{t('marketplaceSubtitle')}</p>
                </div>
                
                <div className="sticky top-[81px] bg-surface-bg/80 backdrop-blur-md z-30 py-4 px-2 rounded-lg border border-border-subtle">
                     <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button 
                            onClick={() => onOpenCreateListing(activeCategory)}
                            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-brand-cyan text-text-inverted font-semibold rounded-full hover:bg-cyan-700 transition-colors"
                        >
                            <PlusCircle size={16} />
                            <span data-i18n="button_create_listing">{t('button_create_listing')}</span>
                        </button>
                        <div className="relative w-full sm:w-auto sm:min-w-[200px]" ref={categoryDropdownRef}>
                            <button 
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-surface-input text-text-primary font-semibold rounded-full hover:bg-surface-elevated transition-colors"
                            >
                                <span>{getTranslatedCategory(activeCategory)}</span>
                                <ChevronDown size={16} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-full mt-2 w-full bg-surface-modal border border-border-subtle rounded-lg shadow-lg z-10 animate-dropdown-enter">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                onSelectCategory(category);
                                                setIsCategoryDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm ${activeCategory === category ? 'text-link font-bold' : 'text-text-primary hover:bg-surface-elevated'}`}
                                        >
                                            {getTranslatedCategory(category)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative flex-grow w-full">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                             <input 
                                 type="text" 
                                 placeholder={t('searchListings')} 
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                                 className="w-full bg-surface-input border border-border-input rounded-full py-2 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none" 
                             />
                        </div>
                         <button onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-surface-input text-text-primary font-semibold rounded-full hover:bg-surface-elevated transition-colors relative">
                            <SlidersHorizontal size={16} />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span
                                    key={badgeKey}
                                    className="absolute -top-1.5 -right-1.5 flex min-w-[20px] h-5 items-center justify-center rounded-full bg-brand-cyan px-1 text-xs font-bold text-text-inverted border-2 border-surface-bg animate-scale-in"
                                >
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <div className="relative w-full sm:w-56">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortByOption)}
                                className="w-full appearance-none bg-surface-input border border-border-input rounded-full py-2 pl-4 pr-10 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <ChevronsUpDown className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        </div>
                     </div>
                     {showFilters && (
                        <MarketplaceFilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                        />
                    )}
                </div>

                <div className="bg-surface-card/50 p-4 rounded-lg border border-border-subtle">
                    <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><BarChart2 size={20} /> {t('marketplaceAnalytics')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-link">{totalListings}</p>
                            <p className="text-xs text-text-secondary">{t('totalListings')}</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-link">{formatCurrency(totalValue)}</p>
                            <p className="text-xs text-text-secondary">{t('totalValue')}</p>
                        </div>
                        {Object.entries(categoryBreakdown).slice(0,3).map(([category, count]) => (
                             <div key={category}>
                                <p className="text-2xl font-bold text-link">{count}</p>
                                <p className="text-xs text-text-secondary truncate">{getTranslatedCategory(category as MarketplaceCategory)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedListings.length > 0 ? filteredAndSortedListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} onSelect={() => onViewListing(listing)} />
                    )) : (
                        <div className="col-span-full text-center py-16 text-text-secondary">
                            <p>No approved listings match your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};