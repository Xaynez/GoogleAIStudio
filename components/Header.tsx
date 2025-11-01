import React, { useState, useRef, useEffect } from 'react';
import { Bot, UserCircle, LayoutDashboard, Store, Shield, MessageSquare, LogOut, User, ChevronDown, Rss, Search, Plus, Eye, PlusCircle, Bell, Sun, Moon, Users, Home, Clock, TrendingUp, FileText, Globe, Map, Link } from 'lucide-react';
import type { AppView, UserProfile, MarketplaceCategory, Notification, Locale, FeedItem, NetworkUser, Post, MarketplaceListing } from '../types';
import { useTranslation, TRANSLATIONS, localeManager } from '../i18n';
import { SUPPORTED_LOCALES, NEW_MARKETPLACE_CATEGORIES } from '../constants';
import { NotificationItem } from './notifications/NotificationItem';
import { Tooltip } from './common/Tooltip';
import { GoogleAppsLauncher } from './GoogleAppsLauncher';

interface Suggestion {
    type: 'person' | 'post' | 'marketplace' | 'query';
    text: string;
    subtext?: string;
    id: string;
}

interface HeaderProps {
    isAuthenticated: boolean;
    userProfile: UserProfile | null;
    onOpenProfile: () => void;
    onNavigate: (view: AppView, itemId?: string) => void;
    onOpenMessages: (conversationId?: string) => void;
    currentView: AppView;
    onLogout: () => void;
    onSelectMarketplaceCategory: (category: MarketplaceCategory) => void;
    activeMarketplaceCategory: MarketplaceCategory;
    onOpenCreateListing: (category: MarketplaceCategory) => void;
    notifications: Notification[];
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onSearch: (query: string) => void;
    searchHistory: string[];
    onClearSearchHistory: () => void;
    feedItems: FeedItem[];
    networkUsers: NetworkUser[];
    marketplaceListings: MarketplaceListing[];
    searchMode: 'evolve' | 'web';
    setSearchMode: (mode: 'evolve' | 'web') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isAuthenticated, userProfile, onOpenProfile, onNavigate, onOpenMessages, currentView, onLogout, 
    onSelectMarketplaceCategory, activeMarketplaceCategory, onOpenCreateListing,
    notifications, onMarkAsRead, onMarkAllAsRead, theme, onToggleTheme, onSearch, searchHistory, onClearSearchHistory,
    feedItems, networkUsers, marketplaceListings, searchMode, setSearchMode
}) => {
  const { t } = useTranslation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue, setDebouncedInputValue] = useState(inputValue);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
          setIsUserDropdownOpen(false);
          setOpenSubMenu(null);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedInputValue(inputValue);
    }, 300); // 300ms debounce delay

    return () => {
        clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (debouncedInputValue.trim() && searchMode === 'evolve') {
        const lowerCaseInput = debouncedInputValue.toLowerCase();

        const personSuggestions: Suggestion[] = networkUsers
            .filter(u => u.fullName.toLowerCase().includes(lowerCaseInput))
            .slice(0, 2)
            .map(u => ({ type: 'person', text: u.fullName, subtext: u.jobTitle, id: `person-${u.id}` }));
        
        const postSuggestions: Suggestion[] = feedItems
            .filter((item): item is Post => 'content' in item && item.content.originalText.toLowerCase().includes(lowerCaseInput))
            .slice(0, 2)
            .map(p => ({ type: 'post', text: p.content.originalText, subtext: `by ${p.author.name}`, id: `post-${p.id}` }));
        
        const marketplaceSuggestions: Suggestion[] = marketplaceListings
            .filter(l => l.title.originalText.toLowerCase().includes(lowerCaseInput) || l.summary.originalText.toLowerCase().includes(lowerCaseInput))
            .slice(0, 2)
            .map(l => ({ type: 'marketplace', text: l.title.originalText, subtext: `${l.category} in ${l.location}`, id: `listing-${l.id}` }));

        const genericSuggestion: Suggestion = { type: 'query', text: `Search for "${debouncedInputValue}"`, id: 'query' };
        
        setSuggestions([genericSuggestion, ...personSuggestions, ...postSuggestions, ...marketplaceSuggestions]);
    } else {
        setSuggestions([]);
    }
  }, [debouncedInputValue, networkUsers, feedItems, marketplaceListings, searchMode]);
  
  const getTranslatedCategory = (category: MarketplaceCategory) => {
    const key = ('category' + category.replace(/ & | /g, '')) as keyof typeof TRANSLATIONS['en-US'];
    return t(key, category);
  };
  
  const handleNotificationClick = (notification: Notification) => {
      onMarkAsRead(notification.id);
      if (notification.link) {
          if (notification.link.view === 'dashboard' && notification.type === 'new_message') {
              onOpenMessages(notification.link.itemId);
          } else {
              onNavigate(notification.link.view, notification.link.itemId);
          }
      }
      // Close dropdown after click
      setIsUserDropdownOpen(false);
      setOpenSubMenu(null);
  };

  const handleNavigate = (view: AppView) => {
    onNavigate(view);
    setIsUserDropdownOpen(false);
    setOpenSubMenu(null);
  }
  
  const toggleSubMenu = (menu: string) => {
    setOpenSubMenu(prev => (prev === menu ? null : menu));
  };
  
  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setInputValue(query);
    setIsSearchDropdownOpen(false);
    onSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSearchSubmit(inputValue);
      }
  };


  const NavItem: React.FC<{view: AppView, icon: React.ReactNode, label: string}> = ({ view, icon, label }) => (
      <li>
        <button 
            onClick={() => handleNavigate(view)}
            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors ${
                currentView === view ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
        >
            {icon} {label}
        </button>
      </li>
  );

  const getSearchPlaceholder = () => {
    switch(searchMode) {
        case 'evolve': return "Search posts, people, and more...";
        case 'web': return "Search the web with Gemini...";
        default: return "Search...";
    }
  }

  return (
    <header className="py-4 px-6 md:px-8 flex justify-between items-center bg-white/80 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-300 dark:border-slate-800 sticky top-0 z-40 gap-4">
      <div className="flex items-center space-x-3 flex-shrink-0">
        
      </div>

      {isAuthenticated && (
        <div className="flex flex-grow max-w-lg items-center flex-col" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
              <input 
                  type="search" 
                  placeholder={getSearchPlaceholder()}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full py-2 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
              />
            </div>

            <div className="mt-2 w-full">
                <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-full text-sm font-semibold">
                    <Tooltip text="Search within the EVOLVE ecosystem" position="bottom" className="flex-1">
                        <button 
                            onClick={() => setSearchMode('evolve')}
                            className={`w-full text-center py-1 rounded-full flex items-center justify-center gap-2 transition-colors ${searchMode === 'evolve' ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            <Bot size={14} /> Evolve
                        </button>
                    </Tooltip>
                    <Tooltip text="Search the web using Google Search" position="bottom" className="flex-1">
                        <button 
                            onClick={() => setSearchMode('web')}
                            className={`w-full text-center py-1 rounded-full flex items-center justify-center gap-2 transition-colors ${searchMode === 'web' ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            <Globe size={14} /> Web
                        </button>
                    </Tooltip>
                </div>
            </div>

             {isSearchDropdownOpen && (
                <div className="absolute top-full mt-14 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xl z-50 p-2 animate-dropdown-enter origin-top">
                    {inputValue.trim() === '' ? (
                        <>
                            <div className="px-2 pb-2 flex justify-between items-center">
                                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recent Searches</h4>
                                {searchHistory.length > 0 && (
                                    <button onClick={onClearSearchHistory} className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">Clear</button>
                                )}
                            </div>
                            {searchHistory.length > 0 ? (
                                <ul>
                                    {searchHistory.map((item, index) => (
                                        <li key={index}>
                                            <button onClick={() => handleSearchSubmit(item)} className="w-full text-left flex items-center gap-3 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                                                <Clock size={16} /> {item}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-2 py-4 text-center text-sm text-slate-500">No recent searches</p>
                            )}
                        </>
                    ) : (
                        <>
                            <h4 className="px-2 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Suggestions</h4>
                            <ul>
                                {suggestions.map((item) => (
                                    <li key={item.id}>
                                        <button onClick={() => handleSearchSubmit(item.type === 'query' ? debouncedInputValue : item.text)} className="w-full text-left flex items-start gap-3 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                                            <div className="mt-1 flex-shrink-0">
                                                {item.type === 'person' && <User size={16} />}
                                                {item.type === 'post' && <FileText size={16} />}
                                                {item.type === 'marketplace' && <Store size={16} />}
                                                {item.type === 'query' && <Search size={16} />}
                                            </div>
                                            <div className="flex-grow overflow-hidden">
                                                <p className="truncate">{item.text}</p>
                                                {item.subtext && <p className="text-xs text-slate-500 truncate">{item.subtext}</p>}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
      )}

      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {isAuthenticated && userProfile && (
            <>
                <GoogleAppsLauncher />
                <div className="relative" ref={userDropdownRef}>
                    <Tooltip text="Profile, settings, and more" position="bottom">
                        <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} aria-label="Open user menu" className="relative flex items-center space-x-2 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                            <UserCircle className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
                        </button>
                    </Tooltip>

                    {isUserDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 animate-dropdown-enter origin-top-right p-2">
                            <div className="p-2 border-b border-slate-800 mb-2">
                                <p className="font-bold text-white truncate">{userProfile.fullName}</p>
                                <p className="text-sm text-slate-400 truncate">{userProfile.jobTitle}</p>
                            </div>
                            <ul className="space-y-1">
                                <NavItem view="feed" icon={<Rss size={18} />} label="Feed" />
                                <NavItem view="dashboard" icon={<LayoutDashboard size={18} />} label={t('dashboard')} />
                                <NavItem view="marketplace" icon={<Store size={18} />} label={t('marketplace')} />
                                <NavItem view="network" icon={<Users size={18} />} label="My Network" />
                                <NavItem view="connectors" icon={<Link size={18} />} label="API Integrations" />
                                <NavItem view="governanceHub" icon={<Shield size={18} />} label={t('governanceHub')} />

                                <li>
                                    <button type="button" onClick={() => toggleSubMenu('notifications')} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2.5 text-sm rounded-md transition-colors text-slate-300 hover:bg-slate-800">
                                        <span className="flex items-center gap-3 relative">
                                            <Bell size={18} /> Notifications
                                            {unreadCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
                                        </span>
                                        <ChevronDown size={16} className={`transition-transform ${openSubMenu === 'notifications' ? 'rotate-180' : ''}`} />
                                    </button>
                                     {openSubMenu === 'notifications' && (
                                        <div className="pl-4 mt-1">
                                            <div className="bg-slate-800/50 rounded-md">
                                                <div className="p-2 border-b border-slate-700 flex justify-between items-center">
                                                    <h3 className="font-bold text-white text-xs">Notifications</h3>
                                                    {unreadCount > 0 && <button onClick={onMarkAllAsRead} className="text-xs text-cyan-400 hover:underline">Mark all as read</button>}
                                                </div>
                                                <div className="max-h-64 overflow-y-auto p-1">
                                                    {notifications.length > 0 ? notifications.map(n => <NotificationItem key={n.id} notification={n} onClick={handleNotificationClick} />)
                                                    : <div className="text-center p-4 text-slate-500 text-sm"><p>You're all caught up!</p></div> }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            </ul>
                            
                            <div className="border-t border-slate-800 my-2"></div>

                            <ul className="space-y-1">
                                <li><button onClick={() => { onOpenProfile(); setIsUserDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-md">
                                    <User size={18} /> {t('about')} Profile
                                </button></li>
                                <li><button onClick={() => { onOpenMessages(); setIsUserDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-md">
                                    <MessageSquare size={18} /> {t('messages')}
                                </button></li>
                                
                                <li>
                                    <button type="button" onClick={onToggleTheme} className="w-full text-left flex items-center justify-between gap-3 px-4 py-2.5 text-sm rounded-md transition-colors text-slate-300 hover:bg-slate-800">
                                        <span className="flex items-center gap-3">
                                            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                            Appearance
                                        </span>
                                        <span className="text-xs text-slate-500 capitalize">{theme}</span>
                                    </button>
                                </li>
                                
                                <li className="border-t border-slate-800 my-1"></li>

                                <li><button onClick={() => { onLogout(); setIsUserDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-md">
                                    <LogOut size={18} /> Logout
                                </button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </>
          )}
      </div>
    </header>
  );
};
