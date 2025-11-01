import React from 'react';
import type { OnboardingData } from '../../types';
import { NEW_MARKETPLACE_CATEGORIES } from '../../constants';
import { Sparkles } from 'lucide-react';

interface Step3Props {
  data: OnboardingData;
  updateData: (update: Partial<OnboardingData>) => void;
}

export const Step3Interests: React.FC<Step3Props> = ({ data, updateData }) => {
    
    const handleToggleInterest = (interest: string) => {
        const newInterests = data.interests.includes(interest)
            ? data.interests.filter(i => i !== interest)
            : [...data.interests, interest];
        updateData({ interests: newInterests });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Select Your Interests</h2>
                <p className="text-slate-400 mb-8">Let us know what you're looking for. This helps our AI find the best opportunities for you.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {NEW_MARKETPLACE_CATEGORIES.map(category => (
                    <button 
                        key={category}
                        onClick={() => handleToggleInterest(category)}
                        className={`p-6 rounded-lg border-2 text-center transition-all duration-200 transform hover:scale-105 ${
                            data.interests.includes(category)
                                ? 'bg-gradient-to-r from-brand-violet to-brand-cyan border-transparent'
                                : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                         <p className={`font-semibold ${data.interests.includes(category) ? 'text-white' : 'text-slate-200'}`}>{category}</p>
                    </button>
                ))}
            </div>
            {data.interests.length > 0 && (
                 <div className="mt-8 text-center p-4 bg-slate-800/50 rounded-lg">
                     <p className="text-slate-300 flex items-center justify-center gap-2">
                         <Sparkles className="h-5 w-5 text-cyan-400" />
                         AI matching will be tailored to your {data.interests.length} selected interest{data.interests.length > 1 ? 's' : ''}.
                    </p>
                 </div>
            )}
        </div>
    );
};