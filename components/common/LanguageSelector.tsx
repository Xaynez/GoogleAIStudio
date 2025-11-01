import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { REGIONAL_LOCALES, SUPPORTED_LOCALES } from '../../constants';
import type { Locale } from '../../types';

interface LanguageSelectorProps {
    direction?: 'up' | 'down';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ direction = 'down' }) => {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocales = useMemo(() => {
    if (!searchTerm.trim()) return null; // Use null to signify that we should show the grouped list
    const lowercasedTerm = searchTerm.toLowerCase();
    // Use the flat list for searching efficiency
    return SUPPORTED_LOCALES.filter(
      l =>
        l.nativeName.toLowerCase().includes(lowercasedTerm) ||
        l.name.toLowerCase().includes(lowercasedTerm) || // English name
        l.country.toLowerCase().includes(lowercasedTerm) ||
        l.code.toLowerCase().includes(lowercasedTerm) || // locale code
        l.dialCode.includes(lowercasedTerm)
    );
  }, [searchTerm]);

  const handleSelect = (selectedLocale: Locale) => {
    setLocale(selectedLocale);
    setIsOpen(false);
    setSearchTerm('');
  };

  const dropdownPositionClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  const renderLocaleItem = (l: Locale) => (
    <li key={l.id}>
      <button
        onClick={() => handleSelect(l)}
        className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md ${locale.code === l.code ? 'bg-brand-cyan/10 text-brand-cyan font-semibold' : 'hover:bg-surface-elevated'}`}
      >
        <span className="text-xl w-6 text-center flex-shrink-0">{l.flag}</span>
        <div className="flex-grow truncate">
            <p className="text-text-primary font-medium">{l.nativeName} — {l.country}</p>
            <p className="text-text-muted text-xs">{l.name}</p>
        </div>
        <span className="text-text-muted text-xs font-mono flex-shrink-0">
            {l.dialCode}
        </span>
      </button>
    </li>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm rounded-md transition-colors text-text-primary bg-surface-input hover:bg-surface-elevated"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{locale.flag}</span>
          <span className="font-semibold">{locale.nativeName}</span>
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${dropdownPositionClass} w-80 max-h-[50vh] flex flex-col bg-surface-modal border border-border-subtle rounded-lg shadow-2xl z-20 animate-dropdown-enter`}>
          <div className="p-2 border-b border-border-subtle">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search language, country, code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface-elevated rounded-md py-1.5 pl-9 pr-3 text-sm text-text-primary focus:ring-1 focus:ring-brand-cyan focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <ul className="flex-grow overflow-y-auto p-1">
            {filteredLocales ? (
              // Render flat list for search results
              <>
                {filteredLocales.map(l => renderLocaleItem(l))}
                {filteredLocales.length === 0 && (
                    <li className="text-center p-4 text-sm text-text-muted">No languages found.</li>
                )}
              </>
            ) : (
              // Render grouped list for default view
              REGIONAL_LOCALES.map(regionGroup => (
                <React.Fragment key={regionGroup.region}>
                  {/* The default pinned group has a special name and should not have a header */}
                  {regionGroup.region !== 'Default' && <li className="px-3 pt-3 pb-1 text-xs font-bold text-text-muted uppercase tracking-wider">{regionGroup.region}</li>}
                  {regionGroup.locales.map(l => renderLocaleItem(l))}
                </React.Fragment>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};