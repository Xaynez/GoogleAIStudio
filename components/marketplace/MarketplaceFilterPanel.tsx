import React from 'react';
import { RotateCcw, HelpCircle } from 'lucide-react';

export interface FilterState {
    priceRange: { min: number; max: number };
    maxRiskScore: number;
    hasDocuments: boolean;
    isSponsored: boolean;
}

interface MarketplaceFilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

const MAX_PRICE = 1000000000; // 1 Billion

export const initialFilters: FilterState = {
    priceRange: { min: 0, max: MAX_PRICE },
    maxRiskScore: 100,
    hasDocuments: false,
    isSponsored: false,
};

export const MarketplaceFilterPanel: React.FC<MarketplaceFilterPanelProps> = ({ filters, onFilterChange }) => {
    
    const handlePriceChange = (field: 'min' | 'max', value: number) => {
        const newPriceRange = { ...filters.priceRange, [field]: isNaN(value) ? (field === 'min' ? 0 : MAX_PRICE) : value };
        onFilterChange({ ...filters, priceRange: newPriceRange });
    };
    
    const handleRiskChange = (value: number) => {
        onFilterChange({ ...filters, maxRiskScore: value });
    };

    const handleCheckboxChange = (field: 'hasDocuments' | 'isSponsored', checked: boolean) => {
        onFilterChange({ ...filters, [field]: checked });
    };

    const resetFilters = () => {
        onFilterChange(initialFilters);
    };

    return (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {/* Price Range */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Price Range (USD)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.priceRange.min}
                            onChange={(e) => handlePriceChange('min', parseInt(e.target.value, 10))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            step="10000"
                        />
                        <span className="text-slate-500">-</span>
                         <input
                            type="number"
                            placeholder="Max"
                            value={filters.priceRange.max === MAX_PRICE ? '' : filters.priceRange.max}
                            onChange={(e) => handlePriceChange('max', parseInt(e.target.value, 10))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            step="10000"
                        />
                    </div>
                </div>

                {/* AI Risk Score */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="risk-score-slider" className="block text-sm font-medium text-slate-300">Max AI Risk Score: <span className="font-bold text-cyan-400">{filters.maxRiskScore}</span></label>
                         <div className="relative group">
                            <HelpCircle size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                A score from 0-100 assessing the completeness and transparency of a listing. Lower is better.
                            </div>
                        </div>
                    </div>
                    <input
                        id="risk-score-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={filters.maxRiskScore}
                        onChange={(e) => handleRiskChange(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Other Filters */}
                <div className="space-y-3 pt-2">
                     <div className="relative group flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                            <input type="checkbox" checked={filters.hasDocuments} onChange={(e) => handleCheckboxChange('hasDocuments', e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600" />
                            <span>Has Documents</span>
                        </label>
                        <HelpCircle size={14} className="text-slate-400 cursor-help" />
                        <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Show only listings that have attached documents like pitch decks or financial overviews.
                        </div>
                    </div>
                    <div className="relative group flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                            <input type="checkbox" checked={filters.isSponsored} onChange={(e) => handleCheckboxChange('isSponsored', e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600" />
                            <span>Sponsored Only</span>
                        </label>
                        <HelpCircle size={14} className="text-slate-400 cursor-help" />
                         <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Show only listings that have been promoted by the seller for better visibility.
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                    <RotateCcw size={16} />
                    Clear All Filters
                </button>
            </div>
        </div>
    );
};